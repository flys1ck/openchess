import { startFloatingButtonSync, stopFloatingButtonSync } from "./floating-button";

startFloatingButtonSync();

if (import.meta.hot) {
  import.meta.hot.dispose(stopFloatingButtonSync);
}
