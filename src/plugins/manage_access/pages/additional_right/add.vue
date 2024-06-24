<template>
  <pre-loader
      :loading="loading"
      class="right-add"
  >
    <el-row>
      <el-col :span="12">
        <h3>{{route.name === 'addAdditionalRight' ? 'Добавление' : 'Редактирование'}} расширенного права</h3>
      </el-col>
      <el-col :span="12" align="right">
        <return-button/>
      </el-col>
    </el-row>

    <el-row v-if="global && route.name === 'addAdditionalRight'" class="mb-15">
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
        <label class="label">Тип права</label>
        <el-select
            v-model="form_data.type"
            :class="['width-full']"
            placeholder="Выбрать"
            @change="form_data.right_content = ''; right_content_list.length = 0;"
        >
          <el-option
              v-for="item in type_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
      </el-col>
      <el-col :md="12">
        <label class="label">Пользователь права</label>
        <el-select
            v-model="form_data.client_id"
            :class="['width-full', {'border-red' : errors.client_id}]"
            filterable
            remote
            reserve-keyword
            :remote-method="(query) => search(query, 'client')"
            placeholder="Выбрать"
            :disabled="route.name === 'editAdditionalRight' || right_content_table.length > 0"
        >
          <el-option
              v-for="item in client_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.client_id" class="font-red">{{errors.client_id}}</small>
      </el-col>
    </el-row>

    <el-row v-if="form_data.type && form_data.client_id" class="mb-15">
      <el-col :md="12">
        <label class="label">{{right_content_label}}</label>
        <el-select
            v-model="form_data.right_content"
            @change="rightAdd"
            :class="['width-full']"
            filterable
            remote
            reserve-keyword
            :remote-method="(query) => search(query, 'entity')"
            placeholder="Выбрать"
        >
          <el-option
              v-for="item in right_content_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>

    <el-row class="mb-15">
      <el-col :md="24">
        <label class="label">Содержимое права</label>
        <el-table
            :data="right_content_table"
            :class="[{'border-red' : errors.right_content}]"
            border
            stripe
        >
          <el-table-column prop="name"        label="ФИО сотрудника / название отдела / код права"/>
          <el-table-column prop="type_ru"     label="Тип права"    width="260"/>
          <el-table-column prop="hierarchy"   label="С иерарххией" width="130">
            <template #default="scope">
              {{scope.row.hierarchy ? 'Да' : 'Нет'}}
            </template>
          </el-table-column>
          <el-table-column prop="full_access" label="Полный доступ" width="130">
            <template #default="scope">
              {{scope.row.full_access ? 'Да' : 'Нет'}}
            </template>
          </el-table-column>
          <el-table-column  align="center" width="70">
            <template #default="scope">
              <el-button
                  size="small"
                  type="danger"
                  @click="rightDelete(scope.$index, scope.row)"
              >
                <el-icon><CloseBold /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <small v-if="errors.right_content" class="font-red">{{errors.right_content}}</small>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <blue-button caption="Сохранить право" @click="saveRight"/>
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
import  {ElMessageBox }  from 'element-plus';
import {ModuleRepo, UserRepo, DepartmentRepo, AdditionalRightRepo} from "@/plugins/manage_access/repositories";

const global       = inject('_global');
const module       = inject('_module');
const module_list  = inject('_module_list');
const user_id      = inject('_user_id');
const notify       = inject('_manage_access_notify');

const router              = useRouter();
const route               = useRoute();
const loading             = ref(false);
const form_data           = reactive({
  type          : '',
  client_id     : '',
  right_content : '',
});
const errors              = reactive({
  module        : null,
  right_content : null,
  client_id     : null,
});
const type_list           = reactive([
  {value : 'personal_read',                    label : 'Сотрудник, только чтение'                 },
  {value : 'personal_full_access',             label : 'Сотрудник, полный доступ'                 },
  {value : 'department_read',                  label : 'Подразделение без иерархии, только чтение'},
  {value : 'department_full_access',           label : 'Подразделение без иерархии, полный доступ'},
  {value : 'hierarchy_department_read',        label : 'Подразделение с иерархией, только чтение' },
  {value : 'hierarchy_department_full_access', label : 'Подразделение с иерархией, полный доступ' },

]);
const client_list         = reactive([]);
const right_content_list  = reactive([]);
const right_content_table = reactive([]);

const right_content_label = computed(() => {
  let label = '';
  switch (form_data.type){
    case 'personal_read'   :
    case 'personal_full_access'             : label = 'Сотрудник'; break;
    case 'department_read'                  :
    case 'department_full_access'           : label = 'Департамент без иерархии'; break;
    case 'hierarchy_department_read'        :
    case 'hierarchy_department_full_access' : label = 'Департамент с иерархией'; break;
  }

  return label;
});

