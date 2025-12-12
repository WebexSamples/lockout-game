# AWS Deployment Quick Reference

Quick commands and reference for deploying and managing the Lockout Game on AWS.

## Environment

- **Backend**: AWS ECS Fargate (Flask + Socket.IO)
- **Frontend**: AWS Amplify (React)
- **Region**: us-east-1 (adjust as needed)

## Prerequisites Setup

```bash
# Install AWS CLI
# macOS: brew install awscli
# Linux: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# Configure AWS CLI
aws configure

# Install Docker
# https://docs.docker.com/get-docker/
```

## Backend (ECS Fargate) Commands

### Build and Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t lockout-game-backend .

# Tag image
docker tag lockout-game-backend:latest <ecr-uri>:latest
docker tag lockout-game-backend:latest <ecr-uri>:$(git rev-parse --short HEAD)

# Push image
docker push <ecr-uri>:latest
docker push <ecr-uri>:$(git rev-parse --short HEAD)
```

### Deploy to ECS

```bash
# Force new deployment (pulls latest image)
aws ecs update-service \
  --cluster lockout-game-cluster \
  --service lockout-game-service \
  --force-new-deployment

# Check deployment status
aws ecs describe-services \
  --cluster lockout-game-cluster \
  --services lockout-game-service \
  --query 'services[0].{desired:desiredCount,running:runningCount,status:status}'
```

### View Logs

```bash
# Tail logs in real-time
aws logs tail /ecs/lockout-game --follow

# Search for errors in last hour
aws logs filter-log-events \
  --log-group-name /ecs/lockout-game \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000
```

### Manage Secrets

```bash
# View current secrets
aws secretsmanager get-secret-value \
  --secret-id lockout-game/production \
  --query 'SecretString' --output text | jq .

# Update secrets
aws secretsmanager update-secret \
  --secret-id lockout-game/production \
  --secret-string '{
    "FLASK_ENV": "production",
    "SECRET_KEY": "your-key",
    "FRONTEND_URL": "https://yourdomain.com",
    "ALLOWED_ORIGINS": "https://yourdomain.com,https://main.d123.amplifyapp.com"
  }'

# After updating secrets, restart service
aws ecs update-service \
  --cluster lockout-game-cluster \
  --service lockout-game-service \
  --force-new-deployment
```

### Scale Service

```bash
# Scale up to 3 tasks
aws ecs update-service \
  --cluster lockout-game-cluster \
  --service lockout-game-service \
  --desired-count 3

# Scale down to 1 task
aws ecs update-service \
  --cluster lockout-game-cluster \
  --service lockout-game-service \
  --desired-count 1
```

## Frontend (Amplify) Commands

### Trigger Deployment

```bash
# Start deployment
aws amplify start-job \
  --app-id <app-id> \
  --branch-name main \
  --job-type RELEASE

# Check deployment status
aws amplify list-jobs \
  --app-id <app-id> \
  --branch-name main \
  --max-results 5
```

### Manage Environment Variables

```bash
# Get current environment variables
aws amplify get-app \
  --app-id <app-id> \
  --query 'app.environmentVariables'

# Update environment variables
aws amplify update-app \
  --app-id <app-id> \
  --environment-variables \
    VITE_API_URL=https://api.yourdomain.com \
    VITE_SOCKET_URL=https://api.yourdomain.com

# Redeploy after changing environment variables
aws amplify start-job \
  --app-id <app-id> \
  --branch-name main \
  --job-type RELEASE
```

### View Amplify App Info

```bash
# Get app details
aws amplify get-app --app-id <app-id>

# Get default domain
aws amplify get-app \
  --app-id <app-id> \
  --query 'app.defaultDomain' --output text

# List all branches
aws amplify list-branches --app-id <app-id>
```

## Health Checks

### Quick Health Check Script

```bash
#!/bin/bash
# Save as check-health.sh

BACKEND_URL="https://api.yourdomain.com"
FRONTEND_URL="https://yourdomain.com"

echo "Checking backend health..."
curl -f $BACKEND_URL/health && echo "✅ Backend healthy" || echo "❌ Backend unhealthy"

