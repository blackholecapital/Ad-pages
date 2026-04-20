import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { DemoGateProvider } from "./state/demoGateState";

import "./styles/global.css";
import "./styles/shell.css";
import "./styles/nav.css";
import "./styles/workspace.css";
import "./styles/cards.css";
import "./styles/gate.css";
import "./styles/admin.css";
import "./styles/marketplace.css";
import "./styles/published-overlay.css";
import "./mobile/styles/mobile-overlay.css";
import "./features/desktop-premium/desktop-premium.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DemoGateProvider>
      <RouterProvider router={router} />
    </DemoGateProvider>
  </React.StrictMode>
);
