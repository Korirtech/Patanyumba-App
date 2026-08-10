import { ShieldCheck, Heart, Users, TrendingUp, MapPin, MessageCircle, Building2, CheckCircle2, Star, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 hero-pattern opacity-20" />
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/8 blur-2xl translate-y-1/3 -translate-x-1/3" />

        <div className="container relative py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 mb-5">
              <Star className="h-4 w-4 text-white/80 fill-current" />
              <span className="text-sm font-medium text-white/90">Kenya's Trusted Property Platform</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl mb-4">
              About PataNyumba
            </h1>
            <p className="text-white/65 text-lg leading-relaxed max-w-xl">
              Built for landlords and house hunters alike — making Kenya's rental market more transparent, one listing at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Story section */}
      <section className="container section-padding">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Our Story</p>
            <h2 className="font-display text-3xl font-extrabold mb-5">
              Born from a Simple Frustration
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                PataNyumba was born from a simple frustration: finding a home in Kenya shouldn't be a guessing game. Between unverified listings, agent fees, and endless phone tags, the process was broken.
              </p>
              <p>
                We set out to fix it — a platform where every listing is verified, every landlord is reachable, and every tenant can search with confidence.
              </p>
              <p>
                Today, PataNyumba connects landlords and tenants across Nairobi, Kiambu, and beyond. From bedsitters in Westlands to maisonettes in Runda, we're making Kenya's rental market more transparent, one listing at a time.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/properties">
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                  Browse Properties
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>

          {/* Mission & Vision cards */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-primary mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To simplify the home-finding journey with modern tools, verified listings, and instant WhatsApp communication — no agents, no delays, no hidden fees.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
                <Star className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become Kenya's most trusted property platform, empowering communities through better housing access and transparent landlord-tenant connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-primary/3 border-y border-border">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Building2, label: "Active Listings", value: "4+", color: "text-primary", bg: "bg-primary/10" },
              { icon: MapPin, label: "Counties Covered", value: "2+", color: "text-blue-600", bg: "bg-blue-500/10" },
              { icon: ShieldCheck, label: "Verified Listings", value: "100%", color: "text-emerald-600", bg: "bg-emerald-500/10" },
              { icon: MessageCircle, label: "WhatsApp Direct", value: "Yes", color: "text-amber-600", bg: "bg-amber-500/10" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg} mb-3`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <p className={`font-display text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container section-padding">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">What We Stand For</p>
          <h2 className="font-display text-3xl font-extrabold mb-3">Our Core Values</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            These principles guide everything we do at PataNyumba.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "Trust",
              desc: "Every listing is verified. Every landlord is real. No fake properties, ever.",
              color: "bg-primary/10",
              iconColor: "text-primary",
            },
            {
              icon: Heart,
              title: "Care",
              desc: "We put users first — from intuitive search to instant landlord contact.",
              color: "bg-rose-500/10",
              iconColor: "text-rose-600",
            },
            {
              icon: Users,
              title: "Community",
              desc: "Connecting landlords and tenants across Kenya's vibrant neighborhoods.",
              color: "bg-blue-500/10",
              iconColor: "text-blue-600",
            },
            {
              icon: TrendingUp,
              title: "Innovation",
              desc: "Smart filters, WhatsApp integration, and real-time dashboards for all.",
              color: "bg-emerald-500/10",
              iconColor: "text-emerald-600",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="group rounded-2xl border border-border bg-card p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20"
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${v.color} mb-5 transition-transform duration-300 group-hover:scale-110`}>
                <v.icon className={`h-7 w-7 ${v.iconColor}`} />
              </div>
              <h4 className="font-display text-lg font-bold mb-2">{v.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team / CTA */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 hero-pattern opacity-20" />
        <div className="container relative py-16 text-center">
          <h2 className="font-display text-3xl font-extrabold text-white mb-4">
            Join the PataNyumba Community
          </h2>
          <p className="text-white/65 text-lg mb-8 max-w-lg mx-auto">
            Whether you're looking for a home or listing a property, we're here to make the process seamless.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90 transition-colors shadow-lg shadow-black/20">
                <Users className="h-4 w-4" />
                Create Free Account
              </button>
            </Link>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/50 transition-all">
                <MessageCircle className="h-4 w-4" />
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
