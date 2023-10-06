import pinia from "@modules/pinia";
import router from "@modules/router";
// import devtools from "@vue/devtools";
import { useLichess } from "@stores/useLichess";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/main.css";

// if (process.env.NODE_ENV === "development") {
//   devtools.connect();
// }

const app = createApp(App);

app.use(pinia);
const lichess = useLichess();
await lichess.setPersonalAccessToken();
app.use(router);
app.mount("#app");
