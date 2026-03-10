import { useCallback, useMemo, useState } from "react";
import { NavLink, useLocation } from "@/lib/router";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight, Eye, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import {
  DndContext,
  MouseSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCompany } from "../context/CompanyContext";
import { useDialog } from "../context/DialogContext";
import { useSidebar } from "../context/SidebarContext";
import { authApi } from "../api/auth";
import { goalsApi } from "../api/goals";
import { projectsApi } from "../api/projects";
import { queryKeys } from "../lib/queryKeys";
import { cn, projectRouteRef } from "../lib/utils";
import { useProjectOrder } from "../hooks/useProjectOrder";
import { BudgetSidebarMarker } from "./BudgetSidebarMarker";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PluginSlotMount, usePluginSlots } from "@/plugins/slots";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Project } from "@paperclipai/shared";

const COMPLETED_STATUSES = ["completed", "cancelled"];
const GOAL_DONE_STATUSES = ["achieved", "cancelled"];

type ProjectSidebarSlot = ReturnType<typeof usePluginSlots>["slots"][number];

function ProjectItem({
  activeProjectRef,
  isMobile,
  project,
  setSidebarOpen,
}: {
  activeProjectRef: string | null;
  isMobile: boolean;
  project: Project;
  setSidebarOpen: (open: boolean) => void;
}) {
  const routeRef = projectRouteRef(project);

  return (
    <NavLink
      to={`/projects/${routeRef}/issues`}
      onClick={() => {
        if (isMobile) setSidebarOpen(false);
      }}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-colors",
        activeProjectRef === routeRef || activeProjectRef === project.id
          ? "bg-accent text-foreground"
          : "text-foreground/80 hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <span className="shrink-0 h-3.5 w-3.5 rounded-sm flex items-center justify-center bg-muted-foreground/20">
        <Check className="h-2.5 w-2.5 text-muted-foreground" />
      </span>
      <span className="flex-1 truncate text-muted-foreground">
        {project.name}
      </span>
    </NavLink>
  );
}

