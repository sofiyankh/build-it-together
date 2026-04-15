import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

const categories = ["All", "SaaS", "AI Tool", "Web App", "MVP"];

const projects = [
  {
    id: "1", name: "TechFlow Dashboard", category: "SaaS",
    desc: "Full-stack analytics platform with real-time data streaming, team management, and custom reporting.",
    stack: ["React", "Node.js", "PostgreSQL", "WebSocket"],
    color: "from-accent-blue/20 to-accent-cyan/10",
  },
  {
    id: "2", name: "ContentAI", category: "AI Tool",
    desc: "AI-powered content generation platform with multi-language support, SEO optimization, and brand voice training.",
    stack: ["Next.js", "Python", "OpenAI", "Redis"],
    color: "from-purple-500/20 to-accent-blue/10",
  },
  {
    id: "3", name: "GreenLeaf E-commerce", category: "Web App",
    desc: "Sustainable fashion marketplace with smart filtering, AR try-on, and carbon footprint tracking.",
    stack: ["React", "Stripe", "Supabase", "Three.js"],
    color: "from-success/20 to-accent-cyan/10",
  },
  {
    id: "4", name: "HealthPulse", category: "MVP",
    desc: "Patient monitoring MVP with real-time vitals, doctor messaging, and appointment scheduling.",
    stack: ["React Native", "Firebase", "HL7", "Chart.js"],
    color: "from-destructive/20 to-warning/10",
  },
  {
    id: "5", name: "FinTrack Pro", category: "SaaS",
    desc: "Financial management SaaS for SMEs with automated invoicing, expense tracking, and tax reporting.",
    stack: ["Vue.js", "Django", "Stripe", "PostgreSQL"],
    color: "from-warning/20 to-accent-blue/10",
  },
  {
    id: "6", name: "WriteBot Studio", category: "AI Tool",
    desc: "AI writing assistant with real-time collaboration, grammar checking, and tone adjustment.",
    stack: ["React", "GPT-4", "Socket.io", "MongoDB"],
    color: "from-accent-cyan/20 to-purple-500/10",
  },
];

const PortfolioPage = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-16 grid-bg">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-accent-cyan/5 blur-[100px] animate-float-slow" />
        </div>
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-cyan text-xs font-body px-3 py-1 rounded-full mb-6 inline-block">Portfolio</span>
            <h1 className="font-display text-h1 font-bold text-foreground mb-4">
              Work that <span className="text-gradient-cyan">speaks</span> for itself.
            </h1>
            <p className="font-body text-lg text-text-secondary max-w-2xl">
              A selection of projects we've built for startups and enterprises alike.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="container">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-5 py-2 rounded-full font-body text-sm transition-all duration-150 ${
                  active === c
                    ? "bg-primary/20 text-foreground border border-primary/40"
                    : "bg-secondary text-text-secondary border border-border hover:border-primary/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-20">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-agency overflow-hidden group cursor-pointer"
                >
                  {/* Gradient placeholder */}
                  <div className={`h-48 bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                    <span className="font-display text-2xl font-bold text-foreground/30">{p.name.split(" ")[0]}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-body text-sm font-bold text-foreground">{p.name}</h3>
                      <ArrowUpRight size={16} className="text-text-muted group-hover:text-accent-cyan transition-colors" />
                    </div>
                    <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full mb-3 inline-block">{p.category}</span>
                    <p className="font-body text-sm text-text-secondary mb-4 line-clamp-2">{p.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.stack.map((s) => (
                        <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-text-muted border border-border">{s}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container">
          <div className="card-agency p-10 text-center" style={{ background: "linear-gradient(135deg, hsl(221 83% 53% / 0.1) 0%, hsl(187 92% 43% / 0.05) 100%)" }}>
            <h2 className="font-display text-h2 font-bold text-foreground mb-3">Want something like this?</h2>
            <p className="font-body text-text-secondary mb-6">Let's build your next product together.</p>
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
};

export default PortfolioPage;
