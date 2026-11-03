// An animated automation graph: triggers on the left flow into an agent in the
// middle, which fans out to the tools on the right. Pure SVG + SMIL/CSS, so it
// keeps animating when GitHub shows it as an image.

const W = 860;
const H = 168;
const CX = W / 2;
const CY = H / 2;

type Node = { label: string; y: number };

const INPUTS: Node[] = [
  { label: "webhook", y: 36 },
  { label: "schedule", y: CY },
  { label: "voice", y: H - 36 },
];

const OUTPUTS: Node[] = [
  { label: "api", y: 36 },
  { label: "mcp", y: CY },
  { label: "notes", y: H - 36 },
];

const NODE_W = 104;
const NODE_H = 28;
const IN_X = 72;
const OUT_X = W - 72 - NODE_W;
const CORE_R = 30;

const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

function curve(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
}

const css = `
  .ring { transform-origin: ${CX}px ${CY}px; animation: ring 3s ease-out infinite; }
  .ring.b { animation-delay: 1.5s; }
  @keyframes ring { 0% { transform: scale(1); opacity: .5 } 100% { transform: scale(2.1); opacity: 0 } }
  .spin { transform-origin: ${CX}px ${CY}px; animation: spin 14s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .blink { animation: blink 1.1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0 } }
  .wire { stroke-dasharray: 2 6; animation: flow 1.6s linear infinite; }
  @keyframes flow { to { stroke-dashoffset: -16 } }
`;

function Packet({ path, begin, dur = 2.4 }: { path: string; begin: number; dur?: number }) {
  return (
    <circle r="2.6" fill="#fff" filter="url(#glow)" opacity="0">
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".4 0 .2 1">
        <mpath href={`#${path}`} />
      </animateMotion>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
    </circle>
  );
}

function Box({ x, y, label, side }: { x: number; y: number; label: string; side: "in" | "out" }) {
  return (
    <g>
      <rect x={x} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx="8" fill="#0a0a0a" stroke="#262626" />
      <circle cx={side === "in" ? x + 14 : x + NODE_W - 14} cy={y} r="2.5" fill="#3fb950" />
      <text
        x={side === "in" ? x + 26 : x + NODE_W - 26}
        y={y + 4}
        textAnchor={side === "in" ? "start" : "end"}
        fontFamily={MONO}
        fontSize="12"
        fill="#a3a3a3"
      >
        {label}
      </text>
    </g>
  );
}

export default function Flow() {
  const wiresIn = INPUTS.map((n, i) => ({ id: `in${i}`, d: curve(IN_X + NODE_W, n.y, CX - CORE_R, CY) }));
  const wiresOut = OUTPUTS.map((n, i) => ({ id: `out${i}`, d: curve(CX + CORE_R, CY, OUT_X, n.y) }));

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Triggers flowing through an agent into APIs, MCP servers and notes">
      <defs>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3fb950" stopOpacity=".28" />
          <stop offset="100%" stopColor="#3fb950" stopOpacity="0" />
        </radialGradient>
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r=".8" fill="#1c1c1c" />
        </pattern>
        <clipPath id="frame">
          <rect width={W} height={H} rx="14" />
        </clipPath>
      </defs>

      <g clipPath="url(#frame)">
        <rect width={W} height={H} fill="#000" />
        <rect width={W} height={H} fill="url(#dots)" />

        {[...wiresIn, ...wiresOut].map((w) => (
          <g key={w.id}>
            <path id={w.id} d={w.d} fill="none" stroke="#1f1f1f" strokeWidth="1.5" />
            <path d={w.d} fill="none" stroke="#333" strokeWidth="1.5" className="wire" />
          </g>
        ))}

        {/* Each trigger fires, the agent thinks for a beat, then calls a tool */}
        {wiresIn.map((w, i) => (
          <Packet key={w.id} path={w.id} begin={i * 0.8} />
        ))}
        {wiresOut.map((w, i) => (
          <Packet key={w.id} path={w.id} begin={1.2 + i * 0.8} />
        ))}

        {INPUTS.map((n) => (
          <Box key={n.label} x={IN_X} y={n.y} label={n.label} side="in" />
        ))}
        {OUTPUTS.map((n) => (
          <Box key={n.label} x={OUT_X} y={n.y} label={n.label} side="out" />
        ))}

        <circle cx={CX} cy={CY} r={CORE_R * 2.2} fill="url(#core)" />
        <circle className="ring" cx={CX} cy={CY} r={CORE_R} fill="none" stroke="#3fb950" strokeOpacity=".6" />
        <circle className="ring b" cx={CX} cy={CY} r={CORE_R} fill="none" stroke="#3fb950" strokeOpacity=".6" />
        <circle cx={CX} cy={CY} r={CORE_R} fill="#050505" stroke="#2f2f2f" />
        <circle className="spin" cx={CX} cy={CY} r={CORE_R - 6} fill="none" stroke="#3fb950" strokeWidth="1.5" strokeDasharray="22 120" strokeLinecap="round" />
        <text x={CX - 2} y={CY + 4} textAnchor="middle" fontFamily={MONO} fontSize="12" fill="#e5e5e5">
          ai
          <tspan className="blink" fill="#3fb950">_</tspan>
        </text>
      </g>
      <rect x=".5" y=".5" width={W - 1} height={H - 1} rx="14" fill="none" stroke="#222" />
    </svg>
  );
}
