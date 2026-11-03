// The GitHub contribution graph drawn as the heat grid from davidkubus.dev.
// Each day glows in the site's "aurora" palette at a heat that matches its
// contribution level, and cells cool down with the site's cooling curve.
// GitHub shows READMEs as images without JS, so every animation is baked into
// CSS keyframes: a variant describes each cell as a heat-over-time track plus
// the delay at which that track starts.

export type Level = "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
export type Day = { date: string; contributionCount: number; contributionLevel: Level };

export const VARIANTS = ["pulse", "loop", "replay", "ripple", "trail", "flicker"] as const;
export type Variant = (typeof VARIANTS)[number];

export const DESCRIPTIONS: Record<Variant, string> = {
  pulse: "reveal on the first sweep, then a heat pulse every 5s",
  loop: "sweep reveals, holds, then fades out left to right",
  replay: "replays the year day by day, then fades out",
  ripple: "ripples out from today, then fades out",
  trail: "a virtual cursor drags a heat trail across, like the site",
  flicker: "active days twinkle at random",
};

const CELL = 14;
const PAD = 20;
const FOOT = 34;

const COOL = 0.85; // heat lost per second, same as the site
const RAMP = 0.12; // seconds for a cell to heat up

type Stop = [stop: number, r: number, g: number, b: number];

const AURORA: Stop[] = [
  [0.0, 10, 30, 60],
  [0.25, 15, 118, 110],
  [0.5, 20, 184, 166],
  [0.7, 52, 211, 153],
  [0.86, 163, 230, 53],
  [1.0, 236, 252, 203],
];

function color(t: number) {
  let i = 1;
  while (i < AURORA.length - 1 && t > AURORA[i][0]) i++;
  const [s0, r0, g0, b0] = AURORA[i - 1];
  const [s1, r1, g1, b1] = AURORA[i];
  const k = Math.min(1, Math.max(0, (t - s0) / (s1 - s0)));
  const alpha = Math.min(1, t * 2.2) * 0.75;
  return `rgba(${(r0 + (r1 - r0) * k) | 0},${(g0 + (g1 - g0) * k) | 0},${(b0 + (b1 - b0) * k) | 0},${alpha.toFixed(3)})`;
}

function fill(v: number) {
  return v > 0.002 ? color(v) : "transparent";
}

// Heat a cell rests at, and how hot a pulse gets it, per contribution level
const LEVELS: Record<Level, { rest: number; peak: number }> = {
  NONE: { rest: 0, peak: 0.4 },
  FIRST_QUARTILE: { rest: 0.3, peak: 0.75 },
  SECOND_QUARTILE: { rest: 0.45, peak: 0.88 },
  THIRD_QUARTILE: { rest: 0.6, peak: 0.96 },
  FOURTH_QUARTILE: { rest: 0.78, peak: 1 },
};
const LEVEL_NAMES = Object.keys(LEVELS) as Level[];

// A heat-over-time curve in seconds, looping every `period`
type Track = { period: number; points: [s: number, heat: number][] };

// Quick rise to the peak at `start`, then the site's cooling curve down to `rest`
function flash(start: number, peak: number, rest: number): [number, number][] {
  const pts: [number, number][] = [[start + RAMP, peak]];
  let v = peak;
  let s = start + RAMP;
  while (v > rest + 0.002) {
    s += 0.08;
    v = Math.max(rest, v - COOL * 0.08 * (0.4 + v));
    pts.push([s, v]);
  }
  return pts;
}

function css(name: string, track: Track, base: number) {
  const frames = track.points.map(([s, v]) => `${((s / track.period) * 100).toFixed(2)}% { fill: ${fill(v)}; }`);
  return `@keyframes ${name} { ${frames.join(" ")} }\n.${name} { fill: ${fill(base)}; animation: ${name} ${track.period}s linear infinite; }`;
}

