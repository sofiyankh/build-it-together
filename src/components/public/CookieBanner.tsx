import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const STORAGE_KEY = "studio.cookie-consent";

type Consent = "accepted" | "rejected";

export const CookieBanner = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const decide = (c: Consent) => {
    localStorage.setItem(STORAGE_KEY, c);
    localStorage.setItem(`${STORAGE_KEY}.at`, new Date().toISOString());
    setVisible(false);
    // analytics scripts would gate on this value before loading
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[60]"
        >
          <div className="card-agency p-5 border border-border/60 backdrop-blur-xl bg-card/95 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                <Cookie size={16} className="text-accent-cyan" />
              </div>
              <div className="flex-1">
                <p className="font-body text-sm font-semibold text-foreground mb-1">{t("cookies.title")}</p>
                <p className="font-body text-xs text-text-secondary leading-relaxed">
                  {t("cookies.body")}{" "}
                  <Link to="/privacy" className="text-accent-cyan hover:underline">{t("cookies.privacyPolicy")}</Link>.
                </p>
              </div>
              <button onClick={() => decide("rejected")} className="text-text-muted hover:text-foreground" aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 font-body text-xs" onClick={() => decide("rejected")}>
                {t("cookies.reject")}
              </Button>
              <Button size="sm" className="flex-1 font-body text-xs" onClick={() => decide("accepted")}>
                {t("cookies.accept")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
