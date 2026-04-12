import { motion } from "framer-motion";
import { FileText, Image, FileSpreadsheet, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const fileIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  png: Image,
  jpg: Image,
  xlsx: FileSpreadsheet,
};

const mockFiles = [
  { id: "1", name: "brand-guidelines.pdf", type: "pdf", size: "2.4 MB", date: "Apr 10, 2026", project: "E-Commerce Platform" },
  { id: "2", name: "homepage-mockup.png", type: "png", size: "1.8 MB", date: "Apr 8, 2026", project: "E-Commerce Platform" },
  { id: "3", name: "requirements.pdf", type: "pdf", size: "450 KB", date: "Mar 15, 2026", project: "AI Content Generator" },
  { id: "4", name: "budget-breakdown.xlsx", type: "xlsx", size: "120 KB", date: "Mar 1, 2026", project: "AI Content Generator" },
];

const PortalFiles = () => (
  <div className="max-w-6xl space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="font-display text-h2 font-bold text-foreground">Files</h1>
      <Button className="font-body text-sm">
        <Upload size={16} className="mr-2" /> Upload Files
      </Button>
    </div>

    {/* Drop zone */}
    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent-blue transition-colors cursor-pointer">
      <Upload size={24} className="mx-auto text-text-muted mb-2" />
      <p className="font-body text-sm text-text-secondary">Drag and drop files here, or click to browse</p>
      <p className="font-body text-[10px] text-text-muted mt-1">PDF, DOCX, PNG, JPG, ZIP — max 50MB</p>
    </div>

    {/* File grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockFiles.map((f, i) => {
        const Icon = fileIcons[f.type] || FileText;
        return (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-agency p-4 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Icon size={20} className="text-accent-cyan" />
            </div>
            <p className="font-body text-sm font-medium text-foreground truncate mb-1">{f.name}</p>
            <p className="font-body text-[10px] text-text-muted">{f.size} · {f.date}</p>
            <p className="font-body text-[10px] text-text-muted">{f.project}</p>
            <button className="mt-3 flex items-center gap-1 text-[10px] font-body text-text-muted group-hover:text-accent-cyan transition-colors">
              <Download size={12} /> Download
            </button>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default PortalFiles;
