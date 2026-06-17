import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const distDir = "dist";
const indexFile = join(distDir, "index.html");
const page2Dir = join(distDir, "page2");

await mkdir(page2Dir, { recursive: true });
await copyFile(indexFile, join(page2Dir, "index.html"));
