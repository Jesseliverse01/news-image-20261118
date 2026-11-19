// news-image-20261118 — v2 entrypoint.
//
// The front page is pre-rendered (entry.png, 1024x1024, PIL text on AI
// panels) and checked in; this program only ships it to the directory
// the grader reads. No network, no fonts, no drawing at run time.
// The grader runs it twice, so both runs must write identical bytes.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const MAX_BYTES = 1_048_576; // kit limit: the image must be at most 1 MiB
// Pinned digest of the approved v2 front page: if entry.png is ever
// corrupted or swapped, the run fails here instead of shipping bad bytes.
const EXPECTED_SHA256 =
  "de6a9a1db9af0873cff8b679211b858c361483f0f65b738e625fedf8e14db1e5";
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;
const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outDir, "entry.png");

const bytes = readFileSync(source);
if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}
// PNG header: width/height live in the IHDR chunk at bytes 16..24.
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
  throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
}
const sha = createHash("sha256").update(bytes).digest("hex");
if (sha !== EXPECTED_SHA256) {
  throw new Error(`entry.png sha256 ${sha} does not match the pinned digest`);
}
mkdirSync(outDir, { recursive: true });
writeFileSync(target, bytes);

// Read the copy back and fail loudly if it differs.
const written = readFileSync(target);
if (!written.equals(bytes)) {
  throw new Error(`verify failed: ${target} differs from ${source}`);
}
console.log(`wrote ${target} (${bytes.length} bytes, sha256 ${sha}, verified)`);
