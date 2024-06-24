import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import locale from 'element-plus/es/locale/lang/ru'
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

if (process.env.NODE_ENV == 'development'){
    window._userId = 14317;
    window._token  = '$2y$10$NMJZxfAaRIJpLeroZdnB5OQrFlm/o.2Hyx.mZWtADsWN9eyLanpOy';
}

import manage_access from "@/plugins/manage_access/index";
const manage_access_setting = {
    router,
    module  : '',// тут каждый пишет свое имя модуля... если global : true  то имя модуля не учитывается тут
    user_id : window._userId,
    global  : true,// если надо управлять сразу всеми модулями, елси плагин используем в стагдартном приложении, то global = false;
}

const app = createApp(App)
app.use(ElementPlus,  {locale})
app.use(manage_access, manage_access_setting)
app.use(router)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')

