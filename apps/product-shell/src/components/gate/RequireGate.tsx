import { Outlet } from "react-router-dom";
import { useState } from "react";

import { DemoBypassButton } from "./DemoBypassButton";
import { GateStatusPill } from "./GateStatusPill";
import { LoginModal } from "./LoginModal";
import { SignMessageButton } from "./SignMessageButton";
import { WalletConnectButton } from "./WalletConnectButton";

export function RequireGate() {
  const [connected, setConnected] = useState(false);
  const [signed, setSigned] = useState(false);
  const [bypassEnabled, setBypassEnabled] = useState(false);

  const hasAccess = bypassEnabled || (connected && signed);

  if (hasAccess) {
    return <Outlet />;
  }

  return (
    <LoginModal title="Access Gate">
      <GateStatusPill connected={connected} signed={signed} bypassEnabled={bypassEnabled} />
      <p style={{ margin: 0, opacity: 0.75 }}>
        Connect wallet and sign a message to continue. Demo bypass is available for local operator flows.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <WalletConnectButton connected={connected} onConnect={() => setConnected(true)} />
        <SignMessageButton connected={connected} signed={signed} onSign={() => setSigned(true)} />
        <DemoBypassButton bypassEnabled={bypassEnabled} onToggle={() => setBypassEnabled((prev) => !prev)} />
      </div>
    </LoginModal>
  );
}
