import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { Plus, MoreVertical, ShieldOff, ShieldCheck, KeyRound, Trash2, UserCog, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Role = "admin" | "developer" | "designer" | "client";

interface Row {
  client_id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  company_name: string | null;
  country: string;
  status: string;
  created_at: string;
  role: Role;
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    active: "bg-success/10 text-success border-success/30",
    paused: "bg-warning/10 text-warning border-warning/30",
    churned: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return map[s] || map.active;
};

const AdminClients = () => {
  const { session } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", display_name: "", company_name: "", role: "client" as Role });

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  // Role change
  const [roleTarget, setRoleTarget] = useState<Row | null>(null);
  const [newRole, setNewRole] = useState<Role>("client");

  const load = async () => {
    setLoading(true);
    const { data: clients } = await supabase
      .from("clients")
      .select("id, user_id, company_name, country, status, created_at")
      .order("created_at", { ascending: false });
    if (!clients) { setLoading(false); return; }

    const userIds = clients.map((c) => c.user_id);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name").in("user_id", userIds),
      supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
    ]);
    const pMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));
    const rMap = new Map((roles ?? []).map((r) => [r.user_id, r.role as Role]));

    setRows(clients.map((c) => ({
      client_id: c.id,
      user_id: c.user_id,
      display_name: pMap.get(c.user_id) ?? null,
      email: null,
      company_name: c.company_name,
      country: c.country,
      status: c.status,
      created_at: c.created_at,
      role: rMap.get(c.user_id) ?? "client",
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const callFn = async (name: string, body: Record<string, unknown>): Promise<boolean> => {
    if (!session) { toast.error("Not authenticated"); return false; }
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (error || (data && data.error)) {
      toast.error((data?.error as string) || error?.message || "Action failed");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!form.email || form.password.length < 8) {
      toast.error("Email + 8+ char password required"); return;
    }
    setBusyId("create");
    const ok = await callFn("admin-create-user", form);
    setBusyId(null);
    if (ok) {
      toast.success("User created");
      setCreateOpen(false);
      setForm({ email: "", password: "", display_name: "", company_name: "", role: "client" });
      load();
    }
  };

  const handleSuspend = async (r: Row, hours: number) => {
    setBusyId(r.user_id);
    const ok = await callFn("admin-update-user", { user_id: r.user_id, action: "suspend", ban_hours: hours });
    setBusyId(null);
    if (ok) { toast.success(`Suspended for ${hours}h`); load(); }
  };

  const handleReactivate = async (r: Row) => {
    setBusyId(r.user_id);
    const ok = await callFn("admin-update-user", { user_id: r.user_id, action: "reactivate" });
    setBusyId(null);
    if (ok) { toast.success("Reactivated"); load(); }
  };

  const handleResetPwd = async (r: Row) => {
    setBusyId(r.user_id);
    const ok = await callFn("admin-update-user", { user_id: r.user_id, action: "reset_password" });
    setBusyId(null);
    if (ok) toast.success("Password reset email sent");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.user_id);
    const ok = await callFn("admin-delete-user", { user_id: deleteTarget.user_id });
    setBusyId(null);
    if (ok) { toast.success("User deleted"); setDeleteTarget(null); load(); }
  };

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setBusyId(roleTarget.user_id);
    const ok = await callFn("admin-assign-role", { user_id: roleTarget.user_id, role: newRole });
    setBusyId(null);
    if (ok) { toast.success(`Role updated to ${newRole}`); setRoleTarget(null); load(); }
  };

  const filtered = rows.filter((r) =>
    (r.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.company_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted mb-1">[02] CLIENTS</h1>
        <h2 className="font-display text-h2 font-bold text-foreground">User Management</h2>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or company…"
            className="pl-9 h-9 font-mono text-xs"
          />
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-mono text-xs uppercase tracking-wider bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              <Plus size={14} className="mr-1" /> New User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Create user account</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider">Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider">Temporary password</Label>
                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="text" placeholder="min 8 characters" />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider">Display name</Label>
                <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider">Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.role === "client" && (
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-wider">Company (optional)</Label>
                  <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={busyId === "create"} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {busyId === "create" ? "Creating…" : "Create user"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card/60 backdrop-blur">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["NAME", "ROLE", "COMPANY", "STATUS", "JOINED", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center font-mono text-xs text-text-muted">Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center font-mono text-xs text-text-muted">No users found</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.client_id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-body text-sm text-foreground">{r.display_name || "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-accent-cyan">{r.role}</span>
                </td>
                <td className="px-4 py-3 font-body text-xs text-text-secondary">{r.company_name || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${statusBadge(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 font-mono text-[10px] text-text-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button disabled={busyId === r.user_id} className="p-1.5 rounded hover:bg-secondary text-text-muted hover:text-foreground disabled:opacity-50">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem onClick={() => { setRoleTarget(r); setNewRole(r.role); }}>
                        <UserCog size={14} className="mr-2" /> Change role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPwd(r)}>
                        <KeyRound size={14} className="mr-2" /> Send password reset
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSuspend(r, 168)}>
                        <ShieldOff size={14} className="mr-2" /> Suspend 7 days
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReactivate(r)}>
                        <ShieldCheck size={14} className="mr-2" /> Reactivate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteTarget(r)} className="text-destructive focus:text-destructive">
                        <Trash2 size={14} className="mr-2" /> Delete account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role change dialog */}
      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-display">Change role for {roleTarget?.display_name}</DialogTitle></DialogHeader>
          <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRoleTarget(null)}>Cancel</Button>
            <Button onClick={handleRoleChange} disabled={busyId === roleTarget?.user_id}>Update role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete {deleteTarget?.display_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the user and all their projects, invoices, messages, and tickets. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminClients;
