import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Gliff } from "./utils/setup";

const rootElement = document.getElementById("root");

if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<Gliff react />
			<App />
		</StrictMode>
	);
}
