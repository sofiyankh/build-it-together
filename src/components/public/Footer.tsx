import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const footerLinks = {
    [t("nav.services")]: ["SaaS Development", "AI Automation", "Web Applications", "MVP Development", "API Integration", "Maintenance"],
    Company: [t("nav.about"), t("nav.portfolio"), t("nav.pricing"), "Blog", "Careers"],
    [t("nav.contact")]: ["hello@studio.dev", "LinkedIn", "Twitter / X"],
  };

  return (
    <footer className="border-t border-border py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="font-display text-xl font-bold text-foreground tracking-tight">STUDIO</span>
              <span className="w-2 h-2 rounded-full bg-accent" />
            </div>
            <p className="font-body text-sm text-text-secondary leading-relaxed">{t("footer.tagline")}</p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-body text-sm font-bold text-foreground mb-4">{group}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-body text-sm text-text-secondary hover:text-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-text-muted">© 2026 Studio. {t("footer.rights")}</p>
          <div className="flex gap-6">
            <a href="#" className="font-body text-xs text-text-muted hover:text-foreground transition-colors">{t("footer.privacy")}</a>
            <a href="#" className="font-body text-xs text-text-muted hover:text-foreground transition-colors">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
