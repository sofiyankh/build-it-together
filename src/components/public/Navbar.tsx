import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
        scrolled ? "glass-nav-scrolled" : "glass-nav"
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-1">
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            STUDIO
          </span>
          <span className="w-2 h-2 rounded-full bg-accent" />
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm font-medium text-text-secondary hover:text-foreground transition-colors relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-accent-cyan group-hover:w-full transition-all duration-200" />
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <a href="#" className="font-body text-sm text-text-secondary hover:text-accent-blue transition-colors">
            Client Login
          </a>
          <Button className="btn-glow font-body text-sm font-medium transition-all duration-150">
            Start a Project
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 top-16 bg-background/95 backdrop-blur-xl md:hidden z-40"
        >
          <div className="flex flex-col items-center gap-8 pt-16">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-body text-lg text-text-secondary hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button className="btn-glow font-body mt-4">Start a Project</Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