function SortableProjectItem({
  activeProjectRef,
  companyId,
  companyPrefix,
  isMobile,
  project,
  projectSidebarSlots,
  setSidebarOpen,
}: {
  activeProjectRef: string | null;
  companyId: string | null;
  companyPrefix: string | null;
  isMobile: boolean;
  project: Project;
  projectSidebarSlots: ProjectSidebarSlot[];
  setSidebarOpen: (open: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const routeRef = projectRouteRef(project);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={cn(isDragging && "opacity-80")}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col gap-0.5">
        <NavLink
          to={`/projects/${routeRef}/issues`}
          onClick={() => {
            if (isMobile) setSidebarOpen(false);
          }}
          className={cn(
            "flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-colors",
            activeProjectRef === routeRef || activeProjectRef === project.id
              ? "bg-accent text-foreground"
              : "text-foreground/80 hover:bg-accent/50 hover:text-foreground",
          )}
        >
          <span
            className="shrink-0 h-3.5 w-3.5 rounded-sm"
            style={{ backgroundColor: project.color ?? "#6366f1" }}
          />
          <span className="flex-1 truncate">{project.name}</span>
          {project.pauseReason === "budget" ? <BudgetSidebarMarker title="Project paused by budget" /> : null}
        </NavLink>
        {projectSidebarSlots.length > 0 && (
          <div className="ml-5 flex flex-col gap-0.5">
            {projectSidebarSlots.map((slot) => (
              <PluginSlotMount
                key={`${project.id}:${slot.pluginKey}:${slot.id}`}
                slot={slot}
                context={{
                  companyId,
                  companyPrefix,
                  projectId: project.id,
                  projectRef: routeRef,
                  entityId: project.id,
                  entityType: "project",
                }}
                missingBehavior="placeholder"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SidebarProjects() {
  const [open, setOpen] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const { selectedCompany, selectedCompanyId } = useCompany();
  const { openNewProject } = useDialog();
  const { isMobile, setSidebarOpen } = useSidebar();
  const location = useLocation();

  const { data: projects } = useQuery({
    queryKey: queryKeys.projects.list(selectedCompanyId!),
    queryFn: () => projectsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const { data: goals } = useQuery({
    queryKey: queryKeys.goals.list(selectedCompanyId!),
    queryFn: () => goalsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const { data: session } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => authApi.getSession(),
  });
  const { slots: projectSidebarSlots } = usePluginSlots({
    slotTypes: ["projectSidebarItem"],
    entityType: "project",
    companyId: selectedCompanyId,
    enabled: !!selectedCompanyId,
  });

  const currentUserId = session?.user?.id ?? session?.session?.userId ?? null;

  const doneGoalIds = useMemo(() => {
    const set = new Set<string>();
    for (const g of goals ?? []) {
      if (GOAL_DONE_STATUSES.includes(g.status)) set.add(g.id);
    }
    return set;
  }, [goals]);

  /** A project is "done" if its own status is completed/cancelled,
   *  or if all its goals are achieved/cancelled. */
  const isProjectDone = useCallback(
    (p: Project) => {
      if (COMPLETED_STATUSES.includes(p.status)) return true;
      const projectGoalIds = p.goalIds?.length ? p.goalIds : p.goalId ? [p.goalId] : [];
      if (projectGoalIds.length > 0 && projectGoalIds.every((id) => doneGoalIds.has(id))) return true;
      return false;
    },
    [doneGoalIds],
  );

  const nonArchivedProjects = useMemo(
    () => (projects ?? []).filter((project: Project) => !project.archivedAt),
    [projects],
  );

  const completedCount = useMemo(
    () => nonArchivedProjects.filter(isProjectDone).length,
    [nonArchivedProjects, isProjectDone],
  );

  const activeProjects = useMemo(
    () => nonArchivedProjects.filter((p) => !isProjectDone(p)),
    [nonArchivedProjects, isProjectDone],
  );

  const completedProjects = useMemo(
    () => nonArchivedProjects.filter(isProjectDone),
    [nonArchivedProjects, isProjectDone],
  );

  const { orderedProjects, persistOrder } = useProjectOrder({
    projects: activeProjects,
    companyId: selectedCompanyId,
    userId: currentUserId,
  });

  const projectMatch = location.pathname.match(/^\/(?:[^/]+\/)?projects\/([^/]+)/);
  const activeProjectRef = projectMatch?.[1] ?? null;
  const sensors = useSensors(
    // Project reordering is intentionally desktop-only; touch should remain tap/scroll behavior.
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const ids = orderedProjects.map((project) => project.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      persistOrder(arrayMove(ids, oldIndex, newIndex));
    },
    [orderedProjects, persistOrder],
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="group">
        <div className="flex items-center px-3 py-1.5">
          <CollapsibleTrigger className="flex items-center gap-1 flex-1 min-w-0">
            <ChevronRight
              className={cn(
                "h-3 w-3 text-muted-foreground/60 transition-transform opacity-0 group-hover:opacity-100",
                open && "rotate-90"
              )}
            />
            <span className="text-[10px] font-medium uppercase tracking-widest font-mono text-muted-foreground/60">
              Projects
            </span>
          </CollapsibleTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to="/projects"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMobile) setSidebarOpen(false);
                }}
                className="flex items-center justify-center h-4 w-4 rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
                aria-label="View all projects"
              >
                <Eye className="h-3 w-3" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>View all projects</p>
            </TooltipContent>
          </Tooltip>
          {completedCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCompleted((prev) => !prev);
                  }}
                  className={cn(
                    "flex items-center justify-center h-4 w-4 rounded transition-colors",
                    showCompleted
                      ? "text-foreground/80 hover:text-foreground hover:bg-accent/50"
                      : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/50"
                  )}
                  aria-label={showCompleted ? "Hide completed projects" : "Show completed projects"}
                >
                  {showCompleted ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{showCompleted ? "Hide completed" : `Show completed (${completedCount})`}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openNewProject();
            }}
            className="flex items-center justify-center h-4 w-4 rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
            aria-label="New project"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <CollapsibleContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedProjects.map((project) => project.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-0.5 mt-0.5">
              {orderedProjects.map((project: Project) => (
                <SortableProjectItem
                  key={project.id}
                  activeProjectRef={activeProjectRef}
                  companyId={selectedCompanyId}
                  companyPrefix={selectedCompany?.issuePrefix ?? null}
                  isMobile={isMobile}
                  project={project}
                  projectSidebarSlots={projectSidebarSlots}
                  setSidebarOpen={setSidebarOpen}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {showCompleted && completedProjects.length > 0 && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            {completedProjects.map((project: Project) => (
              <ProjectItem
                key={project.id}
                activeProjectRef={activeProjectRef}
                isMobile={isMobile}
                project={project}
                setSidebarOpen={setSidebarOpen}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
