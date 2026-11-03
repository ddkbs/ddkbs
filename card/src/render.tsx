// Fetches the contribution calendar and renders it as a heat grid SVG for the
// profile README. Uses $GITHUB_TOKEN, or the local `gh` login as a fallback.
// Usage: tsx src/render.tsx <out.svg> [user]
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import ContributionHeat, { type Day } from "./ContributionHeat";

const out = process.argv[2] ?? "heat.svg";
const user = process.argv[3] ?? "ddkbs";
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

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, renderToStaticMarkup(<ContributionHeat weeks={weeks} total={calendar.totalContributions} />) + "\n");
console.log(`wrote ${out} (${calendar.totalContributions} contributions)`);
