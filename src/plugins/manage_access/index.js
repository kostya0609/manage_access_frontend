import ListGroup from "@/plugins/manage_access/pages/group/list";
import AddGroup from "@/plugins/manage_access/pages/group/add";
import EditGroup from "@/plugins/manage_access/pages/group/edit";

import ListRight from "@/plugins/manage_access/pages/right/list";
import AddRight from "@/plugins/manage_access/pages/right/add";

import ListAdditionalRight from "@/plugins/manage_access/pages/additional_right/list";
import AddAdditionalRight from "@/plugins/manage_access/pages/additional_right/add";

import ListModule from "@/plugins/manage_access/pages/module/list";
import AddModule from "@/plugins/manage_access/pages/module/add";

import {ElNotification}  from 'element-plus'
import {ref, reactive} from "vue";
import {ModuleRepo} from "@/plugins/manage_access/repositories";

let installed = false;

export default {
    install(app, options){

        if (installed) return;

        installed = true;

        let kol = options.router.getRoutes().length;

        options.router.addRoute(
            {
                path: '/manage-access/group',
                children: [
                    {
                        path: 'list',
                        name: 'listGroup',
                        component: ListGroup,
                        meta: {
                            name         : 'Группы пользователей',
                            full_access  : true,
                            order        : kol + 2,
                            right_button : {
                                show  : true,
                                path  : '/manage-access/group/add',
                                label : 'группу',
                            },
                        },
                    },
                    {
                        path: 'add',
                        name: 'addGroup',
                        component: AddGroup,
                    },
                    {
                        path: 'edit/:id',
                        name: 'editGroup',
                        component: EditGroup,
                    },
                ],
            }
        );

        options.router.addRoute(
            {
                path: '/manage-access/right',
                children: [
                    {
                        path: 'list',
                        name: 'listRight',
                        component: ListRight,
                        meta: {
                            name         : 'Права',
                            full_access  : true,
                            order        : kol + 3,
                            right_button : {
                                show  : true,
                                path  : '/manage-access/right/add',
                                label : 'право',
                            },
                        },
                    },
                    {
                        path: 'add',
                        name: 'addRight',
                        component: AddRight,
                    },
                    {
                        path: 'edit/:id',
                        name: 'editRight',
                        component: AddRight,
                    },
                ],
            }
        )

        options.router.addRoute(
            {
                path: '/manage-access/additional-right',
                children: [
                    {
                        path: 'list',
                        name: 'listAdditionalRight',
                        component: ListAdditionalRight,
                        meta: {
                            name         : 'Расширенные права',
                            full_access  : true,
                            order        : kol + 4,
                            right_button : {
                                show  : true,
                                path  : '/manage-access/additional-right/add',
                                label : 'право',
                            },
                        },
                    },
                    {
                        path: 'add',
                        name: 'addAdditionalRight',
                        component: AddAdditionalRight,
                    },
                    {
                        path: 'edit/:module/:client_id',
                        name: 'editAdditionalRight',
                        component: AddAdditionalRight,
                    },
                ],
            }
        )

        if (options.global)
            options.router.addRoute(
                {
                    path: '/manage-access/module',
                    children: [
                        {
                            path: 'list',
                            name: 'listModule',
                            component: ListModule,
                            meta: {
                                name         : 'Модули',
                                full_access  : true,
                                order        : kol + 1,
                                right_button : {
                                    show  : true,
                                    path  : '/manage-access/module/add',
                                    label : 'модуль',
                                },
                            },
                        },
                        {
                            path: 'add',
                            name: 'addModule',
                            component: AddModule,
                        },
                        {
                            path: 'edit/:id',
                            name: 'editModule',
                            component: AddModule,
                        }
                    ]
                },
            )

        const notify       = ({title = '', message = '', type = '', duration = 3000} = {}) => {
            ElNotification({
                title,
                message,
                type,
                duration,
                dangerouslyUseHTMLString: true,
            })
        };

        const module       = ref(options.global ? '' : options.module)
        const module_list  = reactive([]);
        const getModule    = async () => {
         try {
           let result = await ModuleRepo.list();
           result.data ? module_list.push(...result.data) : '';
           module_list.push({code : 'empty_module', name : 'Нет модуля'})
         } catch (e) {
           notify({title : 'Ошибка при выполнении запроса получения списка модулей', message : e.message, type : 'error'});
         } finally {
         }
        };
        options.global ? getModule() : '';

        app.provide('_global',  options.global);
        app.provide('_module', module );
        app.provide('_module_list', module_list);
        app.provide('_manage_access_notify', notify);
        app.provide('_user_id', options.user_id);
    }
}