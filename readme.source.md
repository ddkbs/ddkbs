```aura width=860 height=200 link="https://davidkubus.dev"
<div style={{
  width: '100%', height: '100%', background: '#08090a',
  display: 'flex', alignItems: 'center', fontFamily: 'Inter',
  position: 'relative', overflow: 'hidden', borderRadius: 16,
  border: '1px solid rgba(52,211,153,0.18)'
}}>

  <style>
    {`
      @keyframes drift-a {
        0%, 100% { transform: translateX(0px); opacity: 0.8; }
        50% { transform: translateX(320px); opacity: 1; }
      }
      @keyframes drift-b {
        0%, 100% { transform: translateX(0px); opacity: 0.7; }
        50% { transform: translateX(-260px); opacity: 1; }
      }
      @keyframes drift-c {
        0%, 100% { transform: translateX(0px); opacity: 0.9; }
        50% { transform: translateX(200px); opacity: 0.6; }
      }
      #glow-1 { animation: drift-a 9s ease-in-out infinite; }
      #glow-2 { animation: drift-b 12s ease-in-out infinite; }
      #glow-3 { animation: drift-c 10s ease-in-out infinite; }
      #glow-4 { animation: drift-a 14s ease-in-out infinite reverse; }
    `}
  </style>

  <svg width="860" height="200" style={{ position: 'absolute', top: 0, left: 0 }}>
    <defs>
      <radialGradient id="g1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(16,185,129,0.8)" />
        <stop offset="45%" stopColor="rgba(5,150,105,0.35)" />
        <stop offset="70%" stopColor="rgba(5,150,105,0)" />
      </radialGradient>
      <radialGradient id="g2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(20,184,166,0.7)" />
        <stop offset="50%" stopColor="rgba(13,148,136,0.28)" />
        <stop offset="70%" stopColor="rgba(13,148,136,0)" />
      </radialGradient>
      <radialGradient id="g3" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(52,211,153,0.55)" />
        <stop offset="70%" stopColor="rgba(52,211,153,0)" />
      </radialGradient>
      <radialGradient id="g4" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(6,182,212,0.5)" />
        <stop offset="70%" stopColor="rgba(6,182,212,0)" />
      </radialGradient>
    </defs>

    <ellipse id="glow-1" cx="200" cy="215" rx="260" ry="180" fill="url(#g1)" />
    <ellipse id="glow-2" cx="520" cy="220" rx="220" ry="160" fill="url(#g2)" />
    <ellipse id="glow-3" cx="380" cy="210" rx="180" ry="140" fill="url(#g3)" />
    <ellipse id="glow-4" cx="720" cy="225" rx="160" ry="130" fill="url(#g4)" />
  </svg>

  <div style={{
    position: 'absolute', left: 48, top: 52, width: 96, height: 96,
    borderRadius: 48, background: 'linear-gradient(135deg, #34d399, #0e7490)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <img src={github.user.avatarUrl} width={88} height={88} style={{ borderRadius: 44 }} />
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 168, gap: 8 }}>
    <div style={{ display: 'flex', fontSize: 38, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1 }}>
      David Kubus
    </div>
    <div style={{ display: 'flex', fontSize: 15, color: 'rgba(167,243,208,0.8)', fontWeight: 400, letterSpacing: '0.3px' }}>
      Building interfaces, tools and automations that save time
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
      {['APIs & MCP', 'Productivity', 'Automation', 'Startups'].map(function (tag) {
        return (
          <div key={tag} style={{
            display: 'flex', padding: '4px 12px', borderRadius: 20,
            background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(52,211,153,0.3)',
            color: 'rgba(209,250,229,0.88)', fontSize: 12, fontWeight: 600,
          }}>{tag}</div>
        );
      })}
    </div>
  </div>
</div>
```

**[Sidera](https://github.com/ddkbs/sidera)** · local-first visual notes for macOS<br>
**[Sketchy](https://github.com/ddkbs/sketchy)** · hand-drawn diagrams for Claude, via MCP

Most of my projects are private. DM for private stuff.
