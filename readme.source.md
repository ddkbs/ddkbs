Hi, I'm David.

I build interfaces, productivity tools and automations, mostly around AI. APIs and MCP servers that connect things, tools that save time, and the occasional startup idea that gets out of hand.

Most of my projects are private. DM for private stuff.

```aura width=860 height=300 link="https://github.com/ddkbs?tab=repositories"
(function () {
  var stats = [
    { label: 'Stars', value: github.stats.totalStars },
    { label: 'Forks', value: github.stats.totalForks },
    { label: 'On GitHub since', value: github.user.createdAt.slice(0, 4) },
  ];
  // Own short descriptions; stars and language stay live from the API
  var blurbs = {
    sketchy: 'Claude explains, Sketchy draws. Hand-drawn diagrams right in the chat.',
    sidera: 'Local-first visual notes for macOS. Every action is an MCP tool.',
  };
  var repos = github.repos
    .filter(function (r) { return r.name !== 'awesome-mcp-servers'; })
    .slice(0, 2);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000000', border: '1px solid #222222', borderRadius: 16,
      padding: 28, fontFamily: 'Inter', color: '#ffffff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={github.user.avatarUrl} width={48} height={48} style={{ borderRadius: 24, border: '1px solid #333333' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>David Kubus</div>
            <div style={{ display: 'flex', fontSize: 13, color: '#888888' }}>@{github.user.login}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 36 }}>
          {stats.map(function (s) {
            return (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, letterSpacing: '-1px' }}>{String(s.value)}</div>
                <div style={{ display: 'flex', fontSize: 11, color: '#777777', letterSpacing: '1.5px' }}>{s.label.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', height: 1, background: '#1c1c1c', marginTop: 24, marginBottom: 20 }} />

      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
        {repos.map(function (r) {
          return (
            <div key={r.name} style={{
              display: 'flex', flexDirection: 'column', flex: 1,
              background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 12, padding: 18,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', fontSize: 16, fontWeight: 600 }}>{r.name}</div>
                <div style={{ display: 'flex', fontSize: 13, color: '#888888' }}>{r.stars ? r.stars + (r.stars === 1 ? ' star' : ' stars') : ''}</div>
              </div>
              <div style={{ display: 'flex', marginTop: 8, fontSize: 13, lineHeight: 1.5, color: '#999999' }}>
                {blurbs[r.name] || r.description}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', fontSize: 12, color: '#777777' }}>
                <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 4, background: '#3178c6' }} />
                {r.language || 'Code'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
})()
```
