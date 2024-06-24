<template>
  <pre-loader
      :loading="loading"
  >
    <el-row>
      <el-col :span="20">
        <h3>Редактирование группы - {{group_name}},  модуля - {{module}}</h3>
      </el-col>
      <el-col :span="4" align="right">
        <return-button/>
      </el-col>
    </el-row>

    <el-row class="mb-15">
      <el-col :md="11">
        <label class="label">Права</label>
        <el-select
          v-model="right"
          :class="['width-full']"
          @change="rightAdd"
          placeholder="Выбрать"
        >
        <el-option
          v-for="item in rights_list"
          :key="item.value"
          :label="item.name"
          :value="item.id"
        />
        </el-select>
       </el-col>
      <el-col :span="1"/>
      <el-col :md="11">
        <label class="label">Пользователи</label>
        <el-select
          v-model="user"
          :class="['width-full']"
          @change="userAdd"
          filterable
          remote
          reserve-keyword
          :remote-method="search"
          placeholder="Введите ФИО"
        >
        <el-option
          v-for="item in users_list"
          :key="item.value"
          :label="item.name"
          :value="item.id"
          />
        </el-select>
      </el-col>
    </el-row>

    <el-row class="mb-15">
      <el-col :md="11">
        <label class="label">Список прав группы</label>
        <edit-group-table
         :table_data = rights
         table_type="rights"
         @delete_row="delete_row"
        />
      </el-col>
      <el-col :span="1"/>
      <el-col :md="11">
        <label class="label">Список пользователей группы</label>
        <edit-group-table
          :table_data = users
          table_type="users"
          @delete_row="delete_row"
        />
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <blue-button caption="Сохранить изменения в группе" @click="saveGroup"/>
      </el-col>
    </el-row>

  </pre-loader>
</template>

<script setup>
import {ref, reactive, inject, watchEffect} from "vue";
import { useRouter, useRoute } from 'vue-router';
import preLoader from "@/plugins/manage_access/components/pre_loader";
import returnButton from "@/plugins/manage_access/components/return_button"
import blueButton from "@/plugins/manage_access/components/blue_button"
import editGroupTable from "@/plugins/manage_access/components/edit_group_table"
import {GroupRepo, UserRepo, RightRepo} from "@/plugins/manage_access/repositories";
import  {ElMessageBox }  from 'element-plus';

const user_id = inject('_user_id');
const module  = inject('_module');
const notify  = inject('_manage_access_notify');

const route       = useRoute();
const router      = useRouter();

const loading     = ref(false);
const group_name  = ref('');

const right       = ref('');
const rights      = reactive([]);
const rights_list = reactive([]);

const user        = ref('');
const users       = reactive([]);
const users_list  = reactive([]);

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

const getRights   = async () => {
  try {
    loading.value = true;
    let result = await RightRepo.list({
      count  : '',
      page   : '',
      module : module.value,
      user_id
    });

    if (result.data){
      rights_list.length = 0;
      rights_list.push(...result.data)
    }

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса получения всех прав модуля', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }
};
getRights();

const getData     = async () => {
  try {
    loading.value = true;
    let result = await GroupRepo.get({
      user_id,
      role_id : route.params.id,
      module  : module.value
    });

    if (result.data && result.data.module){
      group_name.value = result.data.name;
      module.value = result.data.module.code;
      rights.push(...result.data.module.rights);
      users.push(...result.data.module.users);
    }

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса получения данных группы', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }
};
getData();

const userAdd     = () => {
  if(!users.find(el => el.id == user.value))
    users.push({id : user.value, name : users_list.find(el => el.id == user.value).name});
      else
        notify({title : 'Ошибка добавления пользователя', message : 'Выбранный пользватель уже был добавлен', type : 'error'});
  user.value = '';
};

const rightAdd    = () => {
  if(!rights.find(el => el.id == right.value))
    rights.push({id : right.value, name : rights_list.find(el => el.id == right.value).name});
      else
        notify({title : 'Ошибка добавления права', message : 'Выбранное право уже было добавлено', type : 'error'});
  right.value = '';
};

const delete_row  = async (idx, row, type) => {
  ElMessageBox.confirm(`Вы уверены, что хотите удалить ${type == 'rights' ? 'право' : 'пользователя'} - ${row.name} ?`)
    .then(() => {
      if (type == 'rights')
        rights.splice(idx, 1)

      if (type == 'users')
        users.splice(idx, 1)
    })
    .catch(() => {})
};

const saveGroup   = async () => {
  try {
    loading.value = true;
    await GroupRepo.edit({
      module  : module.value,
      user_id,
      role_id : route.params.id,
      users   : users.map(el => el.id),
      rights  : rights.map(el => el.id),
    });

    router.push({name : 'listGroup'});

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса редактирования данных группы', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }

};

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
.el-col-md-1{
  padding-right: 15px;
}
.el-col-sm-2{
  padding-right: 15px;
}
.el-col-xs-3{
  padding-right: 15px;
}
.el-col-md-10{
  padding-right: 15px;
}
.el-col-md-11{
  padding-right: 15px;
}
.width-full{
  width: 100%;
}
</style>