import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const SignupPage = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account!");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-bg px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-accent-blue/5 blur-[100px] animate-float-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-accent-cyan/5 blur-[80px] animate-float-slower" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors font-body text-sm mb-8">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="card-agency p-8">
          <div className="flex items-center gap-1 mb-2">
            <span className="font-display text-xl font-bold text-foreground tracking-tight">STUDIO</span>
            <span className="w-2 h-2 rounded-full bg-accent" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Create Account</h1>
          <p className="font-body text-sm text-text-secondary mb-8">
            Join as a client and track your projects.
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-body text-sm text-text-secondary">Full Name</Label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jean Dupont"
                required
                className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm text-text-secondary">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm text-text-secondary">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body pr-10 focus:border-primary focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-glow font-body font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="text-accent-blue hover:text-accent-cyan transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
