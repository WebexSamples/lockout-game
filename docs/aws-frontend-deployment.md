# AWS Frontend Deployment Guide (Amplify)

This guide covers deploying the Lockout Game React frontend to AWS Amplify with CloudFront CDN.

## Architecture Overview

The frontend is deployed as a static site on AWS Amplify with:

- **CloudFront CDN** for global content delivery
- **Automatic SSL/TLS** certificates
- **Git-based deployments** (auto-deploy on push)
- **Environment variables** for backend API configuration
- **Custom domain support** via Route53

## Prerequisites

- AWS CLI installed and configured
- GitHub repository with your code
- Domain configured in Route53 (optional, for custom domain)
- Backend deployed and accessible (see `aws-backend-deployment.md`)

## Step 1: Connect GitHub Repository

### Via AWS Console (Recommended for Initial Setup)

1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Select **GitHub** as the repository service
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository: `lockout-game`
6. Select branch: `main`

### Via AWS CLI

```bash
# First, create a personal access token in GitHub with repo permissions
# https://github.com/settings/tokens

aws amplify create-app \
  --name lockout-game-frontend \
  --repository https://github.com/yourusername/lockout-game \
  --access-token <github-personal-access-token> \
  --enable-branch-auto-build

# Note the App ID
APP_ID=<output-app-id>
```

## Step 2: Configure Build Settings

Amplify should auto-detect your build settings from `frontend/amplify.yml`. Verify the configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Update Build Settings in Console

1. In Amplify Console, select your app
2. Go to **"App settings"** → **"Build settings"**
3. Verify **Build specification** shows the above YAML
4. Set **Monorepo root directory**: `frontend`

Or via CLI:

```bash
aws amplify update-app \
  --app-id $APP_ID \
  --platform WEB \
  --build-spec "$(cat frontend/amplify.yml)"
```

## Step 3: Configure Environment Variables

Set environment variables for the frontend to connect to your backend:

### Via AWS Console

1. Go to **"App settings"** → **"Environment variables"**
2. Add the following variables:

| Variable          | Value                        | Description           |
| ----------------- | ---------------------------- | --------------------- |
| `VITE_API_URL`    | `https://api.yourdomain.com` | Backend API URL       |
| `VITE_SOCKET_URL` | `https://api.yourdomain.com` | Backend WebSocket URL |

### Via AWS CLI

```bash
aws amplify update-app \
  --app-id $APP_ID \
  --environment-variables \
    VITE_API_URL=https://api.yourdomain.com \
    VITE_SOCKET_URL=https://api.yourdomain.com
```

**Important:** Replace `api.yourdomain.com` with your actual backend ALB domain or custom domain.

## Step 4: Connect Branch and Enable Auto-Deploy

### Via AWS Console (Recommended)

1. In Amplify Console, select your app
2. Go to **"App settings"** → **"General"** → **"Branches"**
3. If the `main` branch is not connected:
   - Click **"Connect branch"**
   - Select `main` branch
   - Confirm settings
4. Enable automatic deployments:
   - Click on the `main` branch
   - Go to **"Branch settings"**
   - Ensure **"Auto build"** is enabled (toggle should be ON)
5. Trigger initial deployment by clicking **"Redeploy this version"** or push to main

### Via AWS CLI

```bash
# Connect the main branch with auto-build enabled
aws amplify create-branch \
  --app-id $APP_ID \
  --branch-name main \
  --enable-auto-build \
  --stage PRODUCTION

# Trigger initial deployment
aws amplify start-job \
  --app-id $APP_ID \
  --branch-name main \
  --job-type RELEASE
```

### Verify Auto-Deploy is Enabled

```bash
aws amplify get-branch \
  --app-id $APP_ID \
  --branch-name main \
  --query 'branch.{AutoBuild:enableAutoBuild,Stage:stage}' \
  --output table
```

You should see `AutoBuild: True`.

### Monitor Deployment Progress

In Amplify Console or via CLI:

```bash
aws amplify list-jobs --app-id $APP_ID --branch-name main
```

**How Auto-Deploy Works:**

1. Push code to `main` branch in GitHub
2. GitHub webhook notifies Amplify
3. Amplify automatically builds and deploys
4. Deployment status visible in Amplify Console

## Step 5: Configure Custom Domain (Optional)

### Prerequisites

- Domain registered and Route53 hosted zone configured
- SSL certificate will be automatically provisioned by Amplify

### Add Custom Domain

#### Via AWS Console

1. In Amplify Console, go to **"App settings"** → **"Domain management"**
2. Click **"Add domain"**
3. Select your domain from Route53 or enter a custom domain
4. Configure subdomain: `lockout` or `www` (e.g., `lockout.yourdomain.com`)
5. Click **"Configure domain"**
6. Amplify will automatically:
   - Request an ACM certificate
   - Configure DNS records in Route53
   - Set up CloudFront distribution

#### Via AWS CLI

```bash
aws amplify create-domain-association \
  --app-id $APP_ID \
  --domain-name yourdomain.com \
  --sub-domain-settings '{
    "prefix": "lockout",
    "branchName": "main"
  }'
```

**DNS Verification:**

- Amplify will automatically add CNAME records to Route53
- Certificate validation takes 5-30 minutes
- Domain will be available at `https://lockout.yourdomain.com`

## Step 6: Update Backend CORS

Now that you know your Amplify URLs, update the backend CORS configuration:

1. Go to AWS Secrets Manager
2. Edit the `lockout-game/production` secret
3. Update `ALLOWED_ORIGINS` to include your Amplify URLs:

```json
{
  "FLASK_ENV": "production",
  "SECRET_KEY": "your-secret-key",
  "FRONTEND_URL": "https://lockout.yourdomain.com",
  "ALLOWED_ORIGINS": "https://lockout.yourdomain.com,https://lockoutapi.yourdomain.com,https://*.amplifyapp.com"
}
```

