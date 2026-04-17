import Image from "next/image";
import Link from "next/link";

const proofPoints = [
  {
    label: "Holdings",
    value: "12",
    detail: "active doors",
  },
  {
    label: "Cash Flow",
    value: "$18.4k",
    detail: "monthly net",
  },
  {
    label: "Next Move",
    value: "$5.8k",
    detail: "projected cost",
  },
];

const notes = [
  {
    title: "Portfolio truth",
    body: "Keep values, rents, expenses, and appreciation close enough to make better calls on ordinary Tuesdays.",
  },
  {
    title: "Opportunity math",
    body: "Pressure-test a purchase before momentum turns into a signed contract.",
  },
  {
    title: "Cash flow memory",
    body: "Bring the monthly story into focus without hunting through statements.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <nav className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-lg font-semibold text-white">
            RealPort
          </span>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#564B69] transition-colors hover:bg-[#EEE9F4]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative min-h-[86vh] overflow-hidden bg-stone-950">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80"
            alt="Sunlit city buildings"
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-950/55 to-stone-950/80" />
          <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase text-[#DCD3E7]">
                Real estate decisions, made legible
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Know what your portfolio can carry next.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-100">
                Track the properties you own, understand the cash they produce,
                and test the next acquisition before it reaches your calendar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/opportunity"
                  className="rounded-lg bg-[#564B69] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-[#3C334C]"
                >
                  Price an Opportunity
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  Start Portfolio
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div
                  key={point.label}
                  className="border border-white/20 bg-white/10 p-4 text-white backdrop-blur"
                >
                  <p className="text-xs font-medium uppercase text-stone-200">
                    {point.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{point.value}</p>
                  <p className="text-sm text-stone-200">{point.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase text-[#564B69]">
                The operating notebook
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-stone-950">
                Clean numbers, fewer surprise meetings with your spreadsheet.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {notes.map((note) => (
                <article
                  key={note.title}
                  className="border-l-2 border-[#B6854E] bg-[#F7F4F2] p-5"
                >
                  <h3 className="font-semibold text-stone-950">{note.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {note.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
