import { ShieldCheck, Heart, Users, TrendingUp, MapPin, MessageCircle, Building2 } from "lucide-react";

export default function About() {
  return (
    <div className="page-enter container py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">
            About PataNyumba
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Kenya's trusted property marketplace — built for landlords and house hunters alike.
          </p>
        </div>

        {/* Story card */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-sm md:p-10">
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            PataNyumba was born from a simple frustration: finding a home in Kenya shouldn't be
            a guessing game. Between unverified listings, agent fees, and endless phone tags, the
            process was broken. We set out to fix it — a platform where every listing is verified,
            every landlord is reachable, and every tenant can search with confidence.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Today, PataNyumba connects landlords and tenants across Nairobi, Kiambu, and beyond.
            From bedsitters in Westlands to maisonettes in Runda, we're making Kenya's rental
            market more transparent, one listing at a time.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl bg-primary/5 p-5 border border-primary/10">
              <h3 className="font-display text-lg font-bold text-primary">Our Mission</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                To simplify the home-finding journey with modern tools, verified listings, and
                instant WhatsApp communication — no agents, no delays.
              </p>
            </div>
            <div className="rounded-xl bg-accent p-5 border border-border">
              <h3 className="font-display text-lg font-bold">Our Vision</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                To become Kenya's most trusted property platform, empowering communities through
                better housing access and transparent landlord-tenant connections.
              </p>
            </div>
          </div>
        </div>

        {/* Stats band */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Building2, label: "Active Listings", value: "4+" },
            { icon: MapPin, label: "Counties Covered", value: "2+" },
            { icon: ShieldCheck, label: "Verified Listings", value: "100%" },
            { icon: MessageCircle, label: "WhatsApp Direct", value: "Yes" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center shadow-sm">
              <s.icon className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-2 font-display text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mt-10">
          <h2 className="font-display text-2xl font-bold text-center mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Trust", desc: "Every listing is verified. Every landlord is real. No fake properties, ever." },
              { icon: Heart, title: "Care", desc: "We put users first — from intuitive search to instant landlord contact." },
              { icon: Users, title: "Community", desc: "Connecting landlords and tenants across Kenya's vibrant neighborhoods." },
              { icon: TrendingUp, title: "Innovation", desc: "Smart filters, WhatsApp integration, and real-time dashboards for all." },
            ].map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mt-3 font-display font-bold">{v.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
