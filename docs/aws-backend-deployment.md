# AWS Backend Deployment Guide (ECS Fargate)

This guide covers deploying the Lockout Game backend (Flask + Socket.IO) to AWS ECS Fargate.

## Architecture Overview

The backend runs as a containerized Flask application with:

- **Gunicorn** as the WSGI server with eventlet worker for WebSocket support
- **Flask + Flask-SocketIO** for REST API and real-time communication
- **ECS Fargate** for serverless container orchestration
- **Application Load Balancer** for SSL termination and routing
- **AWS Secrets Manager** for secure configuration management

## Prerequisites

- AWS CLI installed and configured
- Docker installed locally
- AWS Account with appropriate IAM permissions
- Domain configured in Route53 (for custom domain)

## Step 1: Create ECR Repository

Store your Docker images in Amazon Elastic Container Registry:

```bash
aws ecr create-repository \
  --repository-name lockout-game-backend \
  --region us-east-1
```

Note the repository URI (format: `<account-id>.dkr.ecr.<region>.amazonaws.com/lockout-game-backend`)

## Step 2: Set Up VPC and Networking

### Option A: Use Default VPC (Simpler)

Most AWS accounts have a default VPC with public subnets. You can use this.

```bash
# List your VPCs
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,IsDefault,CidrBlock]' --output table

# List subnets in default VPC
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=<your-vpc-id>" \
  --query 'Subnets[*].[SubnetId,AvailabilityZone,CidrBlock,MapPublicIpOnLaunch]' \
  --output table
```

Note at least 2 subnet IDs in different availability zones.

### Option B: Create New VPC (Recommended for Production)

Use AWS VPC wizard or CloudFormation to create:

- VPC with CIDR block (e.g., 10.0.0.0/16)
- 2+ public subnets in different AZs
- Internet Gateway attached to VPC
- Route table with route to Internet Gateway

## Step 3: Create Security Groups

### ALB Security Group

```bash
aws ec2 create-security-group \
  --group-name lockout-alb-sg \
  --description "Security group for Lockout Game ALB" \
  --vpc-id <your-vpc-id>

# Note the security group ID
ALB_SG_ID=<output-from-above>

# Allow HTTP and HTTPS from internet
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### ECS Task Security Group

```bash
aws ec2 create-security-group \
  --group-name lockout-ecs-sg \
  --description "Security group for Lockout Game ECS tasks" \
  --vpc-id <your-vpc-id>

# Note the security group ID
ECS_SG_ID=<output-from-above>

# Allow port 5000 from ALB only
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG_ID \
  --protocol tcp \
  --port 5000 \
  --source-group $ALB_SG_ID
```

## Step 4: Request ACM Certificate

```bash
# Request certificate for your domain
aws acm request-certificate \
  --domain-name api.yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Note the certificate ARN
# Follow the AWS Console to add DNS validation records to Route53
# Wait for certificate status to become "ISSUED"

# Check status
aws acm describe-certificate --certificate-arn <cert-arn>
```

## Step 5: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name lockout-backend-alb \
  --subnets <subnet-1> <subnet-2> \
  --security-groups $ALB_SG_ID \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4

# Note the ALB ARN and DNS name
ALB_ARN=<output-arn>
ALB_DNS=<output-dns-name>

# Create target group
aws elbv2 create-target-group \
  --name lockout-backend-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id <your-vpc-id> \
  --target-type ip \
  --health-check-enabled \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 10 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Note the target group ARN
TG_ARN=<output-arn>

# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<your-cert-arn> \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN

# Create HTTP listener (redirect to HTTPS)
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=redirect,RedirectConfig="{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}"
```

## Step 6: Configure AWS Secrets Manager

Store your backend environment variables securely:

