<template>
  <pre-loader
      :loading="loading"
      class="group-add"
  >
    <el-row>
      <el-col :span="12">
        <h3>Добавление группы</h3>
      </el-col>
      <el-col :span="12" align="right">
        <return-button/>
      </el-col>
    </el-row>

    <el-row v-if="global" class="mb-15">
      <el-col :md="12">
        <label class="label">Название модуля</label>
        <el-select
            v-model="module"
            :class="[{'border-red' : errors.module}, 'width-full']"
            placeholder="Выбрать"
        >
          <el-option
              v-for="item in module_list"
              :key="item.code"
              :label="item.name"
              :value="item.code"
          >
          </el-option>
        </el-select>
        <small v-if="errors.module" class="font-red">{{errors.module}}</small>
      </el-col>
    </el-row>

    <el-row class="mb-15">
      <el-col :md="12">
        <label class="label">Название группы(rus)</label>
        <el-autocomplete
            v-model="form_data.name"
            :fetch-suggestions="groupSearch"
            :trigger-on-focus="true"
            :class="[{'border-red' : errors.name}, 'width-full']"
            placeholder="Введите название группы(rus)"
        />
        <small v-if="errors.name" class="font-red">{{errors.name}}</small>
      </el-col>
    </el-row>

    <el-row class="mb-15">
      <el-col :md="12">
        <label class="label">Примечание</label>
        <el-input
            v-model="form_data.note"
            type="textarea"
            rows="3"
            :class="['width-full']"
            placeholder="Введите примечание"
        />
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <blue-button caption="Сохранить группу" @click="saveGroup"/>
      </el-col>
    </el-row>

  </pre-loader>
</template>

<script setup>

import {ref, reactive, inject, watchEffect, watch} from "vue";
import { useRouter, useRoute } from 'vue-router';
import {GroupRepo, ModuleRepo} from "@/plugins/manage_access/repositories";
import preLoader from "@/plugins/manage_access/components/pre_loader";
import returnButton from "@/plugins/manage_access/components/return_button"
import blueButton from "@/plugins/manage_access/components/blue_button"

const global       = inject('_global');
const module       = inject('_module');
const module_list  = inject('_module_list');
const user_id      = inject('_user_id');
const notify       = inject('_manage_access_notify');

const router    = useRouter();
const route     = useRoute();
const loading   = ref(false);
const form_data = reactive({
  name : '',
  note : '',
});
const errors           = reactive({
  module : null,
  name   : null,
});

let groups             = ref([]);

const createFilter     = (query) => {
  return (group) => {
    return (
      group.name.toLowerCase().indexOf(query.toLowerCase()) === 0
    )
  }
}

const groupSearch  = (query, cb) => {
  const results = query ? groups.value.filter(createFilter(query, 'name')) : groups.value
  cb(results.map(el => ( { value : el.name} ) ));
};

const getGroups        = async() => {
  try {
    loading.value = true;
    let result = await GroupRepo.all({
      user_id
    });

    if (result.data)
      groups.value = result.data

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса получения списка групп', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }

};
getGroups();

const valid            = () => {
  let isValid = true;
  if(!module.value)   {isValid = false; errors.module = 'Необходимо выбрать модуль!'}
  if(!form_data.name) {isValid = false; errors.name   = 'Необходимо указать название группы (rus)!'}
  return isValid;
};
const saveGroup        = async () => {
  if(!valid())return;

  try {
    loading.value = true;
    let result = await ModuleRepo.attachRole({
      name   : form_data.name,
      note   : form_data.note,
      module : module.value,
      user_id,
    });

    router.push({name : 'listGroup'})

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса создания группы', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }

};

watch(
    () => form_data.name,
    () => {
      form_data.name = form_data.name.replace(/[^а-яё_\s0-9]+/iu, '');
    }
)

watchEffect(() => {
  module.value   ? errors.module = null : '';
  form_data.name ? errors.name   = null : '';
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
.group-add::v-deep .border-red{
  border: red solid 1px ;
}

.group-add::v-deep .width-full{
  width: 100%;
}

</style>