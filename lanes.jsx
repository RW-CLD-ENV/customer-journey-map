// Lane components (one per system)
const { useMemo } = React;

function Icon({ name, size = 14, stroke = 1.6 }) {
  const s = size;
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "ticket": return <svg {...p}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4V8z"/><path d="M10 7v10" strokeDasharray="2 2"/></svg>;
    case "heart": return <svg {...p}><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>;
    case "star": return <svg {...p}><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3.1-5.4 3.1 1.2-6L3.3 9.3l6.1-.7L12 3z"/></svg>;
    case "play": return <svg {...p}><path d="M6 4l14 8-14 8V4z" fill="currentColor"/></svg>;
    case "pause": return <svg {...p}><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>;
    case "restart": return <svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>;
    case "next": return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case "prev": return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>;
    case "cloud": return <svg {...p}><path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5 4.5 4.5 0 0 1 17.5 18H7z"/></svg>;
    case "db": return <svg {...p}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>;
    case "send": return <svg {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
    case "user": return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "bolt": return <svg {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>;
    case "check": return <svg {...p}><path d="M5 12l5 5L20 7"/></svg>;
    case "arrow": return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "sparkle": return <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></svg>;
    default: return null;
  }
}

function LaneHeader({ vendor, system, color, icon, sub }) {
  return (
    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px 10px", borderBottom:"1px solid var(--line)"}}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <div style={{
          width:30, height:30, borderRadius:8, display:"grid", placeItems:"center",
          background: "white", color, border:"1px solid currentColor"
        }}>
          <Icon name={icon} size={16} />
        </div>
        <div>
          <div style={{fontSize:11, color:"var(--ink-3)", fontWeight:500, letterSpacing:"0.04em", textTransform:"uppercase"}}>{vendor}</div>
          <div style={{fontSize:14, fontWeight:600, color:"var(--ink)"}}>{system}</div>
        </div>
      </div>
      <div style={{fontSize:11, color:"var(--ink-3)"}} className="mono">{sub}</div>
    </div>
  );
}

