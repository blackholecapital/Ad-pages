import React, { useState } from "react";
import { useDemoGate } from "../../state/demoGateState";

const MOCK_EMPLOYEES = [
  { name: "Bob", wallet: "0xB0b1...A2F3", level: "Admin" },
  { name: "Sally", wallet: "0x5A11...9C4D", level: "Editor" },
  { name: "Frank", wallet: "0xF4A2...3E1B", level: "Viewer" },
];

const PAGE_OPTIONS = ["Homepage", "Pay Me", "Engage", "Referrals", "Skins", "Access"];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="adminBlock">
      <div className="adminBlockTitle">{title}</div>
      <div className="adminBlockBody">{children}</div>
    </div>
  );
}

function KV({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="kvRow">
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ fontWeight: 800, color: accent }}>{value}</span>
    </div>
  );
}

export function AdminPanel() {
  const { state, actions } = useDemoGate();
  const [usdcAddress, setUsdcAddress] = useState(() => localStorage.getItem("admin_usdc_address") || "");
  const [addressSaved, setAddressSaved] = useState(false);
  const [selectedPage, setSelectedPage] = useState("Homepage");
  const [mintStatus, setMintStatus] = useState("");
  const [allowlistStatus, setAllowlistStatus] = useState("");

  function saveUsdcAddress() {
    localStorage.setItem("admin_usdc_address", usdcAddress);
    setAddressSaved(true);
    setTimeout(() => setAddressSaved(false), 2000);
  }

  function simulateMint() {
    setMintStatus("Minting...");
    setTimeout(() => setMintStatus("Minted — Token #" + Math.floor(Math.random() * 9999)), 1200);
  }

  function simulateAllowlist() {
    setAllowlistStatus("Checking...");
    setTimeout(() => setAllowlistStatus(state.walletAddress ? "Address is allowlisted" : "No wallet connected"), 900);
  }

  return (
    <div className="adminGrid">
      {/* 1 — Session Status */}
      <Block title="Session Status">
        <KV label="Demo bypass" value={state.demoBypass ? "ON" : "OFF"} accent={state.demoBypass ? "#2f7df6" : undefined} />
        <KV label="Wallet connected" value={state.walletConnected ? "YES" : "NO"} accent={state.walletConnected ? "#16a34a" : undefined} />
        <KV label="Signed message" value={state.signedMessage ? "YES" : "NO"} accent={state.signedMessage ? "#16a34a" : undefined} />
        <div className="adminActions">
          <button className="adminBtn danger" type="button" onClick={actions.resetDemoState}>Reset State</button>
          <button className="adminBtn" type="button" onClick={actions.enableBypass}>Enable Bypass</button>
        </div>
      </Block>

      {/* 2 — Wallet Status */}
      <Block title="Wallet Status">
        <KV label="Address" value={state.walletAddress || "—"} />
        <div className="adminActions">
          <button className="adminBtn primary" type="button" onClick={() => actions.connectWallet()}>Connect Wallet</button>
          <button className="adminBtn" type="button" onClick={() => actions.signMessage()} disabled={!state.walletConnected}>Sign Message</button>
          <button className="adminBtn" type="button" onClick={actions.simulateSignedMessage}>Simulate Signed</button>
        </div>
      </Block>

      {/* 3 — Tier Unlock Controls */}
      <Block title="Tier Unlock Controls">
        <KV
          label="Tier 1"
          value={state.tier1Unlocked ? "Unlocked" : "Locked"}
          accent={state.tier1Unlocked ? "#16a34a" : undefined}
        />
        <KV
          label="Tier 2"
          value={state.tier2Unlocked ? "Unlocked" : "Locked"}
          accent={state.tier2Unlocked ? "#16a34a" : undefined}
        />
        <KV
          label="Tier 3"
          value={state.tier3Unlocked ? "Unlocked" : "Locked"}
          accent={state.tier3Unlocked ? "#16a34a" : undefined}
        />
        <div className="adminActions">
          <button className="adminBtn" type="button" onClick={actions.toggleTier1}>Toggle T1</button>
          <button className="adminBtn" type="button" onClick={actions.toggleTier2}>Toggle T2</button>
        </div>
        <div className="adminActions" style={{ marginTop: 4 }}>
          <button className="adminBtn primary" type="button" onClick={() => { actions.unlockTier1(); actions.unlockTier2(); actions.unlockTier3(); }}>Unlock All</button>
        </div>
      </Block>

      {/* 4 — Employee Access */}
      <Block title="Employee Access">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ opacity: 0.6 }}>
              <th style={{ textAlign: "left", padding: "4px 0", fontWeight: 700 }}>Name</th>
              <th style={{ textAlign: "left", padding: "4px 0", fontWeight: 700 }}>Wallet</th>
              <th style={{ textAlign: "left", padding: "4px 0", fontWeight: 700 }}>Level</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_EMPLOYEES.map((emp) => (
              <tr key={emp.name} style={{ borderTop: "1px solid rgba(59,130,246,.08)" }}>
                <td style={{ padding: "6px 0", fontWeight: 700 }}>{emp.name}</td>
                <td style={{ padding: "6px 0", fontFamily: "monospace", fontSize: 12, opacity: 0.75 }}>{emp.wallet}</td>
                <td style={{ padding: "6px 0" }}>{emp.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="adminActions">
          <button className="adminBtn" type="button">Add Employee</button>
        </div>
      </Block>

      {/* 5 — NFT Mint */}
      <Block title="NFT Mint">
        <KV label="Collection" value="Biz Pages" />
        <KV label="Network" value="Base" />
        <KV label="Status" value={mintStatus || "Ready"} accent={mintStatus.startsWith("Minted") ? "#16a34a" : undefined} />
        <div className="adminActions">
          <button className="adminBtn primary" type="button" onClick={simulateMint}>Simulate Mint</button>
        </div>
      </Block>

      {/* 6 — Allowlist */}
      <Block title="Allowlist">
        <KV label="Connected wallet" value={state.walletAddress || "None"} />
        <KV label="Check result" value={allowlistStatus || "—"} accent={allowlistStatus.includes("allowlisted") ? "#16a34a" : undefined} />
        <div className="adminActions">
          <button className="adminBtn primary" type="button" onClick={simulateAllowlist}>Simulate Allowlist Check</button>
        </div>
      </Block>

      {/* 7 — Payment Settings */}
      <Block title="Payment Settings (Demo)">
        <div className="adminFormGrid">
          <div className="adminField">
            <label className="adminFieldLabel">USDC Receiving Address</label>
            <input
              className="adminTextInput"
              type="text"
              value={usdcAddress}
              onChange={(e) => setUsdcAddress(e.target.value)}
              placeholder="0x..."
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className="adminActions">
          <button className="adminBtn primary" type="button" onClick={saveUsdcAddress}>
            {addressSaved ? "Saved!" : "Save"}
          </button>
        </div>
      </Block>

      {/* 8 — Page Titles */}
      <Block title="Page Titles">
        <div className="adminFormGrid">
          <div className="adminField">
            <label className="adminFieldLabel">Select Page</label>
            <select
              className="adminTextInput"
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              style={{ width: "100%" }}
            >
              {PAGE_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <KV label="Active page" value={selectedPage} />
        </div>
      </Block>
    </div>
  );
}