**Note:** The `https://*.amplifyapp.com` wildcard allows:

- Your main Amplify URL: `https://main.d1234567890abc.amplifyapp.com`
- All PR preview URLs: `https://pr-123.d1234567890abc.amplifyapp.com`

4. Restart your ECS service to pick up the new configuration:

```bash
aws ecs update-service \
  --cluster lockout-game-cluster \
  --service lockout-game-service \
  --force-new-deployment
```

## Step 7: Verify Automatic Deployments

Amplify is configured to automatically deploy when you push to the `main` branch via its GitHub integration.

**To verify automatic deployment is enabled:**

```bash
# Check branch configuration
aws amplify get-branch \
  --app-id $APP_ID \
  --branch-name main \
  --query 'branch.{EnableAutoBuild:enableAutoBuild,Stage:stage}' \
  --output table
```

**How it works:**

1. Push code to `main` branch
2. Amplify detects the push via GitHub webhook
3. Amplify automatically builds and deploys
4. Monitor progress in Amplify Console

**No GitHub Actions needed!** Amplify handles deployments natively.

## Step 8: Set Up Amplify Features (Optional)

### Enable Pull Request Previews

**⚠️ Important:** PR previews will use the same environment variables as your main branch by default, meaning they will connect to your **production backend**.

```bash
aws amplify update-branch \
  --app-id $APP_ID \
  --branch-name main \
  --enable-pull-request-preview
```

Now, every PR will get a preview URL like `https://pr-123.d1234567890abc.amplifyapp.com` that connects to your production backend.

**CORS Configuration:** Make sure your `ALLOWED_ORIGINS` in Secrets Manager includes `https://*.amplifyapp.com` to allow all PR previews to connect to the backend (see Step 6).

### Enable Basic Authentication (for staging)

```bash
aws amplify update-branch \
  --app-id $APP_ID \
  --branch-name main \
  --enable-basic-auth \
  --basic-auth-credentials username:password
```

### Configure Redirects for SPA

Amplify should auto-detect React Router, but you can manually configure:

In Amplify Console → **"Rewrites and redirects"** → Add rule:

```
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf)$)([^.]+$)/>
Target: /index.html
Type: 200 (Rewrite)
```

Or in `frontend/amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'X-Frame-Options'
        value: 'SAMEORIGIN'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
```

## Verification

### 1. Check Deployment Status

```bash
aws amplify get-app --app-id $APP_ID
```

### 2. Test Your Application

Visit your Amplify URL:

- Default: `https://main.d1234567890abc.amplifyapp.com`
- Custom: `https://lockout.yourdomain.com`

Test functionality:

- ✅ Frontend loads
- ✅ Can create lobby (API connection works)
- ✅ WebSocket connections work (real-time updates)
- ✅ No CORS errors in browser console

### 3. Monitor Logs

In Amplify Console:

- Go to your app
- Click on the branch deployment
- View build logs and deployment details

## Troubleshooting

### Build Failures

**Problem**: Build fails with module not found

**Solution**: Ensure `frontend/amplify.yml` has correct `baseDirectory`:

```yaml
artifacts:
  baseDirectory: dist # For Vite
  # baseDirectory: build  # For Create React App
```

**Problem**: Environment variables not working

**Solution**:

1. Verify variables are set in Amplify Console
2. Redeploy: `aws amplify start-job --app-id $APP_ID --branch-name main --job-type RELEASE`
3. Check build logs for `VITE_API_URL` value

### CORS Errors

**Problem**: Browser shows CORS errors

**Solution**:

1. Check backend logs: `aws logs tail /ecs/lockout-game --follow`
2. Verify `ALLOWED_ORIGINS` in Secrets Manager includes Amplify URL
3. Restart ECS service after updating secrets

### WebSocket Connection Fails

**Problem**: Socket.IO can't connect

**Solution**:

1. Verify `VITE_SOCKET_URL` environment variable
2. Check ALB security group allows inbound 443
3. Verify backend health: `curl https://api.yourdomain.com/health`
4. Check browser console for specific error messages

### Custom Domain Not Working

**Problem**: Custom domain shows "Not found"

**Solution**:

1. Wait 5-30 minutes for DNS propagation
2. Check certificate status in ACM
3. Verify Route53 CNAME records were created
4. Try clearing browser cache / incognito mode

## Rollback Deployments

### Via Console

1. Go to Amplify Console → Your App → Branch
2. Click on a previous deployment
3. Click **"Redeploy this version"**

### Via CLI

```bash
# List previous jobs
aws amplify list-jobs --app-id $APP_ID --branch-name main

# Get specific job details
aws amplify get-job --app-id $APP_ID --branch-name main --job-id <job-id>
```

## Performance Optimization

1. **Enable Gzip Compression** (enabled by default via CloudFront)
2. **Set Cache-Control Headers**: Amplify does this automatically for static assets
3. **Use Lazy Loading**: Already implemented in React components
4. **Monitor Performance**:
   - CloudFront metrics in CloudWatch
   - Real User Monitoring (RUM) via CloudWatch RUM (optional add-on)

## Security Best Practices

1. **Enable HTTPS Only**: Automatic with Amplify
2. **Set Security Headers**: Configure in `amplify.yml` (see Step 8)
3. **Regular Dependency Updates**: Run `npm audit` and update packages
4. **Environment Variable Security**: Never commit API keys to Git
5. **Access Control**: Use Amplify basic auth for staging environments

## Next Steps

- Set up monitoring with CloudWatch
- Configure alarms for failed deployments
- Set up multiple environments (dev, staging, production)
- Enable AWS WAF for additional security (optional)
- Configure custom error pages
