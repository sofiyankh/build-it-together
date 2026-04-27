import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";

const useNavLinks = () => {
  const { t } = useTranslation();
  return [
    { label: t("nav.services"), href: "#services" },
    { label: t("nav.portfolio"), href: "/portfolio" },
    { label: t("nav.pricing"), href: "#pricing" },
    { label: t("nav.about"), href: "/about" },
  ];
};

const Navbar = () => {
  const { t } = useTranslation();
  const navLinks = useNavLinks();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const renderLink = (link: { label: string; href: string }, className: string, onClick?: () => void) => {
    if (link.href.startsWith("#")) {
      return (
        <a key={link.label} href={link.href} onClick={onClick} className={className}>
          {link.label}
          <span className="absolute bottom-0 left-0 w-0 h-px bg-accent-cyan group-hover:w-full transition-all duration-200" />
        </a>
      );
    }
    return (
      <Link key={link.label} to={link.href} onClick={onClick} className={className}>
        {link.label}
        <span className="absolute bottom-0 left-0 w-0 h-px bg-accent-cyan group-hover:w-full transition-all duration-200" />
      </Link>
    );
  };

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
        <Link to="/" className="flex items-center gap-1">
          <span className="font-display text-xl font-bold text-foreground tracking-tight">STUDIO</span>
          <span className="w-2 h-2 rounded-full bg-accent" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            renderLink(link, "font-body text-sm font-medium text-text-secondary hover:text-foreground transition-colors relative group")
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <LanguageToggle />
          <Link to="/login" className="font-body text-sm text-text-secondary hover:text-accent-blue transition-colors">
            {t("nav.clientLogin")}
          </Link>
          <Link to="/contact">
            <Button className="btn-glow font-body text-sm font-medium transition-all duration-150">
              {t("nav.startProject")}
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 top-16 bg-background/95 backdrop-blur-xl md:hidden z-40"
        >
          <div className="flex flex-col items-center gap-8 pt-16">
            {navLinks.map((link) =>
              renderLink(link, "font-body text-lg text-text-secondary hover:text-foreground transition-colors", () => setMobileOpen(false))
            )}
            <Link to="/login" onClick={() => setMobileOpen(false)} className="font-body text-lg text-text-secondary hover:text-foreground transition-colors">
              {t("nav.clientLogin")}
            </Link>
            <LanguageToggle />
            <Link to="/contact" onClick={() => setMobileOpen(false)}>
              <Button className="btn-glow font-body mt-4">{t("nav.startProject")}</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
