<template>
  <pre-loader
      :loading="loading"
  >
    <div v-if="isOK">
      <navBar v-if="navBarVisible"/>
      <router-view/>
    </div>
    <div v-else>
      <h3>У вас нет прав для доступа к этому модулю!</h3>
    </div>
  </pre-loader>
</template>

<script>

import {ref, provide, reactive, computed} from "vue";
import {useRouter, useRoute} from 'vue-router';

import navBar from "@/components/navBar";
import PreLoader from "@/components/pre_loader";
import {ElNotification} from "element-plus";
import {AccessesRepo} from "@/repositories";
import Pre_loader from "@/components/pre_loader";

export default {
  name       : 'App',
  components : {PreLoader, navBar},
  setup(){
    const router        = useRouter();

    const user         = reactive({
      id                : 14317,
      rights            : [],
      additional_rights : {},
    });

    const module       = ref('');
    const module_list  = reactive([]);
    const notify       = ({title = '', message = '', type = '', duration = 3000} = {}) => {
      ElNotification({
        title,
        message,
        type,
        duration,
        dangerouslyUseHTMLString: true,
      })
    };

    const loading      = ref(false);
    const isOK         = ref(null);
    const timerId      = ref(null);

    const navBarVisible = computed(() => {
      let currentRoute = router.currentRoute.value.name;
      return['listCheck', 'listModule', 'listGroup', 'listRight', 'listAdditionalRight'].includes(currentRoute)
    });

    const initData     = async() => {
      window._userId ? user.id      = window._userId : user.id      = null;
      window._token  ? window.token = window._token  : window.token = null;
    }

    const auth         = async() => {
      loading.value = true;
      await initData();
      if (window.token) {
        setTimeout(() => {clearInterval(timerId.value)});
        try {
          loading.value = true;

          let result = await AccessesRepo.rights({
            user_id : user.id,
            module  : 'Accesses',
          });

          if(result.data && result.data.rights.includes('full_access')){
            isOK.value = true;
            user.rights.push(...result.data.rights);
            user.additional_rights = result.data.additional_rights;
          }else{
            user.rights            = [];
            user.additional_rights = [];
            isOK.value  = false;
          }

        } catch (e) {
          notify({title : 'Проблема с получением данных с сервера', message : e.message, type : 'error'});
        } finally {
          loading.value = false;
        }

      } else {
        user.rights = [];
        user.additional_rights = [];
        isOK.value        = false;
        notify({title : 'Проблема с авторизацией на портале', message : 'Нет токена.', type : 'error'});
        timerId.value   = setInterval(async () => await initData(), 15000 );
      };
    };
    auth();

    provide('user', user);
    provide('module', module);
    provide('module_list', module_list);
    provide('notify', notify);

    return{
      navBarVisible, loading, isOK, user
    }
  },
}
</script>

<style>
</style>
