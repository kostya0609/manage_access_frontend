<template>
  <pre-loader
    :loading="loading"
    class="check-rights"
  >
    <h3>Проверить права пользователя</h3>



    <el-row class="mt-15">
      <el-col :md="11">
        <label class="label">Пользователь</label>
        <el-select
            v-model="find_user.id"
            :class="['width-full']"
            filterable
            remote
            reserve-keyword
            :remote-method="search"
            placeholder="Введите ФИО"
            @change="get_rights"
        >
          <el-option
              v-for="item in users_list"
              :key="item.value"
              :label="item.name"
              :value="item.id"
          />
        </el-select>
      </el-col>
      <el-col :md="2">
      </el-col>
      <el-col :md="11">
        <label class="label">Название модуля</label>
        <el-select
            v-model="module"
            :class="['width-full']"
            placeholder="Выбрать"
            @change="get_rights"
        >
          <el-option
              v-for="item in module_list"
              :key="item.code"
              :label="item.name"
              :value="item.code"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>

    <br/>

    <p class="ml-15">ID Пользователя - {{find_user.id ? find_user.id : 'пользователь не выбран.'}}</p>

    <p class="ml-15">Название модуля - {{module ? module : 'модуль не выбран'}}</p>

    <p class="ml-15">Обычные права пользователя:</p>

    <p
      v-if="find_user.rights.length >0"
      v-for="(right, idx) in find_user.rights"
      :key="'right_'+idx"
      class="ml-30"
    >
      - {{right}}
    </p>

    <p v-else  class="ml-30">
      - обычные права отсутствуют
    </p>

    <p class="ml-15">Расширенные права пользователя:</p>

    <el-table
        v-if="find_user.additional_rights.length > 0"
        :data="find_user.additional_rights"
        class="ml-15"
        border
        max-height="600"
        stripe
    >
      <el-table-column                    label="Содержимое права"          >
        <template #default="scope">
          <div v-for="user in scope.row.users">
            - <span>{{user.name}}, {{user.full_access ? 'с полным доступом' : 'без полного доступа'}}</span>
          </div>
          <div v-for="department in scope.row.departments">
            - <span>{{department.name}}, {{department.hierarchy ? 'с иерархией' : 'без иерархии'}} и {{department.full_access ? 'с полным доступом' : 'без полного доступа'}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="date_create" label="Дата создания" width="130"/>
      <el-table-column prop="creator"     label="Создатель"     width="300"/>

    </el-table>
    <p v-else class="ml-30">
      - расширенные права отсутствуют
    </p>

  </pre-loader>
</template>

<script setup>
import {inject, reactive, ref} from "vue";
import {AccessesRepo, ModuleRepo, UserRepo} from "@/repositories";
import preLoader from "@/components/pre_loader";

const module       = inject('module');
const module_list  = inject('module_list');
const notify       = inject('notify');

const find_user   = reactive({
  id     : null,
  rights            : [],
  additional_rights : [],
});

const users_list  = reactive([]);

const loading      = ref(false);

const search      = async(query) => {
  if (!query) return;
  try {
    loading.value = true;

    let result = await UserRepo.search(query);

    users_list.length = 0;
    result.forEach(el =>  users_list.push({id : el.value, name : el.label}))

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса поиска', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }
};

const getModule   = async() => {
  try {
    loading.value = true;
    let result = await ModuleRepo.list();
    module_list.length = 0;
    module_list.push(...result.data);
  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса получения списка модулей', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }
};
getModule();

const get_rights = async() => {
  if(!find_user.id || !module.value) return;

  try {
    loading.value = true;

    let result = await AccessesRepo.rights({
      user_id : find_user.id,
      module  : module.value,
    });

    if(result.data){
      find_user.rights.length = 0;
      find_user.rights.push(... result.data.rights)

      find_user.additional_rights.length = 0;
      find_user.additional_rights.push(result.data.additional_rights);
    }

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса на получение прав пользователя', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
.mb-15{
  margin-bottom: 15px;
}
.mt-15{
  margin-top: 15px;
}
.label{
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}
.ml-15{
  padding-left: 15px;
}
.ml-30{
  padding-left: 30px;
}
.width-full{
  width: 100%;
}
.check-rights::v-deep .el-table .cell{
  word-break: break-word!important;
}


</style>