// The GitHub contribution graph drawn as the heat grid from davidkubus.dev.
// Each day rests at a glow that matches its contribution level; every few
// seconds a pulse sweeps across, heats the cells up through the "aurora"
// palette and lets them cool back down with the site's cooling curve.
// GitHub shows READMEs as images without JS, so all of it is CSS keyframes.

export type Level = "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
export type Day = { date: string; contributionCount: number; contributionLevel: Level };

const CELL = 14;
const PAD = 20;
const FOOT = 34;

const COOL = 0.85; // heat lost per second, same as the site
const PERIOD = 8; // seconds between pulses
const SWEEP = 3.2; // seconds the pulse takes to cross the grid
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

// Heat a cell rests at, and how hot the pulse gets it, per contribution level
const LEVELS: Record<Level, { rest: number; peak: number }> = {
  NONE: { rest: 0, peak: 0.4 },
  FIRST_QUARTILE: { rest: 0.3, peak: 0.75 },
  SECOND_QUARTILE: { rest: 0.45, peak: 0.88 },
  THIRD_QUARTILE: { rest: 0.6, peak: 0.96 },
  FOURTH_QUARTILE: { rest: 0.78, peak: 1 },
};

function fill(v: number) {
  return v > 0.002 ? color(v) : "transparent";
}

// Rest → quick rise to the peak → the site's cooling curve back to rest
function keyframes(name: string, { rest, peak }: { rest: number; peak: number }) {
  const pct = (s: number) => ((s / PERIOD) * 100).toFixed(2);
  const frames = [`0% { fill: ${fill(rest)}; }`, `${pct(RAMP)}% { fill: ${fill(peak)}; }`];
  let v = peak;
  let s = RAMP;
  const dt = 0.08;
  while (v > rest + 0.002) {
    s += dt;
    v = Math.max(rest, v - COOL * dt * (0.4 + v));
    frames.push(`${pct(s)}% { fill: ${fill(v)}; }`);
  }
  frames.push(`100% { fill: ${fill(rest)}; }`);
  return `@keyframes ${name} { ${frames.join(" ")} }\n.${name} { fill: ${fill(rest)}; animation: ${name} ${PERIOD}s linear infinite; }`;
}

// Deterministic per-cell jitter so the pulse front looks scattered, not ruler-straight
function rand(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

export default function ContributionHeat({ weeks, total }: { weeks: Day[][]; total: number }) {
  const gridW = weeks.length * CELL;
  const gridH = 7 * CELL;
  const W = gridW + PAD * 2;
  const H = gridH + PAD + FOOT;

  const names = Object.keys(LEVELS) as Level[];
  const css = names.map((l, i) => keyframes(`l${i}`, LEVELS[l])).join("\n");

  const cells = weeks.flatMap((week, wi) =>
    week.map((d) => {
      const row = new Date(d.date + "T00:00:00Z").getUTCDay();
      const n = wi * 7 + row;
      const delay = (wi / weeks.length) * SWEEP + Math.sin(row * 0.9 + wi * 0.15) * 0.12 + rand(n) * 0.18;
      return (
        <rect
          key={d.date}
          className={`l${names.indexOf(d.contributionLevel)}`}
          x={PAD + wi * CELL + 1}
          y={PAD + row * CELL + 1}
          width={CELL - 1}
          height={CELL - 1}
          style={{ animationDelay: `${(delay - PERIOD).toFixed(2)}s` }}
        >
          <title>{`${d.contributionCount} on ${d.date}`}</title>
        </rect>
      );
    }),
  );

  const grid = [
    ...Array.from({ length: weeks.length + 1 }, (_, i) => `M${PAD + i * CELL + 0.5},${PAD}V${PAD + gridH + 1}`),
    ...Array.from({ length: 8 }, (_, j) => `M${PAD},${PAD + j * CELL + 0.5}H${PAD + gridW + 1}`),
  ].join("");

  const legend = [0.3, 0.45, 0.6, 0.78, 1];
  const footY = PAD + gridH + 22;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${total} contributions in the last year`}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <rect width={W} height={H} rx="12" fill="#000" />
      {cells}
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
