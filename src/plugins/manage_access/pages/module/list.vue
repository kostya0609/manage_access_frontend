<template>
  <pre-loader
      :loading="loading"
  >
  <h3>Список модулей</h3>

  <el-table
        :data="modules_table"
        class="mb-15"
        border
        max-height="600"
        stripe
    >
      <el-table-column prop="id"   label="ID" width="70" />
      <el-table-column prop="name" label="Название (rus)"/>
      <el-table-column prop="code" label="Название (eng)"/>
      <el-table-column width="70" align="center">
        <template #default="scope">
          <el-button
              size="small"
              type="info"
              @click="editModule(scope.$index, scope.row)"
          >
            <el-icon><Setting /></el-icon>
          </el-button>

        </template>
      </el-table-column>
    </el-table>

  </pre-loader>
</template>

<script setup>
import {ref, reactive, inject, watchEffect, watch, computed} from "vue";
import preLoader from "@/plugins/manage_access/components/pre_loader";
import {ModuleRepo} from "@/plugins/manage_access/repositories";
import { useRouter, useRoute } from 'vue-router';

const module_list   = inject('_module_list');
const user_id       = inject('_user_id');
const notify        = inject('_manage_access_notify');

const router        = useRouter();
const loading       = ref(false);
const modules_table = reactive([]);

const editModule   = (idx, row) => {
  router.push({name : 'editModule', params : {id : row.id}})
};

const getData      = async () => {
  try {
    loading.value = true;
    let result = await ModuleRepo.list();
    if (result.data) {
      modules_table.push(...result.data);

      module_list.length = 0;
      module_list.push(...result.data);
      module_list.push({code : 'empty_module', name : 'Нет модуля'})
    }
  } catch (e) {
    notify({title : 'Ошибка при выполнении запроса получения списка модулей', message : e.message, type : 'error'});
  } finally {
    loading.value = false;
  }

};
getData();

</script>

<style scoped>


</style>