```bash
# Generate a secure secret key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Create secret
aws secretsmanager create-secret \
  --name lockout-game/production \
  --description "Production configuration for Lockout Game backend" \
  --secret-string '{
    "FLASK_ENV": "production",
    "SECRET_KEY": "<your-generated-secret-key>",
    "FRONTEND_URL": "https://yourdomain.com",
    "ALLOWED_ORIGINS": "https://yourdomain.com,https://main.d1234567890abc.amplifyapp.com"
  }'

# Note the secret ARN
```

## Step 7: Create IAM Roles

### ECS Task Execution Role

```bash
# Create trust policy file
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name lockout-ecs-execution-role \
  --assume-role-policy-document file://trust-policy.json

# Attach managed policies
aws iam attach-role-policy \
  --role-name lockout-ecs-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Create custom policy for Secrets Manager access
cat > secrets-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "<your-secret-arn>"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name lockout-ecs-execution-role \
  --policy-name SecretsManagerAccess \
  --policy-document file://secrets-policy.json

# Note the role ARN
EXECUTION_ROLE_ARN=$(aws iam get-role --role-name lockout-ecs-execution-role --query 'Role.Arn' --output text)
```

## Step 8: Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name lockout-game-cluster \
  --region us-east-1
```

## Step 9: Register ECS Task Definition

Create a file `task-definition.json`:

```json
{
  "family": "lockout-game-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "<your-execution-role-arn>",
  "containerDefinitions": [
    {
      "name": "lockout-game-backend",
      "image": "<your-ecr-uri>:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [],
      "secrets": [
        {
          "name": "FLASK_ENV",
          "valueFrom": "<secret-arn>:FLASK_ENV::"
        },
        {
          "name": "SECRET_KEY",
          "valueFrom": "<secret-arn>:SECRET_KEY::"
        },
        {
          "name": "FRONTEND_URL",
          "valueFrom": "<secret-arn>:FRONTEND_URL::"
        },
        {
          "name": "ALLOWED_ORIGINS",
          "valueFrom": "<secret-arn>:ALLOWED_ORIGINS::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/lockout-game",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "backend",
          "awslogs-create-group": "true"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:5000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 40
      }
    }
  ]
}
```

Register the task definition:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

## Step 10: Create ECS Service

```bash
aws ecs create-service \
  --cluster lockout-game-cluster \
  --service-name lockout-game-service \
  --task-definition lockout-game-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[<subnet-1>,<subnet-2>],securityGroups=[$ECS_SG_ID],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=lockout-game-backend,containerPort=5000" \
  --health-check-grace-period-seconds 60
```

## Step 11: Configure Route53

```bash
# Create an A record pointing to the ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id <your-hosted-zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "<alb-hosted-zone-id>",
          "DNSName": "'$ALB_DNS'",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

Get ALB Hosted Zone ID from: https://docs.aws.amazon.com/general/latest/gr/elb.html

## Step 12: Build and Push Initial Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t lockout-game-backend .

# Tag image
docker tag lockout-game-backend:latest <ecr-uri>:latest

# Push image
docker push <ecr-uri>:latest

# Force new deployment
aws ecs update-service \
  --cluster lockout-game-cluster \
  --service lockout-game-service \
  --force-new-deployment
```

## Step 13: Configure GitHub Secrets

In your GitHub repository, add the following secrets:

- `AWS_ACCESS_KEY_ID` - IAM user access key with ECR and ECS permissions
- `AWS_SECRET_ACCESS_KEY` - IAM user secret key
- `AWS_REGION` - e.g., `us-east-1`

The GitHub Actions workflow will now automatically deploy on pushes to main.

## Verification

1. Check ECS service status:

   ```bash
   aws ecs describe-services --cluster lockout-game-cluster --services lockout-game-service
   ```

2. Test health endpoint:

   ```bash
   curl https://api.yourdomain.com/health
   ```

3. View logs:
   ```bash
   aws logs tail /ecs/lockout-game --follow
   ```

## Next Steps

- Set up CloudWatch alarms for service health
- Configure auto-scaling policies
- Set up AWS WAF for DDoS protection (optional)
- Enable ECS Exec for debugging running containers
