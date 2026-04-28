// Data + scenario for the customer journey

const CUSTOMER = {
  id: "0035g00000A1B2C",
  name: "Eleanor Ashby",
  email: "e.ashby@mailprovider.example",
  city: "Birmingham, UK",
  joined: "2024-11-08",
};

// Each event:
//  - what the customer DID in the third-party app
//  - what record changes occur in Sales Cloud
//  - which Data Cloud segments they enter / exit
//  - which Marketing Cloud journey enrolls + the message that fires
const EVENTS = [
  {
    id: "evt-lotto-a",
    t: 0,
    label: "Buys £5 ticket — National Draw",
    short: "Lottery A",
    icon: "ticket",
    app: { product: "National Draw", sku: "ND-W17", amount: "£5.00", channel: "Web" },
    sales: {
      object: "Opportunity",
      action: "Closed Won",
      fields: [
        ["Stage", "Closed Won"],
        ["LTV (rolling)", "£5.00"],
        ["Last Product", "National Draw"],
      ],
    },
    dc: {
      enters: ["Active Players", "First-time Buyers"],
      exits: ["Lapsed Leads"],
      attrs: [
        ["unified_id", "uc_8821"],
        ["recency_days", "0"],
        ["product_mix", "[National Draw]"],
      ],
    },
    mc: {
      journey: "Welcome — New Player",
      step: "Email · Welcome + receipt",
      message: {
        subject: "You're in, Eleanor — your National Draw ticket is locked in",
        preview: "Draw closes Saturday 7:45pm. Here's how to check results.",
      },
    },
  },
  {
    id: "evt-donation",
    t: 1,
    label: "Donates £20 to Community Fund",
    short: "Donation",
    icon: "heart",
    app: { product: "Community Fund", sku: "DON-CF", amount: "£20.00", channel: "Web" },
    sales: {
      object: "Opportunity (Donation)",
      action: "Closed Won",
      fields: [
        ["Stage", "Closed Won"],
        ["LTV (rolling)", "£25.00"],
        ["Donor flag", "true"],
      ],
    },
    dc: {
      enters: ["Donors", "Mission-aligned"],
      exits: ["First-time Buyers"],
      attrs: [
        ["donor_lifetime", "£20.00"],
        ["affinity:cause", "0.71"],
        ["product_mix", "[National Draw, Donation]"],
      ],
    },
    mc: {
      journey: "Donor Cultivation",
      step: "Email · Impact thank-you",
      message: {
        subject: "Thank you, Eleanor — here's where your £20 goes",
        preview: "Three projects funded this month thanks to supporters like you.",
      },
    },
  },
  {
    id: "evt-event",
    t: 2,
    label: "Registers for Winners' Night — then no-shows",
    short: "Event reg.",
    icon: "calendar",
    app: { product: "Winners' Night 2026", sku: "EVT-WN26", amount: "£0.00", channel: "Mobile" },
    sales: {
      object: "Campaign Member",
      action: "Registered → (T+2h) no Attended status",
      fields: [
        ["Campaign", "Winners' Night 2026"],
        ["Status", "Registered → No-show"],
        ["Engagement score", "+15 then −15"],
      ],
    },
    dc: {
      enters: ["Event Registrants", "Win-back audience"],
      exits: ["High-engagement"],
      attrs: [
        ["events_registered", "1"],
        ["event_no_show", "true"],
        ["engagement_score", "47"],
      ],
    },
    mc: {
      journey: "Pre-Event Nurture → Sorry we missed you (win-back)",
      step: "Email · Reminder (T-1d, STO 10:30) → Win-back",
      message: {
        subject: "Looking forward to seeing you there",
        preview: "Sent 10:30 · opened 10:42 (TTO 12m). After no-show, win-back fires with replay code.",
      },
    },
  },
  {
    id: "evt-winback",
    t: 3,
    label: "Win-back works — redeems £5 next-draw credit",
    short: "Win-back",
    icon: "refresh",
    app: { product: "National Draw (replay)", sku: "ND-W18", amount: "£5.00", channel: "Mobile" },
    sales: {
      object: "Opportunity",
      action: "Closed Won (recovery, tied to win-back)",
      fields: [
        ["Stage", "Closed Won"],
        ["Source", "Win-back · £5 credit"],
        ["LTV (rolling)", "£30.00"],
      ],
    },
    dc: {
      enters: ["Reactivated"],
      exits: ["Win-back audience"],
      attrs: [
        ["engagement_score", "59 (+12)"],
        ["winback_outcome", "converted"],
        ["recency_days", "0"],
      ],
    },
    mc: {
      journey: "Sorry we missed you (win-back) → closed",
      step: "Email · 'Sorry we missed you' opened (TTO 32m), clicked replay code",
      message: {
        subject: "Sorry we missed you — here's a replay",
        preview: "Opened 11:02 · clicked the £5 next-draw credit · ticket purchased same session.",
      },
    },
  },
  {
    id: "evt-spring",
    t: 4,
    label: "Spring Mega Draw — buys £5 ticket (NBA-paced)",
    short: "Spring Draw",
    icon: "ticket",
    app: { product: "Spring Mega Draw", sku: "SMD-S01", amount: "£5.00", channel: "Web" },
    sales: {
      object: "Opportunity",
      action: "Closed Won (campaign: Spring Mega Draw)",
      fields: [
        ["Stage", "Closed Won"],
        ["Campaign", "Spring Mega Draw"],
        ["LTV (rolling)", "£35.00"],
      ],
    },
    dc: {
      enters: ["Spring Mega Draw — Eligible", "Multi-product Players"],
      exits: [],
      attrs: [
        ["product_mix", "[National Draw, Donation, Spring Mega Draw]"],
        ["xsell_score", "0.84"],
        ["engagement_score", "68"],
      ],
    },
    mc: {
      journey: "Spring Mega Draw · ranked #1 by Einstein NBA",
      step: "Day 1 · Email · STO 10:30 · personalised number patterns",
      message: {
        subject: "Eleanor, the Spring Mega Draw is yours to play",
        preview: "TTO 9m · clicked through · £5 ticket purchased Day 2. Day 3 EOFY send held back (24h transactional cap).",
      },
    },
  },
  {
    id: "evt-eofy",
    t: 5,
    label: "EOFY Donor Appeal — donates £30",
    short: "EOFY Donor",
    icon: "heart",
    app: { product: "EOFY Community Fund", sku: "DON-EOFY26", amount: "£30.00", channel: "Web" },
    sales: {
      object: "Opportunity (Donation)",
      action: "Closed Won (campaign: EOFY Donor Appeal)",
      fields: [
        ["Stage", "Closed Won"],
        ["Campaign", "EOFY Donor Appeal"],
        ["Donor lifetime", "£50.00"],
      ],
    },
    dc: {
      enters: ["VIP Watchlist", "Donor Plus", "EOFY Donor Prospects"],
      exits: ["Reactivated"],
      attrs: [
        ["donor_lifetime", "£50.00"],
        ["affinity:cause", "0.79 (+0.08)"],
        ["engagement_score", "78"],
        ["contact_governance_score", "0.92"],
      ],
    },
    mc: {
      journey: "EOFY Donor Appeal · ranked #2 by Einstein NBA",
      step: "Day 4 · Email · STO 10:30 · personalised £20 impact block",
      message: {
        subject: "Eleanor, your £20 changed three lives — do it again before FY end?",
        preview: "TTO 6m (strong intent) · £30 donation Day 5. Day 8 push + Day 11 SMS suppressed by frequency cap and channel pref — valued, not spammed.",
      },
    },
  },
];

