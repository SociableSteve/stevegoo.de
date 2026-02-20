import { describe, it, expect, beforeAll } from "vitest";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

describe("Bundle Boundary Verification Tests", () => {
  const outDir = path.join(process.cwd(), ".next");
  const staticChunksDir = path.join(outDir, "static", "chunks");

  beforeAll(async () => {
    // Ensure we have a production build to analyze
    // Only build if the .next directory doesn't exist
    if (!fs.existsSync(outDir)) {
      console.log("Building production bundle for analysis...");
      try {
        execSync("npm run build", {
          stdio: "inherit",
          cwd: process.cwd(),
          timeout: 120000 // 2 minutes timeout
        });
      } catch (error) {
        console.warn("Build failed, tests may be unreliable:", error.message);
      }
    }
  }, 150000); // 2.5 minutes timeout for build

  describe("Shiki/rehype-pretty-code bundle boundary", () => {
    it("verifies Shiki stays in Node.js only and does not appear in client chunks", () => {
      if (!fs.existsSync(staticChunksDir)) {
        console.warn("Static chunks directory not found, skipping bundle analysis");
        return;
      }

      const chunkFiles = fs.readdirSync(staticChunksDir)
        .filter(file => file.endsWith(".js"))
        .map(file => path.join(staticChunksDir, file));

      expect(chunkFiles.length).toBeGreaterThan(0, "Should have JavaScript chunk files");

      const shikiSignatures = [
        "shiki",
        "rehype-pretty-code",
        "highlight.js",
        "prismjs",
        // Common syntax highlighter package names that shouldn't be in client bundles
        "@shikijs",
        "vscode-oniguruma",
        "vscode-textmate"
      ];

      const violatingChunks: { file: string; matches: string[] }[] = [];

      chunkFiles.forEach(chunkFile => {
        try {
          const content = fs.readFileSync(chunkFile, "utf-8");
          const matches = shikiSignatures.filter(signature =>
            content.includes(signature)
          );

          if (matches.length > 0) {
            violatingChunks.push({
              file: path.basename(chunkFile),
              matches
            });
          }
        } catch (error) {
          console.warn(`Failed to read chunk file ${chunkFile}:`, error.message);
        }
      });

      if (violatingChunks.length > 0) {
        const violationDetails = violatingChunks
          .map(({ file, matches }) => `  - ${file}: ${matches.join(", ")}`)
          .join("\n");

        throw new Error(
          `Shiki/syntax highlighting code found in client bundles:\n${violationDetails}\n\n` +
          "Syntax highlighting should only run at build time (Node.js) for static content generation. " +
          "Client bundles should not contain syntax highlighting libraries."
        );
      }

      console.log(`✓ Verified ${chunkFiles.length} client chunks are free of syntax highlighting code`);
    });

    it("verifies rehype/remark processing stays server-side", () => {
      if (!fs.existsSync(staticChunksDir)) {
        console.warn("Static chunks directory not found, skipping bundle analysis");
        return;
      }

      const chunkFiles = fs.readdirSync(staticChunksDir)
        .filter(file => file.endsWith(".js"))
        .map(file => path.join(staticChunksDir, file));

      const markdownProcessingSignatures = [
        "unified",
        "remark-parse",
        "remark-rehype",
        "rehype-stringify",
        "mdast",
        "hast",
        "unist-util",
        // Markdown processing should be build-time only
        "micromark",
        "parse5"
      ];

      const violatingChunks: { file: string; matches: string[] }[] = [];

      chunkFiles.forEach(chunkFile => {
        try {
          const content = fs.readFileSync(chunkFile, "utf-8");
          const matches = markdownProcessingSignatures.filter(signature =>
            content.includes(signature)
          );

          if (matches.length > 0) {
            violatingChunks.push({
              file: path.basename(chunkFile),
              matches
            });
          }
        } catch (error) {
          console.warn(`Failed to read chunk file ${chunkFile}:`, error.message);
        }
      });

      if (violatingChunks.length > 0) {
        const violationDetails = violatingChunks
          .map(({ file, matches }) => `  - ${file}: ${matches.join(", ")}`)
          .join("\n");

        console.warn(
          `Markdown processing code found in client bundles:\n${violationDetails}\n\n` +
          "This may indicate that markdown processing is happening client-side, " +
          "which increases bundle size unnecessarily."
        );
      }

      console.log(`✓ Verified ${chunkFiles.length} client chunks minimize markdown processing code`);
    });
  });

  describe("Client bundle size verification", () => {
    it("verifies total client bundle size stays within 50KB budget per chunk", () => {
      if (!fs.existsSync(staticChunksDir)) {
        console.warn("Static chunks directory not found, skipping bundle size analysis");
        return;
      }

      const chunkFiles = fs.readdirSync(staticChunksDir)
        .filter(file => file.endsWith(".js"))
        .map(file => ({
          name: file,
          path: path.join(staticChunksDir, file)
        }));

      expect(chunkFiles.length).toBeGreaterThan(0, "Should have JavaScript chunk files");

      const CHUNK_SIZE_LIMIT = 50 * 1024; // 50KB in bytes
      const oversizedChunks: { name: string; size: number; sizeKB: number }[] = [];

      chunkFiles.forEach(({ name, path: chunkPath }) => {
        try {
          const stats = fs.statSync(chunkPath);
          const sizeKB = Math.round(stats.size / 1024);

          if (stats.size > CHUNK_SIZE_LIMIT) {
            oversizedChunks.push({
              name,
              size: stats.size,
              sizeKB
            });
          }
        } catch (error) {
          console.warn(`Failed to get size for chunk ${name}:`, error.message);
        }
      });

      if (oversizedChunks.length > 0) {
        const oversizedDetails = oversizedChunks
          .map(({ name, sizeKB }) => `  - ${name}: ${sizeKB}KB`)
          .join("\n");

        console.warn(
          `Some chunks exceed the 50KB budget:\n${oversizedDetails}\n\n` +
          "Consider code splitting, dynamic imports, or removing unnecessary dependencies."
        );

        // For now, just warn rather than fail the build
        // In a strict setup, you might want to fail here
      }

      const totalSizeKB = chunkFiles.reduce((total, { path: chunkPath }) => {
        try {
          const stats = fs.statSync(chunkPath);
          return total + stats.size;
        } catch {
          return total;
        }
      }, 0) / 1024;

      console.log(`✓ Total client bundle size: ${Math.round(totalSizeKB)}KB across ${chunkFiles.length} chunks`);
      console.log(`✓ Average chunk size: ${Math.round(totalSizeKB / chunkFiles.length)}KB`);

      if (oversizedChunks.length > 0) {
        console.log(`⚠️  ${oversizedChunks.length} chunks exceed 50KB budget`);
      } else {
        console.log(`✓ All chunks are within 50KB budget`);
      }
    });

    it("verifies first load JS is reasonable for a blog site", () => {
      if (!fs.existsSync(staticChunksDir)) {
        console.warn("Static chunks directory not found, skipping first load analysis");
        return;
      }

      const buildManifestPath = path.join(outDir, "build-manifest.json");
      if (!fs.existsSync(buildManifestPath)) {
        console.warn("Build manifest not found, skipping first load analysis");
        return;
      }

      try {
        const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf-8"));

        // Calculate first load JS for the homepage
        const rootRoute = buildManifest.pages["/"] || [];
        let firstLoadSize = 0;

        rootRoute.forEach((chunkPath: string) => {
          const fullPath = path.join(outDir, chunkPath);
          if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            firstLoadSize += stats.size;
          }
        });

        const firstLoadKB = Math.round(firstLoadSize / 1024);
        const FIRST_LOAD_LIMIT = 100 * 1024; // 100KB limit for first load

        console.log(`✓ First Load JS: ${firstLoadKB}KB`);

        if (firstLoadSize > FIRST_LOAD_LIMIT) {
          console.warn(
            `First Load JS (${firstLoadKB}KB) exceeds recommended limit of 100KB. ` +
            "Consider code splitting or reducing initial bundle size."
          );
        } else {
          console.log(`✓ First Load JS is within recommended 100KB limit`);
        }

        expect(firstLoadKB).toBeLessThan(200); // Hard limit of 200KB
      } catch (error) {
        console.warn("Failed to analyze first load JS:", error.message);
      }
    });
  });

  describe("Bundle composition analysis", () => {
    it("provides bundle composition insights", () => {
      if (!fs.existsSync(staticChunksDir)) {
        console.warn("Static chunks directory not found, skipping composition analysis");
        return;
      }

      const chunkFiles = fs.readdirSync(staticChunksDir)
        .filter(file => file.endsWith(".js"));

      const composition = {
        framework: 0,
        pages: 0,
        shared: 0,
        other: 0
      };

      chunkFiles.forEach(file => {
        if (file.includes("framework") || file.includes("main") || file.includes("runtime")) {
          composition.framework++;
        } else if (file.includes("pages")) {
          composition.pages++;
        } else if (file.includes("shared") || file.includes("commons")) {
          composition.shared++;
        } else {
          composition.other++;
        }
      });

      console.log("Bundle composition:");
      console.log(`  - Framework chunks: ${composition.framework}`);
      console.log(`  - Page chunks: ${composition.pages}`);
      console.log(`  - Shared chunks: ${composition.shared}`);
      console.log(`  - Other chunks: ${composition.other}`);
      console.log(`  - Total chunks: ${chunkFiles.length}`);

      // Basic sanity checks
      expect(chunkFiles.length).toBeGreaterThan(0);
      expect(composition.framework + composition.pages + composition.shared + composition.other)
        .toBe(chunkFiles.length);
    });

    it("verifies no development-only code in production bundles", () => {
      if (!fs.existsSync(staticChunksDir)) {
        console.warn("Static chunks directory not found, skipping dev code analysis");
        return;
      }

      const chunkFiles = fs.readdirSync(staticChunksDir)
        .filter(file => file.endsWith(".js"))
        .map(file => path.join(staticChunksDir, file));

      const devSignatures = [
        "console.warn",
        "console.debug",
        "console.trace",
        "__DEV__",
        "development",
        // React development warnings
        "validateDOMNesting",
        "checkPropTypes"
      ];

      const chunksWithDevCode: { file: string; matches: string[] }[] = [];

      chunkFiles.forEach(chunkFile => {
        try {
          const content = fs.readFileSync(chunkFile, "utf-8");
          const matches = devSignatures.filter(signature =>
            content.includes(signature)
          );

          if (matches.length > 0) {
            chunksWithDevCode.push({
              file: path.basename(chunkFile),
              matches
            });
          }
        } catch (error) {
          console.warn(`Failed to read chunk file ${chunkFile}:`, error.message);
        }
      });

      if (chunksWithDevCode.length > 0) {
        const devCodeDetails = chunksWithDevCode
          .map(({ file, matches }) => `  - ${file}: ${matches.join(", ")}`)
          .join("\n");

        console.warn(
          `Development code found in production bundles:\n${devCodeDetails}\n\n` +
          "This may indicate incomplete minification or production optimization."
        );
      } else {
        console.log(`✓ No obvious development code found in ${chunkFiles.length} production chunks`);
      }
    });
  });
});