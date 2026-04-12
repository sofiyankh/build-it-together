import { motion } from "framer-motion";
import { Layers, Brain, Globe, Rocket, Link, Shield } from "lucide-react";

const services = [
  { icon: Layers, title: "SaaS Development", desc: "Full-stack SaaS products from MVP to scale" },
  { icon: Brain, title: "AI Automation", desc: "Custom AI tools and workflow automation" },
  { icon: Globe, title: "Web Applications", desc: "Complex web apps and internal tools" },
  { icon: Rocket, title: "MVP Development", desc: "0-to-1 product launches in 4–6 weeks" },
  { icon: Link, title: "API Integration", desc: "Third-party integrations and microservices" },
  { icon: Shield, title: "Maintenance & Support", desc: "Retainer plans for ongoing development" },
];

const container = {
  animate: { transition: { staggerChildren: 0.07 } },
};
const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const ServicesSection = () => (
  <section id="services" className="py-24 px-4">
    <div className="container max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-h1 font-semibold text-foreground mb-4">What We Build</h2>
        <p className="font-body text-text-secondary max-w-lg mx-auto">
          End-to-end development services for ambitious European companies.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {services.map((s) => (
          <motion.div
            key={s.title}
            variants={item}
            className="card-agency p-6 group cursor-pointer"
          >
            <s.icon className="text-accent-cyan mb-4" size={28} strokeWidth={1.5} />
            <h3 className="font-body text-lg font-bold text-foreground mb-2">{s.title}</h3>
            <p className="font-body text-sm text-text-secondary">{s.desc}</p>
            <span className="inline-flex items-center gap-1 mt-4 text-sm text-text-muted group-hover:text-accent-cyan transition-colors font-body">
              Learn more →
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default ServicesSection;
