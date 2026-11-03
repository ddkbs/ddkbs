// Renders the Wave component to a static SVG file for the profile README.
// Usage: tsx src/render.tsx <out.svg>
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import Wave from "./Wave";

const out = process.argv[2] ?? "wave.svg";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, renderToStaticMarkup(<Wave />) + "\n");
console.log(`wrote ${out}`);
