import MusicReactiveHero from "@/components/music-reactive-hero-section";

export default function Page() {
  return (
    <main className="bg-black">
      {/* HERO */}
      <MusicReactiveHero />

      {/* SECTION UNDER HERO */}
      <section className="relative w-full bg-black py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
            <div className="relative min-h-[680px] overflow-visible">
              {/* IMAGE */}
              <img
                src="/images/baliho.png"
                alt="Baliho Visual"
                className="
                absolute inset-0
                w-full h-full
                object-contain
                scale-115 md:scale-125
                -translate-x-6 md:-translate-x-10
                drop-shadow-[0_0_80px_rgba(255,200,120,0.25)]
                drop-shadow-[0_0_140px_rgba(255,120,80,0.15)]
              "
              />

              {/* FRAGILE BROKEN LIGHT OVERLAY */}
              <div className="absolute inset-0 pointer-events-none animate-fragile-broken bg-black/70 mix-blend-screen" />
            </div>

            {/* RIGHT: text + cards */}
            <div className="text-white">
              <p className="text-xs md:text-sm uppercase tracking-[0.5em] text-orange-400/90">
                Astronomically Creative
              </p>

              <h2 className="mt-4 text-5xl md:text-6xl font-extrabold leading-[0.95]">
                Behind The <br />
                Craft.
              </h2>

              <p className="mt-6 text-white/70 leading-relaxed max-w-xl">
                UNCU Worklabs is a strategic design & engineering partner to
                bold digital brands. We embed with your team, co-build your
                product, and help bring it to the world.
              </p>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left hover:bg-white/10 transition">
                  <p className="text-sm font-semibold">Marketing</p>
                </button>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left hover:bg-white/10 transition">
                  <p className="text-sm font-semibold">Design</p>
                </button>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left hover:bg-white/10 transition">
                  <p className="text-sm font-semibold">Development</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
