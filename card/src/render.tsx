// Renders the Flow component to a static SVG file for the profile README.
// Usage: tsx src/render.tsx <out.svg>
import { writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import Flow from "./Flow";

const out = process.argv[2] ?? "flow.svg";
writeFileSync(out, renderToStaticMarkup(<Flow />) + "\n");
console.log(`wrote ${out}`);
