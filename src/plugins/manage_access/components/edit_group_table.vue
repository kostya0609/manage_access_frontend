<template>
  <el-table
      :data="table_data"
      class="mb-15"
      border
      max-height="600"
      stripe
  >
    <el-table-column prop="id"   label="ID" width="70"/>
    <el-table-column prop="name" label="Название"     />
    <el-table-column width="70" align="center">
      <template #default="scope">
        <el-button
          size="small"
          type="danger"
          @click="emit('delete_row', scope.$index, scope.row, table_type)"
          :disabled="!!scope.row.default"
        >
          <el-icon><Remove /></el-icon>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
defineProps({
  table_data: {
    type: Array,
    default: [],
  },
  table_type:{
    type:String,
    default: '',
  }
});

const emit = defineEmits(['delete_row']);

</script>

<style scoped>
.mb-15{
  margin-bottom: 15px;
}

</style>