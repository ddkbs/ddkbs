import { useEffect, useMemo, useState } from "react";
import type { Day, Profile, Repo } from "./types";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(json.error));
        setProfile(json);
      })
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <div className="center muted">Could not load GitHub data: {error}</div>;
  if (!profile) return <div className="center muted">Loading…</div>;
  return <Hub p={profile} />;
}

function Hub({ p }: { p: Profile }) {
  const repos = p.repositories.nodes.filter((r) => !r.isFork);
  const stars = repos.reduce((s, r) => s + r.stargazerCount, 0);
  const privateCount = repos.filter((r) => r.isPrivate).length;
  const joined = new Date(p.createdAt);
  const yearsActive = new Date().getFullYear() - joined.getFullYear() + 1;
  const cal = p.contributionsCollection.contributionCalendar;

  return (
    <div className="page">
      <aside className="side">
        <img className="avatar" src={p.avatarUrl} alt="" />
        <h1>{p.name ?? p.login}</h1>
        <div className="handle">@{p.login}</div>
        {p.bio && <p className="bio">{p.bio}</p>}
        <a className="button" href={`https://github.com/${p.login}`} target="_blank" rel="noreferrer">
          <GitHubIcon /> Open on GitHub
        </a>
        <ul className="meta">
          {p.websiteUrl && (
            <li>
              <span>🔗</span>
              <a href={withProtocol(p.websiteUrl)} target="_blank" rel="noreferrer">
                {p.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            </li>
          )}
          {p.location && (
            <li>
              <span>📍</span>
              {p.location}
            </li>
          )}
          <li>
            <span>📅</span>Joined {joined.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </li>
          <li>
            <span>👥</span>
            <b>{p.followers.totalCount}</b>&nbsp;followers · <b>{p.following.totalCount}</b>&nbsp;following
          </li>
        </ul>
      </aside>

      <main className="main">
        <section className="stats">
          <Stat label="Repos" value={repos.length} hint={`${privateCount} private`} />
          <Stat label="Stars" value={stars} />
          <Stat label="Commits this year" value={p.contributionsCollection.totalCommitContributions} />
          <Stat label="Years active" value={yearsActive} />
        </section>

        <section>
          <header className="head">
            <h2>Contributions</h2>
            <span className="muted">
              <b className="fg">{fmt(cal.totalContributions)}</b> in the last year
            </span>
          </header>
          <div className="card">
            <Heatmap weeks={cal.weeks.map((w) => w.contributionDays)} />
          </div>
        </section>

        <Languages repos={repos} />
        <OpenSource p={p} />
        <Projects repos={repos} />
      </main>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="card stat">
      <div className="stat-value">{fmt(value)}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

const LEVELS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

function Heatmap({ weeks }: { weeks: Day[][] }) {
  const max = Math.max(1, ...weeks.flat().map((d) => d.contributionCount));
  const level = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
  const months = weeks.map((w, i) => {
    const m = new Date(w[0].date).getMonth();
    const prev = i > 0 ? new Date(weeks[i - 1][0].date).getMonth() : -1;
    return m !== prev ? new Date(w[0].date).toLocaleDateString("en-US", { month: "short" }) : "";
  });

  return (
    <div>
      <div className="heat" style={{ gridTemplateColumns: `28px repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {months.map((m, i) =>
          m ? (
            <span key={`m${i}`} className="heat-label" style={{ gridRow: 1, gridColumn: i + 2 }}>
              {m}
            </span>
          ) : null,
        )}
        {["Mon", "Wed", "Fri"].map((d, i) => (
          <span key={d} className="heat-label" style={{ gridRow: 3 + i * 2, gridColumn: 1 }}>
            {d}
          </span>
        ))}
        {weeks.map((week, wi) =>
          week.map((d) => (
            <span
              key={d.date}
              className="cell"
              style={{
                gridRow: new Date(d.date + "T00:00:00").getDay() + 2,
                gridColumn: wi + 2,
                background: LEVELS[level(d.contributionCount)],
              }}
              title={`${d.contributionCount} on ${d.date}`}
            />
          )),
        )}
      </div>
      <div className="heat-foot">
        <span className="muted">Last 52 weeks, incl. private</span>
        <span className="legend">
          less {LEVELS.map((c) => <span key={c} className="cell" style={{ background: c }} />)} more
        </span>
      </div>
    </div>
  );
}

function Languages({ repos }: { repos: Repo[] }) {
  const langs = useMemo(() => {
    const map = new Map<string, { color: string; size: number }>();
    for (const r of repos)
      for (const e of r.languages.edges) {
        const cur = map.get(e.node.name) ?? { color: e.node.color ?? "#888", size: 0 };
        cur.size += e.size;
        map.set(e.node.name, cur);
      }
    const total = [...map.values()].reduce((s, l) => s + l.size, 0) || 1;
    return {
      total,
      list: [...map.entries()]
        .map(([name, l]) => ({ name, ...l, pct: (l.size / total) * 100 }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 6),
    };
  }, [repos]);

  // Donut segments as stroke-dasharray arcs on a circle with circumference 100
  let offset = 0;
  return (
    <section>
      <header className="head">
        <h2>Languages</h2>
      </header>
      <div className="card langs">
        <svg viewBox="0 0 42 42" className="donut">
          {langs.list.map((l) => {
            const seg = (
              <circle
                key={l.name}
                cx="21"
                cy="21"
                r="15.915"
                fill="none"
                stroke={l.color}
                strokeWidth="5"
                strokeDasharray={`${l.pct} ${100 - l.pct}`}
                strokeDashoffset={25 - offset}
              />
            );
            offset += l.pct;
            return seg;
          })}
          <text x="21" y="22.5" textAnchor="middle" className="donut-label">
            {langs.list.length} langs
          </text>
        </svg>
        <ul className="lang-list">
          {langs.list.map((l) => (
            <li key={l.name}>
              <span className="dot" style={{ background: l.color }} />
              {l.name}
              <span className="muted right">{l.pct < 1 ? "<1" : Math.round(l.pct)}%</span>
            </li>
          ))}
          <li className="muted small">Based on {(langs.total / 1024 / 1024).toFixed(1)} MB of code</li>
        </ul>
      </div>
    </section>
  );
}

function OpenSource({ p }: { p: Profile }) {
  const byRepo = new Map<string, { repo: Profile["pullRequests"]["nodes"][number]["repository"]; count: number }>();
  for (const pr of p.pullRequests.nodes) {
    if (pr.repository.owner.login === p.login || pr.repository.isPrivate) continue;
    const cur = byRepo.get(pr.repository.nameWithOwner) ?? { repo: pr.repository, count: 0 };
    cur.count++;
    byRepo.set(pr.repository.nameWithOwner, cur);
  }
  if (!byRepo.size) return null;

  return (
    <section>
      <header className="head">
        <h2>Open source contributions</h2>
      </header>
      <div className="grid">
        {[...byRepo.values()].map(({ repo, count }) => (
          <a key={repo.nameWithOwner} className="card repo" href={repo.url} target="_blank" rel="noreferrer">
            <div className="repo-top">
              <span className="repo-name">{repo.name}</span>
              {repo.primaryLanguage && <span className="pill">{repo.primaryLanguage.name}</span>}
            </div>
            <p className="muted">Contributed to {repo.owner.login}</p>
            <div className="repo-foot muted">
              <span>⇄ {count} PR{count > 1 ? "s" : ""}</span>
              <span>★ {fmt(repo.stargazerCount)}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

type Sort = "stars" | "recent";
type Filter = "all" | "public" | "private";

function Projects({ repos }: { repos: Repo[] }) {
  const [sort, setSort] = useState<Sort>("recent");
  const [filter, setFilter] = useState<Filter>("all");
  const shown = repos
    .filter((r) => filter === "all" || (filter === "private") === r.isPrivate)
    .sort((a, b) => (sort === "stars" ? b.stargazerCount - a.stargazerCount : b.pushedAt.localeCompare(a.pushedAt)));

  return (
    <section>
      <header className="head">
        <h2>Projects</h2>
        <div className="controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="recent">Recently pushed</option>
            <option value="stars">Most stars</option>
          </select>
        </div>
      </header>
      <div className="grid">
        {shown.map((r) => (
          <a key={r.name} className="card repo" href={r.url} target="_blank" rel="noreferrer">
            <div className="repo-top">
              <span className="repo-name">
                {r.name}
                {r.isPrivate && <span className="lock">private</span>}
              </span>
              {r.primaryLanguage && <span className="pill">{r.primaryLanguage.name}</span>}
            </div>
            <p className="muted desc">{r.description ?? "No description"}</p>
            {r.repositoryTopics.nodes.length > 0 && (
              <div className="topics">
                {r.repositoryTopics.nodes.map((t) => (
                  <span key={t.topic.name} className="topic">
                    {t.topic.name}
                  </span>
                ))}
              </div>
            )}
            <div className="repo-foot muted">
              <span>★ {fmt(r.stargazerCount)}</span>
              <span>⑂ {fmt(r.forkCount)}</span>
              <span className="right">{relative(r.pushedAt)}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function relative(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function withProtocol(url: string) {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
