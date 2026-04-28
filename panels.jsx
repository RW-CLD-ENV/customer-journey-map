// Header, timeline, side panels

function HeroHeader({ event, idx, total }) {
  return (
    <header style={{
      display:"flex", alignItems:"flex-end", justifyContent:"space-between",
      padding:"28px 32px 18px", gap:24, borderBottom:"1px solid var(--line)",
      background:"linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)",
    }}>
      <div>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
          <span className="badge mono" style={{color:"var(--ink-2)"}}>
            <span className="dot" style={{background:"var(--teal)"}} />
            <span className="dot" style={{background:"var(--amber)"}} />
            <span className="dot" style={{background:"var(--violet)"}} />
            Salesforce ecosystem map
          </span>
          <span className="badge mono" style={{color:"var(--ink-3)"}}>v 0.4 · prototype</span>
        </div>
        <h1 style={{
          margin:0, fontSize:30, fontWeight:700, letterSpacing:"-0.02em",
          color:"var(--ink)", lineHeight:1.1, textWrap:"balance",
        }}>
          One player, six moments — across app, CRM, Data Cloud and Marketing Cloud.
        </h1>
        <p style={{
          margin:"8px 0 0", maxWidth:680, fontSize:13.5, lineHeight:1.55,
          color:"var(--ink-2)", textWrap:"pretty",
        }}>
          Follow Eleanor as she buys a lottery ticket, donates, registers for an event then no-shows, gets won back, and — once two new campaigns launch — converts on both, paced by Einstein NBA + Contact Frequency so she feels valued, not spammed.
        </p>
      </div>
      <div style={{
        textAlign:"right",
        display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6,
        minWidth:200,
      }}>
        <div className="mono" style={{fontSize:11, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:"0.08em"}}>
          Event {String(idx+1).padStart(2,"0")} / {String(total).padStart(2,"0")}
        </div>
        <div style={{fontSize:18, fontWeight:600, color:"var(--ink)"}}>{event.label}</div>
        <div className="mono" style={{fontSize:11, color:"var(--ink-3)"}}>id: {event.id}</div>
      </div>
    </header>
  );
}

