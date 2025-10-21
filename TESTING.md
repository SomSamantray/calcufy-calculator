# Testing Guide for Calcufy Calculator

This guide explains how to test the Calcufy Calculator MCP app locally and in ChatGPT.

## Option 1: Test Locally with Claude Desktop (Recommended)

### Prerequisites
- Claude Desktop app installed (macOS/Windows)
- Project built (`npm run build`)

### Step 1: Locate Claude Desktop Config

The Claude Desktop configuration file location depends on your OS:

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

### Step 2: Add Calcufy to Config

Open the config file and add the Calcufy server:

```json
{
  "mcpServers": {
    "calcufy-calculator": {
      "command": "node",
      "args": [
        "/Users/apple/Documents/Calculator app/dist/server.js"
      ],
      "env": {
        "OPENAI_WIDGET_HOST": "http://localhost:4444"
      }
    }
  }
}
```

**Important:** Update the path to match your actual project location!

### Step 3: Start Widget Server

In a terminal, start the development server for widgets:

```bash
cd ~/Documents/"Calculator app"
npm run dev
```

This starts Vite on http://localhost:4444 serving the widget assets.

### Step 4: Restart Claude Desktop

Quit Claude Desktop completely and relaunch it.

### Step 5: Verify MCP Connection

In Claude Desktop, check if the server connected:
- Look for a status indicator showing MCP servers
- You should see "calcufy-calculator" listed

### Step 6: Test the Calculator

Try these prompts in Claude Desktop:

```
"Use the calcufy-calculator tool"
"I want to calculate something"
"Help me add two numbers"
```

**Expected flow:**
1. Widget carousel appears with 4 operation cards
2. Select an operation (Add, Subtract, Multiply, Divide)
3. Input form appears for two numbers
4. Result displays in animated card

## Option 2: Test with ChatGPT (Production)

### Prerequisites
- ChatGPT Plus or Team subscription
- Project deployed to Vercel (see DEPLOYMENT.md)

### Step 1: Enable Developer Mode

1. Go to https://chatgpt.com
2. Click profile → Settings
3. Navigate to **Apps & Connectors**
4. Enable **Developer mode** under Advanced Settings

### Step 2: Create App

1. Click **Create** in Apps section
2. Configure:
   - **Name**: Calcufy Calculator
   - **MCP URL**: Your Vercel URL + `/mcp`
     - Example: `https://calcufy-calculator.vercel.app/mcp`
   - **Authentication**: No authentication
   - Check: "I trust this application"
3. Click Create

### Step 3: Test in ChatGPT

Start new chat and try:

```
"Using Calcufy Calculator, help me calculate"
"Use Calcufy to multiply two numbers"
```

## Troubleshooting

### Issue: Widgets don't appear in Claude Desktop

**Diagnostic Steps:**
1. Check if widget server is running (`npm run dev`)
2. Visit http://localhost:4444/assets/operation-selector.js in browser
   - Should show JavaScript code
3. Check Claude Desktop logs:
   - macOS: `~/Library/Logs/Claude/mcp*.log`
   - Windows: `%APPDATA%\Claude\logs\mcp*.log`

**Solutions:**
- Ensure `OPENAI_WIDGET_HOST` is set to `http://localhost:4444`
- Verify dist/server.js exists (run `npm run build:server`)
- Check file paths are correct in config

### Issue: MCP server not connecting

**Diagnostic Steps:**
1. Test server standalone:
```bash
node dist/server.js
# Should show: "Calcufy MCP Server running on stdio"
```

2. Check for TypeScript compilation errors:
```bash
npm run build:server
```

**Solutions:**
- Rebuild the project: `npm run build`
- Check Node.js version (requires 18+)
- Verify all dependencies installed: `npm install`

### Issue: Tool not appearing in ChatGPT

**Diagnostic Steps:**
1. Verify deployment:
```bash
curl https://your-url.vercel.app/health
```

