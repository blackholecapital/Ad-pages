type AdminActionButtonProps = {
  label: string;
  onClick?: () => void;
};

export function AdminActionButton({ label, onClick }: AdminActionButtonProps) {
  return (
    <button type="button" className="paymeTab" onClick={onClick}>
      {label}
    </button>
  );
}
