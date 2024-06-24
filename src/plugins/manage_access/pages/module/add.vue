<template>
  <pre-loader
      :loading="loading"
  >
    <el-row>
      <el-col :span="12">
        <h3>{{route.name === 'addModule' ? 'Добавление' : 'Редактирование'}} модуля</h3>
      </el-col>
      <el-col :span="12" align="right">
        <return-button/>
      </el-col>
    </el-row>

    <el-row class="mb-15">
      <el-col :md="12">
        <label class="label">Название модуля(rus)</label>
        <el-input
            v-model="module_data.name"
            @input="module_data.name = module_data.name.replace(/[^а-яё_\s0-9]+/iu, '')"
            :class="[{'border-red' : errors.name}, 'width-full']"
            placeholder="Введите название"
        />
        <small v-if="errors.name" class="font-red">{{errors.name}}</small>
      </el-col>
      <el-col :md="12">
        <label class="label">Буквенный код модуля(eng)</label>
        <el-input
            v-model="module_data.code"
            :class="[{'border-red' : errors.code}, 'width-full']"
            @input="module_data.code = module_data.code.replace(/ /ig, '_').replace(/[^a-z_\s]+/iu, '')"
            placeholder="Введите название"
        />
        <small v-if="errors.code" class="font-red">{{errors.code}}</small>

      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <blue-button caption="Сохранить модуль" @click="saveModule"/>
      </el-col>
    </el-row>
  </pre-loader>

</template>

<script setup>
import {ref, reactive, inject, watchEffect, watch, computed} from "vue";
import { useRouter, useRoute } from 'vue-router';
import preLoader from "@/plugins/manage_access/components/pre_loader";
import returnButton from "@/plugins/manage_access/components/return_button"
import blueButton from "@/plugins/manage_access/components/blue_button"
import {ModuleRepo} from "@/plugins/manage_access/repositories";

const user_id      = inject('_user_id');
const notify       = inject('_manage_access_notify');
const router       = useRouter();
const route        = useRoute();

const loading      = ref(false);

const module_data  = reactive({
  code : '',
  name : '',
});

const errors      = reactive({
  code : null,
  name : null,
});

const valid       = () => {
  let isValid = true;
  if(!module_data.name) {isValid = false; errors.name = 'Необходимо указать имя модуля (rus)!'}
  if(!module_data.code) {isValid = false; errors.code = 'Необходимо указать буквенный код модуля (eng)!'}
  return isValid;
};

const getData    = async() => {
  try {
    loading.value = true;
    let result = await ModuleRepo.get({
      module_id : route.params.id,
      user_id
    });

    if(result.data){
      module_data.name = result.data.name;
      module_data.code = result.data.code;
    }

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса получения данных по модулю', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }
};
route.name === 'editModule' ? getData() : '';

const saveModule = async() => {
  if(!valid())return;

  if (route.name === 'addModule'){

    try {
      loading.value = true;
      let result = await ModuleRepo.add({
        name      : module_data.name,
        code      : module_data.code,
        user_id
      });

      router.push({name : 'listModule'})
    } catch (e) {
      notify({title : 'Ошибка при выполнении запроса на создание модуля', message : e.message, type : 'error'});
    } finally {
      loading.value = false;
    }

  }else{

    try {
      loading.value = true;
      let result = await ModuleRepo.edit({
        name      : module_data.name,
        code      : module_data.code,
        module_id : route.params.id,
        user_id
      });

      router.push({name : 'listModule'})
    } catch (e) {
      notify({title : 'Ошибка при выполнении запроса на редактирование модуля', message : e.message, type : 'error'});
    } finally {
      loading.value = false;
    }

  }

};

watchEffect(() => {
  module_data.name ? errors.name = null : '';
  module_data.code ? errors.code = null : '';
});


</script>

<style scoped>
.label{
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}
.mb-15{
  margin-bottom: 15px;
}
.el-col-md-12{
  padding-right: 25px;
}
.font-red{
  color: red;
  font-weight: bold;
}
.border-red{
  border: red solid 1px ;
}
.width-full{
  width: 100%;
}
</style>