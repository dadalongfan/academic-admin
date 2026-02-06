<template>
  <div class="publications-manage">
    <el-card>
      <template #header>
        <span>研究管理</span>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 研究方向管理 -->
        <el-tab-pane label="研究方向" name="directions">
          <ResearchDirectionsManage />
        </el-tab-pane>

        <!-- 阶段成就管理（暂时隐藏）
        <el-tab-pane label="阶段成就" name="achievements">
          <AchievementsManage />
        </el-tab-pane>
        -->

        <!-- 项目管理 -->
        <el-tab-pane label="科研项目" name="projects">
          <ProjectsManage />
        </el-tab-pane>

        <!-- 论文管理 -->
        <el-tab-pane label="代表论文" name="papers">
          <PapersManage />
        </el-tab-pane>

        <!-- 专利管理 -->
        <el-tab-pane label="代表专利" name="patents">
          <PatentsManage />
        </el-tab-pane>

        <!-- 荣誉管理（暂时隐藏）
        <el-tab-pane label="获奖荣誉" name="honors">
          <HonorsManage />
        </el-tab-pane>
        -->
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ResearchDirectionsManage from './components/ResearchDirectionsManage.vue'
import AchievementsManage from './components/AchievementsManage.vue'
import ProjectsManage from './components/ProjectsManage.vue'
import PapersManage from './components/PapersManage.vue'
import PatentsManage from './components/PatentsManage.vue'
import HonorsManage from './components/HonorsManage.vue'

const activeTab = ref('directions')
</script>

<style scoped>
.publications-manage {
  padding: 20px;
}

:deep(.el-tabs__content) {
  padding: 20px 0;
}
</style>
