// A dot matrix with a wave rolling through it. Every dot runs the same CSS
// keyframes; only its delay differs, and the delays trace a moving sine band.

const COLS = 72;
const ROWS = 7;
const GAP = 12;
const PAD = 22;
const W = PAD * 2 + (COLS - 1) * GAP;
const H = PAD * 2 + (ROWS - 1) * GAP;
const DUR = 3.6;

const css = `
  circle { fill: #2a2a2a; animation: lit ${DUR}s ease-in-out infinite; }
  @keyframes lit {
    0%, 70%, 100% { fill: #2a2a2a; }
    80% { fill: #3fb950; }
    88% { fill: #f5f5f5; }
  }
`;

export default function Wave() {
  const dots = [];
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const delay = x * 0.045 + Math.sin(x * 0.18) * 0.5 + Math.abs(y - (ROWS - 1) / 2) * 0.09;
      dots.push(
        <circle
          key={`${x}-${y}`}
          cx={PAD + x * GAP}
          cy={PAD + y * GAP}
          r="2.1"
          style={{ animationDelay: `${(delay - DUR * 2).toFixed(2)}s` }}
        />,
      );
    }
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="A wave rolling through a dot matrix">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <rect width={W} height={H} rx="12" fill="#000" />
      {dots}
    </svg>
  );
}