// =================== APP LANE ===================
function AppLane({ active, currentEvent, prevEvent }) {
  const color = "var(--indigo)";
  const event = currentEvent;
  return (
    <section className={`lane-card ${active ? "active" : ""}`} style={{
      color,
      background:"white",
      border:"1px solid var(--line)",
      borderRadius:14,
      overflow:"hidden",
      minHeight:170,
    }}>
      <LaneHeader vendor="Third-party" system="Player Web & Mobile App" color={color} icon="cloud" sub="prod.lottery.example" />
      <div style={{padding:"14px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div>
          <div className="micro" style={{marginBottom:8}}>Touchpoint</div>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:10}}>
            <div style={{
              width:36, height:36, borderRadius:8,
              background:"var(--indigo-soft)", color:"var(--indigo)",
              display:"grid", placeItems:"center",
              animation: active ? "glow 1.4s ease-in-out infinite" : "none",
            }}>
              <Icon name={event.icon} size={18} />
            </div>
            <div>
              <div style={{fontSize:13, fontWeight:600, color:"var(--ink)"}}>{event.label}</div>
              <div className="mono" style={{fontSize:11, color:"var(--ink-3)"}}>via {event.app.channel}</div>
            </div>
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
            <span className="chip mono" style={{color:"var(--ink-2)"}}>SKU {event.app.sku}</span>
            <span className="chip mono" style={{color:"var(--ink-2)"}}>{event.app.amount}</span>
          </div>
        </div>
        <div>
          <div className="micro" style={{marginBottom:8}}>Outbound webhook</div>
          <div style={{
            border:"1px dashed var(--line-2)",
            borderRadius:8,
            padding:"10px 12px",
            background:"var(--bg-2)",
            fontSize:11,
            lineHeight:1.55,
          }} className="mono">
            <div style={{color:"var(--ink-3)"}}>POST /sf/ingest</div>
            <div>event:&nbsp;<span style={{color:"var(--indigo)"}}>"{event.id}"</span></div>
            <div>product:&nbsp;<span style={{color:"var(--indigo)"}}>"{event.app.product}"</span></div>
            <div>amount:&nbsp;<span style={{color:"var(--indigo)"}}>{event.app.amount}</span></div>
            <div>player_id:&nbsp;<span style={{color:"var(--ink-3)"}}>"…8821"</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =================== SALES CLOUD LANE ===================
function SalesLane({ active, currentEvent }) {
  const color = "var(--teal)";
  const e = currentEvent.sales;
  return (
    <section className={`lane-card ${active ? "active" : ""}`} style={{
      color, background:"white", border:"1px solid var(--line)",
      borderRadius:14, overflow:"hidden", minHeight:170,
    }}>
      <LaneHeader vendor="Salesforce" system="Sales Cloud · CRM" color={color} icon="db" sub="org: lottery-prod" />
      <div style={{padding:"14px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div>
          <div className="micro" style={{marginBottom:8}}>Record updated</div>
          <div style={{
            border:"1px solid var(--teal)",
            background:"var(--teal-soft)",
            borderRadius:8, padding:"10px 12px",
          }}>
            <div style={{display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:"var(--ink)"}}>
              <Icon name="check" size={14} />
              {e.object}
            </div>
            <div className="mono" style={{fontSize:11, marginTop:4, color:"var(--ink-2)"}}>{e.action}</div>
          </div>
        </div>
        <div>
          <div className="micro" style={{marginBottom:8}}>Field changes</div>
          <div style={{display:"grid", gap:4}}>
            {e.fields.map(([k, v]) => (
              <div key={k} style={{
                display:"flex", justifyContent:"space-between",
                fontSize:11, padding:"4px 8px",
                borderRadius:5, background:"var(--bg-2)",
              }} className="mono">
                <span style={{color:"var(--ink-3)"}}>{k}</span>
                <span style={{color:"var(--ink)"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =================== DATA CLOUD LANE ===================
function DataCloudLane({ active, currentEvent, segmentMembership }) {
  const color = "var(--amber)";
  const e = currentEvent.dc;

  return (
    <section className={`lane-card ${active ? "active" : ""}`} style={{
      color, background:"white", border:"1px solid var(--line)",
      borderRadius:14, overflow:"hidden", minHeight:170,
    }}>
      <LaneHeader vendor="Salesforce" system="Data Cloud · Unification + Segments" color={color} icon="bolt" sub="unified profile · uc_8821" />
      <div style={{padding:"14px 16px", display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:14}}>
        <div>
          <div className="micro" style={{marginBottom:8}}>Dynamic segment membership</div>
          <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
            {SEGMENTS.map(s => {
              const isIn = segmentMembership.has(s.id);
              const justEntered = e.enters.includes(s.name);
              const justExited  = e.exits.includes(s.name);
              return (
                <span key={s.id} className={`chip ${isIn ? "on" : ""}`} style={{
                  color: isIn ? s.color : "var(--ink-3)",
                  background: justEntered ? "var(--amber-soft)" : "white",
                  borderColor: justEntered ? "var(--amber)" : (isIn ? "currentColor" : "var(--line)"),
                  animation: justEntered ? "fadeIn 400ms ease" : "none",
                  textDecoration: justExited ? "line-through" : "none",
                  opacity: justExited ? 0.5 : 1,
                }}>
                  {isIn && <span className="swatch" />}
                  {s.name}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <div className="micro" style={{marginBottom:8}}>Profile attributes</div>
          <div style={{display:"grid", gap:4}}>
            {e.attrs.map(([k, v]) => (
              <div key={k} style={{
                display:"flex", justifyContent:"space-between",
                fontSize:11, padding:"4px 8px",
                borderRadius:5, background:"var(--bg-2)",
              }} className="mono">
                <span style={{color:"var(--ink-3)"}}>{k}</span>
                <span style={{color:"var(--ink)"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =================== MARKETING CLOUD LANE ===================
function MarketingLane({ active, currentEvent, prefs }) {
  const color = "var(--violet)";
  const m = currentEvent.mc;
  return (
    <section className={`lane-card ${active ? "active" : ""}`} style={{
      color, background:"white", border:"1px solid var(--line)",
      borderRadius:14, overflow:"hidden", minHeight:170,
    }}>
      <LaneHeader vendor="Salesforce" system="Marketing Cloud · Journeys + Preferences" color={color} icon="send" sub={m.journey} />
      <div style={{padding:"14px 16px", display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:14}}>
        <div>
          <div className="micro" style={{marginBottom:8}}>Journey step firing</div>
          <div style={{
            border:"1px solid var(--violet)",
            background:"var(--violet-soft)",
            borderRadius:10, padding:"10px 12px",
          }}>
            <div style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:600}}>
              <span className="dot pulse" style={{background:"var(--violet)", color:"var(--violet)"}} />
              <span style={{color:"var(--ink)"}}>{m.step}</span>
            </div>
            <div style={{marginTop:8, paddingTop:8, borderTop:"1px solid var(--violet)", borderTopStyle:"dashed"}}>
              <div style={{fontSize:12, fontWeight:600, color:"var(--ink)"}}>{m.message.subject}</div>
              <div style={{fontSize:11, color:"var(--ink-2)", marginTop:3}}>{m.message.preview}</div>
            </div>
          </div>
        </div>
        <div>
          <div className="micro" style={{marginBottom:8}}>Preference Center</div>
          <div style={{display:"grid", gap:4}}>
            {prefs.map(p => (
              <div key={p.ch} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                fontSize:11, padding:"4px 8px",
                borderRadius:5, background:"var(--bg-2)",
                opacity: p.on ? 1 : 0.45,
              }}>
                <span style={{display:"flex", alignItems:"center", gap:6}}>
                  <span className="dot" style={{background: p.on ? "var(--violet)" : "var(--ink-3)"}} />
                  <span style={{fontWeight:500}}>{p.ch}</span>
                </span>
                <span className="mono" style={{color:"var(--ink-3)"}}>{p.freq}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Icon, AppLane, SalesLane, DataCloudLane, MarketingLane });
