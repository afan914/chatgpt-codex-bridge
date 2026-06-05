import { useCallback, useEffect, useState } from "react";
import { checkBridgeHealth } from "../../bridge/bridgeClient";

export type BridgeStatusState =
  | { status: "checking" }
  | { status: "connected"; version?: string }
  | { status: "disconnected"; message?: string };

type UseBridgeStatusResult = {
  bridgeStatus: BridgeStatusState;
  refresh: () => Promise<void>;
};

export function useBridgeStatus(): UseBridgeStatusResult {
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatusState>({ status: "checking" });

  const refresh = useCallback(async () => {
    setBridgeStatus({ status: "checking" });
    const result = await checkBridgeHealth();
    if (result.ok) {
      setBridgeStatus({ status: "connected", version: result.version });
      return;
    }

    setBridgeStatus({ status: "disconnected", message: result.message });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { bridgeStatus, refresh };
}
