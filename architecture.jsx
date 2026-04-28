// Architecture diagram tab — playable, step-by-step
// Each step activates ONE specific component within ONE system, and lights ONE edge.

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// Layout designed at 1320 × 920 SVG units. Plenty of room so labels never overlap.
const ARCH_NODES = [
  {
    id: "app", title: "Player Web & Mobile App", vendor: "Third-party",
    color: "var(--indigo)", x: 40, y: 110, w: 250, h: 260,
    components: [
      { id: "app-checkout",  name: "Checkout — lottery",    desc: "Ticket purchase" },
      { id: "app-donate",    name: "Donations form",        desc: "One-off + recurring" },
      { id: "app-evt",       name: "Event registration",    desc: "RSVP + wallet pass" },
      { id: "app-deeplink",  name: "Email/SMS deeplinks",   desc: "tracked by mid + cid" },
    ],
  },
  {
    id: "sales", title: "Sales Cloud", vendor: "Salesforce CRM",
    color: "var(--teal)", x: 380, y: 110, w: 250, h: 260,
    components: [
      { id: "sf-contact",  name: "Contact / Person Acct" },
      { id: "sf-opp",      name: "Opportunity",                  desc: "sale · donation" },
      { id: "sf-camp",     name: "Campaign Member",              desc: "RSVP · attended · no-show" },
      { id: "sf-case",     name: "Service case (optional)" },
    ],
  },
  {
    id: "dc", title: "Data Cloud", vendor: "Salesforce",
    color: "var(--amber)", x: 720, y: 90, w: 290, h: 360,
    components: [
      { id: "dc-ingest",   name: "Ingestion — streams + batch", desc: "App · CRM · MC engagement" },
      { id: "dc-identity", name: "Identity Resolution",         desc: "→ unified individual" },
      { id: "dc-ci",       name: "Calculated Insights",         desc: "LTV · open-rate · attend-rate" },
      { id: "dc-seg",      name: "Dynamic Segments",            desc: "Active · Donors · No-shows · VIP" },
      { id: "dc-act",      name: "Activations",                 desc: "→ MC audience APIs" },
    ],
  },
  {
    id: "mc", title: "Marketing Cloud", vendor: "Salesforce",
    color: "var(--violet)", x: 1100, y: 90, w: 220, h: 460,
    components: [
      { id: "mc-jb",     name: "Journey Builder",      desc: "7 active journeys" },
      { id: "mc-nba",    name: "Einstein Next Best Action", desc: "ranks campaigns per individual" },
      { id: "mc-freq",   name: "Contact Frequency",    desc: "3 sends / 7d · 48h gap" },
      { id: "mc-email",  name: "Email Studio",         desc: "+ tracking pixels" },
      { id: "mc-push",   name: "MobilePush + SMS" },
      { id: "mc-pref",   name: "Preference Center" },
      { id: "mc-sto",    name: "Send-Time Optimization", desc: "uses time-to-open histogram" },
      { id: "mc-out",    name: "Engagement events",    desc: "open · click · bounce" },
    ],
  },
  {
    id: "insights", title: "Insights & Feedback", vendor: "Data Cloud · Calculated",
    color: "var(--rose)", x: 320, y: 620, w: 720, h: 360,
    components: [
      { id: "ins-open",     name: "Email open · time-to-open",  desc: "from MC tracking pixel" },
      { id: "ins-tod",      name: "Open time-of-day histogram", desc: "STO source signal" },
      { id: "ins-click",    name: "Click-through paths",        desc: "deeplink → app conversion" },
      { id: "ins-noshow",   name: "Event no-show flag",         desc: "registered ∧ ¬attended @T+2h" },
      { id: "ins-affinity", name: "Affinity · Cause / Product", desc: "feeds NBA decisioning" },
      { id: "ins-score",    name: "Re-engagement scores",       desc: "feeds segment recompute" },
      { id: "ins-behaviour", name: "Behavioural insights",       desc: "product mix · frequency · intent" },
    ],
  },
];

// Edges: from → to. Each edge can be referenced by id from steps.
const ARCH_EDGES = [
  { id: "e-app-sf",   from: "app",    to: "sales",    label: "REST · webhooks",                  kind: "fwd",     side: "top" },
  { id: "e-sf-dc",    from: "sales",  to: "dc",       label: "CDC stream",                       kind: "fwd",     side: "top" },
  { id: "e-dc-mc",    from: "dc",     to: "mc",       label: "Segment activation",               kind: "fwd",     side: "top" },
  { id: "e-mc-app",   from: "mc",     to: "app",      label: "Personalised messages → deeplinks",kind: "fwd",     side: "top-arc" },

  { id: "e-mc-ins",   from: "mc",     to: "insights", label: "Open · click · time-to-open",      kind: "fb",      side: "bottom" },
  { id: "e-sf-ins",   from: "sales",  to: "insights", label: "RSVP vs Attended → no-show",       kind: "fb",      side: "bottom" },
  { id: "e-app-ins",  from: "app",    to: "insights", label: "Click-through → conversion",       kind: "fb",      side: "bottom" },
  { id: "e-ins-dc",   from: "insights", to: "dc",     label: "Recompute segments + scores",      kind: "fb-loop", side: "bottom" },
];

