# Deployment Guide

This guide covers deploying the ESE Booking System frontend to Render.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Prepare Your Application](#prepare-your-application)
- [Deploy to Render](#deploy-to-render)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- A GitHub account with your repository pushed (Render deploys directly from GitHub)
- A [Render](https://render.com) account (free tier available)
- Your application builds and runs locally
- All dependencies installed: `npm install`
- Build process verified: `npm run build`

## Prepare Your Application

### 1. Update Environment Variables

Ensure your `.env` file is properly configured for production. Create a `.env.production` file if needed:

```env
VITE_API_URL=https://your-api-domain.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Important:** Do not commit `.env` files with secrets to version control. Set these in Render's dashboard instead.

### 2. Verify Build Configuration

Ensure your `vite.config.js` is properly configured:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### 3. Add .env to .gitignore

Ensure sensitive data isn't committed:

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

### 4. Commit and Push

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Deploy to Render

### Step 1: Connect GitHub to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** and select **Web Service**
3. Click **Connect account** to authorize GitHub
4. Search for and select your `ESE-frontend` repository
5. Click **Connect**

### Step 2: Configure Deployment Settings

Fill in the following details:

| Setting | Value |
|---------|-------|
| **Name** | `ese-frontend` (or your preferred name) |
| **Environment** | `Node` |
| **Region** | Choose the closest region to your users |
| **Branch** | `main` |
| **Directory**|`frontend`| (Because this is the directory for the frontend components)
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run preview` or use a static site server |
| **Instance Type** | `Free` (for testing) or upgrade as needed |

### Step 3: Add Environment Variables

1. In the Render dashboard, scroll to **Environment Variables**
2. Add the following variables (set values from your backend or Cloudinary):
   - `VITE_API_URL` → Your backend API URL
   - `VITE_CLOUDINARY_CLOUD_NAME` → Your Cloudinary cloud name
   - `VITE_CLOUDINARY_UPLOAD_PRESET` → Your Cloudinary upload preset

3. Click **Create Web Service**

Render will start building and deploying your application.

### Step 4: Monitor Deployment

1. Watch the build logs in real-time
2. Once the build completes, your app will be available at: `https://ese-frontend.onrender.com` (or your custom domain)
3. Click the URL to visit your deployed application

## Post-Deployment Configuration

### 1. Verify Deployment

- Visit your app URL and ensure it loads correctly
- Test authentication flows
- Verify API communication with your backend
- Check profile picture uploads with Cloudinary

### 2. Set Up Custom Domain (Optional)

1. Go to your Render service dashboard
2. Navigate to **Settings** → **Custom Domain**
3. Add your domain (e.g., `app.yourdomain.com`)
4. Follow Render's DNS configuration instructions
5. DNS records typically take 24-48 hours to propagate

### 3. Enable Auto-Deploys

1. The auto-deploy is typically enabled by default
2. Verify in **Settings** → **Auto-Deploy** is set to `Yes`
3. Every push to your main branch will trigger a new deployment

### 4. CORS Configuration

If your backend is on a different domain, ensure CORS is properly configured on your backend to allow requests from your Render domain.

## Environment Variables

### Available Variables for Frontend

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API endpoint | `https://api.yourdomain.com` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my-cloud-name` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | `ese_profile_pictures` |

### Setting Variables in Render

1. Go to your Web Service dashboard
2. Click **Environment**
3. Click **Add Environment Variable**
4. Enter key and value
5. Click **Save Changes**

Changes take effect on the next deployment.

## Troubleshooting

### Build Fails with "Module not found"

**Solution:**
- Ensure `cd frontend &&` is included in your Build Command
- Verify all dependencies are in `package.json`
- Check that `npm install` completes successfully

### App Shows Blank Page

**Possible causes:**
- Incorrect `VITE_API_URL` environment variable
- API server not responding or CORS misconfigured
- JavaScript errors in browser console

**Solution:**
1. Open browser DevTools (F12)
2. Check the Console tab for errors
3. Check the Network tab to see if API requests are being made
4. Verify API endpoint in environment variables

### API Requests Return 404 or CORS Errors

**Solution:**
- Verify `VITE_API_URL` points to correct backend
- Ensure backend CORS headers allow requests from your Render domain
- Check backend logs for errors

### Authentication Token Issues

**Solution:**
- Clear browser storage: DevTools → Application → Local Storage
- Delete all cookies for the domain
- Log in again
- Check that backend is returning valid JWT tokens

### Profile Picture Upload Failures

**Solution:**
- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for upload errors
- Confirm upload preset exists and is set to "Unsigned"
- Verify folder permissions in Cloudinary settings

### Slow Deployments or Timeouts

**Solution:**
- Upgrade to a paid Render plan for faster builds
- Optimize bundle size: remove unused dependencies
- Use production builds: `npm run build`
- Check Node version: should be 18+ (configurable in Render settings)

## Rolling Back a Deployment

If something goes wrong:

1. Go to your Render service dashboard
2. Click **Deployments**
3. Find the previous working deployment
4. Click the three-dot menu and select **Redeploy**

This will revert to the previous version while you fix issues.

## Performance Optimization Tips

1. **Enable Caching:** Configure cache headers in Render
2. **Minify Assets:** Vite does this by default with `npm run build`
3. **Remove Unused Dependencies:** `npm prune`
4. **Optimize Images:** Use Cloudinary's image transformations
5. **Monitor Bundle Size:** Use `npm run build -- --analyze` (requires analyzer plugin)

## Monitoring and Analytics

### View Render Logs

1. Go to your service dashboard
2. Click **Logs** to see real-time logs
3. Useful for debugging deployment issues

### Set Up Error Tracking (Optional)

Consider integrating error tracking services:
- [Sentry](https://sentry.io) - JavaScript error tracking
- [LogRocket](https://logrocket.com) - Session replay and logging

## Next Steps

- Review [CLOUDINARY SETUP](CLOUDINARY_SETUP.md) for profile picture integration details
- Check [TESTING](TESTING.md) for test coverage and quality assurance
- See [README](README.md) for local development setup

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Deployment Best Practices](https://react.dev/learn/start-a-new-react-project)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)

## Support

For issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Render's [support documentation](https://render.com/docs)
3. Check application logs in Render dashboard
4. Review browser console for client-side errors
