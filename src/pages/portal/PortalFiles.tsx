import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { FileText, Image, FileSpreadsheet, Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const fileIcons: Record<string, typeof FileText> = {
  pdf: FileText, png: Image, jpg: Image, jpeg: Image, xlsx: FileSpreadsheet, csv: FileSpreadsheet,
};

interface StoredFile {
  name: string;
  id: string;
  created_at: string;
  metadata: { size: number; mimetype: string };
}

const PortalFiles = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const folder = user?.id ?? "";

  const loadFiles = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.storage.from("client-files").list(folder, { sortBy: { column: "created_at", order: "desc" } });
    setFiles((data as unknown as StoredFile[]) ?? []);
  }, [user, folder]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || !user) return;
    setUploading(true);
    for (const file of Array.from(fileList)) {
      const { error } = await supabase.storage.from("client-files").upload(`${folder}/${file.name}`, file, { upsert: true });
      if (error) toast.error(`Failed to upload ${file.name}: ${error.message}`);
    }
    toast.success("Upload complete!");
    setUploading(false);
    loadFiles();
    e.target.value = "";
  };

  const handleDownload = async (fileName: string) => {
    const { data, error } = await supabase.storage.from("client-files").download(`${folder}/${fileName}`);
    if (error || !data) { toast.error("Download failed"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (fileName: string) => {
    await supabase.storage.from("client-files").remove([`${folder}/${fileName}`]);
    toast.success("File deleted");
    loadFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-foreground">Files</h1>
        <label>
          <input type="file" multiple className="hidden" onChange={handleUpload} />
          <Button className="font-body text-sm cursor-pointer" asChild disabled={uploading}>
            <span><Upload size={16} className="mr-2" /> {uploading ? "Uploading..." : "Upload Files"}</span>
          </Button>
        </label>
      </div>

      {/* Drop zone */}
      <label className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent-blue transition-colors cursor-pointer block">
        <input type="file" multiple className="hidden" onChange={handleUpload} />
        <Upload size={24} className="mx-auto text-text-muted mb-2" />
        <p className="font-body text-sm text-text-secondary">Drag and drop files here, or click to browse</p>
        <p className="font-body text-[10px] text-text-muted mt-1">PDF, DOCX, PNG, JPG, ZIP — max 50MB</p>
      </label>

      {files.length === 0 ? (
        <div className="card-agency p-10 text-center">
          <FileText size={32} className="mx-auto text-text-muted mb-3" />
          <p className="font-body text-sm text-text-secondary">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map((f, i) => {
            const ext = f.name.split(".").pop()?.toLowerCase() || "";
            const Icon = fileIcons[ext] || FileText;
            return (
              <motion.div key={f.id || f.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-agency p-4 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-accent-cyan" />
                </div>
                <p className="font-body text-sm font-medium text-foreground truncate mb-1">{f.name}</p>
                <p className="font-body text-[10px] text-text-muted">
                  {f.metadata?.size ? formatSize(f.metadata.size) : ""} · {new Date(f.created_at).toLocaleDateString()}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button onClick={() => handleDownload(f.name)} className="flex items-center gap-1 text-[10px] font-body text-text-muted hover:text-accent-cyan transition-colors">
                    <Download size={12} /> Download
                  </button>
                  <button onClick={() => handleDelete(f.name)} className="flex items-center gap-1 text-[10px] font-body text-text-muted hover:text-destructive transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortalFiles;
