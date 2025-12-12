# Deployment Troubleshooting Guide

This guide covers common issues and solutions for the Lockout Game deployment on AWS (ECS Fargate + Amplify).

## Table of Contents

- [Backend Issues (ECS Fargate)](#backend-issues-ecs-fargate)
- [Frontend Issues (Amplify)](#frontend-issues-amplify)
- [CORS and Connectivity Issues](#cors-and-connectivity-issues)
- [WebSocket/Socket.IO Issues](#websocketsocketio-issues)
- [Performance Issues](#performance-issues)
- [Monitoring and Debugging](#monitoring-and-debugging)

---

## Backend Issues (ECS Fargate)

### ECS Task Keeps Restarting

**Symptoms**: Tasks start and immediately stop, service never reaches desired count

**Possible Causes**:

1. **Health check failures**
   ```bash
   # Check service events
   aws ecs describe-services --cluster lockout-game-cluster --services lockout-game-service \
     --query 'services[0].events[0:10]'
   
   # Check task logs
   aws logs tail /ecs/lockout-game --follow
   ```
   
   **Solution**: Verify `/health` endpoint is accessible:
   ```bash
   # Test health endpoint
   curl https://api.yourdomain.com/health
   ```

2. **Port mismatch**
   - Task definition has port 5000
   - Container must EXPOSE 5000
   - Target group must target port 5000
   
   **Solution**: Verify all ports match in task definition and target group

3. **Environment variable issues**
   ```bash
   # Check secrets are accessible
   aws secretsmanager get-secret-value --secret-id lockout-game/production
   ```
   
   **Solution**: Ensure execution role has `secretsmanager:GetSecretValue` permission

4. **Docker image issues**
   ```bash
   # Test image locally
   docker run -p 5000:5000 \
     -e FLASK_ENV=production \
     -e SECRET_KEY=test \
     -e FRONTEND_URL=http://localhost \
     -e ALLOWED_ORIGINS=http://localhost \
     <ecr-uri>:latest
   
   # Then test health endpoint
   curl http://localhost:5000/health
   ```

### Cannot Pull Docker Image from ECR

**Symptoms**: Task fails with "CannotPullContainerError"

**Solution**:

```bash
# Check ECR repository exists
aws ecr describe-repositories --repository-names lockout-game-backend

# Verify image exists
aws ecr list-images --repository-name lockout-game-backend

# Check execution role has ECR permissions
aws iam get-role-policy --role-name lockout-ecs-execution-role --policy-name ECRAccess
```

Ensure execution role has these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
```

### High CPU/Memory Usage

**Check resource utilization**:

```bash
# View CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=lockout-game-service Name=ClusterName,Value=lockout-game-cluster \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

**Solutions**:

1. **Increase task size**: Update task definition to use 1024 CPU / 2048 MB
2. **Scale horizontally**: Increase desired count
3. **Optimize code**: Profile application, check for memory leaks

### Load Balancer Returns 502/503/504

**502 Bad Gateway**: Backend is not responding

```bash
# Check target health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
```

**Common causes**:
- Health check path incorrect (should be `/health`)
- Backend not listening on correct port
- Security group blocking traffic from ALB to ECS tasks

**503 Service Unavailable**: No healthy targets

**Solution**: Check why tasks are unhealthy (see "ECS Task Keeps Restarting" above)

**504 Gateway Timeout**: Request taking too long

**Solution**: 
- Check backend logs for slow queries/operations
- Increase timeout in target group settings
- Check network connectivity

---

## Frontend Issues (Amplify)

### Build Failures

**Problem**: Amplify build fails

**Check build logs**:
1. Go to Amplify Console
2. Select your app → branch
3. Click on failed deployment
4. View **Provision**, **Build**, **Deploy** logs

**Common issues**:

1. **Node version mismatch**
   
   Add to `frontend/amplify.yml`:
   ```yaml
   frontend:
     phases:
       preBuild:
         commands:
           - nvm use 20
           - npm ci
   ```

2. **Missing environment variables**
   
   Verify in Amplify Console → Environment variables:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`

3. **Build command fails**
   
   Test locally:
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

4. **Wrong artifacts directory**
   
   Ensure `amplify.yml` has:
   ```yaml
   artifacts:
     baseDirectory: dist  # Vite outputs to dist/
   ```

### Frontend Loads but API Calls Fail

**Check browser console**:
1. Open browser DevTools (F12)
2. Look for network errors
3. Check API request URLs

**Common issues**:

1. **Wrong API URL**
   
   Check `VITE_API_URL` environment variable in Amplify
   ```bash
   aws amplify get-app --app-id <app-id>
   ```

2. **CORS errors** (see [CORS section](#cors-and-connectivity-issues) below)

3. **Backend is down**
   
   Test backend health:
   ```bash
   curl https://api.yourdomain.com/health
   ```

### Custom Domain Not Working

**Problem**: Custom domain shows "Not found" or doesn't resolve

**Solutions**:

1. **Wait for propagation**: DNS changes take 5-30 minutes

2. **Check domain association status**:
   ```bash
   aws amplify get-domain-association --app-id <app-id> --domain-name yourdomain.com
   ```

3. **Verify Route53 records**:
   ```bash
   aws route53 list-resource-record-sets --hosted-zone-id <zone-id>
   ```
   
   Should have CNAME records pointing to Amplify

4. **Check certificate status**:
   - Go to AWS Console → Certificate Manager
   - Verify certificate is "Issued" (not "Pending validation")

5. **Clear DNS cache**:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   
   # Windows
   ipconfig /flushdns
   ```

---

## CORS and Connectivity Issues

### Browser Shows CORS Errors

**Symptoms**: Console shows:
```
Access to XMLHttpRequest at 'https://api.yourdomain.com/api/lobby' from origin 'https://lockout.yourdomain.com' has been blocked by CORS policy
```

**Diagnosis**:

1. **Check backend CORS configuration**:
   ```bash
   # View current secrets
   aws secretsmanager get-secret-value --secret-id lockout-game/production
   ```

2. **Test with curl**:
   ```bash
   curl -H "Origin: https://lockout.yourdomain.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://api.yourdomain.com/api/lobby -v
   ```
   
   Should return:
   ```
   Access-Control-Allow-Origin: https://lockout.yourdomain.com
   Access-Control-Allow-Methods: POST, GET, OPTIONS
   ```

**Solutions**:

1. **Update ALLOWED_ORIGINS** in Secrets Manager:
   ```json
   {
     "ALLOWED_ORIGINS": "https://lockout.yourdomain.com,https://main.d123456.amplifyapp.com"
   }
   ```

2. **Restart ECS service** to pick up new configuration:
   ```bash
   aws ecs update-service \
     --cluster lockout-game-cluster \
     --service lockout-game-service \
     --force-new-deployment
   ```

3. **Wait 2-3 minutes** for new tasks to start

4. **Verify in browser**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Mixed Content Warnings

**Problem**: Frontend is HTTPS, but trying to call HTTP backend

**Solution**: Ensure `VITE_API_URL` uses `https://` not `http://`

---

## WebSocket/Socket.IO Issues

### Socket.IO Connection Fails

**Symptoms**: 
- Console shows: `WebSocket connection failed`
- Lobby doesn't update in real-time
- Players can't see each other

**Diagnosis**:

1. **Check browser console** for Socket.IO errors

2. **Verify WebSocket URL**:
   ```javascript
   // In browser console
   console.log(import.meta.env.VITE_SOCKET_URL)
   ```

3. **Test WebSocket connection**:
   ```bash
   # Using wscat (install: npm install -g wscat)
   wscat -c wss://api.yourdomain.com/socket.io/\?EIO\=4\&transport\=websocket
   ```

**Common issues**:

1. **ALB doesn't support WebSocket upgrade**
   
   **Solution**: Verify ALB target group has:
   - Protocol: HTTP
   - Target type: IP
   - Stickiness: Enabled (important for Socket.IO)
   
   Enable stickiness:
   ```bash
   aws elbv2 modify-target-group-attributes \
     --target-group-arn <target-group-arn> \
     --attributes Key=stickiness.enabled,Value=true Key=stickiness.type,Value=lb_cookie
   ```

2. **Backend not configured for WebSocket**
   
   Verify `backend/app.py` uses eventlet:
   ```python
   socketio = SocketIO(app, cors_allowed_origins=app.config.get('ALLOWED_ORIGINS', '*'), async_mode='eventlet')
   ```
   
   And Dockerfile runs with eventlet worker:
   ```dockerfile
   CMD ["gunicorn", "--worker-class", "eventlet", ...]
   ```

3. **CORS for Socket.IO**
   
   Socket.IO needs same CORS origins as REST API. Verify `ALLOWED_ORIGINS` is set correctly.

### Socket.IO Works Intermittently

**Problem**: Sometimes works, sometimes doesn't

**Cause**: Multiple backend tasks, but no sticky sessions

**Solution**: Enable ALB stickiness (see above)

---

## Performance Issues

### Slow Page Load

**Frontend**:

1. **Check CloudFront caching**:
   ```bash
   # View CloudFront distributions
   aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Status]'
   ```

2. **Analyze bundle size**:
   ```bash
   cd frontend
   npm run build -- --mode production
   # Check dist/ folder size
   ```

3. **Enable gzip**: Already enabled by CloudFront

**Backend**:

1. **Check ECS task performance**:
   - View CPU/Memory metrics in CloudWatch
   - Increase task size if needed

2. **Check database queries**: Add logging to identify slow operations

3. **Enable backend caching**: Consider Redis for frequently accessed data

---

## Monitoring and Debugging

### View Backend Logs

**Real-time logs**:
```bash
aws logs tail /ecs/lockout-game --follow
```

**Query logs**:
```bash
aws logs filter-log-events \
  --log-group-name /ecs/lockout-game \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000
```

### View Frontend Logs

**Build logs**: Amplify Console → App → Branch → Build logs

**Runtime logs**: Use browser console (F12)

### SSH into Running ECS Task

Enable ECS Exec:

```bash
# Update service to enable exec
aws ecs update-service \
  --cluster lockout-game-cluster \
  --service lockout-game-service \
  --enable-execute-command

# Find running task
TASK_ARN=$(aws ecs list-tasks --cluster lockout-game-cluster --service lockout-game-service --query 'taskArns[0]' --output text)

# Connect to task
aws ecs execute-command \
  --cluster lockout-game-cluster \
  --task $TASK_ARN \
  --container lockout-game-backend \
  --interactive \
  --command "/bin/bash"
```

### Set Up CloudWatch Alarms

**ECS Service Alarms**:

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name lockout-ecs-high-cpu \
  --alarm-description "ECS CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=lockout-game-service Name=ClusterName,Value=lockout-game-cluster

# Unhealthy target alarm
aws cloudwatch put-metric-alarm \
  --alarm-name lockout-alb-unhealthy-targets \
  --metric-name UnHealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=TargetGroup,Value=<target-group-arn-suffix> Name=LoadBalancer,Value=<alb-arn-suffix>
```

### Rollback Deployments

**Backend (ECS)**:

```bash
# List task definition revisions
aws ecs list-task-definitions --family-prefix lockout-game-task

# Update service to previous revision
aws ecs update-service \
  --cluster lockout-game-cluster \
  --service lockout-game-service \
  --task-definition lockout-game-task:5  # previous revision
```

**Frontend (Amplify)**:

In Amplify Console:
1. Go to app → branch
2. Click on previous successful deployment
3. Click "Redeploy this version"

### Health Check Checklist

Run these checks to verify full system health:

```bash
# 1. Backend health
curl https://api.yourdomain.com/health

# 2. Frontend loads
curl -I https://lockout.yourdomain.com

# 3. ECS service running
aws ecs describe-services --cluster lockout-game-cluster --services lockout-game-service \
  --query 'services[0].{desired:desiredCount,running:runningCount,status:status}'

# 4. Target health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>

# 5. Amplify deployment status
aws amplify get-app --app-id <app-id> --query 'app.{name:name,status:defaultDomain}'
```

All checks should return healthy/successful status.

---

## Getting Help

If you're still stuck:

1. **Check AWS Service Health**: https://status.aws.amazon.com/
2. **Review AWS Documentation**:
   - [ECS Troubleshooting](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/troubleshooting.html)
   - [Amplify Troubleshooting](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting.html)
3. **AWS Support**: Open a support ticket in AWS Console
4. **Community Forums**: 
   - AWS re:Post: https://repost.aws/
   - Stack Overflow with AWS tags

