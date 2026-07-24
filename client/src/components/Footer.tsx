import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, Apple, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/manus-storage/logo_ef671d8c.png"
                alt="PataNyumba"
                className="h-7 w-7 object-contain"
              />
              <span className="font-display text-lg font-extrabold">
                <span className="text-primary">Pata</span>
                <span className="text-foreground">Nyumba</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
              Find your next home with confidence. Kenya's trusted property marketplace.
            </p>
            <div className="flex gap-3">
              <button onClick={() => toast.info("Follow us on Facebook soon!")} aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </button>
              <button onClick={() => toast.info("Follow us on Twitter soon!")} aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </button>
              <button onClick={() => toast.info("Follow us on Instagram soon!")} aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </button>
              <button onClick={() => toast.info("Subscribe on YouTube soon!")} aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h5 className="font-display font-bold text-sm mb-3">Explore</h5>
            <div className="flex flex-col gap-2">
              <Link href="/properties" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Properties
              </Link>
              <Link href="/counties" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Counties
              </Link>
              <Link href="/properties" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Landlords
              </Link>
              <button onClick={() => toast.info("Blog coming soon!")} className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                Blog
              </button>
            </div>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-display font-bold text-sm mb-3">Support</h5>
            <div className="flex flex-col gap-2">
              <button onClick={() => toast.info("Help Center coming soon!")} className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                Help Center
              </button>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <button onClick={() => toast.info("FAQs coming soon!")} className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                FAQs
              </button>
              <button onClick={() => toast.info("Privacy Policy coming soon!")} className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                Privacy Policy
              </button>
            </div>
          </div>

          {/* Download */}
          <div>
            <h5 className="font-display font-bold text-sm mb-3">Download App</h5>
            <div className="flex flex-col gap-2">
              <button onClick={() => toast.info("App coming soon to the App Store!")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                <Apple className="h-4 w-4" /> App Store
              </button>
              <button onClick={() => toast.info("App coming soon to Google Play!")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                <Smartphone className="h-4 w-4" /> Google Play
              </button>
              <p className="text-xs text-muted-foreground mt-1">Coming soon.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PataNyumba. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
