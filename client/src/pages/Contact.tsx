import { Phone, Mail, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+254 726 605 919",
    href: "tel:+254726605919",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Mail,
    label: "Email",
    value: "patanyumbaadmin@gmail.com",
    href: "mailto:patanyumbaadmin@gmail.com",
    color: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Nairobi, Kenya",
    href: null,
    color: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Mon–Sat, 8AM–6PM EAT",
    href: null,
    color: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 hero-pattern opacity-20" />
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl -translate-y-1/3 translate-x-1/3" />

        <div className="container relative py-16 md:py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 mb-5">
              <MessageCircle className="h-4 w-4 text-white/80" />
              <span className="text-sm font-medium text-white/90">We're here to help</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl mb-4">
              Get in Touch
            </h1>
            <p className="text-white/65 text-lg leading-relaxed">
              Questions, feedback, or partnership inquiries — our team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      <div className="container section-padding">
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Contact Info</p>
              <h2 className="font-display text-2xl font-bold mb-2">Reach Us Directly</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Choose the most convenient way to get in touch with our team.
              </p>
            </div>

            <div className="space-y-3">
              {contactInfo.map((item) => (
                <div
                  key={item.label}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${item.color}`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-semibold text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/254726605919"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full rounded-2xl bg-emerald-500 text-white px-6 py-4 font-semibold hover:bg-emerald-600 transition-all duration-200 shadow-sm shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>

            {/* Response time note */}
            <div className="rounded-2xl bg-muted/40 border border-border p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Fast Response</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  We typically respond within 2–4 hours during business hours.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm md:p-9">
              <div className="mb-7">
                <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Message Us</p>
                <h2 className="font-display text-2xl font-bold">Send a Message</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Fill in the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Your Name</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        placeholder="John Kamau"
                        className="h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">
                      Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 7XX XXX XXX"
                      className="h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold">Subject</Label>
                    <Input
                      id="subject"
                      type="text"
                      required
                      placeholder="What's this about?"
                      className="h-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold">Message</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      required
                      placeholder="Tell us how we can help you..."
                      className="rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 gap-2 rounded-xl font-semibold shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-all"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
