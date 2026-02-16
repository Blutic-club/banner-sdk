import { createRoot } from "react-dom/client";
import CookieBanner from "./CookieBanner";
import "./index.css";

// Auto-run banner
function autoInit() {
  const script = document.currentScript || [...document.scripts].pop();
  if (!script) return;

  const url = new URL(script.src);
  const params = new URLSearchParams(url.search);
  const domainId = params.get("domainId");

  if (!domainId) {
    console.warn("CookieBannerSDK: Missing domainId in script src.");
    return;
  }

  localStorage.setItem("domainId", domainId);

  const run = () => {
    const container = document.createElement("div");
    container.id = "cookie-banner-container";
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<CookieBanner />);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}

autoInit();