echo "Checking frontend..."
curl -f -I $FRONTEND_URL && echo "✅ Frontend accessible" || echo "❌ Frontend inaccessible"

echo "Checking ECS service..."
aws ecs describe-services \
  --cluster lockout-game-cluster \
  --services lockout-game-service \
  --query 'services[0].{desired:desiredCount,running:runningCount}' \
  --output table

echo "Checking target health..."
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --query 'TargetHealthDescriptions[*].{Target:Target.Id,Health:TargetHealth.State}' \
  --output table
```

## Monitoring

### CloudWatch Metrics

```bash
# ECS CPU usage (last hour)
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=lockout-game-service Name=ClusterName,Value=lockout-game-cluster \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum \
  --output table

# ECS Memory usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=lockout-game-service Name=ClusterName,Value=lockout-game-cluster \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum \
  --output table

# ALB request count
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name RequestCount \
  --dimensions Name=LoadBalancer,Value=<alb-arn-suffix> \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum \
  --output table
```

## Rollback

### Backend Rollback

```bash
# List task definition revisions
aws ecs list-task-definitions --family-prefix lockout-game-task

# Rollback to previous revision
aws ecs update-service \
  --cluster lockout-game-cluster \
  --service lockout-game-service \
  --task-definition lockout-game-task:<previous-revision>
```

### Frontend Rollback

Use Amplify Console:
1. Go to https://console.aws.amazon.com/amplify/
2. Select app → branch
3. Click on previous successful deployment
4. Click "Redeploy this version"

## Common Issues

### Backend not responding

```bash
# Check if tasks are running
aws ecs list-tasks --cluster lockout-game-cluster --service lockout-game-service

# Get task details
TASK_ARN=$(aws ecs list-tasks --cluster lockout-game-cluster --service lockout-game-service --query 'taskArns[0]' --output text)
aws ecs describe-tasks --cluster lockout-game-cluster --tasks $TASK_ARN

# Check logs
aws logs tail /ecs/lockout-game --follow
```

### CORS errors

```bash
# Update ALLOWED_ORIGINS
aws secretsmanager update-secret \
  --secret-id lockout-game/production \
  --secret-string '{"ALLOWED_ORIGINS":"https://yourdomain.com,https://main.d123.amplifyapp.com",...}'

# Restart service
aws ecs update-service --cluster lockout-game-cluster --service lockout-game-service --force-new-deployment
```

### Frontend build fails

```bash
# Check build logs
aws amplify get-job \
  --app-id <app-id> \
  --branch-name main \
  --job-id <job-id>

# Retry deployment
aws amplify start-job \
  --app-id <app-id> \
  --branch-name main \
  --job-type RELEASE
```

## Useful ARN Patterns

```bash
# Replace <account-id> and <region> with your values

# ECR Repository
arn:aws:ecr:<region>:<account-id>:repository/lockout-game-backend

# ECS Cluster
arn:aws:ecs:<region>:<account-id>:cluster/lockout-game-cluster

# ECS Service
arn:aws:ecs:<region>:<account-id>:service/lockout-game-cluster/lockout-game-service

# Secrets Manager
arn:aws:secretsmanager:<region>:<account-id>:secret:lockout-game/production

# CloudWatch Log Group
/ecs/lockout-game
```

## GitHub Actions Variables

Set these in GitHub repository settings → Secrets and variables → Actions:

### Secrets
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AMPLIFY_APP_ID`

### Variables (optional)
- `AWS_REGION` (default: us-east-1)
- `AMPLIFY_BRANCH_NAME` (default: main)

## Local Development

```bash
# Run backend in Docker
docker-compose up --build

# Run frontend dev server
cd frontend
npm run dev

# Configure frontend to use local backend
# Create frontend/.env.local:
# VITE_API_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000
```

## Documentation

- [Backend Deployment Guide](./aws-backend-deployment.md)
- [Frontend Deployment Guide](./aws-frontend-deployment.md)
- [Troubleshooting Guide](./deployment-troubleshooting.md)

## Support

- AWS Documentation: https://docs.aws.amazon.com/
- AWS Support: https://console.aws.amazon.com/support/
- Project Issues: https://github.com/your-repo/lockout-game/issues

