import { useLocation } from "react-router-dom";
import FloatingAIChat from "./FloatingAIChat";

/**
 * Route-aware wrapper for the Floating AI Chat component.
 * Renders the AI Assistant on all routes EXCEPT the landing page.
 * 
 * Excluded routes:
 * - "/", "/login", "/signup", "/terms-of-use", "/privacy-policy" (Landing Page, Login, Signup, terms of use, privacy policy)
 * 
 * This wrapper is mounted once globally in App.tsx and controls
 * visibility based on the current route.
 */
const FloatingAIChatWrapper = () => {
  const location = useLocation();

  // Define routes where the AI Assistant should be hidden
const excludedRoutes = ["/", "/login", "/signup", "/terms-of-use", "/privacy-policy"];

  // Check if current path matches any excluded route
  const shouldHide = excludedRoutes.includes(location.pathname);

  // Don't render on excluded routes
  if (shouldHide) {
    return null;
  }

  return <FloatingAIChat />;
};

export default FloatingAIChatWrapper;