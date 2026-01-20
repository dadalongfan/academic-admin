<template>
  <div class="publications-manage">
    <el-card>
      <template #header>
        <span>科研成果管理</span>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 阶段成就管理 -->
        <el-tab-pane label="阶段成就" name="achievements">
          <AchievementsManage />
        </el-tab-pane>

        <!-- 论文管理 -->
        <el-tab-pane label="代表论文" name="papers">
          <PapersManage />
        </el-tab-pane>

        <!-- 专利管理 -->
        <el-tab-pane label="代表专利" name="patents">
          <PatentsManage />
        </el-tab-pane>

        <!-- 荣誉管理 -->
        <el-tab-pane label="获奖荣誉" name="honors">
          <HonorsManage />
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
import AchievementsManage from './components/AchievementsManage.vue'
import PapersManage from './components/PapersManage.vue'
import PatentsManage from './components/PatentsManage.vue'
import HonorsManage from './components/HonorsManage.vue'
import PartnersManage from './components/PartnersManage.vue'

const activeTab = ref('achievements')
</script>

<style scoped>
.publications-manage {
  padding: 20px;
}

:deep(.el-tabs__content) {
  padding: 20px 0;
}
</style>
