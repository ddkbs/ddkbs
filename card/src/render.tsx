// Fetches the contribution calendar and renders it as a heat grid SVG for the
// profile README. Uses $GITHUB_TOKEN, or the local `gh` login as a fallback.
// Usage: tsx src/render.tsx <out.svg> [user] [variant]
// Pass "gallery" as the variant to stack every variant into one SVG instead.
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import ContributionHeat, { DESCRIPTIONS, VARIANTS, type Day, type Variant } from "./ContributionHeat";

const out = process.argv[2] ?? "heat.svg";
const user = process.argv[3] ?? "ddkbs";
const variant = process.argv[4] ?? "pulse";
const token = process.env.GITHUB_TOKEN ?? execSync("gh auth token").toString().trim();

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query, variables: { login: user } }),
});
const json = await res.json();
if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors ?? json));

const calendar = json.data.user.contributionsCollection.contributionCalendar;
const weeks: Day[][] = calendar.weeks.map((w: { contributionDays: Day[] }) => w.contributionDays);

const render = (v: Variant, prefix = "") =>
  renderToStaticMarkup(<ContributionHeat weeks={weeks} total={calendar.totalContributions} variant={v} prefix={prefix} />);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, (variant === "gallery" ? gallery() : render(variant as Variant)) + "\n");
console.log(`wrote ${out} (${variant}, ${calendar.totalContributions} contributions)`);

// Every variant stacked with a label, inlined as nested <svg>s (images inside an
// SVG image don't animate). Prefixes keep their keyframe names apart.
function gallery() {
  const w = weeks.length * 14 + 40;
  const h = 7 * 14 + 54;
  const step = h + 44;
  const items = VARIANTS.map((v, i) => {
    const y = 24 + i * step;
    const inner = render(v, `${v}-`).replace(/^<svg [^>]*?width=/, `<svg x="0" y="${y + 24}" width=`);
    return `<text x="0" y="${y + 14}" font-family="ui-monospace,Menlo,monospace" font-size="13" fill="#f5f5f6">${i + 1}. ${v}<tspan fill="#8e8e96">  ${DESCRIPTIONS[v]}</tspan></text>
${inner}`;
  });
  const H = 24 + VARIANTS.length * step;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}"><rect width="${w}" height="${H}" fill="#0d1117"/>${items.join("")}</svg>`;
}
