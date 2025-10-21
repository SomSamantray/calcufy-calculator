import { build } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import * as path from "path";
import * as fs from "fs";
import glob from "fast-glob";

const ASSETS_DIR = "./assets";
const BASE_URL = process.env.BASE_URL || "http://localhost:4444";

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Find all widget entry points
const entries = await glob("widgets/*-{selector,input,display}.tsx");

console.log("Building widgets:", entries);

// Build each widget separately
for (const entry of entries) {
  const componentName = path.basename(entry, path.extname(entry));

  console.log(`\nBuilding ${componentName}...`);

  await build({
    plugins: [react(), tailwindcss()],
    build: {
      outDir: ASSETS_DIR,
      emptyOutDir: false,
      rollupOptions: {
        input: { [componentName]: entry },
        output: {
          entryFileNames: `${componentName}.js`,
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === "style.css") {
              return `${componentName}.css`;
            }
            return assetInfo.name!;
          },
          format: "es",
        },
      },
      minify: "esbuild",
      target: "es2022",
      cssCodeSplit: false,
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  });

  // Generate HTML file
  const normalizedBaseUrl = BASE_URL.replace(/\/$/, "");
  const html = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" crossorigin src="${normalizedBaseUrl}/assets/${componentName}.js"></script>
  <link rel="stylesheet" crossorigin href="${normalizedBaseUrl}/assets/${componentName}.css">
</head>
<body>
  <div id="${componentName}-root"></div>
</body>
</html>
`;

  const htmlPath = path.join(ASSETS_DIR, `${componentName}.html`);
  fs.writeFileSync(htmlPath, html, "utf8");

  console.log(`✓ Built ${componentName}.html, .js, .css`);
}

console.log("\n✅ All widgets built successfully!");
