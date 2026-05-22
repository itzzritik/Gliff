import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { IconDataProvider } from "./playground/useIconData";
import { Gliff } from "./utils/setup";

const rootElement = document.getElementById("root");

if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<Gliff react />
			<IconDataProvider>
				<App />
			</IconDataProvider>
		</StrictMode>
	);
}
