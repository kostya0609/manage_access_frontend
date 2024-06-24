<template>
  <pre-loader class="additional-rights-list">
    <el-row v-if="global" >
      <el-col :md="12">
        <h3>Список расширенных прав</h3>
      </el-col>
      <el-col :md="6">
      </el-col>
      <el-col :md="6" v-if="global" class="mt-15">
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
          :data="rights_table"
          class="mb-15"
          border
          max-height="600"
          stripe
      >
        <el-table-column prop="client_id" label="ID"            width="70" />
        <el-table-column prop="name"      label="Пользователь права"       />
        <el-table-column prop="content"   label="Содержимое права"          >
          <template #default="scope">
            <div v-for="item in scope.row.content">
              - <span v-html="item"></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="date"      label="Дата создания" width="130"/>
        <el-table-column prop="creator"   label="Создатель"     width="300"/>
        <el-table-column width="110" align="center">
          <template #default="scope">
            <el-button
                size="small"
                type="info"
                @click="editRight(scope.$index, scope.row)"
                :disabled="!!scope.row.default"
            >
              <el-icon><Setting /></el-icon>
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="deleteRight(scope.$index, scope.row)"
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
import {AdditionalRightRepo, ModuleRepo} from "@/plugins/manage_access/repositories";

const global       = inject('_global');
const module       = inject('_module');
const module_list  = inject('_module_list');
const user_id      = inject('_user_id');
const notify       = inject('_manage_access_notify');

const router       = useRouter();
const loading      = ref(false);
const rights_table = reactive([]);
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
const editRight           = (idx, row) => {
  router.push({name : 'editAdditionalRight', params : {module : module.value, client_id : row.client_id}})
};
const deleteRight         = async (idx, row) => {
  try {
    await ElMessageBox.confirm(`Вы уверены, что хотите удалить ${row.name} расширенное право?`);
    loading.value = true;

    await AdditionalRightRepo.set({
      user_id,
      client_id   : row.client_id,
      module      : module.value,
      individuals : [],
      departments : [],
    });

    rights_table.splice(idx, 1);

  } catch (e) {
    if (e !== 'cancel')
      notify({title : 'Ошибка при выполнении запроса на удаление расширенного права', message :e.message, type : 'error', duration : 5000});
  } finally {
    loading.value = false;
  }
};

const getData             = async() => {
  try {
    loading.value = true;
    let result = await AdditionalRightRepo.list({
      count  : pageSize.value,
      page   : currentPage.value,
      module : module.value,
      user_id
    });

    rights_table.length = 0;

    if (result.data)

      result.data.forEach(el => {
        let content = [];
          if (Array.isArray(el.users))
            el.users.forEach(user => content.push(user.name + (user.full_access ? ' - с полным доступом' : ' - без полного доступа')  ))

          if (Array.isArray(el.departments))
            el.departments.forEach(department => content.push(department.name + (department.hierarchy ? ' - с иерархией' : ' - без иерархии')+ ' и '  + (department.full_access ? 'с полным доступом' : 'без полного доступа') ))

          rights_table.push({
            client_id : el.client_id,
            name      : el.name,
            date      : el.date_create,
            creator   : el.creator,
            content
          })

      });

    total.value = result.total ? result.total : 0;

  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса получения списка расширенных прав', message : e.message, type : 'error'});
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
.additional-rights-list::v-deep .el-table .cell{
  word-break: break-word!important;
}
</style>