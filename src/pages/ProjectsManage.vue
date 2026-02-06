<template>
  <div class="projects-manage">
    <el-card>
      <template #header>
        <span>应用开发管理</span>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 专业能力管理 -->
        <el-tab-pane label="专业能力" name="expertise">
          <ExpertiseManage />
        </el-tab-pane>

        <!-- 合作伙伴管理 -->
        <el-tab-pane label="合作伙伴" name="partners">
          <PartnersManage />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ExpertiseManage from './components/ExpertiseManage.vue'
import PartnersManage from './components/PartnersManage.vue'

const activeTab = ref('expertise')
</script>

<style scoped>
.projects-manage {
  padding: 20px;
}

:deep(.el-tabs__content) {
  padding: 20px 0;
}

.placeholder-content {
  padding: 40px 0;
}
</style>
