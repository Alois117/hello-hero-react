import React from "react";
import { createRoot } from "react-dom/client";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import type { AuthClientEvent, AuthClientError } from "@react-keycloak/core";

import App from "./App";
import "./index.css";
import "./styles/accessibility.css";
import { logPerformanceMetrics } from "./utils/performance";

import keycloak from "./auth/keycloak";

const APP_ORIGIN = "http://localhost:8082";

const initOptions = {
  onLoad: "check-sso" as const,
  pkceMethod: "S256" as const,
  checkLoginIframe: true,
  silentCheckSsoRedirectUri: `${APP_ORIGIN}/silent-check-sso.html`,
  redirectUri: `${APP_ORIGIN}/dashboard`,
};

const onEvent = (event: AuthClientEvent, error?: AuthClientError) => {
  if (error) console.error("[Keycloak Error]", event, error);
};

createRoot(document.getElementById("root")!).render(
  <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions} onEvent={onEvent}>
    <App />
  </ReactKeycloakProvider>,
);

// Log performance metrics after app loads (development only)
if (import.meta.env.DEV) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      logPerformanceMetrics();
    }, 1000);
  });
}
