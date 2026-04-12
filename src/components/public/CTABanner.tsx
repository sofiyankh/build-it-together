import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CTABanner = () => (
  <section className="py-24 px-4">
    <div className="container max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl p-12 md:p-16 text-center"
        style={{
          background: "linear-gradient(135deg, hsl(221 83% 53%) 0%, hsl(187 92% 43%) 100%)",
        }}
      >
        <h2 className="font-display text-h1 font-bold text-primary-foreground mb-4">
          Ready to Build Something Great?
        </h2>
        <p className="font-body text-lg text-primary-foreground/80 max-w-lg mx-auto mb-8">
          Let's discuss your project. Free discovery call — no commitment, just clarity.
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="font-body font-medium text-base px-8 bg-background text-foreground hover:bg-background/90"
        >
          Book a Free Call
        </Button>
      </motion.div>
    </div>
  </section>
);

export default CTABanner;
