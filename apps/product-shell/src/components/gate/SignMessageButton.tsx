type SignMessageButtonProps = {
  connected: boolean;
  signed: boolean;
  onSign: () => void;
};

export function SignMessageButton({ connected, signed, onSign }: SignMessageButtonProps) {
  return (
    <button
      type="button"
      className="loginTextBtn"
      onClick={onSign}
      disabled={!connected || signed}
    >
      {signed ? "Message signed" : "Sign access message"}
    </button>
  );
}
