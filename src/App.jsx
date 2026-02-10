import { useState, useEffect, useRef, useCallback } from "react";

const SALARY_TIERS = [
  { label: "Intern / Entry", annual: 45000, emoji: "📎" },
  { label: "Mid-Level", annual: 85000, emoji: "💼" },
  { label: "Manager / Sr. Manager", annual: 130000, emoji: "📊" },
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
  { label: "Daily Standup", subtitle: "5 mid-level, 1 manager", attendees: [0, 5, 1, 0, 0] },
  { label: "Sprint Planning", subtitle: "3 mid-level, 2 managers, 1 director", attendees: [0, 3, 2, 1, 0] },
  { label: "All-Hands", subtitle: "5 entry, 10 mid, 8 managers, 4 directors, 2 C-suite", attendees: [5, 10, 8, 4, 2] },
  { label: "Board Meeting", subtitle: "2 directors, 6 C-suite", attendees: [0, 0, 0, 2, 6] },
  { label: '"Quick Sync"', subtitle: "3 managers who could've Slacked", attendees: [0, 0, 3, 0, 0] },
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

function AttendeePicker({ attendees, setAttendees }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
        Attendees
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SALARY_TIERS.map((tier, tierIdx) => {
          const count = attendees[tierIdx] || 0;
          return (
            <div key={tierIdx} style={{
              background: count > 0 ? "#f8fafc" : "#fff",
              border: count > 0 ? "1.5px solid #1e293b" : "1.5px solid #e2e8f0",
              borderRadius: 10,
              padding: "12px 16px",
              minWidth: 140,
              flex: "1 1 140px",
              transition: "all 0.2s ease",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>
                {tier.emoji} {tier.label}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>
                ${(tier.annual / 1000).toFixed(0)}k/yr
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => {
                    const next = [...attendees];
                    next[tierIdx] = Math.max(0, (next[tierIdx] || 0) - 1);
                    setAttendees(next);
                  }}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0",
                    background: "#fff", cursor: "pointer", fontSize: 16, color: "#64748b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >−</button>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", minWidth: 20, textAlign: "center", fontFamily: "'DM Mono', monospace" }}>
                  {count}
                </span>
                <button
                  onClick={() => {
                    const next = [...attendees];
                    next[tierIdx] = (next[tierIdx] || 0) + 1;
                    setAttendees(next);
                  }}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "1px solid #1e293b",
                    background: "#1e293b", cursor: "pointer", fontSize: 16, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >+</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CostDisplay({ cost, elapsed, running, comparison, milestoneMessage }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "48px 24px",
      background: "linear-gradient(180deg, #f8fafc 0%, #fff 100%)",
      borderRadius: 16,
      border: "1px solid #e2e8f0",
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
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: running ? "#ef4444" : "#94a3b8", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
        {running ? "💸 Burning" : elapsed > 0 ? "Final Damage" : "Ready"}
      </div>
      <div style={{
        fontSize: cost > 9999 ? 56 : 72,
        fontWeight: 800,
        color: "#0f172a",
        fontFamily: "'DM Mono', monospace",
        lineHeight: 1,
        marginBottom: 8,
        letterSpacing: "-0.02em",
        transition: "font-size 0.3s ease",
      }}>
        {formatCurrency(cost)}
      </div>
      <div style={{ fontSize: 16, color: "#64748b", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
        {formatTime(elapsed)}
      </div>
      {comparison && (
        <div style={{
          display: "inline-block",
          background: "#fef3c7",
          border: "1px solid #fde68a",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 13,
          color: "#92400e",
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: milestoneMessage ? 12 : 0,
        }}>
          This meeting has surpassed the cost of <strong>{comparison.label}</strong>
        </div>
      )}
      {milestoneMessage && (
        <div style={{
          display: "block",
          fontSize: 14,
          color: "#64748b",
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

function SummaryCard({ cost, elapsed, totalAttendees, onReset }) {
  const comparison = getCurrentComparison(cost);
  const perPerson = totalAttendees > 0 ? cost / totalAttendees : 0;
  const perMinute = elapsed > 60 ? cost / (elapsed / 60) : cost;
  const quip = getEndingQuip(cost);
  const couldveBeenAnEmail = elapsed <= 300;

  return (
    <div style={{
      background: "#0f172a",
      borderRadius: 16,
      padding: 32,
      color: "#fff",
      marginBottom: 24,
      animation: "fadeIn 0.6s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      {couldveBeenAnEmail && (
        <div style={{
          position: "absolute",
          top: 16,
          right: -32,
          background: "#ef4444",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "6px 40px",
          transform: "rotate(35deg)",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
          zIndex: 1,
          animation: "stampIn 0.5s ease-out 0.3s both",
        }}>
          📧 Could've been an email
        </div>
      )}
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
        Meeting Post-Mortem
      </div>
      <div style={{
        fontSize: 16,
        color: "#e2e8f0",
        fontStyle: "italic",
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: 24,
        lineHeight: 1.5,
        animation: "fadeIn 0.8s ease",
      }}>
        "{quip}"
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Total Cost</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{formatCurrency(cost)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Per Person</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{formatCurrency(perPerson)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Per Minute</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{formatCurrency(perMinute)}</div>
        </div>
      </div>
      {comparison && (
        <div style={{ fontSize: 14, color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", marginBottom: 24, padding: "12px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
          This meeting cost more than <strong style={{ color: "#fbbf24" }}>{comparison.label}</strong>. Hope it was worth it.
        </div>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onReset}
          style={{
            flex: 1, padding: "12px 24px", borderRadius: 8, border: "1px solid #334155",
            background: "transparent", color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}
        >
          New Meeting
        </button>
        <button
          onClick={() => {
            const emailBadge = elapsed <= 300 ? `\n\n📧 Official verdict: Could've been an email.` : "";
            const text = `Our ${formatTime(elapsed)} meeting with ${totalAttendees} people just cost ${formatCurrency(cost)}. That's more than ${comparison ? comparison.label : "expected"}.${emailBadge}\n\nWas it worth it? 🤔\n\nCalculate yours → thismeetingcosts.io`;
            navigator.clipboard.writeText(text).catch(() => {});
          }}
          style={{
            flex: 1, padding: "12px 24px", borderRadius: 8, border: "none",
            background: "#3b82f6", color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}
        >
          📋 Copy for LinkedIn
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [attendees, setAttendees] = useState([0, 0, 0, 0, 0]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cost, setCost] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState("");
  const lastMilestoneRef = useRef(0);
  const intervalRef = useRef(null);

  const totalAttendees = attendees.reduce((s, c) => s + c, 0);

  const costPerSecond = attendees.reduce((sum, count, idx) => {
    const hourly = SALARY_TIERS[idx].annual / 2080;
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
      background: "#fff",
      fontFamily: "'DM Sans', sans-serif",
    }}>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#94a3b8",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
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
            color: "#0f172a",
            lineHeight: 1.2,
            marginBottom: 8,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            This Meeting Costs
          </h1>
          <p style={{
            fontSize: 15,
            color: "#64748b",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Because someone should be keeping track.
          </p>
        </div>

        {/* Attendee Picker */}
        {!running && !showSummary && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {/* Quick Presets */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
                Quick Setup
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {QUICK_PRESETS.map((preset, idx) => {
                  const isActive = JSON.stringify(attendees) === JSON.stringify(preset.attendees);
                  return (
                    <button
                      key={idx}
                      onClick={() => setAttendees([...preset.attendees])}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: isActive ? "1.5px solid #1e293b" : "1.5px solid #e2e8f0",
                        background: isActive ? "#f0f9ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{preset.label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{preset.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <AttendeePicker attendees={attendees} setAttendees={setAttendees} />

            {totalAttendees > 0 && (
              <div style={{
                textAlign: "center",
                padding: "16px",
                background: "#f8fafc",
                borderRadius: 10,
                marginBottom: 24,
                fontSize: 13,
                color: "#64748b",
                fontFamily: "'DM Mono', monospace",
                animation: "fadeIn 0.3s ease",
              }}>
                {totalAttendees} attendee{totalAttendees !== 1 ? "s" : ""} · Burn rate: <strong style={{ color: "#0f172a" }}>{formatCurrency(costPerSecond * 3600)}/hr</strong>
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
                  background: totalAttendees === 0 ? "#e2e8f0" : "#0f172a",
                  color: totalAttendees === 0 ? "#94a3b8" : "#fff",
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
          fontSize: 12,
          color: "#cbd5e1",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Salary data based on 2,080 working hours/year. No meetings were harmed in the making of this tool.
        </div>
      </div>
    </div>
  );
}
