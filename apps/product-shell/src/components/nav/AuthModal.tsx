import { useState } from "react";

type AuthMode = "login" | "signup" | "reset";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <div
      className="authModalBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Authentication"
      onClick={onClose}
    >
      <div className="authModal" onClick={(e) => e.stopPropagation()}>
        <div className="authModalHeader">
          <span>Account</span>
          <button type="button" className="authModalClose" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="authModalTabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={"authModalTab" + (mode === "login" ? " active" : "")}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={"authModalTab" + (mode === "signup" ? " active" : "")}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "reset"}
            className={"authModalTab" + (mode === "reset" ? " active" : "")}
            onClick={() => setMode("reset")}
          >
            Restore
          </button>
        </div>

        <form
          className="authModalBody"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <label>
            <div className="authModalLabel">Email</div>
            <input
              className="authModalInput"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {mode !== "reset" && (
            <label>
              <div className="authModalLabel">Password</div>
              <input
                className="authModalInput"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}

          {mode === "signup" && (
            <label>
              <div className="authModalLabel">Confirm Password</div>
              <input
                className="authModalInput"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </label>
          )}

          <div className="authModalActions">
            <button type="submit" className="primary">
              {mode === "login" ? "Login" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
