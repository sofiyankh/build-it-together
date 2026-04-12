import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-accent-blue/10 blur-[100px] animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent-cyan/10 blur-[80px] animate-float-slower" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-accent-blue/5 blur-[60px] animate-float-slow" />
      </div>

      <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="badge-cyan inline-block px-4 py-1.5 rounded-full text-xs font-body font-medium uppercase tracking-widest">
            AI + SaaS Development Agency
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-hero font-bold leading-[1.05] mt-8 mb-6 text-foreground"
        >
          We Build Products
          <br />
          <span className="text-gradient-cyan">European Startups Love</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="font-body text-lg text-text-secondary max-w-xl mx-auto mb-10"
        >
          Full-stack SaaS, AI tools, and web applications — designed and built by a
          French-speaking team for the European market.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" className="btn-glow font-body font-medium text-base px-8 py-3 animate-pulse-glow">
            Start Your Project
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="font-body font-medium text-base px-8 py-3 border-border text-text-secondary hover:text-foreground hover:border-accent-blue transition-all"
          >
            See Our Work
          </Button>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-16 flex items-center justify-center gap-6 text-text-muted font-body text-sm"
        >
          <span>🇫🇷</span>
          <span>🇩🇪</span>
          <span>🇧🇪</span>
          <span>🇨🇭</span>
          <span className="ml-2">3+ years building for EU clients</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="text-text-muted" size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
