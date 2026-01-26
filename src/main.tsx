import { createRoot } from "react-dom/client";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak, { initOptions } from "./keycloak/config/keycloak";
import AuthLoadingScreen from "./keycloak/components/AuthLoadingScreen";
import App from "./App.tsx";
import "./index.css";

const eventLogger = (event: string, error?: unknown) => {
  if (import.meta.env.DEV) {
    console.log('[Keycloak Event]:', event);
    if (error) {
      console.error('[Keycloak Error]:', error);
    }
  }
};

const tokenLogger = (tokens: { token?: string }) => {
  if (import.meta.env.DEV && tokens?.token) {
    console.log('[Keycloak] Token refreshed');
  }
};

createRoot(document.getElementById("root")!).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={initOptions}
    onEvent={eventLogger}
    onTokens={tokenLogger}
  >
    <App />
  </ReactKeycloakProvider>
);
