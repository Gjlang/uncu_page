import MusicReactiveHero from "@/components/music-reactive-hero-section";
import { AnimatedSlideshowSection } from "@/components/animated-slideshow";
import InfiniteGallery from "@/components/3d-gallery-photography";
import { Footer } from "@/components/modem-animated-footer";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";

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

            {/* RIGHT: text + cards + vinyl UNDER */}
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

              {/* BUTTONS */}
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

              {/* VINYL UNDER THE BUTTONS */}
              <div className="relative mt-10">
                <video
                  src="/videos/vinyl.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="
                    w-full
                    max-w-md
                    mx-auto
                    h-auto
                    object-contain
                    opacity-100
                    pointer-events-none
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED SLIDESHOW SECTION */}
      <AnimatedSlideshowSection />

      {/* GALLERY SECTION */}
      <section className="relative w-full bg-black py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative h-[600px] w-full rounded-3xl overflow-hidden">
            <InfiniteGallery
              images={[
                "/images/vinyl.png",
                "/images/goose.png",
                "/images/mice.png",
                "/images/octopus.png",
                "/images/baliho.png",
                "/images/vinyl.png",
                "/images/goose.png",
                "/images/mice.png",
              ]}
              className="h-full w-full relative z-0"
              speed={1}
              visibleCount={12}
              fadeSettings={{
                fadeIn: { start: 0.05, end: 0.25 },
                fadeOut: { start: 0.4, end: 0.43 },
              }}
              blurSettings={{
                blurIn: { start: 0.0, end: 0.1 },
                blurOut: { start: 0.4, end: 0.43 },
                maxBlur: 8.0,
              }}
            />

            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center text-center px-6">
              <h1 className="font-serif text-4xl md:text-7xl tracking-tight text-white mix-blend-exclusion">
                <span className="italic">I create;</span> therefore I am
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ FOOTER */}
      <Footer
        brandName="UNCU"
        brandDescription="Strategic design & engineering partner for bold digital brands."
        socialLinks={[
          {
            icon: <Twitter className="w-6 h-6" />,
            href: "https://twitter.com",
            label: "Twitter",
          },
          {
            icon: <Linkedin className="w-6 h-6" />,
            href: "https://linkedin.com",
            label: "LinkedIn",
          },
          {
            icon: <Github className="w-6 h-6" />,
            href: "https://github.com",
            label: "GitHub",
          },
          {
            icon: <Mail className="w-6 h-6" />,
            href: "mailto:hello@uncu.com",
            label: "Email",
          },
        ]}
        navLinks={[
          { label: "Home", href: "/" },
          { label: "Work", href: "/work" },
          { label: "Services", href: "/services" },
          { label: "Contact", href: "/contact" },
        ]}
        creatorName="UNCU Worklabs"
        creatorUrl="https://example.com"
      />
    </main>
  );
}
