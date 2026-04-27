import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useDraggable, useDroppable, useSensor, useSensors,
} from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type ProjectStatus = Tables<"projects">["status"];

const columns: Array<{ key: ProjectStatus; label: string; color: string }> = [
  { key: "planning", label: "Planning", color: "#818CF8" },
  { key: "design", label: "Design", color: "#22D3EE" },
  { key: "development", label: "Development", color: "#60A5FA" },
  { key: "testing", label: "Testing", color: "#FCD34D" },
  { key: "deployment", label: "Deployment", color: "#C084FC" },
  { key: "live", label: "Live", color: "#10B981" },
];

const ProjectCard = ({ p, dragging = false }: { p: Tables<"projects">; dragging?: boolean }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: p.id });
  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-agency p-4 cursor-grab active:cursor-grabbing select-none ${
        isDragging || dragging ? "ring-2 ring-accent-cyan opacity-70" : ""
      }`}
    >
      <p className="font-body text-sm font-medium text-foreground mb-1">{p.name}</p>
      <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full capitalize">{p.type.replace("_", " ")}</span>
      {p.deadline && (
        <p className="font-body text-[10px] text-text-muted mt-2">
          Due {new Date(p.deadline).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
};

const Column = ({
  col, projects,
}: {
  col: typeof columns[number];
  projects: Tables<"projects">[];
}) => {
  const { isOver, setNodeRef } = useDroppable({ id: col.key });
  return (
    <div className="min-w-[260px] flex-shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
        <span className="font-body text-sm font-bold text-foreground">{col.label}</span>
        <span className="font-mono text-[10px] text-text-muted ml-auto">{projects.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[120px] rounded-xl p-2 transition-colors ${
          isOver ? "bg-accent-cyan/10 ring-1 ring-accent-cyan/40" : ""
        }`}
      >
        {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
        {projects.length === 0 && (
          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
            <p className="font-body text-[10px] text-text-muted">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminProjects = () => {
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    supabase.from("projects").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setProjects(data ?? []));
  }, []);

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const projectId = String(e.active.id);
    const newStatus = e.over.id as ProjectStatus;
    const project = projects.find((p) => p.id === projectId);
    if (!project || project.status === newStatus) return;

    const prev = projects;
    setProjects((ps) => ps.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)));

    const { error } = await supabase.from("projects").update({ status: newStatus }).eq("id", projectId);
    if (error) {
      setProjects(prev);
      toast.error(`Failed to update: ${error.message}`);
    } else {
      toast.success(`Moved to ${newStatus}`);
    }
  };

  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted mb-1">[03] PROJECTS</h1>
        <h2 className="font-display text-h2 font-bold text-foreground">Project Kanban</h2>
        <p className="font-body text-xs text-text-muted mt-1">Drag a card across columns to update its status.</p>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <Column key={col.key} col={col} projects={projects.filter((p) => p.status === col.key)} />
          ))}
        </div>
        <DragOverlay>
          {activeProject ? <ProjectCard p={activeProject} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default AdminProjects;
