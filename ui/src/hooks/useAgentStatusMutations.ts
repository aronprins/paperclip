import { useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { agentsApi } from "../api/agents";
import { useToast } from "../context/ToastContext";
import { queryKeys } from "../lib/queryKeys";

interface UseAgentStatusMutationsOptions {
  companyId: string;
  /** When provided, also invalidates the agent detail query on success. */
  agentId?: string;
}

/**
 * Shared pause / resume / terminate mutations with automatic query
 * invalidation and error toasts.
 */
export function useAgentStatusMutations({ companyId, agentId }: UseAgentStatusMutationsOptions) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.agents.list(companyId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.org(companyId) });
    if (agentId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(agentId) });
    }
  }, [queryClient, companyId, agentId]);

  const onError = useCallback(
    (err: Error) => {
      pushToast({ title: err.message, tone: "error" });
    },
    [pushToast],
  );

  const pauseAgent = useMutation({
    mutationFn: (id: string) => agentsApi.pause(id, companyId),
    onSuccess: invalidate,
    onError,
  });

  const resumeAgent = useMutation({
    mutationFn: (id: string) => agentsApi.resume(id, companyId),
    onSuccess: invalidate,
    onError,
  });

  const terminateAgent = useMutation({
    mutationFn: (id: string) => agentsApi.terminate(id, companyId),
    onSuccess: invalidate,
    onError,
  });

  const busy = pauseAgent.isPending || resumeAgent.isPending || terminateAgent.isPending;

  return { pauseAgent, resumeAgent, terminateAgent, invalidate, onError, busy };
}
