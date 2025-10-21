# Calcufy Calculator - MCP App for ChatGPT

A beautiful, interactive calculator app built with the OpenAI Apps SDK and Model Context Protocol (MCP). This app provides an elegant calculation experience directly within ChatGPT conversations.

## Features

- **Interactive Carousel**: Choose from 4 calculation operations (Add, Subtract, Multiply, Divide) with beautiful gradient cards
- **Smart Input**: Clean, user-friendly number input interface with validation
- **Animated Results**: Eye-catching result display with smooth animations
- **Decimal Support**: Full support for decimal numbers and floating-point arithmetic
- **Error Handling**: Graceful handling of edge cases like division by zero

## Architecture

This app consists of three main components:

1. **MCP Server** (TypeScript/Node.js) - Handles tool registration and calculation logic
2. **UI Widgets** (React) - Three interactive widgets for operation selection, number input, and result display
3. **Deployment** (Vercel) - Serverless deployment with CDN hosting for widgets

## Project Structure

```
Calculator app/
├── src/
│   └── server.ts           # MCP server implementation
├── widgets/
│   ├── operation-selector.tsx  # Carousel widget for operation selection
│   ├── number-input.tsx        # Number input form widget
│   ├── result-display.tsx      # Animated result display widget
│   └── styles.css              # Shared Tailwind CSS styles
├── assets/                 # Built widget bundles (generated)
├── dist/                   # Compiled server code (generated)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── vercel.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Vercel account (for deployment)
- ChatGPT Plus or Team subscription (for testing)

### Installation

1. **Install dependencies**:
```bash
cd ~/Documents/"Calculator app"
npm install
```

2. **Build the project**:
```bash
npm run build
```

This will:
- Compile the TypeScript server to `dist/`
- Bundle the React widgets to `assets/`

### Local Development

1. **Start the development server**:
```bash
npm run dev
```

This starts Vite dev server on port 4444 for widget development.

2. **In another terminal, start the MCP server**:
```bash
npm start
```

The MCP server will run on port 3000.

## Deployment to Vercel

### Step 1: Initialize Git Repository

```bash
cd ~/Documents/"Calculator app"
git init
git add .
git commit -m "Initial commit - Calcufy Calculator MCP App"
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **calcufy-calculator** (or your choice)
- Directory? **./** (current directory)
- Want to override settings? **N**

### Step 3: Configure Environment Variable

After deployment, you'll get a URL like `https://calcufy-calculator.vercel.app`

Set the environment variable:

```bash
vercel env add OPENAI_WIDGET_HOST
```

Enter the value: `https://your-deployment-url.vercel.app`

Then redeploy:

```bash
vercel --prod
```

### Step 4: Note Your MCP Endpoint

Your MCP endpoint will be:
```
https://your-deployment-url.vercel.app/mcp
```

## Testing in ChatGPT

### Enable Developer Mode

1. Go to ChatGPT Settings
2. Navigate to **Apps & Connectors**
3. Scroll to **Advanced Settings**
4. Enable **"Developer mode"**

### Add Your App

1. Click **"Create"** in the Apps section
2. Fill in the details:
   - **Name**: Calcufy Calculator
   - **MCP Server URL**: `https://your-deployment-url.vercel.app/mcp`
   - **Authentication**: No authentication
   - Enable **"I trust this application"**
3. Click **"Create"**

### Use Your App

1. Start a new chat in ChatGPT
2. Click the **"+"** (Plus) icon in the message input
3. Find and select **"Calcufy Calculator"** from the "More" menu
4. Invoke the calculator:
   - "Using Calcufy Calculator, help me calculate something"
   - "Using Calcufy, I want to add two numbers"
   - Simply selecting the app will trigger the operation selector

### Expected Flow

1. **Operation Selection**: A carousel of 4 beautiful cards appears showing Add, Subtract, Multiply, and Divide operations
2. **Select Operation**: Click "Select" on any card
3. **Enter Numbers**: A form appears asking for two numbers
4. **View Result**: The result is displayed in an animated, beautiful card

## Customization

### Change Colors

Edit `widgets/operation-selector.tsx` to modify the gradient colors:

```typescript
const operations: Operation[] = [
  {
    id: 'add',
    gradient: 'from-green-400 to-emerald-600',  // Change these
    // ...
  },
  // ...
];
```

### Add More Operations

1. Add the operation to `src/server.ts` in the `calculate` function
2. Add the operation to `widgets/operation-selector.tsx` operations array
3. Rebuild and redeploy

### Modify Animations

Edit `widgets/result-display.tsx` to adjust animation timing and effects:

```typescript
className={`transform transition-all duration-500 delay-300 ...`}
```

## Troubleshooting

### Widget doesn't render
- Verify that `OPENAI_WIDGET_HOST` environment variable is set correctly
- Check that assets are built (`npm run build`)
- Ensure assets are accessible at `https://your-url/assets/`

### MCP endpoint not responding
- Check Vercel deployment logs
- Verify the endpoint URL is correct
- Test the health endpoint: `https://your-url/health`

### Calculation errors
- Check browser console for errors
- Verify number inputs are valid
- Check division by zero handling

## Technologies Used

- **OpenAI Apps SDK** - MCP server framework
- **React 18** - UI components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Embla Carousel** - Carousel functionality
- **Express** - HTTP server
- **Vercel** - Deployment platform

## License

MIT

## Support

For issues or questions:
- Check the [OpenAI Apps SDK documentation](https://platform.openai.com/docs/apps)
- Review the [MCP specification](https://modelcontextprotocol.io)
- Open an issue in this repository
