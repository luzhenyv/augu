import App from './App.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from "./router";
import vuetify from "./plugins/vuetify"
import i18n from "./plugins/i18n";


// import './style.css'
import "./styles/main.scss";

const app = createApp(App)

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

app.use(vuetify)
app.use(pinia)
app.use(router);
app.use(i18n);
app.mount('#app').$nextTick(() => postMessage({ payload: 'removeLoading' }, '*'))