2. Check MCP endpoint responds:
```bash
curl -X POST https://your-url.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**Solutions:**
- Verify MCP URL is correct in ChatGPT settings
- Check Vercel deployment logs
- Ensure OPENAI_WIDGET_HOST environment variable is set
- Try deleting and recreating the app in ChatGPT

### Issue: Carousel doesn't scroll

**Diagnostic Steps:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify embla-carousel loaded

**Solutions:**
- Rebuild widgets: `npm run build:widgets`
- Check that styles.css is loading
- Test widget in isolation: http://localhost:4444

### Issue: Calculation returns error

**Diagnostic Steps:**
1. Check what inputs were provided
2. Look for division by zero
3. Check number parsing

**Solutions:**
- Ensure numbers are valid decimals
- For division, second number cannot be 0
- Check browser/Claude console for errors

## Manual Widget Testing

You can test widgets independently without the full MCP setup.

### Create Test HTML Files

**Test Operation Selector:**
```html
<!-- test-operation-selector.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="http://localhost:4444/assets/styles.css">
</head>
<body>
  <div id="widget-root"></div>
  <script type="module" src="http://localhost:4444/assets/operation-selector.js"></script>
</body>
</html>
```

**Test Number Input:**
```html
<!-- test-number-input.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="http://localhost:4444/assets/styles.css">
</head>
<body>
  <div id="widget-root"></div>
  <script type="module">
    // Simulate tool response data
    window.dispatchEvent(new CustomEvent('openai:tool_response', {
      detail: {
        structuredContent: {
          operation: 'add',
          operationSymbol: '+'
        }
      }
    }));
  </script>
  <script type="module" src="http://localhost:4444/assets/number-input.js"></script>
</body>
</html>
```

**Test Result Display:**
```html
<!-- test-result-display.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="http://localhost:4444/assets/styles.css">
</head>
<body>
  <div id="widget-root"></div>
  <script type="module">
    // Simulate tool response with result
    window.dispatchEvent(new CustomEvent('openai:tool_response', {
      detail: {
        structuredContent: {
          operation: 'add',
          operationSymbol: '+',
          number1: 5,
          number2: 3,
          result: 8
        }
      }
    }));
  </script>
  <script type="module" src="http://localhost:4444/assets/result-display.js"></script>
</body>
</html>
```

### Test in Browser

1. Start widget server: `npm run dev`
2. Open test HTML files in browser
3. Verify each widget renders correctly

## Test Cases

### Basic Operations

**Test 1: Addition**
- Input: 5 + 3
- Expected: 8

**Test 2: Subtraction**
- Input: 10 - 4
- Expected: 6

**Test 3: Multiplication**
- Input: 6 × 7
- Expected: 42

**Test 4: Division**
- Input: 20 ÷ 4
- Expected: 5

### Decimal Numbers

**Test 5: Decimal Addition**
- Input: 3.14 + 2.86
- Expected: 6

**Test 6: Decimal Division**
- Input: 7.5 ÷ 2.5
- Expected: 3

### Edge Cases

**Test 7: Division by Zero**
- Input: 10 ÷ 0
- Expected: Error message "Cannot divide by zero"

**Test 8: Large Numbers**
- Input: 999999 × 999999
- Expected: 999998000001

**Test 9: Negative Results**
- Input: 5 - 10
- Expected: -5

**Test 10: Very Small Decimals**
- Input: 0.1 + 0.2
- Expected: 0.3 (handles floating point precision)

## Performance Testing

### Widget Load Time

Widgets should load in < 500ms on good connection.

Test:
```bash
curl -w "@-" -o /dev/null -s "http://localhost:4444/assets/operation-selector.js" <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
         time_total:  %{time_total}\n
EOF
```

### Bundle Size

Check widget bundle sizes:
```bash
ls -lh assets/
```

Target sizes:
- operation-selector.js: < 50KB
- number-input.js: < 10KB
- result-display.js: < 10KB
- styles.css: < 20KB

## Debugging Tips

### Enable Verbose Logging

Add to server.ts temporarily:

```typescript
console.error("Tool called:", request.params.name);
console.error("Arguments:", JSON.stringify(request.params.arguments));
```

### Check Widget State

In browser console while widget is open:

```javascript
// Check if openai bridge is available
console.log(window.openai);

// Manually trigger state change
window.openai?.widget?.setState({ test: "data" });
```

### Inspect MCP Messages

For Claude Desktop, check logs:
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

## Next Steps After Testing

Once testing is complete:

- [ ] All 4 operations work correctly
- [ ] Widgets render properly
- [ ] Error handling works (division by zero)
- [ ] Decimals are supported
- [ ] Animations are smooth
- [ ] Deploy to production (see DEPLOYMENT.md)
- [ ] Share with team/users

## Support

If issues persist:
- Check project README.md
- Review DEPLOYMENT.md
- Inspect browser console
- Check MCP server logs
- Verify all build steps completed
