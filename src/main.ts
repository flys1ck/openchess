import pinia from "@modules/pinia";
import router from "@modules/router";
import { useSession } from "@stores/useSession";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/main.css";

// if (process.env.NODE_ENV === "development") {
//   devtools.connect();
// }

const app = createApp(App);

app.use(pinia);
// refresh initial session for first navigation
const { refreshSession } = useSession();
await refreshSession();
app.use(router);

app.mount("#app");
