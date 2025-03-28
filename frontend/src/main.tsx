// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ModalProvider, Modal } from "./context/Modal";

import { restoreCSRF } from "./services/csrf";

// Handle CSRF restoration and window assignments in development
if (import.meta.env.MODE !== "production") {
	restoreCSRF();
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ModalProvider>
			<App />
			<Modal />
		</ModalProvider>
	</React.StrictMode>
);
