import { usePayMeCart } from "../../state/paymeCartState";
import { Basket } from "../../features/payme/Basket";

export function PayMePanel() {
  const { open, hide } = usePayMeCart();

  return (
    <aside
      className={"paymeSidePanel" + (open ? " paymeSidePanelOpen" : "")}
      aria-hidden={!open}
      role="dialog"
      aria-label="PayMe basket"
    >
      <div className="paymeSidePanelHeader">
        <div className="paymeSidePanelTitle">PayMe Checkout</div>
        <button
          type="button"
          className="paymeSidePanelClose"
          onClick={hide}
          aria-label="Close basket"
        >
          ×
        </button>
      </div>
      <div className="paymeSidePanelBody">
        <Basket />
      </div>
    </aside>
  );
}
