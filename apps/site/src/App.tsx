import { FormEvent, useState } from "react";
import aceArch from "../../../ace-arch.png";
import aceRelayer from "../../../ace-relayer.png";
import antiSnipePolicy from "../../../anti-snipe policy.png";
import bamReadyArch from "../../../bam ready arch.png";

type EarlyAccessFormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  productType: string;
  message: string;
};

const earlyAccessEndpoint = import.meta.env.VITE_FAIRLANE_INTEREST_URL?.trim() ?? "";

const benefits = [
  {
    title: "Fair execution for contested actions",
    body: "Protect moments like loot claims, launches, and queue-sensitive actions with explicit execution policy instead of raw speed."
  },
  {
    title: "Deterministic outcomes teams can explain",
    body: "Fairlane produces clear decision artifacts so builders, partners, and users can understand why an action won."
  },
  {
    title: "A better product surface for Solana apps",
    body: "Apps keep their own transaction payloads and product logic while Fairlane handles the fairness layer."
  }
] as const;

const steps = [
  {
    id: "01",
    title: "Apps define a protected action",
    body: "A team marks a high-stakes flow like a claim, launch buy, or reward settlement and attaches the relevant policy."
  },
  {
    id: "02",
    title: "Fairlane resolves competition deterministically",
    body: "Competing actions are grouped inside a scoped window and resolved with a transparent ordering rule."
  },
  {
    id: "03",
    title: "Teams get replayable execution evidence",
    body: "The outcome is paired with a decision trail that helps apps build user trust and operational clarity."
  }
] as const;

const segments = [
  {
    title: "Games",
    body: "For loot, PvP rewards, race finishes, and any action where fairness changes the player experience."
  },
  {
    title: "Launches and mints",
    body: "For high-pressure entry points where brand trust depends on a visibly fair execution path."
  },
  {
    title: "Markets and queueing flows",
    body: "For applications that need an app-defined ordering rule instead of leaving outcomes to open contention."
  }
] as const;

const ecosystemPoints = [
  {
    title: "Better user trust",
    body: "Fairlane helps apps offer clearer and more defensible outcomes in the moments users care about most."
  },
  {
    title: "More ambitious application design",
    body: "With a fairness layer in place, teams can build products that rely on contested interactions without inventing bespoke execution logic from scratch."
  },
  {
    title: "Stronger economic activity on Solana",
    body: "If contested actions become more legible and trustworthy, more teams can build high-value flows directly on Solana."
  }
] as const;

const productStack = [
  {
    title: "SDK integration surface",
    body: "Developers mark protected actions and attach execution policy without turning their team into validator specialists."
  },
  {
    title: "Managed relay and decision engine",
    body: "Fairlane classifies contested actions, applies policy, and produces deterministic execution plans."
  },
  {
    title: "Replay and operator visibility",
    body: "Replay logs, reason trails, and analytics make execution decisions understandable for teams and users."
  }
] as const;

const businessModel = [
  {
    title: "Hosted execution quality",
    body: "The SDK is the entry point. The business is the hosted policy layer, replay, simulation, and analytics."
  },
  {
    title: "Usage aligned monetization",
    body: "Fairlane can charge as a subscription plus per protected action or per protected action group."
  },
  {
    title: "Expansion after the first wedge",
    body: "Games are the clearest first demo. Launchpads and trading flows are the strongest adjacent revenue expansions."
  }
] as const;

const defaultForm: EarlyAccessFormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  productType: "game",
  message: ""
};

function persistLocal(entry: Record<string, string>) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return;
  }

  const key = "fairlane_interest_submissions";
  const existing = window.localStorage.getItem(key);
  const records = existing ? (JSON.parse(existing) as Array<Record<string, string>>) : [];
  records.push({
    submittedAt: new Date().toISOString(),
    ...entry
  });
  window.localStorage.setItem(key, JSON.stringify(records));
}

async function submitForm(payload: Record<string, string>) {
  if (!earlyAccessEndpoint) {
    persistLocal(payload);
    return;
  }

  const response = await fetch(earlyAccessEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      submittedAt: new Date().toISOString(),
      ...payload
    })
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
}

