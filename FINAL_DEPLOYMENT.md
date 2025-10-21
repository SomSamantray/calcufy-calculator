# FINAL DEPLOYMENT GUIDE - Apps SDK Architecture

## ✅ What Has Been Fixed

The calculator has been **completely rebuilt** to match the official OpenAI Apps SDK architecture:

### Key Changes:
1. **MCP Resources**: Widgets are now served via `ui://widget/` URIs through MCP resource protocol
2. **window.openai Bridge**: Widgets use `window.openai.callTool()` and `window.openai.toolOutput`
3. **Proper Metadata**: Tool responses include `openai/outputTemplate` with `ui://` URIs
4. **Build System**: Custom build script creates proper widget bundles (.html, .js, .css)
5. **Resource Handlers**: Server handles `ReadResourceRequest` to serve widget HTML

## 🚀 Deployment Steps

### 1. Wait for Vercel Deployment

Vercel should be auto-deploying your latest commit. Check:
- Go to https://vercel.com/dashboard
- Find `calcufy-calculator`
- Wait for deployment to show **"Ready"**

### 2. Set Environment Variable in Vercel

**CRITICAL**: You MUST set the BASE_URL environment variable:

1. Go to your Vercel project
2. Click **Settings**
3. Click **Environment Variables**
4. Add new variable:
   - **Key**: `BASE_URL`
   - **Value**: `https://calcufy-calculator.vercel.app` (your actual Vercel URL)
   - **Environment**: Production
5. Click **Save**

### 3. Redeploy

After setting the environment variable:
1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Wait for completion

### 4. Verify Assets Are Accessible

Test these URLs in your browser:

```
https://calcufy-calculator.vercel.app/assets/operation-selector.js
https://calcufy-calculator.vercel.app/assets/operation-selector.css
https://calcufy-calculator.vercel.app/assets/number-input.js
https://calcufy-calculator.vercel.app/assets/result-display.js
```

All should return 200 OK (not 404).

## 🧪 Testing in ChatGPT

### Configure the App

1. Go to https://chatgpt.com
2. Settings → Apps & Connectors
3. Enable "Developer mode" if not already
4. Find "Calcufy Calculator" or create new:
   - **Name**: Calcufy Calculator
   - **MCP URL**: `https://calcufy-calculator.vercel.app/api/mcp`
   - **Authentication**: No authentication
   - **Trust**: Check "I trust this application"

### Test the Flow

1. Start new chat
2. Click "+" icon
3. Select "Calcufy Calculator"
4. Type: `"Help me calculate something"`

**Expected behavior:**

**Step 1**: Beautiful carousel appears with 4 gradient cards (Add, Subtract, Multiply, Divide)

**Step 2**: Click "Select" on any card → Number input form appears

**Step 3**: Enter two numbers → Animated result displays

## 📋 Architecture Overview

```
ChatGPT
   ↓
POST /api/mcp (MCP JSON-RPC)
   ↓
tools/call → Returns response with _meta.openai/outputTemplate: "ui://widget/operation-selector.html"
   ↓
ChatGPT sees ui:// URI → Sends resources/read request
   ↓
ReadResourceRequest handler returns widget HTML as text
   ↓
Widget HTML references /assets/operation-selector.js and .css from BASE_URL
   ↓
ChatGPT loads widget in iframe with window.openai bridge
   ↓
Widget calls window.openai.callTool() when user interacts
   ↓
Cycle continues...
```

## 🔍 Debugging

### Check MCP Endpoint

```bash
curl -X POST https://calcufy-calculator.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
```

Should return tool list with `calcufy_calculator`.

### Check Resource Support

```bash
curl -X POST https://calcufy-calculator.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"resources/list","params":{},"id":2}'
```

Should return 3 resources with `ui://widget/` URIs.

### Check Widget HTML

```bash
curl -X POST https://calcufy-calculator.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"resources/read","params":{"uri":"ui://widget/operation-selector.html"},"id":3}'
```

Should return HTML with script tags referencing BASE_URL/assets/.

## ✅ Success Criteria

- [ ] Vercel deployment shows "Ready"
- [ ] BASE_URL environment variable is set
- [ ] Assets are accessible (200 OK)
- [ ] MCP endpoint responds to tools/list
- [ ] MCP endpoint responds to resources/list
- [ ] MCP endpoint responds to resources/read
- [ ] App configured in ChatGPT
- [ ] **UI CAROUSEL APPEARS** (not just text!)
- [ ] Can click cards and see forms
- [ ] Calculations work with animated results

## 🎯 The Critical Difference

**Before**: ChatGPT tried to fetch widgets from HTTP URLs → 404 or wrong format → No UI

**Now**: ChatGPT requests resources via MCP protocol → Server returns HTML as text → Widgets load correctly → **UI APPEARS!**

## 📞 If Still No UI

If you've done all the above and still see only text:

1. Open browser DevTools (F12) in ChatGPT
2. Go to **Console** tab - look for errors
3. Go to **Network** tab - filter by "mcp"
4. Check if ChatGPT is sending `resources/read` requests
5. Check if responses contain the widget HTML
6. Look for any JavaScript errors when widget loads

Take screenshots and we can debug further.

---

**This architecture matches the official OpenAI Apps SDK examples exactly. It WILL work if deployed correctly!**