function Timeline({ events, currentIdx, onPick, playing, onPlayToggle, onRestart, onNext, onPrev, speed }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:16,
      padding:"18px 32px", background:"white",
      borderBottom:"1px solid var(--line)",
      position:"sticky", top:0, zIndex:20,
    }}>
      <div style={{display:"flex", gap:6}}>
        <button className="ghost-btn" onClick={onPrev} aria-label="Previous">
          <Icon name="prev" size={14} />
        </button>
        <button className="primary-btn" onClick={onPlayToggle} style={{minWidth:88, justifyContent:"center"}}>
          <Icon name={playing ? "pause" : "play"} size={12} />
          {playing ? "Pause" : "Play"}
        </button>
        <button className="ghost-btn" onClick={onNext} aria-label="Next">
          <Icon name="next" size={14} />
        </button>
        <button className="ghost-btn" onClick={onRestart} aria-label="Restart">
          <Icon name="restart" size={14} />
        </button>
      </div>
      <div style={{flex:1, position:"relative", display:"flex", alignItems:"center"}}>
        {/* baseline */}
        <div style={{
          position:"absolute", left:18, right:18, height:2,
          background:"var(--line-2)", borderRadius:2,
        }} />
        {/* progress */}
        <div style={{
          position:"absolute", left:18, height:2, background:"var(--ink)", borderRadius:2,
          width:`calc(${(currentIdx / (events.length-1)) * 100}% - 36px * ${currentIdx / (events.length-1)})`,
          transition:"width 700ms cubic-bezier(0.65,0,0.35,1)",
        }} />
        <div style={{
          position:"relative", flex:1, display:"flex", justifyContent:"space-between",
          padding:"0 18px",
        }}>
          {events.map((e, i) => {
            const isOn = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <button key={e.id} onClick={() => onPick(i)} style={{
                background:"none", border:"none", padding:0, cursor:"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                color: isOn ? "var(--ink)" : "var(--ink-3)",
              }}>
                <span style={{
                  width: isCurrent ? 22 : 14, height: isCurrent ? 22 : 14,
                  borderRadius:"50%",
                  border: isCurrent ? "2px solid var(--ink)" : `2px solid ${isOn ? "var(--ink)" : "var(--line-2)"}`,
                  background: isOn ? "var(--ink)" : "white",
                  display:"grid", placeItems:"center", color:"white",
                  transition:"all 300ms",
                }}>
                  {isCurrent && <span style={{width:6, height:6, borderRadius:"50%", background:"white"}} />}
                </span>
                <span style={{fontSize:11, fontWeight: isCurrent ? 600 : 500, whiteSpace:"nowrap"}}>
                  {e.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mono" style={{fontSize:11, color:"var(--ink-3)"}}>{speed}× speed</div>
    </div>
  );
}

function CustomerCard({ customer, segmentMembership, prefs }) {
  const initials = customer.name.split(" ").map(p=>p[0]).join("").slice(0,2);
  return (
    <aside style={{
      width:280, flexShrink:0,
      background:"white", border:"1px solid var(--line)", borderRadius:14,
      padding:16, alignSelf:"flex-start",
      position:"sticky", top:88,
    }}>
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <div style={{
          width:44, height:44, borderRadius:"50%",
          background:"var(--ink)", color:"white",
          display:"grid", placeItems:"center", fontWeight:600, fontSize:14,
        }}>{initials}</div>
        <div>
          <div style={{fontSize:14, fontWeight:600}}>{customer.name}</div>
          <div className="mono" style={{fontSize:11, color:"var(--ink-3)"}}>{customer.id}</div>
        </div>
      </div>
      <div style={{marginTop:14, display:"grid", gap:6, fontSize:12}}>
        <div style={{display:"flex", justifyContent:"space-between", color:"var(--ink-2)"}}>
          <span>Email</span><span className="mono" style={{fontSize:11}}>{customer.email}</span>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", color:"var(--ink-2)"}}>
          <span>Location</span><span style={{fontSize:11}}>{customer.city}</span>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", color:"var(--ink-2)"}}>
          <span>Joined</span><span className="mono" style={{fontSize:11}}>{customer.joined}</span>
        </div>
      </div>

      <div style={{marginTop:16, paddingTop:14, borderTop:"1px solid var(--line)"}}>
        <div className="micro" style={{marginBottom:8}}>Active segments · {segmentMembership.size}</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:5}}>
          {SEGMENTS.filter(s => segmentMembership.has(s.id)).map(s => (
            <span key={s.id} className="chip on" style={{color: s.color, fontSize:10}}>
              <span className="swatch" /> {s.name}
            </span>
          ))}
          {segmentMembership.size === 0 && <span className="mono" style={{fontSize:11, color:"var(--ink-3)"}}>none yet</span>}
        </div>
      </div>

      <div style={{marginTop:16, paddingTop:14, borderTop:"1px solid var(--line)"}}>
        <div className="micro" style={{marginBottom:8}}>Channel preferences</div>
        <div style={{display:"grid", gap:4}}>
          {prefs.map(p => (
            <div key={p.ch} style={{display:"flex", justifyContent:"space-between", fontSize:11.5, opacity: p.on ? 1 : 0.45}}>
              <span>{p.ch}</span>
              <span className="mono" style={{color:"var(--ink-3)"}}>{p.freq}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// Animated connector arrows between lanes
function Connector({ active, color, label, fromColor }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap:10,
      padding:"6px 0",
      color: active ? color : "var(--ink-3)",
      transition:"color 300ms",
    }}>
      <svg width="280" height="22" viewBox="0 0 280 22">
        <defs>
          <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={fromColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <marker id={`m-${label}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
        <line
          x1="2" y1="11" x2="270" y2="11"
          stroke={active ? `url(#g-${label})` : "var(--line-2)"}
          strokeWidth="2"
          strokeDasharray={active ? "8 8" : "0"}
          style={{ animation: active ? "flowDash 1s linear infinite" : "none" }}
          markerEnd={`url(#m-${label})`}
        />
      </svg>
      <span className="mono" style={{
        fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase",
        fontWeight:600, whiteSpace:"nowrap",
      }}>{label}</span>
    </div>
  );
}

// Event log feed
function EventLog({ history }) {
  return (
    <div style={{
      background:"white", border:"1px solid var(--line)", borderRadius:14,
      padding:14, marginTop:18,
    }}>
      <div className="micro" style={{marginBottom:10, display:"flex", justifyContent:"space-between"}}>
        <span>System log</span>
        <span className="mono" style={{fontSize:10, color:"var(--ink-3)", textTransform:"none", letterSpacing:0}}>{history.length} entries</span>
      </div>
      <div style={{display:"grid", gap:4, fontSize:11.5, maxHeight:160, overflow:"auto"}} className="mono">
        {history.length === 0 && <div style={{color:"var(--ink-3)"}}>Press play to begin streaming events…</div>}
        {history.slice().reverse().map((h, i) => (
          <div key={i} style={{
            display:"grid", gridTemplateColumns:"60px 90px 1fr",
            gap:10, padding:"3px 6px", borderRadius:4,
            background: i === 0 ? "var(--bg-2)" : "transparent",
            animation: i === 0 ? "fadeIn 400ms ease" : "none",
          }}>
            <span style={{color:"var(--ink-3)"}}>{h.time}</span>
            <span style={{color: h.color, fontWeight:600}}>{h.system}</span>
            <span style={{color:"var(--ink-2)"}}>{h.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HeroHeader, Timeline, CustomerCard, Connector, EventLog });
