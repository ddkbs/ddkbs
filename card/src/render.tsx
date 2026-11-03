// Renders the HeatTrail component to a static SVG file for the profile README.
// Usage: tsx src/render.tsx <out.svg>
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import HeatTrail from "./HeatTrail";

const out = process.argv[2] ?? "heat.svg";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, renderToStaticMarkup(<HeatTrail />) + "\n");
console.log(`wrote ${out}`);
