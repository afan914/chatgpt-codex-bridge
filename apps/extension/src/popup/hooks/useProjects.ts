import { useEffect, useState } from "react";
import type { BridgeProjectOption } from "../../bridge/bridgeClient";
import { fetchBridgeProjects } from "../../bridge/bridgeClient";

const SELECTED_PROJECT_STORAGE_KEY = "chatgptCodexBridge.selectedProjectId";

export type ProjectsState =
  | { status: "loading"; projects: BridgeProjectOption[]; selectedProjectId?: string; message?: string }
  | { status: "ready"; projects: BridgeProjectOption[]; selectedProjectId?: string; message?: string }
  | { status: "error"; projects: BridgeProjectOption[]; selectedProjectId?: string; message: string };

export function useProjects(shouldLoad: boolean): {
  projectsState: ProjectsState;
  selectProject: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
} {
  const [projectsState, setProjectsState] = useState<ProjectsState>({ status: "loading", projects: [] });

  async function loadProjects(): Promise<void> {
    if (!shouldLoad) {
      setProjectsState({ status: "ready", projects: [] });
      return;
    }

    setProjectsState((current) => ({ ...current, status: "loading" }));
    const [storedProjectId, projectsResult] = await Promise.all([readStoredProjectId(), fetchBridgeProjects()]);
    if (!projectsResult.ok) {
      setProjectsState({
        status: "error",
        projects: [],
        selectedProjectId: storedProjectId,
        message: projectsResult.message
      });
      return;
    }

    const selectedProjectId = chooseSelectedProjectId(projectsResult.projects, storedProjectId);
    setProjectsState({
      status: "ready",
      projects: projectsResult.projects,
      selectedProjectId
    });
  }

  useEffect(() => {
    void loadProjects();
  }, [shouldLoad]);

  async function selectProject(projectId: string): Promise<void> {
    await chrome.storage.local.set({ [SELECTED_PROJECT_STORAGE_KEY]: projectId });
    setProjectsState((current) => ({ ...current, selectedProjectId: projectId }));
  }

  return {
    projectsState,
    selectProject,
    refreshProjects: loadProjects
  };
}

async function readStoredProjectId(): Promise<string | undefined> {
  const value = await chrome.storage.local.get(SELECTED_PROJECT_STORAGE_KEY);
  return typeof value[SELECTED_PROJECT_STORAGE_KEY] === "string" ? value[SELECTED_PROJECT_STORAGE_KEY] : undefined;
}

function chooseSelectedProjectId(projects: BridgeProjectOption[], storedProjectId: string | undefined): string | undefined {
  if (storedProjectId && projects.some((project) => project.id === storedProjectId)) {
    return storedProjectId;
  }

  return projects.find((project) => project.isDefault)?.id ?? projects[0]?.id;
}
