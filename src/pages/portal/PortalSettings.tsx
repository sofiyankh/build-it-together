import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PortalSettings = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    toast.success("Settings saved!");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-h2 font-bold text-foreground">Settings</h1>

      {/* Profile */}
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
        </div>
        <Button onClick={handleSave} className="font-body text-sm">Save Changes</Button>
      </div>

      {/* Danger Zone */}
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
