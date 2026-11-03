// The heat grid from davidkubus.dev, replayed without a mouse: a virtual cursor
// sweeps along a sine path and the cells it passes heat up and cool down
// through the site's "aurora" palette. GitHub shows READMEs as images without
// JS, so every cell's heat curve is baked into CSS keyframes ahead of time.

const CELL = 14;
const COLS = 61;
const ROWS = 9;
const W = COLS * CELL + 1;
const H = ROWS * CELL + 1;

const RADIUS = 3.2 * CELL; // brush radius, same as the site
const COOL = 0.85; // heat lost per second, same as the site
const PERIOD = 7; // seconds per sweep, including the pause
const SWEEP = 5.2; // seconds the cursor takes to cross
const RAMP = 0.12; // seconds for a cell to heat up as the cursor arrives

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

// Deterministic stand-in for the site's Math.random() grain
function rand(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function cursorAt(t: number) {
  const p = t / SWEEP;
  const x = -RADIUS + p * (W + RADIUS * 2);
  const y = H / 2 + Math.sin(p * Math.PI * 2.4) * H * 0.28;
  return { x, y };
}

// One keyframe track per heat level: quick rise to the peak, then the site's
// cooling curve (heat -= COOL * dt * (0.4 + heat)) until the cell is dark.
const LEVELS = [0.3, 0.5, 0.7, 0.85, 1];

function keyframes(level: number, i: number) {
  const pct = (s: number) => ((s / PERIOD) * 100).toFixed(2);
  const frames = [`0% { fill: transparent; }`, `${pct(RAMP)}% { fill: ${color(level)}; }`];
  let v = level;
  let s = RAMP;
  const dt = 0.08;
  while (v > 0.002) {
    s += dt;
    v = Math.max(0, v - COOL * dt * (0.4 + v));
    frames.push(`${pct(s)}% { fill: ${v > 0.002 ? color(v) : "transparent"}; }`);
  }
  frames.push(`100% { fill: transparent; }`);
  return `@keyframes h${i} { ${frames.join(" ")} }\n.h${i} { animation: h${i} ${PERIOD}s linear infinite; }`;
}

export default function HeatTrail() {
  const path = Array.from({ length: 400 }, (_, k) => {
    const t = (k / 399) * SWEEP;
    return { t, ...cursorAt(t) };
  });

  const cells = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const cx = i * CELL + CELL / 2;
      const cy = j * CELL + CELL / 2;
      let best = { d: Infinity, t: 0 };
      for (const p of path) {
        const d = Math.hypot(p.x - cx, p.y - cy);
        if (d < best.d) best = { d, t: p.t };
      }
      const r = best.d / RADIUS;
      if (r >= 1) continue;
      const n = j * COLS + i;
      const heat = (1 - r * r) * (0.6 + rand(n) * 0.4) * 1.15;
      // Ragged, pixelated rim like the site
      if (heat < 0.3 && rand(n + 999) < 0.5) continue;
      const level = LEVELS.findIndex((l) => heat <= l);
      cells.push(
        <rect
          key={n}
          className={`h${level === -1 ? LEVELS.length - 1 : level}`}
          x={i * CELL + 1}
          y={j * CELL + 1}
          width={CELL - 1}
          height={CELL - 1}
          fill="transparent"
          style={{ animationDelay: `${(best.t - RAMP - PERIOD).toFixed(2)}s` }}
        />,
      );
    }
  }

  const css = LEVELS.map((l, i) => keyframes(l, i)).join("\n");
  const grid = [
    ...Array.from({ length: COLS + 1 }, (_, i) => `M${i * CELL + 0.5},0V${H}`),
    ...Array.from({ length: ROWS + 1 }, (_, j) => `M0,${j * CELL + 0.5}H${W}`),
  ].join("");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="A heat trail moving across a grid">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <clipPath id="r">
        <rect width={W} height={H} rx="12" />
      </clipPath>
      <g clipPath="url(#r)">
        <rect width={W} height={H} fill="#000" />
        {cells}
        <path d={grid} stroke="rgba(255,255,255,0.045)" strokeWidth="1" fill="none" />
      </g>
      <rect x=".5" y=".5" width={W - 1} height={H - 1} rx="12" fill="none" stroke="rgba(255,255,255,0.08)" />
    </svg>
  );
}
