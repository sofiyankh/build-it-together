import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

const PortalSettings = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 2FA state
  const [mfaFactors, setMfaFactors] = useState<Array<{ id: string; status: string; friendly_name?: string }>>([]);
  const [enrollment, setEnrollment] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name || "");
        setPhone(data.phone || "");
        setJobTitle(data.job_title || "");
      }
      setLoaded(true);
    });
  }, [user]);

  const refreshFactors = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setMfaFactors((data?.totp ?? []) as typeof mfaFactors);
  }, []);

  useEffect(() => { refreshFactors(); }, [refreshFactors]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName, phone, job_title: jobTitle,
    }).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Settings saved!");
    setSaving(false);
  };

  const startEnroll = async () => {
    setMfaBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${Date.now()}` });
    setMfaBusy(false);
    if (error || !data) { toast.error(error?.message || "Could not start 2FA enrollment"); return; }
    setEnrollment({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const finishEnroll = async () => {
    if (!enrollment) return;
    setMfaBusy(true);
    const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId: enrollment.id });
    if (chalErr || !chal) { setMfaBusy(false); toast.error(chalErr?.message || "Challenge failed"); return; }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId: enrollment.id, challengeId: chal.id, code: verifyCode });
    setMfaBusy(false);
    if (vErr) { toast.error(vErr.message); return; }
    toast.success("Two-factor authentication enabled");
    setEnrollment(null); setVerifyCode("");
    refreshFactors();
  };

  const disableFactor = async (id: string) => {
    setMfaBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setMfaBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("2FA disabled");
    refreshFactors();
  };

  const verifiedFactor = mfaFactors.find((f) => f.status === "verified");

  if (!loaded) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-h2 font-bold text-foreground">Settings</h1>

      <div className="card-agency p-6 space-y-5">
        <h2 className="font-body text-sm font-bold text-foreground">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-body text-xs text-text-secondary">Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary border-border text-foreground font-body" />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-xs text-text-secondary">Email</Label>
            <Input value={user?.email || ""} disabled className="bg-secondary border-border text-text-muted font-body" />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-xs text-text-secondary">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body" />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-xs text-text-secondary">Job Title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Product Manager" className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="font-body text-sm">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Security / 2FA */}
      <div className="card-agency p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-accent-cyan" />
          <h2 className="font-body text-sm font-bold text-foreground">Two-Factor Authentication</h2>
        </div>
        <p className="font-body text-xs text-text-secondary">
          Protect your account with a TOTP code from an authenticator app (Google Authenticator, 1Password, Authy).
        </p>

        {verifiedFactor ? (
          <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/5 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-success" />
              <span className="font-mono text-xs text-foreground">2FA enabled</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => disableFactor(verifiedFactor.id)} disabled={mfaBusy}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 font-body text-xs">
              <ShieldOff size={12} className="mr-1" /> Disable
            </Button>
          </div>
        ) : enrollment ? (
          <div className="space-y-3">
            <p className="font-body text-xs text-text-secondary">Scan this QR code in your authenticator app, then enter the 6-digit code.</p>
            <div className="flex justify-center bg-white p-4 rounded-lg">
              <img src={enrollment.qr} alt="TOTP QR" className="w-44 h-44" />
            </div>
            <p className="font-mono text-[10px] text-text-muted text-center break-all">Secret: {enrollment.secret}</p>
            <Input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456" className="bg-secondary border-border text-foreground font-mono text-center tracking-widest" />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 font-body text-xs" onClick={() => { setEnrollment(null); setVerifyCode(""); }}>Cancel</Button>
              <Button className="flex-1 font-body text-xs" onClick={finishEnroll} disabled={mfaBusy || verifyCode.length !== 6}>
                {mfaBusy ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={startEnroll} disabled={mfaBusy} className="font-body text-sm">
            {mfaBusy ? "Starting..." : "Enable 2FA"}
          </Button>
        )}
      </div>

      <div className="card-agency p-6 border-destructive/30">
        <h2 className="font-body text-sm font-bold text-destructive mb-2">Danger Zone</h2>
        <p className="font-body text-xs text-text-secondary mb-4">Request account deletion. This will send a request to our team.</p>
        <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 font-body text-sm">
          Request Account Deletion
        </Button>
      </div>
    </div>
  );
};

export default PortalSettings;
