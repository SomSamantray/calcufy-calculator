# Deployment Guide for Calcufy Calculator

This guide walks you through deploying the Calcufy Calculator MCP app to Vercel and testing it in ChatGPT.

## Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Project builds successfully (`npm run build`)
- [ ] Git repository initialized
- [ ] Vercel account created

## Step-by-Step Deployment

### 1. Build the Project

```bash
cd ~/Documents/"Calculator app"
npm run build
```

Verify that:
- `dist/server.js` exists
- `assets/` folder contains widget bundles

### 2. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Calcufy Calculator MCP App"
```

### 3. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 4. Login to Vercel

```bash
vercel login
```

Follow the authentication flow in your browser.

### 5. Deploy to Vercel

```bash
vercel
```

Answer the prompts:

```
? Set up and deploy "~/Documents/Calculator app"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] N
? What's your project's name? calcufy-calculator
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

Vercel will build and deploy your app. You'll receive a preview URL.

### 6. Set Environment Variable

After deployment, set the widget host URL:

```bash
vercel env add OPENAI_WIDGET_HOST production
```

When prompted, enter: `https://your-deployment-url.vercel.app`

(Replace with your actual Vercel URL from step 5)

### 7. Deploy to Production

```bash
vercel --prod
```

This creates a production deployment with your environment variable.

### 8. Verify Deployment

Test the endpoints:

```bash
# Health check
curl https://your-deployment-url.vercel.app/health

# Should return: {"status":"ok","service":"calcufy-calculator"}

# Check if assets are accessible
curl https://your-deployment-url.vercel.app/assets/operation-selector.js
```

## ChatGPT Configuration

### Enable Developer Mode

1. Open ChatGPT (https://chatgpt.com)
2. Click your profile icon → **Settings**
3. Go to **Apps & Connectors**
4. Scroll to **Advanced Settings**
5. Toggle **"Developer mode"** to ON

### Add Calcufy Calculator App

1. In Settings → Apps & Connectors, click **"Create"**
2. Fill in the form:

   **App Information:**
   - **App Name**: Calcufy Calculator
   - **Description**: Interactive calculator for basic arithmetic operations

   **MCP Server Configuration:**
   - **MCP Server URL**: `https://your-deployment-url.vercel.app/mcp`
   - **Authentication**: No authentication

   **Trust Settings:**
   - Check ✅ **"I trust this application"**

3. Click **"Create"**

### Test the App

1. Start a new chat
2. Click the **"+"** icon in the message input
3. Look for **"Calcufy Calculator"** under "More" or in your apps list
4. Click to connect

Try these prompts:

```
"Help me calculate something using Calcufy"
"Use Calcufy to add two numbers"
"I want to divide using the calculator"
```

## Expected Behavior

### Flow 1: Complete Calculation

**User**: "Using Calcufy Calculator, add 5 and 3"

1. Operation selector carousel appears
2. User clicks "Select" on Addition card
3. Number input form appears
4. User enters 5 and 3
5. Beautiful result card shows: "5 + 3 = 8"

### Flow 2: Step-by-Step

**User**: "Use Calcufy"

1. Operation selector carousel appears
2. User selects "Multiply"
3. ChatGPT prompts: "Please enter two numbers to multiply"
4. User: "12 and 4"
5. Result displays: "12 × 4 = 48"

## Troubleshooting

### Issue: Widgets don't appear

**Solution:**
- Check Vercel deployment logs: `vercel logs`
- Verify OPENAI_WIDGET_HOST is set: `vercel env ls`
- Ensure assets are accessible (test the URLs directly)

### Issue: MCP endpoint returns 500 error

**Solution:**
- Check function logs in Vercel dashboard
- Verify server.ts compiled correctly
- Test locally first: `npm start`

### Issue: "Cannot find module" errors

**Solution:**
- Ensure all dependencies are in `package.json` dependencies (not devDependencies)
- Run `npm install --production` locally to verify
- Check Vercel build logs

### Issue: ChatGPT says "Tool not available"

**Solution:**
- Verify the MCP URL is correct
- Check that the server responds to POST requests
- Enable CORS in server (already configured)
- Try recreating the app in ChatGPT settings

### Issue: Carousel doesn't scroll

**Solution:**
- Check browser console for JavaScript errors
- Verify embla-carousel is loaded
- Test widget locally: `npm run dev`

## Monitoring

### Check Deployment Status

```bash
vercel ls
```

### View Logs

```bash
vercel logs [deployment-url]
```

### Redeploy

```bash
vercel --prod
```

## Updating the App

When you make changes:

```bash
# 1. Build locally
npm run build

# 2. Test locally
npm start

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Deploy
vercel --prod
```

ChatGPT will automatically use the updated version.

## Security Notes

- This app uses no authentication (suitable for public calculations)
- For production apps with sensitive data, implement OAuth 2.0
- Never expose API keys in client-side code
- Review OpenAI's security guidelines for MCP apps

## Performance Tips

1. **Optimize Assets**: Consider minifying CSS and JS further
2. **CDN Caching**: Vercel automatically caches assets
3. **Lazy Loading**: Widgets load on-demand
4. **Bundle Size**: Current bundle is ~100KB (acceptable)

## Next Steps

- [ ] Test all four operations (Add, Subtract, Multiply, Divide)
- [ ] Test edge cases (division by zero, large numbers)
- [ ] Share with team members
- [ ] Monitor usage in Vercel analytics
- [ ] Consider adding more operations (power, square root, etc.)

## Support

If you encounter issues:

1. Check this guide first
2. Review Vercel deployment logs
3. Test the MCP endpoint directly with curl
4. Check ChatGPT Developer Console (if available)
5. Consult [OpenAI Apps SDK docs](https://platform.openai.com/docs/apps)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI Apps SDK Examples](https://github.com/openai/openai-apps-sdk-examples)
- [Model Context Protocol Spec](https://modelcontextprotocol.io)
- [React Documentation](https://react.dev)
