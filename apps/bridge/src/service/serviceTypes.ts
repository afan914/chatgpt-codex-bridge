export type ServiceState = "installed" | "not_installed" | "unsupported" | "unknown";

export type ServiceStatus = {
  state: ServiceState;
  detail?: string;
};

export type ServiceManager = {
  platform: NodeJS.Platform;
  install(): Promise<void>;
  uninstall(): Promise<void>;
  stop(): Promise<boolean>;
  getStatus(): Promise<ServiceStatus>;
};
