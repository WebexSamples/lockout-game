# AWS Deployment Checklist

Use this checklist to ensure a successful deployment of the Lockout Game to AWS.

## Pre-Deployment Preparation

### AWS Account Setup
- [ ] AWS account created and configured
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS CLI configured (`aws configure`)
- [ ] Billing alerts set up in AWS Console
- [ ] Domain registered or available in Route53 (if using custom domain)

### Local Development Tools
- [ ] Docker installed and running (`docker --version`)
- [ ] Git installed (`git --version`)
- [ ] Node.js v20 installed (`node --version`)
- [ ] Python 3.12+ installed (`python --version`)
- [ ] Application tested locally and working

### Repository Setup
- [ ] Code pushed to GitHub repository
- [ ] GitHub account has admin access to repository

---

## Backend Deployment (ECS Fargate)

### Step 1: ECR Repository
- [ ] ECR repository created: `lockout-game-backend`
- [ ] Repository URI noted and saved
- [ ] ECR login tested: `aws ecr get-login-password | docker login ...`

### Step 2: Networking
- [ ] VPC selected or created
- [ ] At least 2 public subnets in different AZs identified
- [ ] Subnet IDs noted and saved
- [ ] Internet Gateway attached to VPC

### Step 3: Security Groups
- [ ] ALB security group created
  - [ ] Inbound rule: Port 80 from 0.0.0.0/0
  - [ ] Inbound rule: Port 443 from 0.0.0.0/0
- [ ] ECS security group created
  - [ ] Inbound rule: Port 5000 from ALB security group
- [ ] Security group IDs noted and saved

### Step 4: SSL Certificate
- [ ] ACM certificate requested for backend domain
- [ ] DNS validation records added to Route53
- [ ] Certificate status is "Issued"
- [ ] Certificate ARN noted and saved

### Step 5: Application Load Balancer
- [ ] ALB created (internet-facing)
- [ ] ALB attached to public subnets
- [ ] ALB security group attached
- [ ] Target group created:
  - [ ] Protocol: HTTP
  - [ ] Port: 5000
  - [ ] Target type: IP
  - [ ] Health check path: `/health`
  - [ ] Health check interval: 30s
- [ ] HTTPS listener created (port 443) with ACM certificate
- [ ] HTTP listener created (port 80) with redirect to HTTPS
- [ ] ALB DNS name and ARN noted and saved
- [ ] Target group ARN noted and saved

### Step 6: IAM Roles
- [ ] ECS task execution role created
- [ ] Managed policy attached: `AmazonECSTaskExecutionRolePolicy`
- [ ] Custom policy for Secrets Manager access created and attached
- [ ] Execution role ARN noted and saved

### Step 7: Secrets Manager
- [ ] Secret created: `lockout-game/production`
- [ ] SECRET_KEY generated (secure random 64-char hex)
- [ ] Secret JSON configured:
  - [ ] `FLASK_ENV`: "production"
  - [ ] `SECRET_KEY`: (generated key)
  - [ ] `FRONTEND_URL`: (your frontend domain)
  - [ ] `ALLOWED_ORIGINS`: (comma-separated list of allowed origins)
- [ ] Secret ARN noted and saved

### Step 8: ECS Cluster
- [ ] ECS cluster created: `lockout-game-cluster`
- [ ] Cluster ARN noted and saved

### Step 9: Task Definition
- [ ] task-definition.json file created with:
  - [ ] Correct execution role ARN
  - [ ] Correct ECR image URI
  - [ ] Correct secret ARN for environment variables
  - [ ] CPU: 512
  - [ ] Memory: 1024
  - [ ] Port mapping: 5000
  - [ ] CloudWatch logs configured
  - [ ] Health check configured
- [ ] Task definition registered with ECS
- [ ] Task definition ARN noted and saved

### Step 10: Docker Image
- [ ] Docker image built locally and tested
- [ ] Image tagged with ECR URI
- [ ] Image pushed to ECR
- [ ] Image visible in ECR Console

