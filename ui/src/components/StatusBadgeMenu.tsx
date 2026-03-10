import { AGENT_ACTIONABLE_STATUSES, type AgentStatus } from "@paperclipai/shared";
import { Pause, Play, Trash2 } from "lucide-react";
import { useAgentStatusMutations } from "../hooks/useAgentStatusMutations";
import { StatusBadge } from "./StatusBadge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface StatusBadgeMenuProps {
  agentId: string;
  status: AgentStatus;
  companyId: string;
}

export function StatusBadgeMenu({ agentId, status, companyId }: StatusBadgeMenuProps) {
  const { pauseAgent, resumeAgent, terminateAgent, busy } = useAgentStatusMutations({
    companyId,
    agentId,
  });

  if (!AGENT_ACTIONABLE_STATUSES.has(status)) {
    return <StatusBadge status={status} />;
  }

  const canPause = status !== "paused";
  const canResume = status === "paused";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={busy} onClick={(e) => e.stopPropagation()}>
        <button className="cursor-pointer focus:outline-none" disabled={busy}>
          <StatusBadge status={status} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {canPause && (
          <DropdownMenuItem onClick={() => pauseAgent.mutate(agentId)} disabled={busy}>
            <Pause className="h-3.5 w-3.5" />
            Pause
          </DropdownMenuItem>
        )}
        {canResume && (
          <DropdownMenuItem onClick={() => resumeAgent.mutate(agentId)} disabled={busy}>
            <Play className="h-3.5 w-3.5" />
            Resume
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => terminateAgent.mutate(agentId)} disabled={busy}>
          <Trash2 className="h-3.5 w-3.5" />
          Terminate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
