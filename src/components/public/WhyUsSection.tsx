import { motion } from "framer-motion";
import { Check } from "lucide-react";

const metrics = [
  { value: "3+", label: "Years Building EU Products" },
  { value: "100%", label: "Remote-First Operation" },
  { value: "48h", label: "Average First Response" },
];

const differentiators = [
  "Client Portal Included",
  "French-Speaking Team",
  "AI-Native Stack",
  "Fixed-Price Projects",
];

const WhyUsSection = () => (
  <section id="about" className="py-24 px-4 bg-secondary/50">
    <div className="container max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-h1 font-semibold text-foreground mb-4">Why Choose Us</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <span className="font-display text-5xl font-bold text-accent-cyan">{m.value}</span>
            <p className="font-body text-text-secondary mt-2">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-4"
      >
        {differentiators.map((d) => (
          <div key={d} className="flex items-center gap-2 px-4 py-2 card-agency rounded-full">
            <Check className="text-success" size={16} />
            <span className="font-body text-sm text-foreground">{d}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default WhyUsSection;