// Deterministic stand-in for Math.random(), so renders are reproducible
function rand(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type Cell = { day: Day; col: number; row: number; index: number; n: number };
type Plan = { tracks: Record<string, { track: Track; base: number }>; assign: (c: Cell) => { track?: string; delay: number; static?: number } };

// Reveal with a flash, hold at rest, fade out; the shared shape of loop/replay/ripple
function revealLoop(period: number, holdUntil: number, fadeUntil: number): Plan["tracks"] {
  return Object.fromEntries(
    LEVEL_NAMES.map((l, i) => {
      const { rest, peak } = LEVELS[l];
      return [
        `l${i}`,
        {
          base: 0,
          track: {
            period,
            points: [[0, 0], ...flash(0, peak, rest), [holdUntil, rest], [fadeUntil, 0], [period, 0]],
          },
        },
      ];
    }),
  );
}

function plan(variant: Variant, cells: Cell[], cols: number): Plan {
  const level = (c: Cell) => LEVEL_NAMES.indexOf(c.day.contributionLevel);
  const jitter = (c: Cell) => Math.sin(c.row * 0.9 + c.col * 0.15) * 0.12 + rand(c.n) * 0.18;

  switch (variant) {
    case "pulse": {
      const period = 5;
      const tracks = Object.fromEntries(
        LEVEL_NAMES.map((l, i) => {
          const { rest, peak } = LEVELS[l];
          return [`l${i}`, { base: 0, track: { period, points: [[0, rest], ...flash(0, peak, rest), [period, rest]] } }];
        }),
      ) as Plan["tracks"];
      return { tracks, assign: (c) => ({ track: `l${level(c)}`, delay: 0.3 + (c.col / cols) * 1.6 + jitter(c) }) };
    }
    case "loop":
      return {
        tracks: revealLoop(7, 4.2, 6.2),
        assign: (c) => ({ track: `l${level(c)}`, delay: 0.3 + (c.col / cols) * 1.6 + jitter(c) }),
      };
    case "replay":
      return {
        tracks: revealLoop(8, 4.4, 6.6),
        assign: (c) => ({ track: `l${level(c)}`, delay: 0.3 + (c.index / cells.length) * 2.6 }),
      };
    case "ripple": {
      const last = cells[cells.length - 1];
      return {
        tracks: revealLoop(7, 4.2, 6.2),
        assign: (c) => ({
          track: `l${level(c)}`,
          delay: 0.3 + Math.hypot(c.col - last.col, (c.row - last.row) * 1.2) * 0.04 + rand(c.n) * 0.08,
        }),
      };
    }
    case "trail": {
      // A virtual cursor crosses on a sine path; cells inside the brush flash
      const period = 6;
      const sweep = 3.4;
      const radius = 3.2;
      const at = (t: number) => {
        const p = t / sweep;
        return { x: -radius + p * (cols + radius * 2), y: 3 + Math.sin(p * Math.PI * 2.4) * 2.6 };
      };
      const path = Array.from({ length: 300 }, (_, k) => ({ t: (k / 299) * sweep, ...at((k / 299) * sweep) }));
      const tracks: Plan["tracks"] = {};
      return {
        tracks,
        assign: (c) => {
          const { rest, peak } = LEVELS[c.day.contributionLevel];
          let best = { d: Infinity, t: 0 };
          for (const p of path) {
            const d = Math.hypot(p.x - c.col, p.y - c.row);
            if (d < best.d) best = { d, t: p.t };
          }
          const r = best.d / radius;
          if (r >= 1) return { delay: 0, static: rest };
          // Brush strength like the site, never below what the day already rests at
          const heat = Math.max(rest + 0.1, Math.min(1, (1 - r * r) * (0.6 + rand(c.n) * 0.4) * 1.15, peak + 0.1));
          const q = Math.round(heat * 10) / 10;
          const key = `t${level(c)}_${q * 10}`;
          tracks[key] ??= { base: rest, track: { period, points: [[0, rest], ...flash(0, q, rest), [period, rest]] } };
          return { track: key, delay: 0.3 + best.t };
        },
      };
    }
    case "flicker": {
      const periods = [2.6, 3.4, 4.6];
      const tracks: Plan["tracks"] = {};
      LEVEL_NAMES.forEach((l, i) => {
        const { rest, peak } = LEVELS[l];
        periods.forEach((period, j) => {
          tracks[`f${i}_${j}`] = { base: rest, track: { period, points: [[0, rest], ...flash(0, peak * 0.92, rest), [period, rest]] } };
        });
      });
      return {
        tracks,
        assign: (c) => {
          const lv = level(c);
          // Most empty days stay dark; a few spark faintly
          if (lv === 0 && rand(c.n + 7) > 0.12) return { delay: 0, static: 0 };
          const j = Math.floor(rand(c.n + 3) * periods.length);
          return { track: `f${lv}_${j}`, delay: rand(c.n + 11) * periods[j] };
        },
      };
    }
  }
}

const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

export default function ContributionHeat({
  weeks,
  total,
  variant = "pulse",
  prefix = "",
}: {
  weeks: Day[][];
  total: number;
  variant?: Variant;
  // Namespaces keyframes and classes, so several grids can share one document
  prefix?: string;
}) {
  const gridW = weeks.length * CELL;
  const gridH = 7 * CELL;
  const W = gridW + PAD * 2;
  const H = gridH + PAD + FOOT;

  const cells: Cell[] = weeks.flatMap((week, col) =>
    week.map((day) => {
      const row = new Date(day.date + "T00:00:00Z").getUTCDay();
      return { day, col, row, index: 0, n: col * 7 + row };
    }),
  );
  cells.forEach((c, i) => (c.index = i));

  const { tracks, assign } = plan(variant, cells, weeks.length);
  const rects = cells.map((c) => {
    const a = assign(c);
    return (
      <rect
        key={c.day.date}
        className={a.track && prefix + a.track}
        x={PAD + c.col * CELL + 1}
        y={PAD + c.row * CELL + 1}
        width={CELL - 1}
        height={CELL - 1}
        fill={a.static !== undefined ? fill(a.static) : undefined}
        style={a.track ? { animationDelay: `${a.delay.toFixed(2)}s` } : undefined}
      >
        <title>{`${c.day.contributionCount} on ${c.day.date}`}</title>
      </rect>
    );
  });
  const style = Object.entries(tracks)
    .map(([name, { track, base }]) => css(prefix + name, track, base))
    .join("\n");

  const grid = [
    ...Array.from({ length: weeks.length + 1 }, (_, i) => `M${PAD + i * CELL + 0.5},${PAD}V${PAD + gridH + 1}`),
    ...Array.from({ length: 8 }, (_, j) => `M${PAD},${PAD + j * CELL + 0.5}H${PAD + gridW + 1}`),
  ].join("");

  const legend = [0.3, 0.45, 0.6, 0.78, 1];
  const footY = PAD + gridH + 22;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${total} contributions in the last year`}>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <rect width={W} height={H} rx="12" fill="#000" />
      {rects}
      <path d={grid} stroke="rgba(255,255,255,0.045)" strokeWidth="1" fill="none" />
      <text x={PAD} y={footY} fontFamily={MONO} fontSize="11" fill="#8e8e96">
        {total} contributions in the last year
      </text>
      <text x={W - PAD - legend.length * 13 - 44} y={footY} textAnchor="end" fontFamily={MONO} fontSize="11" fill="#56565e">
        less
      </text>
      {legend.map((v, i) => (
        <rect key={v} x={W - PAD - 36 - (legend.length - i) * 13} y={footY - 9} width="10" height="10" fill={color(v)} />
      ))}
      <text x={W - PAD} y={footY} textAnchor="end" fontFamily={MONO} fontSize="11" fill="#56565e">
        more
      </text>
      <rect x=".5" y=".5" width={W - 1} height={H - 1} rx="12" fill="none" stroke="rgba(255,255,255,0.08)" />
    </svg>
  );
}
