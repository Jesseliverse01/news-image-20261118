// News image entry: ships one front-page PNG of 18 November 2026 and
// copies it into the output directory the grader reads. No network,
// no drawing at run time — the picture is already in the repository.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outDir, "entry.png");

mkdirSync(outDir, { recursive: true });
const bytes = readFileSync(source);
writeFileSync(target, bytes);
// Read the copy back and fail loudly if it differs: the grader runs
// this program twice and both runs must write the same bytes.
const written = readFileSync(target);
if (!written.equals(bytes)) {
  throw new Error(`verification failed: ${target} differs from ${source}`);
}
console.log(`wrote ${target} (${bytes.length} bytes, verified)`);
