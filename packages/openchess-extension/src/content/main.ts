import { mountFloatingButton } from "./floating-button";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountFloatingButton, { once: true });
} else {
  mountFloatingButton();
}