### Step 11: ECS Service
- [ ] ECS service created:
  - [ ] Service name: `lockout-game-service`
  - [ ] Task definition: `lockout-game-task`
  - [ ] Desired count: 2
  - [ ] Launch type: FARGATE
  - [ ] VPC subnets configured
  - [ ] Security group attached
  - [ ] ALB target group attached
  - [ ] Public IP enabled
- [ ] Service started successfully
- [ ] Tasks running (2/2)
- [ ] Tasks registered with target group

### Step 12: Route53
- [ ] A record created for backend domain
- [ ] A record points to ALB (ALIAS record)
- [ ] DNS propagation verified (`dig api.yourdomain.com`)

### Step 13: Backend Verification
- [ ] Health endpoint accessible: `curl https://api.yourdomain.com/health`
- [ ] Returns `{"status": "healthy", "service": "lockout-game"}`
- [ ] No SSL certificate warnings
- [ ] CloudWatch logs show application startup

---

## Frontend Deployment (Amplify)

### Step 1: Amplify App
- [ ] Amplify app created
- [ ] GitHub repository connected
- [ ] Branch connected: `main`
- [ ] App ID noted and saved

### Step 2: Build Configuration
- [ ] Build settings configured from `frontend/amplify.yml`
- [ ] Monorepo root directory set: `frontend`
- [ ] Build specification verified in Console

### Step 3: Environment Variables
- [ ] `VITE_API_URL` set to backend URL
- [ ] `VITE_SOCKET_URL` set to backend URL
- [ ] Environment variables visible in Amplify Console

### Step 4: Initial Deployment
- [ ] Initial build triggered
- [ ] Build completed successfully
- [ ] Deployment succeeded
- [ ] Default Amplify URL accessible
- [ ] Default URL noted and saved (e.g., `https://main.d123.amplifyapp.com`)

### Step 5: Backend CORS Update
- [ ] Amplify default URL added to backend `ALLOWED_ORIGINS`
- [ ] Secrets Manager secret updated
- [ ] ECS service restarted (`--force-new-deployment`)

### Step 6: Custom Domain (Optional)
- [ ] Custom domain added in Amplify Console
- [ ] Subdomain configured (e.g., `lockout`)
- [ ] DNS records created in Route53
- [ ] SSL certificate issued by Amplify
- [ ] Custom domain accessible

### Step 7: Frontend Verification
- [ ] Frontend loads at Amplify URL
- [ ] Can create lobby (API connection works)
- [ ] Can join lobby
- [ ] Real-time updates work (Socket.IO)
- [ ] No CORS errors in browser console
- [ ] No JavaScript errors in console

---

## CI/CD Setup (GitHub Actions)

### Step 1: IAM User for GitHub Actions
- [ ] IAM user created: `github-actions-lockout-game`
- [ ] Policies attached:
  - [ ] ECR push permissions
  - [ ] ECS update service permissions
  - [ ] Amplify deployment permissions
- [ ] Access key created
- [ ] Access key ID and secret noted (keep secure!)

### Step 2: GitHub Secrets
- [ ] Repository Settings → Secrets → Actions opened
- [ ] `AWS_ACCESS_KEY_ID` added
- [ ] `AWS_SECRET_ACCESS_KEY` added
- [ ] `AWS_REGION` added (e.g., `us-east-1`)
- [ ] `AMPLIFY_APP_ID` added
- [ ] `AMPLIFY_BRANCH_NAME` added (e.g., `main`)

### Step 3: Workflow Files
- [ ] `.github/workflows/deploy.yml` exists (backend)
- [ ] `.github/workflows/deploy-frontend.yml` exists (frontend)
- [ ] Workflow files have correct values:
  - [ ] ECR repository name
  - [ ] ECS cluster name
  - [ ] ECS service name
  - [ ] Task definition name
  - [ ] Container name

### Step 4: Test CI/CD
- [ ] Make a small change to backend code
- [ ] Push to main branch
- [ ] Backend workflow triggers
- [ ] Backend tests pass
- [ ] Docker image builds and pushes
- [ ] ECS service updates
- [ ] Backend deployment succeeds
- [ ] Make a small change to frontend code
- [ ] Push to main branch
- [ ] Frontend workflow triggers
- [ ] Frontend tests pass
- [ ] Amplify deployment triggers
- [ ] Frontend deployment succeeds

