type DemoBypassButtonProps = {
  bypassEnabled: boolean;
  onToggle: () => void;
};

export function DemoBypassButton({ bypassEnabled, onToggle }: DemoBypassButtonProps) {
  return (
    <button type="button" className="loginTextBtn" onClick={onToggle}>
      {bypassEnabled ? "Disable demo bypass" : "Enable demo bypass"}
    </button>
  );
}
