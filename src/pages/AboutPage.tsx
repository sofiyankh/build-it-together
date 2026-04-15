import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Target, Sparkles, Globe } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

const values = [
  { icon: Target, title: "Precision", desc: "Every pixel, every line of code — crafted with intention and purpose." },
  { icon: Sparkles, title: "Innovation", desc: "We push boundaries with the latest frameworks and AI-driven tooling." },
  { icon: Users, title: "Partnership", desc: "Your success is our success. We work as an extension of your team." },
  { icon: Globe, title: "Global Reach", desc: "Based in Paris, serving clients across Europe and beyond." },
];

const team = [
  { name: "Alex Moreau", role: "Founder & Lead Developer", initials: "AM" },
  { name: "Sarah Chen", role: "Senior Full-Stack Engineer", initials: "SC" },
  { name: "Lucas Petit", role: "UI/UX Designer", initials: "LP" },
  { name: "Nina Weber", role: "Project Manager", initials: "NW" },
  { name: "Tom Bernard", role: "DevOps Engineer", initials: "TB" },
  { name: "Léa Martin", role: "AI/ML Specialist", initials: "LM" },
];

const item = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="relative pt-32 pb-20 overflow-hidden grid-bg">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-accent-blue/5 blur-[120px] animate-float-slow" />
      </div>
      <div className="container relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <span className="badge-cyan text-xs font-body px-3 py-1 rounded-full mb-6 inline-block">About Us</span>
          <h1 className="font-display text-h1 font-bold text-foreground mb-4">
            We build digital products that <span className="text-gradient-cyan">matter</span>.
          </h1>
          <p className="font-body text-lg text-text-secondary max-w-2xl">
            STUDIO is a boutique development agency specializing in SaaS, AI tools, and custom web applications. We combine technical excellence with elegant design to deliver products that scale.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Values */}
    <section className="py-20">
      <div className="container">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-display text-h2 font-bold text-foreground mb-10">
          Our Values
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div key={v.title} variants={item} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-agency p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <v.icon size={20} className="text-accent-cyan" />
              </div>
              <h3 className="font-body text-sm font-bold text-foreground mb-2">{v.title}</h3>
              <p className="font-body text-sm text-text-secondary">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="py-20">
      <div className="container">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-display text-h2 font-bold text-foreground mb-3">
          The Team
        </motion.h2>
        <p className="font-body text-text-secondary mb-10 max-w-xl">A small, senior team that ships fast and communicates clearly.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((t, i) => (
            <motion.div key={t.name} variants={item} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card-agency p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-display font-bold text-foreground shrink-0">
                {t.initials}
              </div>
              <div>
                <p className="font-body text-sm font-bold text-foreground">{t.name}</p>
                <p className="font-body text-xs text-text-secondary">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="container">
        <div className="card-agency p-10 text-center" style={{ background: "linear-gradient(135deg, hsl(221 83% 53% / 0.1) 0%, hsl(187 92% 43% / 0.05) 100%)" }}>
          <h2 className="font-display text-h2 font-bold text-foreground mb-3">Ready to work together?</h2>
          <p className="font-body text-text-secondary mb-6 max-w-md mx-auto">Let's turn your vision into a product users love.</p>
          <Link to="/contact">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center px-8 py-3 rounded-lg bg-primary text-primary-foreground font-body font-medium btn-glow transition-all">
              Start a Project
            </motion.button>
          </Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default AboutPage;
