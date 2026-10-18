import pinia from "@modules/pinia";
import queryClient from "@modules/queryClient";
import router from "@modules/router";
import { initLichessStore } from "@stores/useLichess";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { initDeepLinks } from "@utilities/deepLinks";
// import devtools from "@vue/devtools";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/main.css";

// if (process.env.NODE_ENV === "development") {
//   devtools.connect();
// }

const app = createApp(App);
app.use(pinia).use(router).use(VueQueryPlugin, { queryClient });

await initLichessStore();
await initDeepLinks(router);

app.mount("#app");
