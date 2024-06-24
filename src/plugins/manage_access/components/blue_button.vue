<template>
  <el-button class="blueButton">{{caption}}</el-button>
</template>

<script setup>

defineProps({
  caption: {
    type: String,
    default: '',
  }
});

</script>

<style scoped>

.blueButton{
  color: #fff!important;
  background: #3bc8f5!important;
  border-color: #3bc8f5!important;
}

.blueButton:hover{
  background: #3fddff !important;
}

</style>