export default function App() {
  const [form, setForm] = useState<EarlyAccessFormState>(defaultForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      await submitForm(form);
      setStatus("success");
      setForm(defaultForm);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">F</span>
          <div>
            <p className="brand-name">Fairlane</p>
            <p className="brand-tag">Fair execution infrastructure for contested actions on Solana</p>
          </div>
        </div>
        <nav className="topnav">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#ecosystem">Ecosystem</a>
          <a href="#early-access">Early access</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Built for apps where execution quality is part of the product.</p>
            <h1>Fairlane gives Solana apps a better way to handle contested actions.</h1>
            <p className="hero-text">
              Games, launches, and high-pressure product flows should not have to choose between speed and trust.
              Fairlane gives builders a policy layer for contested execution so outcomes feel intentional,
              explainable, and aligned with the app experience they want to deliver.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#early-access">
                Request early access
              </a>
              <a className="button button-secondary" href="#how-it-works">
                See how it works
              </a>
            </div>
            <ul className="hero-points">
              <li>Policy-driven fairness for high-stakes actions</li>
              <li>Deterministic resolution with replayable evidence</li>
              <li>Designed for teams building revenue-generating Solana products</li>
            </ul>
          </div>

          <div className="hero-panel">
            <div className="signal-card signal-card-primary">
              <p className="signal-label">What Fairlane enables</p>
              <p className="signal-title">Apps can make fairness part of the user experience.</p>
              <p className="signal-text">
                Instead of explaining away chaotic outcomes after the fact, teams can define how contested
                actions should be handled before they happen.
              </p>
            </div>

            <div className="signal-stack">
              {benefits.map((item) => (
                <article className="stack-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="value-section" id="product">
          <div className="section-heading">
            <p className="section-kicker">Why Fairlane</p>
            <h2>Contested actions are one of the hardest product problems on Solana.</h2>
          </div>

          <div className="problem-strip">
            <div className="problem-card">
              <p className="section-kicker">The challenge</p>
              <h3>Users notice unfair outcomes immediately.</h3>
              <p>
                When a loot claim, launch buy, or limited action feels arbitrary, trust breaks fast. Teams end up
                with support burden, frustrated communities, and product flows that are hard to defend.
              </p>
            </div>

            <div className="problem-card accent-card">
              <p className="section-kicker">The product answer</p>
              <h3>Fairlane adds a fairness layer without taking over the app.</h3>
              <p>
                Builders keep their product logic and transaction path. Fairlane adds scoped protection,
                deterministic resolution, and a clear decision surface around the moments where fairness matters most.
              </p>
            </div>
          </div>
        </section>

        <section className="market-section" id="how-it-works">
          <div className="section-heading">
            <p className="section-kicker">How it works</p>
            <h2>A simple model for making contested execution more trustworthy.</h2>
          </div>

          <div className="market-grid">
            {steps.map((step) => (
              <article className="market-card" key={step.id}>
                <p className="mini-label">{step.id}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="market-section" id="architecture">
          <div className="section-heading">
            <p className="section-kicker">Product architecture</p>
            <h2>Fairlane is a policy engine with pluggable execution backends.</h2>
          </div>

          <div className="market-grid">
            {productStack.map((item) => (
              <article className="market-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <div className="diagram-grid">
            <figure className="diagram-card">
              <img alt="Fairlane core architecture diagram" className="diagram-image" src={aceArch} />
              <figcaption>
                The current Fairlane stack: SDK, relay API, transaction classifier, decision engine, replay,
                analytics, and execution adapters.
              </figcaption>
            </figure>

            <figure className="diagram-card">
              <img alt="Fairlane relay flow diagram" className="diagram-image" src={aceRelayer} />
              <figcaption>
                Protected actions are classified, matched to policy, resolved deterministically, executed,
                and recorded with replay plus reasoning.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="market-section" id="segments">
          <div className="section-heading">
            <p className="section-kicker">Who it is for</p>
            <h2>Fairlane starts with the teams that feel contested execution pain the most.</h2>
          </div>

          <div className="market-grid">
            {segments.map((segment) => (
              <article className="market-card" key={segment.title}>
                <h3>{segment.title}</h3>
                <p>{segment.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="market-section" id="proof">
          <div className="section-heading">
            <p className="section-kicker">First wedge</p>
            <h2>One policy, one app category, one visible before-and-after.</h2>
          </div>

          <div className="problem-strip">
            <div className="problem-card">
              <p className="section-kicker">Why this wedge works</p>
              <h3>Games make the fairness problem instantly legible.</h3>
              <p>
                A contested loot claim is easy to understand, easy to demo, and makes the before-and-after obvious.
                That is the right first story for Fairlane because it shows visible pain and a visible fix.
              </p>
            </div>

            <div className="problem-card accent-card">
              <p className="section-kicker">What the first policy proves</p>
              <h3>`anti_snipe_window` turns a race condition into a product decision.</h3>
              <p>
                Instead of rewarding the last-millisecond winner by default, Fairlane groups the action,
                holds it briefly, and selects a deterministic outcome the app can explain.
              </p>
            </div>
          </div>

          <figure className="diagram-card diagram-card-wide">
            <img alt="Anti-snipe policy sequence diagram" className="diagram-image" src={antiSnipePolicy} />
            <figcaption>
              The first Fairlane demo: two competing actions enter the same protected window, the policy resolves
              the winner, and the final execution plus replay trail are returned to the app.
            </figcaption>
          </figure>
        </section>

        <section className="market-section" id="ecosystem">
          <div className="section-heading">
            <p className="section-kicker">Why Solana wins</p>
            <h2>Better execution quality expands what serious app teams can build on the network.</h2>
          </div>

          <div className="market-grid">
            {ecosystemPoints.map((point) => (
              <article className="market-card" key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="market-section" id="roadmap">
          <div className="section-heading">
            <p className="section-kicker">Built for now, ready for what comes next</p>
            <h2>Fairlane delivers value today through a managed relay and is designed to move deeper over time.</h2>
          </div>

          <div className="problem-strip">
            <div className="problem-card">
              <p className="section-kicker">Today</p>
              <h3>Managed execution policy for app-level protected flow</h3>
              <p>
                Fairlane works now through a managed relay, replay, and execution adapter model. That gives apps
                a practical way to improve fairness before BAM plugin access becomes broadly available.
              </p>
            </div>

            <div className="problem-card accent-card">
              <p className="section-kicker">Tomorrow</p>
              <h3>BAM-ready execution path</h3>
              <p>
                The policy layer stays the same while the execution backend evolves. As plugin access opens,
                Fairlane can move from managed relay execution toward BAM-native enforcement and stronger guarantees.
              </p>
            </div>
          </div>

          <figure className="diagram-card diagram-card-wide">
            <img alt="BAM-ready Fairlane architecture diagram" className="diagram-image" src={bamReadyArch} />
            <figcaption>
              Fairlane is designed so the policy layer remains the product moat while execution backends can evolve
              from managed relay adapters to BAM-native adapters.
            </figcaption>
          </figure>
        </section>

        <section className="market-section" id="business">
          <div className="section-heading">
            <p className="section-kicker">Business model</p>
            <h2>Fairlane is not just an SDK. It is hosted execution-quality infrastructure.</h2>
          </div>

          <div className="market-grid">
            {businessModel.map((item) => (
              <article className="market-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="capture-section" id="early-access">
          <div className="section-heading">
            <p className="section-kicker">Early access</p>
            <h2>Fairlane is working with design partners building high-stakes Solana products.</h2>
          </div>

          <div className="capture-layout">
            <div className="capture-card capture-card-copy">
              <p className="mini-label">Work with Fairlane</p>
              <h3>Apply for early access</h3>
              <p>
                We are looking for teams building products where fairness, execution quality, and user trust are
                core to adoption. If that describes your app, request access and tell us what you are building.
              </p>
            </div>

            <form className="capture-card form-card" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  <span>Name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Your name"
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="you@company.com"
                  />
                </label>
                <label>
                  <span>Company</span>
                  <input
                    value={form.company}
                    onChange={(event) => setForm({ ...form, company: event.target.value })}
                    placeholder="Company or project"
                  />
                </label>
                <label>
                  <span>Role</span>
                  <input
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                    placeholder="Founder, PM, engineer"
                  />
                </label>
                <label className="full-span">
                  <span>Product type</span>
                  <select
                    value={form.productType}
                    onChange={(event) => setForm({ ...form, productType: event.target.value })}
                  >
                    <option value="game">Game</option>
                    <option value="launch">Launch or mint</option>
                    <option value="market">Market or queueing product</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="full-span">
                  <span>What are you building?</span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder="Tell us about your product and where contested execution matters."
                  />
                </label>
              </div>

              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={status === "submitting"}>
                  {status === "submitting" ? "Submitting..." : "Request access"}
                </button>
                <StatusMessage kind={status} />
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusMessage(props: { kind: "idle" | "submitting" | "success" | "error" }) {
  if (props.kind === "success") {
    return <p className="status-message success-message">Request received.</p>;
  }

  if (props.kind === "error") {
    return <p className="status-message error-message">Something went wrong. Please try again.</p>;
  }

  return null;
}