---

## Post-Deployment Configuration

### Monitoring Setup
- [ ] CloudWatch Log Groups configured with retention policy
- [ ] CloudWatch alarm for ECS CPU > 80%
- [ ] CloudWatch alarm for ALB unhealthy targets
- [ ] CloudWatch alarm for ALB 5xx errors

### Documentation
- [ ] All ARNs and IDs documented in secure location
- [ ] Deployment runbook created for team
- [ ] Access credentials stored securely

### Security Review
- [ ] Security groups reviewed (least privilege)
- [ ] IAM roles reviewed (least privilege)
- [ ] Secrets rotation policy defined
- [ ] SSL/TLS certificates have auto-renewal enabled
- [ ] CORS configuration verified (no wildcards in production)

---

## Final Verification

### End-to-End Testing
- [ ] Open frontend in browser
- [ ] Create a new lobby
- [ ] Copy lobby ID
- [ ] Open in incognito/private window
- [ ] Join lobby with different user
- [ ] Verify real-time updates work
- [ ] Select teams and roles
- [ ] Mark ready
- [ ] Start game (if implemented)
- [ ] Verify game functionality

### Performance Testing
- [ ] Page load time acceptable (< 3 seconds)
- [ ] API response time acceptable (< 500ms)
- [ ] WebSocket connection establishes quickly (< 2 seconds)
- [ ] No console errors or warnings

### Cross-Browser Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested in Edge
- [ ] Mobile browser tested (iOS/Android)

### Load Testing (Optional)
- [ ] Multiple concurrent lobbies tested
- [ ] Multiple users in single lobby tested
- [ ] ECS service scales appropriately
- [ ] No memory leaks observed

---

## Rollback Plan

### If Backend Deployment Fails
- [ ] Previous task definition revision identified
- [ ] Rollback command ready:
  ```bash
  aws ecs update-service \
    --cluster lockout-game-cluster \
    --service lockout-game-service \
    --task-definition lockout-game-task:<previous-revision>
  ```

### If Frontend Deployment Fails
- [ ] Previous Amplify deployment identified
- [ ] Rollback steps documented:
  1. Go to Amplify Console
  2. Select previous successful deployment
  3. Click "Redeploy this version"

---

## Maintenance Schedule

### Daily
- [ ] Check CloudWatch metrics for anomalies
- [ ] Review error logs

### Weekly
- [ ] Check for security updates
- [ ] Review application logs for issues

### Monthly
- [ ] Update dependencies (npm, pip)
- [ ] Test disaster recovery procedures

### Quarterly
- [ ] Rotate secrets in Secrets Manager
- [ ] Review IAM permissions
- [ ] Update SSL certificates if needed
- [ ] Load testing

---

## Success Criteria

Deployment is complete and successful when:

✅ Backend health check returns 200 OK
✅ Frontend loads without errors
✅ Users can create and join lobbies
✅ Real-time updates work via WebSocket
✅ No CORS errors in browser console
✅ ECS service shows 2/2 running tasks
✅ ALB target group shows 2 healthy targets
✅ GitHub Actions workflows complete successfully
✅ Custom domain resolves correctly (if configured)
✅ SSL/TLS certificates are valid
✅ CloudWatch logs show no critical errors
✅ Application tested end-to-end successfully

---

## Troubleshooting Reference

If any step fails, refer to:
- **Backend issues**: `docs/aws-backend-deployment.md`
- **Frontend issues**: `docs/aws-frontend-deployment.md`
- **Common problems**: `docs/deployment-troubleshooting.md`
- **Quick commands**: `docs/deployment-quick-reference.md`

---

## Sign-Off

Deployment completed by: ___________________
Date: ___________________
Backend URL: ___________________
Frontend URL: ___________________
Verified by: ___________________

🎉 **Congratulations! Your Lockout Game is live on AWS!** 🎉