// Steps — each highlights one node, one component within it, one edge.
const ARCH_STEPS = [
  // Forward path — 1st event (lottery ticket)
  { id: 1,  node: "app",      comp: "app-checkout",  edge: null,        title: "Player buys a lottery ticket",       detail: "Sale completed in third-party app." },
  { id: 2,  node: "sales",    comp: "sf-opp",        edge: "e-app-sf",  title: "Opportunity Closed Won",             detail: "Webhook posts the sale into Sales Cloud." },
  { id: 3,  node: "dc",       comp: "dc-ingest",     edge: "e-sf-dc",   title: "Sale streams into Data Cloud",       detail: "CDC stream from CRM lands in DC ingestion." },
  { id: 4,  node: "dc",       comp: "dc-identity",   edge: null,        title: "Identity resolved",                  detail: "Email + device id → single unified individual." },
  { id: 5,  node: "dc",       comp: "dc-ci",         edge: null,        title: "Calculated Insights refresh",        detail: "LTV, recency, product mix recomputed." },
  { id: 6,  node: "dc",       comp: "dc-seg",        edge: null,        title: "Dynamic Segments recompute",         detail: "Enters Active Players + First-time Buyers.", segUpdate: { enters: ["Active Players","First-time Buyers"], exits: [] } },
  { id: 7,  node: "dc",       comp: "dc-act",        edge: null,        title: "Audience activated",                 detail: "Segment pushed to Marketing Cloud audience API." },
  { id: 8,  node: "mc",       comp: "mc-jb",         edge: "e-dc-mc",   title: "Welcome — New Player journey starts", detail: "Player enrolled in welcome journey." },
  { id: 9,  node: "mc",       comp: "mc-email",      edge: null,        title: "Welcome email sent",                 detail: "Email Studio renders + sends with tracking pixel.", emailSend: { time: "10:14", subject: "Welcome — your ticket is locked in" } },
  { id: 10, node: "app",      comp: "app-deeplink",  edge: "e-mc-app",  title: "Player taps email deeplink",         detail: "Returns to app via tracked deeplink (mid + cid).", emailOpen: { time: "10:28", tto: "14m", hourOfDay: 10 } },

  // FB phase 1 — open + click-through (donation)
  { id: 11, node: "mc",       comp: "mc-out",        edge: "e-mc-ins",  title: "Engagement events emitted",          detail: "Email open recorded; time-to-open = 14m at 10:28.", phase: "fb" },
  { id: 12, node: "insights", comp: "ins-open",      edge: null,        title: "Open + time-to-open landed",         detail: "Open-rate Insight bumped for this individual.", phase: "fb" },
  { id: 13, node: "insights", comp: "ins-tod",       edge: null,        title: "Open time-of-day recorded",          detail: "10:28 added to time-of-day histogram → STO source.", phase: "fb", todMark: 10 },
  { id: 14, node: "app",      comp: "app-donate",    edge: "e-mc-app",  title: "Player follows CTA → donates £20",   detail: "Click-through lands on Donations form; donation completed.", phase: "fb" },
  { id: 15, node: "insights", comp: "ins-click",     edge: "e-app-ins", title: "Click-through path attributed",      detail: "Donation 12m after open → credited to welcome email step.", phase: "fb" },
  { id: 16, node: "insights", comp: "ins-affinity",  edge: null,        title: "Affinity recalculated · Cause +",  detail: "affinity:cause incremented for click-through donation. Mission-aligned weight feeds into next NBA decision.", phase: "fb" },
  { id: 17, node: "dc",       comp: "dc-seg",        edge: "e-ins-dc",  title: "Segments update for Donor",          detail: "Enters Donors + Mission-aligned; exits First-time Buyers.", phase: "fb", segUpdate: { enters: ["Donors","Mission-aligned"], exits: ["First-time Buyers"] } },

  // 2nd email — reflects STO and emits another open
  { id: 18, node: "mc",       comp: "mc-sto",        edge: null,        title: "STO picks the next send time",       detail: "Histogram shows player opens 10–11am — schedule donor thank-you for 10:30 tomorrow.", phase: "fb" },
  { id: 19, node: "mc",       comp: "mc-email",      edge: null,        title: "Donor thank-you email sent",         detail: "Sent 10:30; opened 10:38 → time-to-open = 8m.", phase: "fb", emailSend: { time: "10:30", subject: "Thank you — here's where your £20 goes" }, emailOpen: { time: "10:38", tto: "8m", hourOfDay: 10 }, todMark: 10 },

  // FB phase 2 — event registration + pre-event reminder loop
  { id: 20, node: "app",      comp: "app-evt",       edge: null,        title: "Player registers for Winners' Night", detail: "Event registration completed in app.", phase: "fb" },
  { id: 21, node: "sales",    comp: "sf-camp",       edge: "e-app-sf",  title: "Campaign Member · Registered",       detail: "Status set to Registered in Sales Cloud.", phase: "fb" },
  { id: 22, node: "dc",       comp: "dc-ingest",     edge: "e-sf-dc",   title: "Registration streams into Data Cloud", detail: "Campaign Member CDC update flows from Sales Cloud into DC.", phase: "fb" },
  { id: 23, node: "dc",       comp: "dc-ci",         edge: null,        title: "Insights refresh for the registrant", detail: "event_registered flag set; recency + intent score recomputed.", phase: "fb" },
  { id: 24, node: "dc",       comp: "dc-seg",        edge: null,        title: "Dynamic Segments recompute",         detail: "Membership condition (registered ∧ event not yet passed) evaluates true → enters Registered — Awaiting Attendance.", phase: "fb", segUpdate: { enters: ["Registered — Awaiting Attendance"], exits: [] } },
  { id: 25, node: "mc",       comp: "mc-jb",         edge: "e-dc-mc",   title: "'Pre-Event Nurture' journey enrols", detail: "Reusable pre-event journey — confirmation + venue details + reminders at T-7d, T-1d, T-3h. Content is templated per campaign.", phase: "fb" },
  { id: 26, node: "mc",       comp: "mc-sto",        edge: null,        title: "STO schedules each reminder",        detail: "Each reminder lands inside the player's modal open hour from the time-of-day histogram.", phase: "fb" },
  { id: 27, node: "mc",       comp: "mc-email",      edge: null,        title: "Reminder email sent (T-1d)",         detail: "Sent 10:30; opened 10:42 → time-to-open = 12m.", phase: "fb", emailSend: { time: "10:30", subject: "Looking forward to seeing you there" }, emailOpen: { time: "10:42", tto: "12m", hourOfDay: 10 }, todMark: 10 },
  { id: 28, node: "insights", comp: "ins-tod",       edge: "e-mc-ins",  title: "Open + time-of-day fed back",        detail: "10:42 added to histogram; OToD + TTO refresh STO model for the next send.", phase: "fb", todMark: 10 },

  // FB phase 3 — no-show + win-back
  { id: 29, node: "sales",    comp: "sf-camp",       edge: null,        title: "T+2h after event — no Attended status", detail: "Campaign Member status remains Registered → triggers no-show check.", phase: "fb" },
  { id: 30, node: "insights", comp: "ins-noshow",    edge: "e-sf-ins",  title: "No-show flag raised",                detail: "Event no-show recorded for this individual.", phase: "fb" },
  { id: 31, node: "mc",       comp: "mc-jb",         edge: "e-ins-dc",  title: "'Sorry we missed you' journey enrols", detail: "Win-back sequence kicks off — apology + replay code + £5 next-draw credit.", phase: "fb" },
  { id: 32, node: "mc",       comp: "mc-email",      edge: null,        title: "'Sorry we missed you' email sent",   detail: "Sent at STO-optimal 10:30; opened 11:02 → time-to-open = 32m.", phase: "fb", emailSend: { time: "10:30", subject: "Sorry we missed you — here's a replay" }, emailOpen: { time: "11:02", tto: "32m", hourOfDay: 11 }, todMark: 11 },

  // Final FB — score update + segment recompute
  { id: 33, node: "insights", comp: "ins-score",     edge: null,        title: "Re-engagement score updated",        detail: "engagement_score −15 for no-show, +5 for win-back open.", phase: "fb" },
  { id: 34, node: "dc",       comp: "dc-seg",        edge: "e-ins-dc",  title: "Segments recompute from Insights",   detail: "Exits Registered — Awaiting Attendance + High-engagement; enters Win-back audience.", phase: "fb", segUpdate: { enters: ["Win-back audience"], exits: ["Registered — Awaiting Attendance","High-engagement"] } },

  // ===== Win-back lands & works =====
  { id: 35, node: "mc",       comp: "mc-email",      edge: null,        title: "Win-back email opened",              detail: "'Sorry we missed you' opened at 11:02 (TTO 32m) — longer than usual; STO logs slower hour.", phase: "fb" },
  { id: 36, node: "app",      comp: "app-deeplink",  edge: "e-mc-app",  title: "Click-through → replay code in app", detail: "Player taps 'Use my £5 next-draw credit' deeplink.", phase: "fb" },
  { id: 37, node: "app",      comp: "app-checkout",  edge: null,        title: "Recovery purchase — £5 ticket",       detail: "Win-back credit redeemed against the next National Draw.", phase: "fb" },
  { id: 38, node: "sales",    comp: "sf-opp",        edge: "e-app-sf",  title: "Opportunity Closed Won (recovery)",  detail: "Sales Cloud records the win-back conversion; ties opp to the win-back campaign.", phase: "fb" },
  { id: 39, node: "insights", comp: "ins-score",     edge: "e-mc-ins",  title: "Re-engagement score recovers",       detail: "engagement_score +12 (open + click + recovery purchase). Win-back marked successful.", phase: "fb" },
  { id: 40, node: "dc",       comp: "dc-seg",        edge: "e-ins-dc",  title: "Exits Win-back · enters Reactivated", detail: "Win-back audience condition no longer met; Reactivated (last_purchase ≤ 7d ∧ prior no-show) becomes true.", phase: "fb", segUpdate: { enters: ["Reactivated"], exits: ["Win-back audience"] } },

  // ===== Two campaigns activate simultaneously =====
  { id: 41, node: "mc",       comp: "mc-jb",         edge: null,        title: "Marketers launch two campaigns",     detail: "'Spring Mega Draw' (lottery, launch +1d) and 'EOFY Donor Appeal' (donation, FY ends in 14d) both go live.", phase: "fb" },
  { id: 42, node: "dc",       comp: "dc-seg",        edge: null,        title: "Eligibility segments recompute",     detail: "Member meets both: Spring Mega Draw — Eligible (active player ∧ reactivated) AND EOFY Donor Prospects (donor_lifetime > 0 ∧ affinity:cause ≥ 0.5).", phase: "fb", segUpdate: { enters: ["Spring Mega Draw — Eligible","EOFY Donor Prospects"], exits: [] } },
  { id: 43, node: "dc",       comp: "dc-act",        edge: "e-dc-mc",   title: "Both audiences activated to MC",     detail: "Two parallel activations land in MC — without governance they would each schedule their own sends.", phase: "fb" },

  // ===== Governance decides who wins each slot =====
  { id: 44, node: "insights", comp: "ins-affinity",  edge: null,        title: "Affinity scores read by NBA",        detail: "affinity:cause = 0.71 · affinity:lottery = 0.64 · xsell_score = 0.84. Both campaigns score above threshold.", phase: "fb" },
  { id: 45, node: "mc",       comp: "mc-nba",        edge: null,        title: "Einstein NBA ranks the campaigns",   detail: "Per-individual ranking: slot 1 → Spring Mega Draw (recency + xsell), slot 2 → EOFY Donor (higher value, time-bound), slot 3 → Spring Mega Draw push (lighter channel).", phase: "fb" },
  { id: 46, node: "mc",       comp: "mc-freq",       edge: null,        title: "Contact Frequency caps applied",     detail: "Cap = 3 marketing sends / 7d · min 48h gap between same-individual touches · no marketing within 24h of a transactional. Sequence stretched across 11 days.", phase: "fb" },
  { id: 47, node: "mc",       comp: "mc-pref",       edge: null,        title: "Channel preference honoured",        detail: "Email = Weekly ✓ · Push = Smart ✓ · SMS = Event-only ✗. SMS reminder swapped for push.", phase: "fb" },
  { id: 48, node: "mc",       comp: "mc-sto",        edge: null,        title: "STO schedules each surviving send",  detail: "Day 1 Spring email · Day 4 EOFY email · Day 8 Spring push — each landed in the 10–11am open window.", phase: "fb" },

  // ===== Sends fire & she converts on both =====
  { id: 49, node: "mc",       comp: "mc-email",      edge: null,        title: "Day 1 · Spring Mega Draw email",      detail: "Personalised: hero shows her preferred number patterns. Sent 10:30; opened 10:39 (TTO 9m); clicked.", phase: "fb", emailSend: { time: "10:30", subject: "Eleanor, the Spring Mega Draw is yours to play" }, emailOpen: { time: "10:39", tto: "9m", hourOfDay: 10 }, todMark: 10 },
  { id: 50, node: "app",      comp: "app-checkout",  edge: "e-mc-app",  title: "Day 2 · buys £5 Spring Mega Draw ticket", detail: "Conversion attributed to the Spring email. Sales Cloud Opportunity Closed Won.", phase: "fb" },
  { id: 51, node: "sales",    comp: "sf-opp",        edge: "e-app-sf",  title: "CRM · Opportunity (Spring) recorded", detail: "Sales Cloud writes Opportunity £5 · ticket count incremented · attribution = Spring Mega Draw email.", phase: "fb" },
  { id: 52, node: "dc",       comp: "dc-ingest",     edge: "e-sf-dc",   title: "DC ingests purchase · Insights refresh", detail: "ticket_count_30d → 4 · affinity:lottery +0.06 (→ 0.70) · LTV recomputed.", phase: "fb" },
  { id: 53, node: "insights", comp: "ins-behaviour", edge: "e-app-ins", title: "Behavioural insight · ticket-stacking pattern", detail: "Cross-draw stacking detected (≥3 tickets in 30d). 'Increase your chances' messaging unlocked for next eligible draw.", phase: "fb" },
  { id: 54, node: "dc",       comp: "dc-seg",        edge: "e-ins-dc",  title: "Segments recompute post-purchase", detail: "Enters Multi-ticket Buyers + Stackers; retains Active Players. Reactivated retained until next cycle review.", phase: "fb", segUpdate: { enters: ["Multi-ticket Buyers","Stackers"], exits: [] } },
  { id: 55, node: "mc",       comp: "mc-freq",       edge: null,        title: "Day 3 · transactional suppression fires", detail: "Order receipt sent (transactional). 24h marketing suppression activates — Day 3 EOFY send is postponed by Contact Frequency.", phase: "fb" },
  { id: 56, node: "mc",       comp: "mc-email",      edge: null,        title: "Day 4 · EOFY Donor Appeal email",     detail: "Personalised impact block: 'Your last £20 funded 3 community projects.' Sent 10:30; opened 10:36 (TTO 6m — strongly engaged).", phase: "fb", emailSend: { time: "10:30", subject: "Eleanor, your £20 changed three lives — do it again before FY end?" }, emailOpen: { time: "10:36", tto: "6m", hourOfDay: 10 }, todMark: 10 },
  { id: 57, node: "app",      comp: "app-donate",    edge: "e-mc-app",  title: "Day 5 · donates £30",                 detail: "EOFY conversion. Sales Cloud Opportunity (Donation) Closed Won · ties to EOFY campaign.", phase: "fb" },
  { id: 58, node: "sales",    comp: "sf-opp",        edge: "e-app-sf",  title: "CRM · Opportunity (Donation) recorded", detail: "Sales Cloud writes Opportunity £30 · Donor lifetime updated to £50 · attribution = EOFY Donor Appeal.", phase: "fb" },
  { id: 59, node: "dc",       comp: "dc-ingest",     edge: "e-sf-dc",   title: "DC ingests donation · Insights refresh", detail: "donor_lifetime → £50 · affinity:cause +0.08 (→ 0.79) · recency reset.", phase: "fb" },
  { id: 60, node: "insights", comp: "ins-behaviour", edge: "e-app-ins", title: "Behavioural shift · mission-driven repeat donor", detail: "Pattern detected: paid-then-donated within 14 days, twice. Future EOFY-style appeals weighted higher in NBA — next ask: legacy giving exploration.", phase: "fb" },
  { id: 61, node: "dc",       comp: "dc-seg",        edge: "e-ins-dc",  title: "Segments recompute post-donation", detail: "Enters Donor Plus + EOFY Donor Prospects · retains VIP Watchlist; exits Reactivated.", phase: "fb", segUpdate: { enters: ["Donor Plus","EOFY Donor Prospects","VIP Watchlist"], exits: ["Reactivated"] } },
  { id: 62, node: "mc",       comp: "mc-freq",       edge: null,        title: "Day 6–11 · remaining sends suppressed", detail: "Frequency budget exhausted (2 of 3 sends used + recent conversions). Day 8 push and Day 11 reminder dropped — customer feels valued, not spammed.", phase: "fb" },

  // ===== Final loop =====
  { id: 63, node: "insights", comp: "ins-score",     edge: "e-mc-ins",  title: "Engagement + governance score logged", detail: "engagement_score = 78 (recovered + amplified). contact_governance_score = 0.92 (high engagement / low fatigue ratio).", phase: "fb" },
  { id: 64, node: "dc",       comp: "dc-seg",        edge: "e-ins-dc",  title: "Segments recompute · ready for next cycle", detail: "Enters VIP Watchlist + Donor Plus + Multi-product Players; exits Reactivated. Cycle closes — ready for the next campaign window.", phase: "fb", segUpdate: { enters: ["VIP Watchlist","Donor Plus","Multi-product Players"], exits: ["Reactivated"] } },
];

