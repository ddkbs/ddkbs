Hi, I'm David.<br>
I build interfaces, productivity tools and automations, mostly around AI.<br>
Public right now: [Sidera](https://github.com/ddkbs/sidera) and [Sketchy](https://github.com/ddkbs/sketchy).<br>
Most of my projects are private. DM for private stuff.

```aura width=860 height=96 link="https://github.com/ddkbs?tab=repositories"
(function () {
  var stats = [
    { label: 'Stars', value: github.stats.totalStars },
    { label: 'Forks', value: github.stats.totalForks },
    { label: 'Since', value: github.user.createdAt.slice(0, 4) },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#000000', border: '1px solid #222222', borderRadius: 14,
      padding: '0 24px', fontFamily: 'Inter', color: '#ffffff',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>
        {`
          @keyframes sweep {
            0% { transform: translateX(-260px); }
            60%, 100% { transform: translateX(1120px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.35; }
          }
          #sweep-top { animation: sweep 6s ease-in-out infinite; }
          #sweep-bottom { animation: sweep 6s ease-in-out 3s infinite; }
          #dot { animation: pulse 2.4s ease-in-out infinite; }
        `}
      </style>

      <svg width="860" height="96" style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <rect id="sweep-top" x="0" y="0" width="240" height="1" fill="url(#line)" />
        <rect id="sweep-bottom" x="0" y="94" width="240" height="1" fill="url(#line)" />
        <circle id="dot" cx="62" cy="63" r="4.5" fill="#3fb950" stroke="#000000" strokeWidth="2.5" />
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src={github.user.avatarUrl} width={44} height={44} style={{ borderRadius: 22, border: '1px solid #333333' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 18, fontWeight: 700, letterSpacing: '-0.4px' }}>David Kubus</div>
          <div style={{ display: 'flex', fontSize: 12, color: '#888888' }}>@{github.user.login}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32 }}>
        {stats.map(function (s) {
          return (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: '-0.8px' }}>{String(s.value)}</div>
              <div style={{ display: 'flex', fontSize: 10, color: '#777777', letterSpacing: '1.5px' }}>{s.label.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
})()
```
