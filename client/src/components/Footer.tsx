import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, Apple, Smartphone, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import BrandMark from "@/components/BrandMark";

export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* Main footer */}
      <div className="bg-foreground/[0.03] border-t border-border">
        <div className="container py-14 md:py-16">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <BrandMark className="h-8 w-8 rounded-xl transition-transform group-hover:scale-105" />
                <span className="font-display text-xl font-extrabold">
                  <span className="text-primary">Pata</span>
                  <span className="text-foreground">Nyumba</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-[220px]">
                Kenya's trusted property marketplace. Find your next home with confidence.
              </p>
              {/* Social links */}
              <div className="flex gap-2">
                {[
                  { icon: Facebook, label: "Facebook", msg: "Follow us on Facebook soon!" },
                  { icon: Twitter, label: "Twitter", msg: "Follow us on Twitter soon!" },
                  { icon: Instagram, label: "Instagram", msg: "Follow us on Instagram soon!" },
                  { icon: Youtube, label: "YouTube", msg: "Subscribe on YouTube soon!" },
                ].map(({ icon: Icon, label, msg }) => (
                  <button
                    key={label}
                    onClick={() => toast.info(msg)}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div>
              <h5 className="font-display font-bold text-sm mb-4 text-foreground">Explore</h5>
              <ul className="space-y-2.5">
                {[
                  { href: "/properties", label: "Browse Properties" },
                  { href: "/counties", label: "Browse Counties" },
                  { href: "/properties", label: "Landlord Listings" },
                  { href: "#", label: "Blog", onClick: () => toast.info("Blog coming soon!") },
                ].map((item) => (
                  <li key={item.label}>
                    {item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h5 className="font-display font-bold text-sm mb-4 text-foreground">Support</h5>
              <ul className="space-y-2.5">
                {[
                  { label: "Help Center", onClick: () => toast.info("Help Center coming soon!") },
                  { href: "/contact", label: "Contact Us" },
                  { label: "FAQs", onClick: () => toast.info("FAQs coming soon!") },
                  { label: "Privacy Policy", onClick: () => toast.info("Privacy Policy coming soon!") },
                  { label: "Terms of Service", onClick: () => toast.info("Terms coming soon!") },
                ].map((item) => (
                  <li key={item.label}>
                    {item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                      >
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        href={item.href!}
                        className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & App */}
            <div>
              <h5 className="font-display font-bold text-sm mb-4 text-foreground">Contact Us</h5>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">+254 726 605 919</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground break-all">patanyumbaadmin@gmail.com</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Nairobi, Kenya</span>
                </li>
              </ul>

              <h5 className="font-display font-bold text-sm mb-3 text-foreground">Download App</h5>
              <div className="space-y-2">
                <button
                  onClick={() => toast.info("App coming soon to the App Store!")}
                  className="flex items-center gap-2.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  <Apple className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <div className="text-[10px] text-muted-foreground leading-none">Download on the</div>
                    <div className="text-xs font-semibold">App Store</div>
                  </div>
                </button>
                <button
                  onClick={() => toast.info("App coming soon to Google Play!")}
                  className="flex items-center gap-2.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <div className="text-[10px] text-muted-foreground leading-none">Get it on</div>
                    <div className="text-xs font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-muted/20">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PataNyumba. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => toast.info("Privacy Policy coming soon!")} className="hover:text-primary transition-colors">
                Privacy
              </button>
              <button onClick={() => toast.info("Terms coming soon!")} className="hover:text-primary transition-colors">
                Terms
              </button>
              <button onClick={() => toast.info("Sitemap coming soon!")} className="hover:text-primary transition-colors">
                Sitemap
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
