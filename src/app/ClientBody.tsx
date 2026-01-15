"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/offline";
import { wsManager } from "@/lib/websocket";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";

    // Register service worker for offline capabilities
    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log("[App] Service worker registered successfully");
      }
    });

    // Initialize WebSocket connection
    wsManager.connect("current-user", ["ADMIN"]).then(() => {
      console.log("[App] WebSocket connected");
    }).catch((error) => {
      console.log("[App] WebSocket connection failed:", error);
    });

    // Cleanup on unmount
    return () => {
      wsManager.disconnect();
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="antialiased">{children}</div>
      </AuthProvider>
    </LanguageProvider>
  );
}
