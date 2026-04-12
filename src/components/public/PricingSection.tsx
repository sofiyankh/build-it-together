import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "€4,900",
    desc: "Perfect for MVPs and landing pages",
    features: ["Single web application", "Up to 5 pages", "Responsive design", "Basic SEO", "2 revision rounds", "4-week delivery"],
    popular: false,
  },
  {
    name: "Growth",
    price: "€14,900",
    desc: "For SaaS products and complex apps",
    features: ["Full SaaS application", "Auth + dashboard", "Database + API", "Payment integration", "Client portal access", "8-week delivery"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Large-scale platforms and AI tools",
    features: ["Custom architecture", "AI/ML integration", "Multi-tenant system", "Advanced security", "Dedicated team", "Ongoing retainer"],
    popular: false,
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-24 px-4">
    <div className="container max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-h1 font-semibold text-foreground mb-4">Transparent Pricing</h2>
        <p className="font-body text-text-secondary max-w-md mx-auto">
          Fixed-price packages. No hourly billing surprises.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`card-agency p-8 flex flex-col relative ${
              p.popular ? "border-accent-blue scale-[1.02] shadow-[0_0_30px_rgba(37,99,235,0.15)]" : ""
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-cyan text-xs font-body font-medium px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="font-body text-lg font-bold text-foreground">{p.name}</h3>
            <div className="mt-4 mb-2">
              <span className="font-display text-4xl font-bold text-foreground">{p.price}</span>
            </div>
            <p className="font-body text-sm text-text-secondary mb-6">{p.desc}</p>
            <ul className="flex-1 space-y-3 mb-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="text-success shrink-0" size={16} />
                  <span className="font-body text-sm text-text-secondary">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`w-full font-body font-medium ${
                p.popular ? "btn-glow" : ""
              }`}
              variant={p.popular ? "default" : "outline"}
            >
              Get Started
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
