import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export const LanguageToggle = ({ variant = "nav" }: { variant?: "nav" | "compact" }) => {
  const { i18n } = useTranslation();
  const cur = (i18n.resolvedLanguage || "en").startsWith("fr") ? "fr" : "en";
  const next = cur === "en" ? "fr" : "en";

  const label = cur.toUpperCase();

  if (variant === "compact") {
    return (
      <button
        onClick={() => i18n.changeLanguage(next)}
        className="font-mono text-[10px] text-text-muted hover:text-foreground uppercase tracking-widest flex items-center gap-1"
        aria-label="Toggle language"
      >
        <Globe size={12} /> {label}
      </button>
    );
  }

  return (
    <button
      onClick={() => i18n.changeLanguage(next)}
      className="font-body text-sm text-text-secondary hover:text-foreground transition-colors flex items-center gap-1.5"
      aria-label="Toggle language"
    >
      <Globe size={14} /> {label}
    </button>
  );
};

export default LanguageToggle;
