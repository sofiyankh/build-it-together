import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const projectTypes = ["SaaS", "AI Tool", "Web App", "MVP", "API Integration", "Maintenance"];
const budgetRanges = ["< €5K", "€5K – €15K", "€15K – €50K", "€50K – €100K", "€100K+"];
const timelines = ["< 1 month", "1 – 3 months", "3 – 6 months", "6+ months", "Ongoing"];

const countries = [
  "France", "Germany", "United Kingdom", "United States", "Netherlands",
  "Belgium", "Spain", "Italy", "Switzerland", "Canada", "Australia", "Other",
];

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "", email: "", company: "", country: "", phone: "",
    projectType: [] as string[], budget: "", timeline: "", description: "",
    gdpr: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const toggleProjectType = (t: string) => {
    set("projectType", form.projectType.includes(t) ? form.projectType.filter((x) => x !== t) : [...form.projectType, t]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!form.gdpr) {
      toast.error("Please accept the privacy policy.");
      return;
    }
    setSubmitted(true);
    toast.success("Project request submitted!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-bg px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h1 className="font-display text-h2 font-bold text-foreground mb-3">Request Received!</h1>
          <p className="font-body text-text-secondary mb-6">We'll review your project details and get back to you within 24 hours.</p>
          <Link to="/">
            <Button className="btn-glow font-body">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-accent-blue/5 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full bg-accent-cyan/5 blur-[100px] animate-float-slower" />
      </div>

      <div className="container relative z-10 py-24 lg:py-32">
        <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors font-body text-sm mb-10">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Form — left 3 cols */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
            <h1 className="font-display text-h1 font-bold text-foreground mb-2">Start a Project</h1>
            <p className="font-body text-text-secondary mb-10">Tell us about your vision — we'll take it from there.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name + Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-body text-sm text-text-secondary">Full Name *</Label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="John Doe" required className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm text-text-secondary">Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" required className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body" />
                </div>
              </div>

              {/* Company + Country */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-body text-sm text-text-secondary">Company</Label>
                  <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Inc." className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm text-text-secondary">Country</Label>
                  <select
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className="w-full h-10 rounded-md border border-border bg-secondary text-foreground font-body text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="font-body text-sm text-text-secondary">Phone</Label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+33 6 12 34 56 78" className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body" />
              </div>

              {/* Project Type Pills */}
              <div className="space-y-3">
                <Label className="font-body text-sm text-text-secondary">Project Type</Label>
                <div className="flex flex-wrap gap-2">
                  {projectTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleProjectType(t)}
                      className={`px-4 py-2 rounded-full font-body text-sm transition-all duration-150 ${
                        form.projectType.includes(t)
                          ? "bg-primary/20 text-foreground border border-primary/40"
                          : "bg-secondary text-text-secondary border border-border hover:border-primary/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget + Timeline */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="font-body text-sm text-text-secondary">Budget Range</Label>
                  <div className="flex flex-wrap gap-2">
                    {budgetRanges.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => set("budget", b)}
                        className={`px-3 py-1.5 rounded-full font-body text-xs transition-all duration-150 ${
                          form.budget === b
                            ? "bg-accent-cyan/20 text-foreground border border-accent-cyan/40"
                            : "bg-secondary text-text-secondary border border-border hover:border-accent-cyan/30"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="font-body text-sm text-text-secondary">Timeline</Label>
                  <div className="flex flex-wrap gap-2">
                    {timelines.map((tl) => (
                      <button
                        key={tl}
                        type="button"
                        onClick={() => set("timeline", tl)}
                        className={`px-3 py-1.5 rounded-full font-body text-xs transition-all duration-150 ${
                          form.timeline === tl
                            ? "bg-accent-cyan/20 text-foreground border border-accent-cyan/40"
                            : "bg-secondary text-text-secondary border border-border hover:border-accent-cyan/30"
                        }`}
                      >
                        {tl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="font-body text-sm text-text-secondary">Project Description *</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Tell us about your project goals, target audience, key features, and any specific requirements..."
                  required
                  rows={5}
                  className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body resize-none"
                />
              </div>

              {/* GDPR */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.gdpr}
                  onChange={(e) => set("gdpr", e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border bg-secondary accent-primary"
                />
                <span className="font-body text-xs text-text-secondary">
                  I agree to the processing of my personal data in accordance with the{" "}
                  <a href="#" className="text-accent-blue hover:text-accent-cyan transition-colors">Privacy Policy</a>. *
                </span>
              </label>

              <Button type="submit" className="btn-glow font-body font-medium w-full sm:w-auto px-8">
                <Send size={16} className="mr-2" /> Submit Project Request
              </Button>
            </form>
          </motion.div>

          {/* Right sidebar — info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-8">
            <div className="card-agency p-6">
              <h3 className="font-body text-sm font-bold text-foreground mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Mail size={16} className="text-accent-cyan" /></div>
                  <div>
                    <p className="font-body text-xs text-text-muted">Email</p>
                    <p className="font-body text-sm text-foreground">hello@studio.dev</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Phone size={16} className="text-accent-cyan" /></div>
                  <div>
                    <p className="font-body text-xs text-text-muted">Phone</p>
                    <p className="font-body text-sm text-foreground">+33 1 23 45 67 89</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><MapPin size={16} className="text-accent-cyan" /></div>
                  <div>
                    <p className="font-body text-xs text-text-muted">Location</p>
                    <p className="font-body text-sm text-foreground">Paris, France</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-agency p-6">
              <h3 className="font-body text-sm font-bold text-foreground mb-4">What Happens Next?</h3>
              <ol className="space-y-3">
                {[
                  { step: "01", text: "We review your project details within 24h" },
                  { step: "02", text: "Schedule a free discovery call" },
                  { step: "03", text: "Receive a detailed proposal & timeline" },
                  { step: "04", text: "Kick off development!" },
                ].map((s) => (
                  <li key={s.step} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-accent-cyan font-bold mt-0.5">{s.step}</span>
                    <span className="font-body text-sm text-text-secondary">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Testimonial */}
            <div className="card-agency p-6">
              <p className="font-body text-sm text-text-secondary italic mb-4">
                "Working with STUDIO transformed our idea into a production-ready SaaS in just 3 months. The portal kept us in the loop at every step."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-xs font-body font-bold text-accent-cyan">M</div>
                <div>
                  <p className="font-body text-sm font-medium text-foreground">Marie Laurent</p>
                  <p className="font-body text-xs text-text-muted">CEO, TechFlow</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
