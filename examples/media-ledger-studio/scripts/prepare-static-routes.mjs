import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");

await mkdir(join(distDir, "demo-video"), { recursive: true });
await copyFile(join(distDir, "demo-video.html"), join(distDir, "demo-video", "index.html"));

console.log("Prepared static route: /demo-video");
