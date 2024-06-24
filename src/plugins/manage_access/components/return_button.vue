<template>
  <blue-button caption="Вернуться назад" @click="goBack"/>
</template>
<script setup>

import {useRouter} from 'vue-router';
import blueButton from "@/plugins/manage_access/components/blue_button"

const router = useRouter();

function goBack(){
  if(!router.previous){
    router.push({name:'listCheck'});
  } else {
    router.back(1);
  }
};

</script>

<style scoped>

</style>