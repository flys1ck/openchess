import pinia from "@modules/pinia";
import router from "@modules/router";
import { initLichessStore } from "@stores/useLichess";
import { initDeepLinks } from "@utilities/deepLinks";
// import devtools from "@vue/devtools";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/main.css";

// if (process.env.NODE_ENV === "development") {
//   devtools.connect();
// }

const app = createApp(App);
app.use(pinia).use(router);

await initLichessStore();
await initDeepLinks(router);

app.mount("#app");
