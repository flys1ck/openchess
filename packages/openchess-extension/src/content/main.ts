import { mountFloatingButtonWhenFinished } from "./floating-button";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => void mountFloatingButtonWhenFinished(), { once: true });
} else {
  void mountFloatingButtonWhenFinished();
}
