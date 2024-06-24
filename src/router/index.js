import { createRouter, createWebHistory } from 'vue-router'
import listCheck from '@/pages/check/index'

const routes = [
  {
    path      : '/manage-access/info/',
    children : [
      {
        path      : 'list',
        name      : 'listCheck',
        component : listCheck,
        meta      : {
          name         : 'Проверка прав',
          full_access  : true,
          order        : 1,
          right_button : {
            show  : false,
           // label : '',
           // path  : '/check/add',
          }
        }
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  previous : null,
})

router.beforeEach((to, from, next) => {
  router.previous = from.name;
  !router.getRoutes().find(el => {return el.name === to.name}) ? router.push({name : 'listCheck'}) : '';
  next();
})

export default router
