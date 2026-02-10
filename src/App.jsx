import { useState, useEffect, useRef, useCallback } from "react";

const SALARY_TIERS = [
  { label: "Intern / Entry", annual: 45000, emoji: "📎" },
  { label: "Mid-Level", annual: 85000, emoji: "💼" },
  { label: "Mgr / Sr. Mgr", annual: 130000, emoji: "📊" },
  { label: "Director / VP", annual: 200000, emoji: "🏌️" },
  { label: "C-Suite", annual: 350000, emoji: "🛩️" },
];

const COMPARISONS = [
  { amount: 5, label: "a fancy latte" },
  { amount: 15, label: "a month of Netflix" },
  { amount: 25, label: "a decent bottle of wine" },
  { amount: 50, label: "a nice dinner for two" },
  { amount: 75, label: "a pair of running shoes" },
  { amount: 100, label: "a PS5 game" },
  { amount: 150, label: "AirPods" },
  { amount: 200, label: "a weekend getaway Airbnb" },
  { amount: 300, label: "a round-trip domestic flight" },
  { amount: 500, label: "a PS5 console" },
  { amount: 750, label: "a new iPhone" },
  { amount: 1000, label: "a month's rent (somewhere)" },
  { amount: 1500, label: "a designer handbag" },
  { amount: 2000, label: "a Bali vacation" },
  { amount: 3000, label: "a used car" },
  { amount: 5000, label: "a semester of community college" },
  { amount: 7500, label: "a Rolex Submariner" },
  { amount: 10000, label: "a really good used car" },
  { amount: 15000, label: "a year of daycare" },
  { amount: 25000, label: "a kitchen renovation" },
  { amount: 50000, label: "a Tesla Model 3" },
];

const SARCASTIC_MILESTONES = [
  { amount: 10, messages: ["Off to a strong start.", "The meter is running."] },
  { amount: 50, messages: ["This could've been a Slack message.", "Hope someone's taking notes."] },
  { amount: 100, messages: ["We've officially entered three-digit territory.", "Someone just checked their phone. Don't blame them."] },
  { amount: 250, messages: ["A quarter-thousand dollars. For a meeting.", "This better be a really good meeting."] },
  { amount: 500, messages: ["Half a grand. Let that sink in.", "Somewhere, a finance team is weeping."] },
  { amount: 1000, messages: ["One thousand dollars. We've hit four figures.", "This meeting now costs more than most people's monthly grocery bill."] },
  { amount: 2000, messages: ["Two thousand. This is fine. Everything is fine.", "At this rate, the meeting will need its own budget line."] },
  { amount: 5000, messages: ["Five thousand dollars. This meeting has a higher burn rate than some startups.", "You could have hired a consultant for this."] },
  { amount: 10000, messages: ["Ten thousand dollars. This meeting is now more expensive than most weddings' catering.", "Perhaps a follow-up meeting to discuss this meeting's cost?"] },
  { amount: 25000, messages: ["Twenty-five thousand. This isn't a meeting, it's an investment.", "This meeting could've funded a small team for a month."] },
  { amount: 50000, messages: ["Fifty thousand dollars. Congratulations, this is historic.", "This meeting costs more than the median American's annual savings."] },
];

const QUICK_PRESETS = [
  { label: "Daily Standup", subtitle: "5 mid, 1 mgr", attendees: [0, 5, 1, 0, 0, 0] },
  { label: "Sprint Planning", subtitle: "3 mid, 2 mgrs, 1 dir", attendees: [0, 3, 2, 1, 0, 0] },
  { label: "All-Hands", subtitle: "5+10+8+4+2", attendees: [5, 10, 8, 4, 2, 0] },
  { label: "Board Meeting", subtitle: "2 dirs, 6 C-suite", attendees: [0, 0, 0, 2, 6, 0] },
  { label: '"Quick Sync"', subtitle: "3 mgrs who could've Slacked", attendees: [0, 0, 3, 0, 0, 0] },
  { label: "Friday 4:45pm", subtitle: "1 VP, 1 mgr, 'one quick thing'", attendees: [0, 0, 1, 1, 0, 0] },
];

