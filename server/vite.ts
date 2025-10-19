import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
// import viteConfig from "../vite.config.js"; // File doesn't exist, using inline config
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    configFile: false,
    root: path.resolve(__dirname, "..", "client"), // 🎯 MB.MD FIX: Set client/ as root directory
    resolve: {
      // 🎯 MB.MD FIX: Manually configure path aliases since configFile is disabled
      alias: {
        '@': path.resolve(__dirname, "..", "client", "src"),
        '@shared': path.resolve(__dirname, "..", "shared"),
      },
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        // Log error but don't crash the server for dependency scan issues
        viteLogger.error(msg, options);
        // Only exit on critical errors, not dependency resolution issues
        if (msg.includes('Failed to scan for dependencies')) {
          viteLogger.warn('Dependency scan failed, but continuing with development server...');
        } else {
          process.exit(1);
        }
      },
    },
    server: {
      middlewareMode: true,
      hmr: { server },
      host: true, // Allow all hosts (was allowedHosts: true)
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
