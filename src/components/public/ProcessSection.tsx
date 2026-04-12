import { motion } from "framer-motion";
import { Phone, FileText, Palette, Code, TestTube, Rocket } from "lucide-react";

const steps = [
  { icon: Phone, num: "01", title: "Discovery Call", desc: "Understand your vision and goals" },
  { icon: FileText, num: "02", title: "Project Proposal", desc: "Scope, timeline, and fixed price" },
  { icon: Palette, num: "03", title: "Design Phase", desc: "UI/UX prototypes you approve" },
  { icon: Code, num: "04", title: "Development", desc: "Agile sprints with weekly demos" },
  { icon: TestTube, num: "05", title: "Testing", desc: "QA, performance, and security" },
  { icon: Rocket, num: "06", title: "Launch", desc: "Deployment and handover" },
];

const ProcessSection = () => (
  <section className="py-24 px-4">
    <div className="container max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-h1 font-semibold text-foreground mb-4">How It Works</h2>
        <p className="font-body text-text-secondary max-w-md mx-auto">
          A proven 6-step process from idea to live product.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary mb-4">
              <s.icon className="text-accent-cyan" size={22} strokeWidth={1.5} />
              <span className="absolute -top-2 -right-2 font-mono text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded-md border border-border">
                {s.num}
              </span>
            </div>
            <h3 className="font-body text-sm font-bold text-foreground mb-1">{s.title}</h3>
            <p className="font-body text-xs text-text-secondary">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;
