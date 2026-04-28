// Main orchestration
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Animation phases per event:
// 0 idle → 1 app → 2 sales → 3 dataCloud → 4 marketingCloud → done
const PHASE_NAMES = ["idle","app","sales","datacloud","marketing","done"];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "speed": 1,
  "showPrefs": true,
  "autoSegments": true,
  "showLog": true,
  "density": "comfortable"
}/*EDITMODE-END*/;

function timestampFor(idx, phase) {
  // synthetic times for the log
  const base = ["10:14:02","10:21:44","11:02:19","11:14:08","10:39:42","10:36:11"][idx] || "00:00:00";
  const offset = phase * 0.4;
  // tweak seconds for each phase
  const [h, m, s] = base.split(":").map(Number);
  const total = h*3600 + m*60 + s + offset;
  const hh = String(Math.floor(total/3600)).padStart(2,"0");
  const mm = String(Math.floor((total%3600)/60)).padStart(2,"0");
  const ss = String(Math.floor(total%60)).padStart(2,"0");
  return `${hh}:${mm}:${ss}`;
}

function Tabs({ value, onChange }) {
  const tabs = [
    { id: "journey", label: "Customer journey" },
    { id: "arch",    label: "Data flow architecture" },
  ];
  return (
    <div style={{
      display:"flex", gap:4, padding:"0 32px",
      borderBottom:"1px solid var(--line)", background:"white",
    }}>
      {tabs.map(t => {
        const on = value === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background:"none", border:"none", padding:"14px 16px",
            cursor:"pointer", fontSize:13, fontWeight: on ? 600 : 500,
            color: on ? "var(--ink)" : "var(--ink-3)",
            borderBottom: on ? "2px solid var(--ink)" : "2px solid transparent",
            marginBottom:-1,
          }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useState("journey");
  const [eventIdx, setEventIdx] = useState(0);
  const [phase, setPhase] = useState(0);   // 0..5
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState([]);
  const [segmentMembership, setSegmentMembership] = useState(new Set());

  const events = EVENTS;
  const event = events[eventIdx];

  // step the phase
  useEffect(() => {
    if (!playing) return;
    const stepMs = Math.round(1100 / tweaks.speed);
    const id = setTimeout(() => {
      if (phase < 5) {
        setPhase(p => p + 1);
      } else {
        // advance to next event if any
        if (eventIdx < events.length - 1) {
          setEventIdx(i => i + 1);
          setPhase(0);
        } else {
          setPlaying(false);
        }
      }
    }, stepMs);
    return () => clearTimeout(id);
  }, [playing, phase, eventIdx, tweaks.speed, events.length]);

  // when phase changes, append history + update segments
  useEffect(() => {
    if (phase === 0) return;
    const e = events[eventIdx];
    const entries = [];
    if (phase === 1) entries.push({
      time: timestampFor(eventIdx, 1), system: "App", color: "var(--indigo)",
      msg: `${e.label} · ${e.app.amount} via ${e.app.channel}`,
    });
    if (phase === 2) entries.push({
      time: timestampFor(eventIdx, 2), system: "Sales", color: "var(--teal)",
      msg: `${e.sales.object} → ${e.sales.action}`,
    });
    if (phase === 3) {
      // Update segment membership
      if (tweaks.autoSegments) {
        setSegmentMembership(prev => {
          const next = new Set(prev);
          SEGMENTS.forEach(s => {
            if (e.dc.enters.includes(s.name)) next.add(s.id);
            if (e.dc.exits.includes(s.name)) next.delete(s.id);
          });
          return next;
        });
      }
      const enterTxt = e.dc.enters.length ? `enters [${e.dc.enters.join(", ")}]` : "";
      const exitTxt = e.dc.exits.length ? ` · exits [${e.dc.exits.join(", ")}]` : "";
      entries.push({
        time: timestampFor(eventIdx, 3), system: "Data Cloud", color: "var(--amber)",
        msg: `Segment recompute · ${enterTxt}${exitTxt}`,
      });
    }
    if (phase === 4) entries.push({
      time: timestampFor(eventIdx, 4), system: "Marketing", color: "var(--violet)",
      msg: `${e.mc.journey} · ${e.mc.step}`,
    });
    if (entries.length) setHistory(h => [...h, ...entries]);
  }, [phase, eventIdx]);

  // jumping to an event manually — reset segments to derived state up to here
  const goToEvent = useCallback((idx) => {
    setEventIdx(idx);
    setPhase(0);
    setHistory([]);
    // recompute segment membership from scratch up to (but not including) this event
    const next = new Set();
    for (let i = 0; i < idx; i++) {
      SEGMENTS.forEach(s => {
        if (events[i].dc.enters.includes(s.name)) next.add(s.id);
        if (events[i].dc.exits.includes(s.name)) next.delete(s.id);
      });
    }
    setSegmentMembership(next);
  }, [events]);

  const restart = () => { setPlaying(false); goToEvent(0); };
  const next = () => { if (eventIdx < events.length-1) goToEvent(eventIdx+1); else { setPhase(5);} };
  const prev = () => { if (eventIdx > 0) goToEvent(eventIdx-1); };

  // Active flags for lanes
  const active = {
    app: phase === 1,
    sales: phase === 2,
    dc: phase === 3,
    mc: phase === 4,
  };

  // Connectors lit when leaving a phase
  const connectorLit = {
    appToSales: phase >= 2,
    salesToDC: phase >= 3,
    dcToMC: phase >= 4,
  };

  const prefs = PREFS;

  return (
    <>
      <Tabs value={tab} onChange={setTab} />
      {tab === "journey" ? (
        <>
          <HeroHeader event={event} idx={eventIdx} total={events.length} />
          <Timeline
            events={events}
            currentIdx={eventIdx}
            onPick={goToEvent}
            playing={playing}
            onPlayToggle={() => setPlaying(p => !p)}
            onRestart={restart}
            onNext={next}
            onPrev={prev}
            speed={tweaks.speed}
          />

          <main style={{
            display:"grid", gridTemplateColumns:"280px 1fr",
            gap:24, padding:"24px 32px 60px",
            maxWidth: 1480, margin:"0 auto",
          }}>
            <CustomerCard customer={CUSTOMER} segmentMembership={segmentMembership} prefs={prefs} />

            <section>
              <AppLane active={active.app} currentEvent={event} />
              <Connector active={connectorLit.appToSales} color="var(--teal)" fromColor="var(--indigo)" label="ingest → CRM" />
              <SalesLane active={active.sales} currentEvent={event} />
              <Connector active={connectorLit.salesToDC} color="var(--amber)" fromColor="var(--teal)" label="stream → unified profile" />
              <DataCloudLane active={active.dc} currentEvent={event} segmentMembership={segmentMembership} />
              <Connector active={connectorLit.dcToMC} color="var(--violet)" fromColor="var(--amber)" label="segment activation" />
              <MarketingLane active={active.mc} currentEvent={event} prefs={tweaks.showPrefs ? prefs : []} />

              {tweaks.showLog && <EventLog history={history} />}

              <Legend />
            </section>
          </main>
        </>
      ) : (
        <ArchitectureView speed={tweaks.speed} />
      )}

      <TweaksUI tweaks={tweaks} setTweak={setTweak} />
    </>
  );
}

function Legend() {
  const items = [
    { name: "Third-party app", color: "var(--indigo)", desc: "Player web/mobile · sale + event endpoints" },
    { name: "Sales Cloud",     color: "var(--teal)",   desc: "System of record · contacts, opps, campaigns" },
    { name: "Data Cloud",      color: "var(--amber)",  desc: "Identity unification · dynamic segmentation" },
    { name: "Marketing Cloud", color: "var(--violet)", desc: "Journeys · personalization · preferences" },
  ];
  return (
    <div style={{
      marginTop:18, padding:"14px 16px",
      background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:14,
      display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14,
    }}>
      {items.map(it => (
        <div key={it.name} style={{display:"flex", gap:10, alignItems:"flex-start"}}>
          <span style={{
            width:10, height:10, borderRadius:3, background:it.color, marginTop:4,
          }} />
          <div>
            <div style={{fontSize:12, fontWeight:600}}>{it.name}</div>
            <div style={{fontSize:11, color:"var(--ink-2)", lineHeight:1.4}}>{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TweaksUI({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Animation">
        <TweakSlider label="Playback speed" value={tweaks.speed} min={0.5} max={3} step={0.25}
          onChange={v => setTweak("speed", v)} unit="×" />
      </TweakSection>
      <TweakSection label="Data Cloud">
        <TweakToggle label="Auto-recompute segments"
          value={tweaks.autoSegments} onChange={v => setTweak("autoSegments", v)} />
      </TweakSection>
      <TweakSection label="Marketing Cloud">
        <TweakToggle label="Show Preference Center"
          value={tweaks.showPrefs} onChange={v => setTweak("showPrefs", v)} />
      </TweakSection>
      <TweakSection label="Display">
        <TweakToggle label="Show system log"
          value={tweaks.showLog} onChange={v => setTweak("showLog", v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
