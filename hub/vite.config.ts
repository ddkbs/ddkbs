import { execSync } from "node:child_process";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Serves /api/profile from the GitHub GraphQL API, authenticated with the local
// `gh` login. Uses `viewer`, so private repos and contributions are included.
const QUERY = `{
  viewer {
    login name avatarUrl bio websiteUrl location createdAt
    followers { totalCount }
    following { totalCount }
    repositories(ownerAffiliations: OWNER, first: 100, orderBy: { field: PUSHED_AT, direction: DESC }) {
      totalCount
      nodes {
        name description url isPrivate isFork stargazerCount forkCount pushedAt
        primaryLanguage { name color }
        repositoryTopics(first: 4) { nodes { topic { name } } }
        languages(first: 10) { edges { size node { name color } } }
      }
    }
    pullRequests(first: 100, states: [MERGED, OPEN, CLOSED], orderBy: { field: CREATED_AT, direction: DESC }) {
      nodes {
        state
        repository { name nameWithOwner url stargazerCount isPrivate owner { login } primaryLanguage { name color } }
      }
    }
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount color } }
      }
    }
  }
}`;

function githubApi(): Plugin {
  return {
    name: "github-api",
    configureServer(server) {
      server.middlewares.use("/api/profile", async (_req, res) => {
        try {
          const token = process.env.GITHUB_TOKEN ?? execSync("gh auth token").toString().trim();
          const r = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ query: QUERY }),
          });
          const json = await r.json();
          res.statusCode = json.errors ? 502 : r.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(json.errors ? { error: json.errors } : json.data.viewer));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), githubApi()],
  server: { host: "127.0.0.1", port: 5179 },
});
