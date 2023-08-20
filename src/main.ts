import pinia from "@modules/pinia";
import router from "@modules/router";
import { useLichess } from "@stores/useLichess";
import { useSession } from "@stores/useSession";
// import devtools from "@vue/devtools";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/main.css";

// if (process.env.NODE_ENV === "development") {
//   devtools.connect();
// }

const app = createApp(App);

app.use(pinia);
// refresh initial session for first navigation
const session = useSession();
await session.refreshSession();
const lichess = useLichess();
if (session.session) await lichess.setPersonalAccessToken(session.session.user.id);
app.use(router);

app.mount("#app");
