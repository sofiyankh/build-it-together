import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PortalSettings = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName,
      phone,
      job_title: jobTitle,
    }).eq("user_id", user.id);

    if (error) toast.error(error.message);
    else toast.success("Settings saved!");
    setSaving(false);
  };

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
