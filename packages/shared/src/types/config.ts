export interface BridgeConfig {
  defaultProjectId?: string;
  port: number;
  projects: BridgeProject[];
}

export interface BridgeProject {
  id: string;
  name: string;
  path: string;
}