const search              = async(query, type) => {
  if (!query) return;
  try {
    loading.value = true;
    let result = '';

    if(type === 'entity') {
      if (form_data.type.includes('personal'))
        result = await UserRepo.search(query);

      if (form_data.type.includes('department'))
        result = await DepartmentRepo.search(query);

      right_content_list.length = 0;
      right_content_list.push(...result)
    };

    if(type === 'client'){
      result = await UserRepo.search(query);
      client_list.length = 0;
      client_list.push(...result);
    }

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса поиска', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }
};

const rightAdd            = () => {
  let type = '';
  let type_ru = '';
  if (form_data.type.includes('personal')) {type = 'personal'; type_ru = 'Сотрудник'}
  else if (form_data.type.includes('department')) {type = 'department', type_ru = 'Департамент'};

  let hierarchy = !!form_data.type.includes('hierarchy');

  let full_access = !!form_data.type.includes('full_access');

  let id = form_data.right_content;

  if (right_content_table.find(el => el.id == id && el.type === type) ){
    notify({title : 'Ошибка добавления', message : 'Данное право уже было добавлено ранее.', type : 'error', duration : 5000});
    return;
  }

  right_content_table.push({
    id,
    name : right_content_list.find(el => el.value === form_data.right_content).label,
    type,
    type_ru,
    hierarchy,
    full_access,
  });

  form_data.right_content   = '';
  right_content_list.length = 0;
};

const rightDelete         = (idx, row) => {
  ElMessageBox.confirm(`Вы уверены, что хотите удалить содержимое права - ${row.name ? row.name : row.code} ?`)
      .then(() => right_content_table.splice(idx, 1))
      .catch(() => {})
};

const getEditRight        = async() => {
  try {
    loading.value = true;
    let result = await AdditionalRightRepo.get({
      user_id,
      client_id : route.params.client_id,
      module    : module.value ? module.value : route.params.module,
    });

    if(result.data){
      form_data.client_id = result.data.client_id;
      client_list.length = 0;
      client_list.push({
        value : result.data.client_id,
        label : result.data.name,
      })

      if(result.data.users){
        result.data.users.forEach(el => {
          right_content_table.push({
            id          : el.id,
            name        : el.name,
            type_ru     : 'Сотрудник',
            type        : 'personal',
            hierarchy   : !!el.hierarchy,
            full_access : !!el.full_access,
          });
        })
      }

      if(result.data.departments){
        result.data.departments.forEach(el => {
          right_content_table.push({
            id          : el.id,
            name        : el.name,
            type_ru     : 'Департамент',
            type        : 'department',
            hierarchy   : !!el.hierarchy,
            full_access : !!el.full_access,
          });
        })
      }

    }

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса на получение данных права', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }
};
route.name === 'editAdditionalRight' ? getEditRight() : '';

const valid               = () => {
  let isValid = true;
  if(!module.value && route.name === 'addAdditionalRight') {isValid = false; errors.module        = 'Необходимо выбрать модуль!'}
  if(right_content_table.length === 0)                     {isValid = false; errors.right_content = 'Необходимо добавить содержимое права!'}
  if(!form_data.client_id)                                 {isValid = false; errors.client_id     = 'Необходимо выбрать пользователя права!'}

  return isValid;
};

const saveRight           = async() => {
  if(!valid())return;

  let individuals = [];
  let departments = [];

  right_content_table.forEach(el => {
    if(el.type === 'personal') individuals.push({entity_id : el.id, full_access : el.full_access, user_id : form_data.user_id})
      else departments.push({entity_id : el.id, hierarchy : el.hierarchy, full_access : el.full_access, user_id : form_data.user_id})
  });

  let send_right = {
    module    : module.value,
    right_id  : form_data.id,
    client_id : form_data.client_id,
    individuals,
    departments,
    user_id,
  }

  try {
    loading.value = true;
    let result = await AdditionalRightRepo.set(send_right);
    router.push({name : 'listAdditionalRight'})
  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса на создание расширенного права', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }

};

watchEffect(() => {
  module.value               ? errors.module        = null : '';
  form_data.client_id        ? errors.client_id     = null : '';
  right_content_table.length ? errors.right_content = null : '';
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

.right-add::v-deep .border-red{
  border: red solid 1px ;
}

.right-add::v-deep .width-full{
  width: 100%;
}

.right-add::v-deep .el-table .cell{
  word-break: break-word!important;
}


</style>