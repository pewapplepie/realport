import Image from "next/image";
import Link from "next/link";

const metrics = [
  {
    label: "Portfolio view",
    value: "Live holdings",
    detail: "Track value, debt, rent, and monthly drag in one place.",
  },
  {
    label: "New deal",
    value: "Carry before you sign",
    detail: "Model mortgage, equity loan, HOA, tax, and upfront costs together.",
  },
  {
    label: "Buy vs invest",
    value: "Decision in context",
    detail: "Compare the home path against market compounding across time horizons.",
  },
];

const pillars = [
  {
    eyebrow: "Portfolio command",
    title: "See the book the way capital sees it.",
    body: "Bring operating income, debt service, and property-level changes into one crisp view so your portfolio story stays current.",
  },
  {
    eyebrow: "Opportunity underwriting",
    title: "Model the next acquisition with the full debt stack.",
    body: "Test down payment financing, mansion tax, closing costs, HOA, and taxes before the deal reaches your banker or broker.",
  },
  {
    eyebrow: "Capital comparison",
    title: "Know when property beats the market and when it does not.",
    body: "Compare rent-and-invest versus buy-and-hold with a frame that makes the tradeoff readable, not theatrical.",
  },
];

const workflow = [
  "Track your current properties and monthly operating picture.",
  "Pressure-test a target purchase with synced equity financing.",
  "Compare the real estate path against investing the same capital elsewhere.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#17191c]">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pt-5 sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between rounded-lg border border-[#9C7CA5]/34 bg-[#3B343C] px-4 py-3 text-white shadow-[0_20px_80px_rgba(0,0,0,0.32)]">
            <Link href="/" className="text-2xl font-bold tracking-tight text-white">
              RealPort
            </Link>
            <div className="hidden items-center gap-6 text-sm font-semibold text-white/84 md:flex">
              <Link href="/dashboard" className="transition-colors hover:text-white">
                Dashboard
              </Link>
              <Link href="/opportunity" className="transition-colors hover:text-white">
                Opportunity
              </Link>
              <Link href="/analytics" className="transition-colors hover:text-white">
                Analytics
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white/88 transition-colors hover:bg-white/10 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#ADB2D3] px-4 py-2 text-sm font-semibold text-[#1a1820] transition-colors hover:bg-[#c4c8e2]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[94vh] overflow-hidden bg-[#0f1417]">
          <Image
            src="https://images.unsplash.com/photo-1529307474719-3d0a417aaf8a?auto=format&fit=crop&w=1800&q=80"
            alt="Towering city buildings with warm reflected light"
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-56"
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(11,15,18,0.94)_0%,rgba(11,15,18,0.82)_42%,rgba(11,15,18,0.58)_68%,rgba(11,15,18,0.84)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0f1417] to-transparent" />

          <div className="relative mx-auto flex min-h-[94vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ADB2D3]">
                Real estate, priced like capital
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                Run your property book with a younger, sharper investing lens.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
                RealPort gives you a cleaner way to track holdings, model the next
                purchase, and compare property ownership against market investing
                without drowning the answer in spreadsheet noise.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/opportunity"
                  className="rounded-lg bg-[#ADB2D3] px-6 py-3 text-center text-sm font-semibold text-[#1a1820] transition-colors hover:bg-[#c4c8e2]"
                >
                  Price the Opportunity
                </Link>
                <Link
                  href="/analytics"
                  className="rounded-lg border border-white/18 bg-white/8 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/14"
                >
                  Compare Buy vs Invest
                </Link>
              </div>
            </div>

            <div className="mt-16 grid gap-6 border-t border-white/14 pt-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-5 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="border-t border-[#9C7CA5]/55 pt-4 text-white"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ADB2D3]">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold leading-tight">
                      {metric.value}
                    </p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-white/64">
                      {metric.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-between border-t border-[#c89a62]/60 pt-4 text-white/78 lg:pl-10">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c89a62]">
                  This week in focus
                </p>
                <p className="mt-3 max-w-md text-lg leading-8 text-white/84">
                  Move from rough intuition to an investable read on what the next
                  home, rental, or leverage layer actually does to your monthly
                  posture.
                </p>
                <p className="mt-6 text-sm text-white/54">
                  Built for operators, first-time buyers, and investors who want a
                  polished answer before the call starts.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#11161a] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9cd6d0]">
                Why it feels different
              </p>
              <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight sm:text-4xl">
                Calm interface, serious underwriting.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-white/68">
                The goal is not more dashboard theater. It is a better read on
                leverage, affordability, and capital allocation while the numbers
                are still fluid.
              </p>
            </div>
            <div className="grid gap-7">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="grid gap-3 border-b border-white/12 pb-7 md:grid-cols-[180px_1fr]"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#c89a62]">
                    {pillar.eyebrow}
                  </p>
                  <div>
                    <h3 className="text-2xl font-semibold leading-tight text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-white/68">
                      {pillar.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f2eb]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#4f7f7f]">
                  Workflow
                </p>
                <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight text-[#17191c] sm:text-4xl">
                  From property memory to the next allocation decision.
                </h2>
              </div>
              <div className="space-y-6">
                {workflow.map((step, index) => (
                  <div
                    key={step}
                    className="grid gap-4 border-b border-[#d8d0c5] pb-6 sm:grid-cols-[56px_1fr]"
                  >
                    <div className="text-4xl font-semibold leading-none text-[#9f7a4a]">
                      0{index + 1}
                    </div>
                    <p className="max-w-2xl text-lg leading-8 text-[#47443f]">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