// Master segment list — used by the Data Cloud lane.
const SEGMENTS = [
  { id: "lapsed", name: "Lapsed Leads", color: "var(--ink-3)" },
  { id: "active", name: "Active Players", color: "var(--teal)" },
  { id: "first", name: "First-time Buyers", color: "var(--teal)" },
  { id: "donors", name: "Donors", color: "var(--rose)" },
  { id: "mission", name: "Mission-aligned", color: "var(--rose)" },
  { id: "events", name: "Event Registrants", color: "var(--amber)" },
  { id: "awaiting", name: "Registered — Awaiting Attendance", color: "var(--amber)" },
  { id: "winback", name: "Win-back audience", color: "var(--rose)" },
  { id: "multi", name: "Multi-product Players", color: "var(--violet)" },
  { id: "vip", name: "VIP Watchlist", color: "var(--violet)" },
  { id: "reactivated", name: "Reactivated", color: "var(--teal)" },
  { id: "spring-elig", name: "Spring Mega Draw — Eligible", color: "var(--violet)" },
  { id: "eofy-prosp", name: "EOFY Donor Prospects", color: "var(--rose)" },
  { id: "donor-plus", name: "Donor Plus", color: "var(--rose)" },
];

// Preference center state — Marketing Cloud
const PREFS = [
  { ch: "Email",   freq: "Weekly",   on: true  },
  { ch: "SMS",     freq: "Event-only", on: true  },
  { ch: "Push",    freq: "Smart",    on: true  },
  { ch: "Direct",  freq: "Off",      on: false },
];

Object.assign(window, { CUSTOMER, EVENTS, SEGMENTS, PREFS });