const formatCurrency = (amount) => {
  if (amount < 0.01) return "$0.00";
  if (amount < 1000) return `$${amount.toFixed(2)}`;
  if (amount < 10000) return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${Math.floor(amount).toLocaleString("en-US")}`;
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const getCurrentComparison = (amount) => {
  let last = null;
  for (const c of COMPARISONS) {
    if (amount >= c.amount) last = c;
    else break;
  }
  return last;
};

const getCurrentMilestone = (amount, lastMilestoneRef) => {
  let milestone = null;
  for (const m of SARCASTIC_MILESTONES) {
    if (amount >= m.amount && m.amount > (lastMilestoneRef || 0)) {
      milestone = m;
    }
  }
  return milestone;
};

/* ─── Dark Mode Toggle ─── */
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: `1px solid var(--border)`,
        background: "var(--toggle-bg)",
        cursor: "pointer",
        fontSize: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

/* ─── Toast Component ─── */
function CopyToast({ visible, text, onHide }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      width: "calc(100% - 40px)",
      maxWidth: 400,
      animation: "toastIn 0.3s ease",
    }}>
      <div style={{
        background: "#0f172a",
        borderRadius: 12,
        padding: "16px 20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        border: "1px solid #334155",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
            Copied! Now paste it on LinkedIn
          </span>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.07)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 12,
          color: "#94a3b8",
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          maxHeight: 80,
          overflow: "hidden",
        }}>
          {text}
        </div>
        <div style={{
          marginTop: 10,
          fontSize: 12,
          color: "#64748b",
          fontFamily: "'DM Sans', sans-serif",
          textAlign: "center",
        }}>
          Open LinkedIn → Start a post → Paste (Ctrl+V)
        </div>
      </div>
    </div>
  );
}

/* ─── Attendee Picker ─── */
function AttendeePicker({ attendees, setAttendees, customSalary, setCustomSalary }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Attendees
      </label>
      <div
        className="attendee-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {SALARY_TIERS.map((tier, tierIdx) => {
          const count = attendees[tierIdx] || 0;
          return (
            <div key={tierIdx} style={{
              background: count > 0 ? "var(--bg-card-active)" : "var(--bg-card)",
              border: count > 0 ? `1.5px solid var(--border-active)` : `1.5px solid var(--border)`,
              borderRadius: 10,
              padding: "14px 14px 12px",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.2s ease",
            }}>
              {/* Label area — fixed height so controls align */}
              <div style={{ minHeight: 40, marginBottom: 6 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3,
                }}>
                  {tier.emoji} {tier.label}
                </div>
                <div style={{
                  fontSize: 12, color: "var(--text-muted)", marginTop: 2,
                  fontFamily: "'DM Mono', monospace",
                }}>
                  ${(tier.annual / 1000).toFixed(0)}k/yr
                </div>
              </div>
              {/* Controls — always at the bottom */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
                <button
                  onClick={() => {
                    const next = [...attendees];
                    next[tierIdx] = Math.max(0, (next[tierIdx] || 0) - 1);
                    setAttendees(next);
                  }}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    border: `1px solid var(--minus-border)`,
                    background: "var(--minus-bg)", cursor: "pointer",
                    fontSize: 20, color: "var(--minus-color)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                  }}
                >−</button>
                <span style={{
                  fontSize: 22, fontWeight: 700, color: "var(--text-primary)",
                  minWidth: 24, textAlign: "center",
                  fontFamily: "'DM Mono', monospace", flex: 1,
                }}>
                  {count}
                </span>
                <button
                  onClick={() => {
                    const next = [...attendees];
                    next[tierIdx] = (next[tierIdx] || 0) + 1;
                    setAttendees(next);
                  }}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    border: "1px solid var(--btn-bg)",
                    background: "var(--btn-bg)", cursor: "pointer",
                    fontSize: 20, color: "var(--btn-text)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                  }}
                >+</button>
              </div>
            </div>
          );
        })}

        {/* Custom salary tier */}
        {(() => {
          const tierIdx = 5;
          const count = attendees[tierIdx] || 0;
          return (
            <div style={{
              background: count > 0 ? "var(--bg-card-active)" : "var(--bg-card)",
              border: count > 0 ? `1.5px solid var(--border-active)` : `1.5px solid var(--border)`,
              borderRadius: 10,
              padding: "14px 14px 12px",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.2s ease",
            }}>
              <div style={{ minHeight: 40, marginBottom: 6 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3,
                }}>
                  ✏️ Custom
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <span style={{
                    fontSize: 12, color: "var(--text-muted)",
                    fontFamily: "'DM Mono', monospace",
                  }}>$</span>
                  <input
                    type="number"
                    value={customSalary || ""}
                    onChange={(e) => setCustomSalary(Number(e.target.value) || 0)}
                    placeholder="salary"
                    style={{
                      width: "100%",
                      border: `1px solid var(--input-border)`,
                      borderRadius: 4,
                      padding: "3px 6px",
                      fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                      color: "var(--text-primary)",
                      background: "var(--input-bg)",
                      outline: "none",
                    }}
                  />
                  <span style={{
                    fontSize: 11, color: "var(--text-muted)",
                    fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
                  }}>/yr</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
                <button
                  onClick={() => {
                    const next = [...attendees];
                    next[tierIdx] = Math.max(0, (next[tierIdx] || 0) - 1);
                    setAttendees(next);
                  }}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    border: `1px solid var(--minus-border)`,
                    background: "var(--minus-bg)", cursor: "pointer",
                    fontSize: 20, color: "var(--minus-color)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                  }}
                >−</button>
                <span style={{
                  fontSize: 22, fontWeight: 700, color: "var(--text-primary)",
                  minWidth: 24, textAlign: "center",
                  fontFamily: "'DM Mono', monospace", flex: 1,
                }}>
                  {count}
                </span>
                <button
                  onClick={() => {
                    if (!customSalary || customSalary <= 0) return;
                    const next = [...attendees];
                    next[tierIdx] = (next[tierIdx] || 0) + 1;
                    setAttendees(next);
                  }}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    border: "1px solid var(--btn-bg)",
                    background: (!customSalary || customSalary <= 0) ? "var(--border)" : "var(--btn-bg)",
                    cursor: (!customSalary || customSalary <= 0) ? "not-allowed" : "pointer",
                    fontSize: 20, color: "var(--btn-text)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                  }}
                >+</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ─── Cost Display ─── */
function CostDisplay({ cost, elapsed, running, comparison, milestoneMessage }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "48px 24px",
      background: "var(--cost-display-bg)",
      borderRadius: 16,
      border: `1px solid var(--border)`,
      marginBottom: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      {running && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444)",
          backgroundSize: "200% 100%",
          animation: "burnBar 2s linear infinite",
        }} />
      )}
      <div style={{
        fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
        color: running ? "#ef4444" : "var(--text-muted)", marginBottom: 8,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {running ? "💸 Burning" : elapsed > 0 ? "Final Damage" : "Ready"}
      </div>
      <div style={{
        fontSize: cost > 9999 ? 48 : 64,
        fontWeight: 800,
        color: "var(--text-primary)",
        fontFamily: "'DM Mono', monospace",
        lineHeight: 1,
        marginBottom: 8,
        letterSpacing: "-0.02em",
        transition: "font-size 0.3s ease",
      }}>
        {formatCurrency(cost)}
      </div>
      <div style={{
        fontSize: 18, color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace", marginBottom: 16,
      }}>
        {formatTime(elapsed)}
      </div>
      {comparison && (
        <div style={{
          display: "inline-block",
          background: "var(--comparison-bg)",
          border: `1px solid var(--comparison-border)`,
          borderRadius: 8,
          padding: "10px 18px",
          fontSize: 14,
          color: "var(--comparison-text)",
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: milestoneMessage ? 12 : 0,
        }}>
          This meeting has surpassed the cost of <strong>{comparison.label}</strong>
        </div>
      )}
      {milestoneMessage && (
        <div style={{
          display: "block",
          fontSize: 15,
          color: "var(--text-secondary)",
          fontStyle: "italic",
          fontFamily: "'DM Sans', sans-serif",
          marginTop: 8,
          animation: "fadeIn 0.5s ease",
        }}>
          "{milestoneMessage}"
        </div>
      )}
    </div>
  );
}

/* ─── Ending Quips ─── */
const ENDING_QUIPS = [
  { max: 50, quips: [
    "That was practically free. By corporate standards.",
    "Honestly? Not bad. You should celebrate with a meeting about it.",
    "A bargain. Someone's getting a raise. (Not really.)",
  ]},
  { max: 200, quips: [
    "Could've been an email. But you already knew that.",
    "On the bright side, at least it wasn't a two-parter.",
    "That's one way to spend a Tuesday.",
    "Time well spent? That's between you and your calendar.",
  ]},
  { max: 500, quips: [
    "For that price, you could've taken the whole team to lunch. And actually bonded.",
    "Just think — someone approved this meeting.",
    "Alexa, play 'Money' by Pink Floyd.",
    "Don't worry. No one will remember what was decided anyway.",
  ]},
  { max: 1500, quips: [
    "This meeting now qualifies as a capital expenditure.",
    "Hopefully someone at least took notes.",
    "You could've hired a freelancer for a week instead. Just saying.",
    "This is why your company has a 'meeting-free Friday' policy. Oh wait, they don't.",
  ]},
  { max: 5000, quips: [
    "This meeting cost more than some people's monthly salary. Let that marinate.",
    "Congratulations. You've unlocked the 'budget conversation' achievement.",
    "Somewhere, a CFO just felt a disturbance in the force.",
    "At least the vibes were good. Right? ...Right?",
  ]},
  { max: Infinity, quips: [
    "This wasn't a meeting. This was a fundraising event with no cause.",
    "You should frame this receipt.",
    "This meeting had a higher budget than most indie films.",
    "In the time it took to have this meeting, a small business could've launched.",
    "Please schedule a follow-up meeting to discuss what went wrong in this meeting.",
  ]},
];

const getEndingQuip = (cost) => {
  for (const tier of ENDING_QUIPS) {
    if (cost <= tier.max) {
      return tier.quips[Math.floor(Math.random() * tier.quips.length)];
    }
  }
  return "No comment.";
};

/* ─── Summary Card ─── */
function SummaryCard({ cost, elapsed, totalAttendees, onReset, onCopy }) {
  const comparison = getCurrentComparison(cost);
  const perPerson = totalAttendees > 0 ? cost / totalAttendees : 0;
  const perMinute = elapsed > 60 ? cost / (elapsed / 60) : cost;
  const quip = getEndingQuip(cost);
  const couldveBeenAnEmail = elapsed <= 300;

  const handleCopy = () => {
    const emailBadge = elapsed <= 300 ? `\n\n📧 Official verdict: Could've been an email.` : "";
    const text = `Our ${formatTime(elapsed)} meeting with ${totalAttendees} people just cost ${formatCurrency(cost)}. That's more than ${comparison ? comparison.label : "expected"}.${emailBadge}\n\nWas it worth it? 🤔\n\nCalculate yours → thismeetingcosts.io`;
    navigator.clipboard.writeText(text).then(() => {
      onCopy(text);
    }).catch(() => {});
  };

  return (
    <div style={{
      background: "var(--summary-bg)",
      borderRadius: 16,
      padding: "32px 24px",
      color: "var(--summary-text)",
      marginBottom: 24,
      animation: "fadeIn 0.6s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      {couldveBeenAnEmail && (
        <div style={{
          background: "#ef4444",
          borderRadius: 8,
          padding: "10px 20px",
          marginBottom: 20,
          textAlign: "center",
          animation: "stampIn 0.5s ease-out 0.3s both",
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
            textTransform: "uppercase", color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            📧 Could've been an email
          </span>
        </div>
      )}

      <div style={{
        fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
        color: "var(--summary-muted)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif",
      }}>
        Meeting Post-Mortem
      </div>
      <div style={{
        fontSize: 17, color: "var(--summary-subtle)", fontStyle: "italic",
        fontFamily: "'DM Sans', sans-serif", marginBottom: 24, lineHeight: 1.5,
        animation: "fadeIn 0.8s ease",
      }}>
        "{quip}"
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24,
      }} className="summary-stats">
        <div>
          <div style={{ fontSize: 12, color: "var(--summary-muted)", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Total Cost</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{formatCurrency(cost)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--summary-muted)", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Per Person</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{formatCurrency(perPerson)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--summary-muted)", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Per Minute</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{formatCurrency(perMinute)}</div>
        </div>
      </div>

      {comparison && (
        <div style={{
          fontSize: 15, color: "var(--summary-subtle)", fontFamily: "'DM Sans', sans-serif",
          marginBottom: 24, padding: "12px 16px", background: "var(--summary-overlay)", borderRadius: 8,
        }}>
          This meeting cost more than <strong style={{ color: "#fbbf24" }}>{comparison.label}</strong>. Hope it was worth it.
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }} className="summary-buttons">
        <button
          onClick={onReset}
          style={{
            flex: 1, padding: "14px 24px", borderRadius: 8,
            border: `1px solid var(--summary-border)`,
            background: "transparent", color: "var(--summary-text)", fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}
        >
          New Meeting
        </button>
        <button
          onClick={handleCopy}
          style={{
            flex: 1, padding: "14px 24px", borderRadius: 8, border: "none",
            background: "#3b82f6", color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}
        >
          📋 Copy for LinkedIn
        </button>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [attendees, setAttendees] = useState([0, 0, 0, 0, 0, 0]); // 6th slot = custom
  const [customSalary, setCustomSalary] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cost, setCost] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastText, setToastText] = useState("");
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const lastMilestoneRef = useRef(0);
  const intervalRef = useRef(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const allTiers = [...SALARY_TIERS, { label: "Custom", annual: customSalary || 0, emoji: "✏️" }];

  const totalAttendees = attendees.reduce((s, c) => s + c, 0);

  const costPerSecond = attendees.reduce((sum, count, idx) => {
    const annual = allTiers[idx].annual;
    const hourly = annual / 2080;
    return sum + count * (hourly / 3600);
  }, 0);

  const startMeeting = useCallback(() => {
    if (totalAttendees === 0) return;
    setRunning(true);
    setShowSummary(false);
    setCost(0);
    setElapsed(0);
    setMilestoneMessage("");
    lastMilestoneRef.current = 0;
  }, [totalAttendees]);

  const stopMeeting = useCallback(() => {
    setRunning(false);
    setShowSummary(true);
  }, []);

  const resetMeeting = useCallback(() => {
    setRunning(false);
    setShowSummary(false);
    setCost(0);
    setElapsed(0);
    setMilestoneMessage("");
    lastMilestoneRef.current = 0;
  }, []);

  const handleCopy = useCallback((text) => {
    setToastText(text);
    setToastVisible(true);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
        setCost((c) => {
          const newCost = c + costPerSecond;
          const milestone = getCurrentMilestone(newCost, lastMilestoneRef.current);
          if (milestone) {
            lastMilestoneRef.current = milestone.amount;
            const msgs = milestone.messages;
            setMilestoneMessage(msgs[Math.floor(Math.random() * msgs.length)]);
          }
          return newCost;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, costPerSecond]);

  const comparison = getCurrentComparison(cost);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      fontFamily: "'DM Sans', sans-serif",
      transition: "background 0.3s ease",
    }}>
      <CopyToast
        visible={toastVisible}
        text={toastText}
        onHide={() => setToastVisible(false)}
      />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: "center", position: "relative" }}>
          {/* Theme toggle — top right */}
          <div style={{ position: "absolute", top: 0, right: 0 }}>
            <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
          </div>

          <div style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            background: "var(--bg-secondary)",
            border: `1px solid var(--border)`,
            borderRadius: 6,
            padding: "6px 12px",
            marginBottom: 16,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Fiscal Accountability Tool
          </div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: 8,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            This Meeting Costs
          </h1>
          <p style={{
            fontSize: 16,
            color: "var(--text-secondary)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Because someone should be keeping track.
          </p>
        </div>

        {/* Setup */}
        {!running && !showSummary && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {/* Quick Presets */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Meeting Presets
              </label>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
              }} className="preset-grid">
                {QUICK_PRESETS.map((preset, idx) => {
                  const isActive = JSON.stringify(attendees) === JSON.stringify(preset.attendees);
                  return (
                    <button
                      key={idx}
                      onClick={() => setAttendees([...preset.attendees])}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: isActive ? `1.5px solid var(--border-active)` : `1.5px solid var(--border)`,
                        background: isActive ? "var(--preset-active-bg)" : "var(--bg-card)",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{preset.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{preset.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <AttendeePicker
              attendees={attendees}
              setAttendees={setAttendees}
              customSalary={customSalary}
              setCustomSalary={setCustomSalary}
            />

            {totalAttendees > 0 && (
              <div style={{
                textAlign: "center",
                padding: "16px",
                background: "var(--burn-rate-bg)",
                borderRadius: 10,
                marginBottom: 24,
                fontSize: 14,
                color: "var(--text-secondary)",
                fontFamily: "'DM Mono', monospace",
                animation: "fadeIn 0.3s ease",
              }}>
                {totalAttendees} attendee{totalAttendees !== 1 ? "s" : ""} · Burn rate: <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(costPerSecond * 3600)}/hr</strong>
              </div>
            )}
          </div>
        )}

        {/* Cost Display */}
        {(running || elapsed > 0) && !showSummary && (
          <CostDisplay
            cost={cost}
            elapsed={elapsed}
            running={running}
            comparison={comparison}
            milestoneMessage={milestoneMessage}
          />
        )}

        {/* Summary */}
        {showSummary && (
          <SummaryCard
            cost={cost}
            elapsed={elapsed}
            totalAttendees={totalAttendees}
            onReset={resetMeeting}
            onCopy={handleCopy}
          />
        )}

        {/* Controls */}
        {!showSummary && (
          <div style={{ display: "flex", gap: 12 }}>
            {!running ? (
              <button
                onClick={startMeeting}
                disabled={totalAttendees === 0}
                style={{
                  flex: 1,
                  padding: "16px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: totalAttendees === 0 ? "var(--border)" : "var(--btn-bg)",
                  color: totalAttendees === 0 ? "var(--text-muted)" : "var(--btn-text)",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: totalAttendees === 0 ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                {elapsed > 0 ? "Restart Meeting" : "Start Meeting"}
              </button>
            ) : (
              <button
                onClick={stopMeeting}
                style={{
                  flex: 1,
                  padding: "16px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  animation: "pulse 2s infinite",
                }}
              >
                End This Meeting
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 48,
          textAlign: "center",
          fontSize: 13,
          color: "var(--text-footer)",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Salary data based on 2,080 working hours/year. No meetings were harmed in the making of this tool.
        </div>
      </div>
    </div>
  );
}
