# Quick Start Guide - Calcufy Calculator

Get up and running with Calcufy Calculator in 5 minutes!

## What You'll Need

- Node.js 18+ installed
- Vercel account (free tier works)
- ChatGPT Plus/Team subscription

## Step 1: Install Dependencies

```bash
cd ~/Documents/"Calculator app"
npm install
```

## Step 2: Build the Project

```bash
npm run build
```

This creates:
- `dist/server.js` - Compiled MCP server
- `assets/` - Widget bundles (HTML/CSS/JS)

## Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

Answer the prompts:
- Set up and deploy? **Y**
- Project name? **calcufy-calculator**
- Directory? **./&**
- Override settings? **N**

Copy your deployment URL (e.g., `https://calcufy-calculator-xyz.vercel.app`)

## Step 4: Set Environment Variable

```bash
vercel env add OPENAI_WIDGET_HOST production
```

Paste your deployment URL when prompted.

Deploy to production:

```bash
vercel --prod
```

## Step 5: Configure ChatGPT

1. Go to https://chatgpt.com
2. Settings → Apps & Connectors
3. Enable "Developer mode"
4. Click "Create"
5. Fill in:
   - Name: **Calcufy Calculator**
   - MCP URL: **https://your-deployment-url.vercel.app/mcp**
   - Authentication: **No authentication**
   - Check: **I trust this application**
6. Click Create

## Step 6: Test It!

Start a new chat and try:

```
"Using Calcufy Calculator, add 5 and 3"
```

You should see:
1. A beautiful carousel with 4 operation cards
2. Click "Select" on Addition
3. Enter 5 and 3
4. See animated result: 5 + 3 = 8

## Troubleshooting

**Widgets don't appear?**
- Verify OPENAI_WIDGET_HOST is set: `vercel env ls`
- Check assets are accessible: Visit `https://your-url/assets/operation-selector.js`

**MCP server errors?**
- View logs: `vercel logs`
- Test health endpoint: `curl https://your-url/health`

**ChatGPT can't connect?**
- Double-check the MCP URL (must end with `/mcp`)
- Try deleting and recreating the app

## Next Steps

- Read [TESTING.md](TESTING.md) for comprehensive testing guide
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment info
- Read [README.md](README.md) for full documentation

## Quick Commands Reference

```bash
# Build everything
npm run build

# Build server only
npm run build:server

# Build widgets only
npm run build:widgets

# Start dev server for widgets
npm run dev

# Run server locally
npm start

# Deploy to Vercel
vercel --prod

# View logs
vercel logs

# List environment variables
vercel env ls
```

## File Structure

```
Calculator app/
├── src/server.ts          # MCP server (main logic)
├── widgets/
│   ├── operation-selector.tsx  # Carousel widget
│   ├── number-input.tsx        # Input form widget
│   ├── result-display.tsx      # Result widget
│   └── styles.css              # Shared styles
├── dist/                  # Compiled server (generated)
├── assets/                # Built widgets (generated)
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Widget build config
├── tailwind.config.js     # Styling config
└── vercel.json            # Deployment config
```

## Help & Support

- **Build errors?** Check `npm run build` output
- **Deployment issues?** Check Vercel dashboard
- **Widget problems?** Test locally with `npm run dev`
- **MCP issues?** Check server logs

For detailed help, see the other docs:
- README.md - Full documentation
- DEPLOYMENT.md - Deployment details
- TESTING.md - Testing strategies

## Success Checklist

- [ ] npm install completed
- [ ] npm run build succeeded
- [ ] Deployed to Vercel
- [ ] OPENAI_WIDGET_HOST set
- [ ] App created in ChatGPT
- [ ] Calculator works (test all 4 operations)

## What Makes This Special?

**Calcufy Calculator** is a fully functional MCP app that demonstrates:

✅ **Interactive Widgets** - Beautiful React components
✅ **Multi-step Flow** - Operation selection → Input → Result
✅ **Animated UI** - Smooth transitions and effects
✅ **Error Handling** - Division by zero protection
✅ **Decimal Support** - Works with any numbers
✅ **Production Ready** - Deployed on Vercel

You now have a template for building your own MCP apps with custom UI!

## Customization Ideas

Want to extend Calcufy?

- Add more operations (power, square root, percentage)
- Add calculation history
- Support multiple calculations in sequence
- Add unit conversions
- Create a scientific calculator mode
- Add keyboard shortcuts
- Support complex numbers

The codebase is modular and easy to extend!

## One-Line Test

After setup, test with:

```
Using Calcufy Calculator, what is 12 times 8?
```

Expected: Beautiful widget showing 12 × 8 = 96

🎉 **Congratulations!** You've successfully deployed a ChatGPT MCP App!
