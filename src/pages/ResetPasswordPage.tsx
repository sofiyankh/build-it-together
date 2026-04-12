import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/portal");
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-body text-text-secondary">Invalid or expired reset link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-bg px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="card-agency p-8">
          <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Set New Password</h1>
          <p className="font-body text-sm text-text-secondary mb-8">Choose a strong password for your account.</p>
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-body text-sm text-text-secondary">New Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body focus:border-primary" />
            </div>
            <Button type="submit" className="w-full font-body font-medium" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
