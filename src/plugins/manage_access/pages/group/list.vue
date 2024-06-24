<template>
  <pre-loader class="groups-list">
    <el-row v-if="global" >
      <el-col :md="12">
        <h3>Список групп пользователей</h3>
      </el-col>
      <el-col :md="6">
      </el-col>
      <el-col :md="6" class="mt-15">
        <label class="label">Название модуля</label>
        <el-select
            v-model="module"
            :class="['width-full']"
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
      </el-col>
    </el-row>

    <div v-if="module">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :class="['mb-15', {'mt-15' : !global} ]"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      >
      </el-pagination>

      <el-table
          :data="groups_table"
          class="mb-15"
          border
          max-height="600"
          stripe
      >
        <el-table-column prop="id"    label="ID"            width="70"     />
        <el-table-column label="Название"                                   >
          <template #default="scope">
            <div>{{scope.row.name}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="note"       label="Примечание"    width="130"/>
        <el-table-column prop="created_at" label="Дата создания" width="130"/>
        <el-table-column prop="creator"    label="Создатель"     width="200"/>
        <el-table-column width="110" align="center">
          <template #default="scope">
            <el-button
                size="small"
                type="info"
                @click="editGroup(scope.$index, scope.row)"
            >
              <el-icon><Setting /></el-icon>
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="deleteGroup(scope.$index, scope.row)"
                :disabled="!!scope.row.default"
            >
              <el-icon><Remove /></el-icon>
            </el-button>

          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          class="mb-15"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

  </pre-loader>

</template>

<script setup>

import {ref, inject, reactive, watch} from "vue";
import { useRouter, useRoute } from 'vue-router';
import preLoader from "@/plugins/manage_access/components/pre_loader";
import  {ElMessageBox }  from 'element-plus';
import {ModuleRepo, GroupRepo} from "@/plugins/manage_access/repositories";

const global       = inject('_global');
const module       = inject('_module');
const module_list  = inject('_module_list');
const user_id      = inject('_user_id');
const notify       = inject('_manage_access_notify');

const router       = useRouter();
const loading      = ref(false);
const groups_table = reactive([]);
const currentPage  = ref(1);
const pageSize     = ref(10);
const total        = ref(0);

const handleSizeChange    = (val) => {
  pageSize.value = val;
  getData();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  getData();
};

const editGroup           = (idx, row) => {
  module.value  = module.value ? module.value : row.module.code;
  router.push({name : 'editGroup', params : {id : row.id}});
};

const deleteGroup         = async (idx, row) => {
  let msg = row.module.length != 0 ? `Вы уверены, что хотите ОТКРЕПИТЬ ${row.name} группу от модуля?` : `Вы уверены, что хотите УДАЛИТЬ ${row.name} группу?`;

  try {
   await ElMessageBox.confirm(msg);
   loading.value = true;
   if (row.module.length != 0)
     await ModuleRepo.detachRole({
       user_id,
       module : row.module.code,
       role_id : row.id
     });
   else
     await GroupRepo.delete({
       user_id,
       role_id : row.id
     });

    groups_table.splice(idx, 1)

  } catch (e) {
    if (e !== 'cancel')
      notify({title : 'Ошибка при выполнении запроса на открепления / удаление группы', message :e.message, type : 'error', duration : 5000});
  } finally {
    loading.value = false;
  }
};

const getData             = async() => {
  try {
    loading.value = true;
    let result = await GroupRepo.list({
      count  : pageSize.value,
      page   : currentPage.value,
      module : module.value === 'empty_module' ? '' : module.value,
      user_id
    });

    groups_table.length = 0;

    if (result.data){
      groups_table.push(...result.data)
    }

    total.value = result.total ? result.total : 0;

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса получения списка групп', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }

};
module.value ? getData() : '';

watch(
    module,
    () => getData()
)

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
.width-full{
  width: 100%;
}
.groups-list::v-deep .el-table .cell{
  word-break: break-word!important;
}

</style>