function ArchNode({ node, highlightedComp, dimmed, lit, onClick }) {
  const headerH = 50;
  const compH = 38;
  return (
    <g onClick={onClick} style={{ cursor:"pointer", opacity: dimmed ? 0.45 : 1, transition:"opacity 300ms" }}>
      <rect
        x={node.x} y={node.y} width={node.w} height={node.h}
        rx="14" ry="14"
        fill="white"
        stroke={lit ? node.color : "var(--line)"}
        strokeWidth={lit ? 2.5 : 1.2}
        style={{
          filter: lit ? `drop-shadow(0 14px 36px ${node.color}55)` : "none",
          transition: "all 300ms ease",
        }}
      />
      {/* color tab top */}
      <rect x={node.x} y={node.y} width={node.w} height={6} rx="14" ry="14" fill={node.color}/>
      <rect x={node.x} y={node.y+3} width={node.w} height={4} fill={node.color}/>

      <text x={node.x + 14} y={node.y + 24} fontSize="9.5" fontWeight="600"
            letterSpacing="1.2" fill="var(--ink-3)" style={{textTransform:"uppercase"}}>
        {node.vendor}
      </text>
      <text x={node.x + 14} y={node.y + 42} fontSize="14" fontWeight="700" fill="var(--ink)">
        {node.title}
      </text>

      {node.components.map((c, i) => {
        const cy = node.y + headerH + 12 + i*compH;
        const isLit = highlightedComp === c.id;
        return (
          <g key={c.id} style={{transition:"all 300ms ease"}}>
            <rect x={node.x + 12} y={cy} width={node.w - 24} height={compH - 6} rx="7" ry="7"
                  fill={isLit ? "white" : "var(--bg-2)"}
                  stroke={isLit ? node.color : "var(--line)"}
                  strokeWidth={isLit ? 2 : 1}
                  style={{
                    filter: isLit ? `drop-shadow(0 4px 14px ${node.color}66)` : "none",
                  }}/>
            <circle cx={node.x + 24} cy={cy + (compH-6)/2} r={isLit ? 4 : 3}
                    fill={node.color}
                    style={{ filter: isLit ? `drop-shadow(0 0 6px ${node.color})` : "none" }}/>
            <text x={node.x + 36} y={cy + 14} fontSize="11" fontWeight={isLit ? 700 : 600} fill="var(--ink)">
              {c.name}
            </text>
            {c.desc && (
              <text x={node.x + 36} y={cy + 26} fontSize="9.5"
                    fill={isLit ? node.color : "var(--ink-3)"}
                    fontFamily="JetBrains Mono, monospace">
                {c.desc}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

// Build cubic path between two nodes given a side hint.
function pathBetween(from, to, side) {
  if (side === "top") {
    // Route through a band ABOVE the boxes so labels never sit on a node header.
    const x1 = from.x + from.w, y1 = from.y + 18;
    const x2 = to.x,            y2 = to.y + 18;
    const bandY = Math.min(y1, y2) - 32;          // strictly above both nodes
    const c1x = x1 + 24, c2x = x2 - 24;
    const d = `M ${x1} ${y1} C ${c1x} ${bandY}, ${c2x} ${bandY}, ${x2} ${y2}`;
    return { d, mid: { x: (x1 + x2)/2, y: bandY + 2 } };
  }
  if (side === "top-arc") {
    const x1 = from.x + from.w/2, y1 = from.y;
    const x2 = to.x + to.w/2,     y2 = to.y;
    const peak = Math.min(y1, y2) - 60;
    return { d: `M ${x1} ${y1} C ${x1} ${peak}, ${x2} ${peak}, ${x2} ${y2}`, mid: { x: (x1+x2)/2, y: peak + 6 } };
  }
  // bottom — feedback to/from insights bar
  const x1 = from.x + from.w/2, y1 = from.y + from.h;
  const x2 = to.x + to.w/2,     y2 = to.y;
  const my = (y1 + y2)/2;
  return { d: `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`, mid: { x: (x1 + x2)/2, y: my } };
}

// Pre-compute label positions, then nudge any pair that overlaps.
function buildEdgeLayouts(edges, nodes) {
  const layouts = edges.map(e => {
    const from = nodes.find(n => n.id === e.from);
    const to   = nodes.find(n => n.id === e.to);
    const { d, mid } = pathBetween(from, to, e.side);
    return { edge: e, d, label: e.label, x: mid.x, y: mid.y, w: Math.max(80, e.label.length * 6.0 + 18) };
  });

  // simple anti-overlap pass: if two labels' rects collide, nudge vertically
  for (let i = 0; i < layouts.length; i++) {
    for (let j = i+1; j < layouts.length; j++) {
      const a = layouts[i], b = layouts[j];
      const overlapX = Math.abs(a.x - b.x) < (a.w + b.w)/2 + 6;
      const overlapY = Math.abs(a.y - b.y) < 22;
      if (overlapX && overlapY) {
        // push lower one down
        if (a.y <= b.y) b.y += 22; else a.y += 22;
      }
    }
  }
  return layouts;
}

function ArchEdge({ layout, lit, dimmed, animated }) {
  const e = layout.edge;
  const isFb = e.kind !== "fwd";
  const stroke = isFb ? "var(--rose)" : "var(--ink-2)";
  return (
    <g style={{ opacity: dimmed ? 0.18 : 1, transition:"opacity 300ms" }}>
      <path d={layout.d} fill="none"
        stroke={lit ? stroke : "var(--line-2)"}
        strokeWidth={lit ? 2.4 : 1.4}
        strokeDasharray={isFb ? "5 4" : "0"}
        markerEnd={`url(#arrow-${isFb ? "fb" : "fwd"}${lit ? "-lit" : ""})`}
        style={{
          animation: animated && lit ? "flowDash 1.4s linear infinite" : "none",
          transition: "stroke 250ms",
        }}
      />
      <g>
        <rect x={layout.x - layout.w/2} y={layout.y - 9}
              width={layout.w} height={18} rx="9"
              fill="white"
              stroke={lit ? stroke : "var(--line)"}
              strokeWidth={lit ? 1.5 : 1}/>
        <text x={layout.x} y={layout.y + 4} textAnchor="middle"
              fontSize="10" fontWeight="500"
              fill={lit ? stroke : "var(--ink-2)"}
              fontFamily="JetBrains Mono, monospace">
          {layout.label}
        </text>
      </g>
    </g>
  );
}

function ArchitectureView({ speed }) {
  const [stepIdx, setStepIdx] = useStateA(0);
  const [playing, setPlaying] = useStateA(false);

  const step = ARCH_STEPS[stepIdx];
  const visitedNodeIds = new Set(ARCH_STEPS.slice(0, stepIdx + 1).map(s => s.node));
  const visitedEdgeIds = new Set(ARCH_STEPS.slice(0, stepIdx + 1).map(s => s.edge).filter(Boolean));

  // Roll up cumulative state up to current step
  const seenSteps = ARCH_STEPS.slice(0, stepIdx + 1);
  const segments = new Set();
  seenSteps.forEach(s => {
    if (s.segUpdate) {
      s.segUpdate.enters?.forEach(x => segments.add(x));
      s.segUpdate.exits?.forEach(x => segments.delete(x));
    }
  });
  const todBuckets = Array(24).fill(0);
  seenSteps.forEach(s => { if (s.todMark != null) todBuckets[s.todMark]++; });
  const emailLog = seenSteps.flatMap(s => {
    const out = [];
    if (s.emailSend) out.push({ kind:"send", ...s.emailSend, stepId: s.id });
    if (s.emailOpen) out.push({ kind:"open", ...s.emailOpen, stepId: s.id });
    return out;
  });
  const journeys = [];
  if (seenSteps.some(s => s.id >= 8))  journeys.push({ name:"Welcome — New Player",        kind:"welcome" });
  if (seenSteps.some(s => s.id >= 19)) journeys.push({ name:"Donor Cultivation",            kind:"donor" });
  if (seenSteps.some(s => s.id >= 25)) journeys.push({ name:"Pre-Event Nurture", kind:"reminder", isNew: stepIdx === 24 });
  if (seenSteps.some(s => s.id >= 31)) journeys.push({ name:"Sorry we missed you (win-back)", kind:"winback", isNew: stepIdx === 30 });
  if (seenSteps.some(s => s.id >= 41)) journeys.push({ name:"Spring Mega Draw",   kind:"lottery", isNew: stepIdx === 40 });
  if (seenSteps.some(s => s.id >= 41)) journeys.push({ name:"EOFY Donor Appeal",  kind:"donor",   isNew: stepIdx === 40 });

  // Contact governance ledger — reflects sends/suppressions across the campaign window
  const governanceVisible = stepIdx >= 40;
  const ledger = [
    { day: 1,  campaign: "Spring Mega Draw",  channel: "Email", state: "sent",       reason: "NBA rank #1 · STO 10:30", afterStep: 48 },
    { day: 2,  campaign: "—",                  channel: "—",     state: "transactional", reason: "Order receipt (ticket purchase)", afterStep: 49 },
    { day: 3,  campaign: "EOFY Donor Appeal", channel: "Email", state: "suppressed", reason: "24h post-transactional cap", afterStep: 50 },
    { day: 4,  campaign: "EOFY Donor Appeal", channel: "Email", state: "sent",       reason: "NBA rank #2 · personalised impact", afterStep: 55 },
    { day: 5,  campaign: "—",                  channel: "—",     state: "transactional", reason: "Donation receipt", afterStep: 56 },
    { day: 8,  campaign: "Spring Mega Draw",  channel: "Push",  state: "suppressed", reason: "Frequency cap reached this week", afterStep: 57 },
    { day: 11, campaign: "EOFY Donor Appeal", channel: "SMS",   state: "suppressed", reason: "Channel pref: SMS = Event-only", afterStep: 57 },
  ];

  // Auto-advance when playing
  useEffectA(() => {
    if (!playing) return;
    const stepMs = Math.round(1500 / (speed || 1));
    const t = setTimeout(() => {
      if (stepIdx < ARCH_STEPS.length - 1) setStepIdx(i => i + 1);
      else setPlaying(false);
    }, stepMs);
    return () => clearTimeout(t);
  }, [playing, stepIdx, speed]);

  const layouts = useRefA(buildEdgeLayouts(ARCH_EDGES, ARCH_NODES)).current;

  const restart = () => { setPlaying(false); setStepIdx(0); };
  const next = () => setStepIdx(i => Math.min(ARCH_STEPS.length - 1, i + 1));
  const prev = () => setStepIdx(i => Math.max(0, i - 1));

  const fbStarts = ARCH_STEPS.findIndex(s => s.phase === "fb");

  return (
    <div style={{padding:"0 0 12px", display:"flex", flexDirection:"column", height:"calc(100vh - 50px)", overflow:"hidden"}}>
      {/* Sticky control bar — same vocabulary as journey timeline */}
      <div style={{
        display:"flex", alignItems:"center", gap:16,
        padding:"10px 24px", background:"white",
        borderBottom:"1px solid var(--line)",
        flexShrink:0,
      }}>
        <div style={{display:"flex", gap:6}}>
          <button className="ghost-btn" onClick={prev} aria-label="Previous"><Icon name="prev" size={14} /></button>
          <button className="primary-btn" onClick={() => setPlaying(p => !p)} style={{minWidth:88, justifyContent:"center"}}>
            <Icon name={playing ? "pause" : "play"} size={12} />
            {playing ? "Pause" : "Play"}
          </button>
          <button className="ghost-btn" onClick={next} aria-label="Next"><Icon name="next" size={14} /></button>
          <button className="ghost-btn" onClick={restart} aria-label="Restart"><Icon name="restart" size={14} /></button>
        </div>

        <div style={{flex:1, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
          {ARCH_STEPS.map((s, i) => {
            const on = i <= stepIdx;
            const isCurrent = i === stepIdx;
            const isFb = s.phase === "fb";
            return (
              <button key={s.id} onClick={() => setStepIdx(i)} title={s.title} style={{
                width: isCurrent ? 22 : 12, height: isCurrent ? 22 : 12,
                borderRadius:"50%", border:"none", padding:0, cursor:"pointer",
                background: on ? (isFb ? "var(--rose)" : "var(--ink)") : "var(--line-2)",
                color: "white",
                display:"grid", placeItems:"center",
                transition:"all 250ms",
                outline: isCurrent ? "2px solid white" : "none",
                boxShadow: isCurrent ? `0 0 0 2px ${isFb ? "var(--rose)" : "var(--ink)"}` : "none",
              }}>
                {isCurrent && <span style={{width:6, height:6, borderRadius:"50%", background:"white"}} />}
              </button>
            );
          })}
        </div>

        <div className="mono" style={{fontSize:11, color:"var(--ink-3)", whiteSpace:"nowrap"}}>
          Step {String(stepIdx+1).padStart(2,"0")} / {String(ARCH_STEPS.length).padStart(2,"0")}
          {stepIdx >= fbStarts && <span style={{marginLeft:8, color:"var(--rose)", fontWeight:600}}>· feedback phase</span>}
        </div>
      </div>

      {/* Title + step description — compact */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        gap:16, padding:"10px 24px", flexShrink:0,
      }}>
        <h2 style={{margin:0, fontSize:18, fontWeight:700, letterSpacing:"-0.01em"}}>
          Data flow architecture
        </h2>
        <div style={{
          background:"white", border:"1px solid var(--line)", borderRadius:10,
          padding:"6px 12px", display:"flex", alignItems:"flex-start", gap:10,
          borderLeft: `3px solid ${step.phase === "fb" ? "var(--rose)" : "var(--ink)"}`,
          minWidth:0, flex:1, maxWidth:980,
        }}>
          <span className="mono" style={{fontSize:9.5, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--ink-3)", fontWeight:600, whiteSpace:"nowrap", paddingTop:2}}>
            {step.phase === "fb" ? "Feedback" : "Forward"} · {String(stepIdx+1).padStart(2,"0")}
          </span>
          <div style={{minWidth:0, flex:1, lineHeight:1.4}}>
            <span style={{fontSize:13, fontWeight:600, color:"var(--ink)"}}>{step.title}</span>
            <span style={{fontSize:12, color:"var(--ink-2)"}}> — {step.detail}</span>
          </div>
        </div>
      </div>

      {/* Main grid: diagram + side rail, fills remaining height */}
      <div style={{
        display:"grid", gridTemplateColumns:"minmax(0, 1.7fr) minmax(280px, 1fr)",
        gap:14, padding:"0 24px 14px", flex:1, minHeight:0,
      }}>
        {/* Diagram */}
        <div style={{background:"white", border:"1px solid var(--line)", borderRadius:12, padding:10, minHeight:0, display:"flex"}}>
          <svg viewBox="0 0 1360 1000" style={{width:"100%", height:"100%", display:"block"}} preserveAspectRatio="xMidYMid meet"
               role="img" aria-label="Data flow architecture">
            <defs>
              <marker id="arrow-fwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--line-2)"/>
              </marker>
              <marker id="arrow-fwd-lit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-2)"/>
              </marker>
              <marker id="arrow-fb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--line-2)"/>
              </marker>
              <marker id="arrow-fb-lit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--rose)"/>
              </marker>
            </defs>

            {/* canvas */}
            <rect x="20" y="20" width="1320" height="960" rx="12" fill="var(--bg-2)" stroke="var(--line)" />

            {/* band labels */}
            <text x="40" y="48" fontSize="10" fontWeight="600" fill="var(--ink-3)"
                  letterSpacing="1.5" style={{textTransform:"uppercase"}}>
              Forward path · acquisition → activation
            </text>
            <text x="40" y="610" fontSize="10" fontWeight="600" fill="var(--rose)"
                  letterSpacing="1.5" style={{textTransform:"uppercase"}}>
              Feedback loops · engagement signals & non-events
            </text>
            <line x1="20" y1="596" x2="1340" y2="596" stroke="var(--line-2)" strokeDasharray="3 4"/>

            {/* edges underneath */}
            {layouts.map((lay, i) => {
              const isCurrent = step.edge === lay.edge.id;
              return (
                <ArchEdge
                  key={lay.edge.id}
                  layout={lay}
                  lit={isCurrent}
                  dimmed={!isCurrent}
                  animated={isCurrent}
                />
              );
            })}

            {/* nodes */}
            {ARCH_NODES.map(n => {
              const isCurrent = step.node === n.id;
              const visited   = visitedNodeIds.has(n.id);
              return (
                <ArchNode
                  key={n.id}
                  node={n}
                  highlightedComp={isCurrent ? step.comp : null}
                  lit={isCurrent}
                  dimmed={!visited && !isCurrent}
                  onClick={() => {
                    // jump to first step that involves this node
                    const target = ARCH_STEPS.findIndex(s => s.node === n.id);
                    if (target >= 0) setStepIdx(target);
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Side rail — stacked vertically to fit on screen */}
        <div style={{display:"flex", flexDirection:"column", gap:10, minWidth:0, minHeight:0, overflow:"hidden"}}>
          <div style={{display:"flex", flexDirection:"column", gap:10, height:"100%", minHeight:0, overflow:"auto"}}>
          {/* Segments */}
          <div style={{background:"white", border:"1px solid var(--line)", borderRadius:10, padding:10, borderTop:"3px solid var(--amber)", minHeight:0, overflow:"hidden"}}>
            <div className="micro" style={{marginBottom:6, fontSize:9}}>Data Cloud · segment membership</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
              {segments.size === 0 && <span className="mono" style={{fontSize:11, color:"var(--ink-3)"}}>none yet — play to begin</span>}
              {[...segments].map(s => {
                const justEntered = step.segUpdate?.enters?.includes(s);
                return (
                  <span key={s} className="chip on" style={{
                    color:"var(--amber)",
                    borderColor: justEntered ? "var(--amber)" : "currentColor",
                    background: justEntered ? "var(--amber-soft)" : "white",
                    animation: justEntered ? "fadeIn 400ms ease" : "none",
                  }}>
                    <span className="swatch" /> {s}
                  </span>
                );
              })}
            </div>
            {step.segUpdate?.exits?.length > 0 && (
              <div style={{marginTop:10, paddingTop:10, borderTop:"1px dashed var(--line)"}}>
                <div className="micro" style={{marginBottom:6, color:"var(--ink-3)"}}>just exited</div>
                <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                  {step.segUpdate.exits.map(s => (
                    <span key={s} className="chip" style={{color:"var(--ink-3)", textDecoration:"line-through", opacity:0.6}}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Time-of-day histogram for STO */}
          <div style={{background:"white", border:"1px solid var(--line)", borderRadius:10, padding:10, borderTop:"3px solid var(--violet)", minHeight:0, overflow:"hidden"}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6}}>
              <span className="micro" style={{fontSize:9}}>Open time-of-day · STO source</span>
              <span className="mono" style={{fontSize:9, color:"var(--ink-3)"}}>{todBuckets.reduce((a,b)=>a+b,0)} samples</span>
            </div>
            <svg viewBox="0 0 480 120" style={{width:"100%", height:"auto", maxHeight:96}}>
              {todBuckets.map((c, h) => {
                const max = Math.max(1, ...todBuckets);
                const bh = c === 0 ? 2 : (c / max) * 80;
                const isCurrent = step.todMark === h;
                return (
                  <g key={h}>
                    <rect x={6 + h*19} y={100 - bh} width={14} height={bh}
                          fill={isCurrent ? "var(--violet)" : (c > 0 ? "var(--violet)" : "var(--line)")}
                          opacity={isCurrent ? 1 : (c > 0 ? 0.55 : 0.5)}
                          rx="2"
                          style={{transition:"all 300ms"}}/>
                    {(h % 3 === 0) && (
                      <text x={13 + h*19} y={114} fontSize="8" textAnchor="middle"
                            fontFamily="JetBrains Mono, monospace" fill="var(--ink-3)">{String(h).padStart(2,"0")}</text>
                    )}
                  </g>
                );
              })}
              {/* highlight optimal window */}
              {todBuckets.some(c => c > 0) && (() => {
                const max = Math.max(...todBuckets);
                const peak = todBuckets.indexOf(max);
                return (
                  <g>
                    <rect x={6 + peak*19 - 4} y={14} width={22} height={92} fill="none"
                          stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="3 3" rx="3"/>
                    <text x={17 + peak*19} y={10} fontSize="8" textAnchor="middle" fill="var(--violet)" fontWeight="600">
                      STO window
                    </text>
                  </g>
                );
              })()}
            </svg>
            <div className="mono" style={{fontSize:9, color:"var(--ink-3)", marginTop:2}}>
              MC schedules sends near the player's modal open hour.
            </div>
          </div>

          {/* Active journeys */}
          <div style={{background:"white", border:"1px solid var(--line)", borderRadius:10, padding:10, borderTop:"3px solid var(--rose)", minHeight:0, display:"flex", flexDirection:"column", overflow:"hidden"}}>
            <div className="micro" style={{marginBottom:6, fontSize:9}}>MC · active journeys</div>
            <div style={{display:"grid", gap:4, flexShrink:0}}>
              {journeys.length === 0 && <span className="mono" style={{fontSize:11, color:"var(--ink-3)"}}>none yet</span>}
              {journeys.map(j => (
                <div key={j.name} style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"6px 8px", borderRadius:6,
                  background: j.isNew ? "var(--rose-soft)" : "var(--bg-2)",
                  border: j.isNew ? "1px solid var(--rose)" : "1px solid var(--line)",
                  animation: j.isNew ? "fadeIn 400ms ease" : "none",
                }}>
                  <span className="dot pulse" style={{
                    background: j.kind === "winback" ? "var(--rose)" : j.kind === "reminder" ? "var(--amber)" : "var(--violet)",
                    color: j.kind === "winback" ? "var(--rose)" : j.kind === "reminder" ? "var(--amber)" : "var(--violet)",
                  }} />
                  <span style={{fontSize:12, fontWeight:600}}>{j.name}</span>
                  {j.isNew && <span className="mono" style={{marginLeft:"auto", fontSize:9, color:"var(--rose)", fontWeight:700}}>NEW</span>}
                </div>
              ))}
            </div>
            {emailLog.length > 0 && (
              <div style={{marginTop:8, paddingTop:8, borderTop:"1px dashed var(--line)", flex:1, minHeight:0, display:"flex", flexDirection:"column"}}>
                <div className="micro" style={{marginBottom:4, fontSize:9}}>Email log</div>
                <div style={{display:"grid", gap:2, fontSize:10.5, overflow:"auto", flex:1, minHeight:0}} className="mono">
                  {emailLog.slice().reverse().map((e, i) => (
                    <div key={i} style={{display:"grid", gridTemplateColumns:"38px 32px 1fr", gap:4}}>
                      <span style={{color:"var(--ink-3)"}}>{e.time}</span>
                      <span style={{color: e.kind === "send" ? "var(--violet)" : "var(--amber)", fontWeight:600}}>{e.kind}</span>
                      <span style={{color:"var(--ink-2)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                        {e.kind === "send" ? e.subject : `tto ${e.tto} @ ${e.time}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact governance ledger — only visible once campaigns activate */}
          {governanceVisible && (() => {
            const sentCount = ledger.filter(l => l.afterStep <= stepIdx && l.state === "sent").length;
            const suppressedCount = ledger.filter(l => l.afterStep <= stepIdx && l.state === "suppressed").length;
            const cap = 3;
            return (
              <div style={{background:"white", border:"1px solid var(--line)", borderRadius:10, padding:10, borderTop:"3px solid var(--violet)", flexShrink:0}}>
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
                  <span className="micro" style={{fontSize:9}}>MC · contact governance · 7-day window</span>
                  <span className="mono" style={{fontSize:9, color:"var(--ink-3)"}}>NBA + frequency cap</span>
                </div>
                {/* Send budget bar */}
                <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
                  <span className="mono" style={{fontSize:10, color:"var(--ink-2)", whiteSpace:"nowrap"}}>Sends used</span>
                  <div style={{flex:1, height:10, background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:6, display:"flex", overflow:"hidden"}}>
                    {Array.from({length: cap}).map((_, i) => (
                      <div key={i} style={{
                        flex:1, borderRight: i < cap-1 ? "1px solid var(--line)" : "none",
                        background: i < sentCount ? "var(--violet)" : "transparent",
                        transition:"background 300ms",
                      }} />
                    ))}
                  </div>
                  <span className="mono" style={{fontSize:10, color:"var(--violet)", fontWeight:600}}>{sentCount}/{cap}</span>
                </div>
                {/* Ledger rows */}
                <div style={{display:"grid", gap:3, fontSize:10.5}} className="mono">
                  {ledger.map((l, i) => {
                    const fired = l.afterStep <= stepIdx;
                    const stateColor = l.state === "sent" ? "var(--violet)"
                                     : l.state === "suppressed" ? "var(--ink-3)"
                                     : "var(--teal)";
                    const stateBg = l.state === "sent" ? "var(--violet-soft, #eef2ff)"
                                  : l.state === "suppressed" ? "var(--bg-2)"
                                  : "#ecfdf5";
                    return (
                      <div key={i} style={{
                        display:"grid", gridTemplateColumns:"36px 1fr 78px", gap:6,
                        padding:"4px 6px", borderRadius:4,
                        background: fired ? stateBg : "transparent",
                        opacity: fired ? 1 : 0.35,
                        textDecoration: l.state === "suppressed" && fired ? "line-through" : "none",
                        transition:"opacity 300ms, background 300ms",
                      }}>
                        <span style={{color:"var(--ink-3)"}}>D{l.day}</span>
                        <span style={{color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                          <span style={{fontWeight:600}}>{l.campaign}</span>
                          <span style={{color:"var(--ink-3)"}}> · {l.channel} · {l.reason}</span>
                        </span>
                        <span style={{color: stateColor, fontWeight:600, textAlign:"right", textDecoration:"none"}}>{l.state}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mono" style={{fontSize:9.5, color:"var(--ink-3)", marginTop:8, lineHeight:1.4}}>
                  Result: {sentCount} marketing send{sentCount===1?"":"s"} this window, {suppressedCount} held back. Customer feels valued, not spammed.
                </div>
              </div>
            );
          })()}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ArchitectureView });
