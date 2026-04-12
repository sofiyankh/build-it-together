import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-bg px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors font-body text-sm mb-8">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <div className="card-agency p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="text-accent-blue" size={24} />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">Check your email</h2>
              <p className="font-body text-sm text-text-secondary">We sent a password reset link to {email}</p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Reset Password</h1>
              <p className="font-body text-sm text-text-secondary mb-8">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-body text-sm text-text-secondary">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body focus:border-primary" />
                </div>
                <Button type="submit" className="w-full font-body font-medium" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
