<template>
  <div class="page-container">
    <div class="page-header">
      <h2>提交作业</h2>
      <p class="page-desc">填写作业参数并提交到集群</p>
    </div>

    <el-card shadow="never" class="form-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        size="default"
      >
        <el-form-item label="作业名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入作业名称" />
        </el-form-item>

        <el-form-item label="分区/队列" prop="partition">
          <el-select v-model="formData.partition" placeholder="请选择分区" style="width: 100%">
            <el-option label="CPU分区" value="cpu" />
            <el-option label="GPU分区" value="gpu" />
            <el-option label="高性能分区" value="high-perf" />
            <el-option label="大数据分区" value="big-data" />
          </el-select>
        </el-form-item>

        <el-form-item label="作业脚本" prop="script">
          <el-input
            v-model="formData.script"
            type="textarea"
            :rows="4"
            placeholder="请输入作业脚本内容，例如：#!/bin/bash&#10;echo 'Hello World'"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="节点数">
              <el-input-number v-model="formData.nodes" :min="1" :max="999" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="CPU核数">
              <el-input-number v-model="formData.cpus" :min="1" :max="256" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="GPU数">
              <el-input-number v-model="formData.gpus" :min="0" :max="64" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="内存要求">
              <el-select v-model="formData.memory" placeholder="请选择内存" style="width: 100%">
                <el-option label="4GB" value="4GB" />
                <el-option label="8GB" value="8GB" />
                <el-option label="16GB" value="16GB" />
                <el-option label="32GB" value="32GB" />
                <el-option label="64GB" value="64GB" />
                <el-option label="128GB" value="128GB" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运行时长">
              <el-select v-model="formData.walltime" placeholder="请选择时长" style="width: 100%">
                <el-option label="1小时" value="1:00:00" />
                <el-option label="4小时" value="4:00:00" />
                <el-option label="12小时" value="12:00:00" />
                <el-option label="24小时" value="24:00:00" />
                <el-option label="48小时" value="48:00:00" />
                <el-option label="72小时" value="72:00:00" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="输出目录">
          <el-input v-model="formData.outputDir" placeholder="如不指定则使用默认输出目录" />
        </el-form-item>

        <el-form-item label="错误目录">
          <el-input v-model="formData.errorDir" placeholder="如不指定则使用默认错误目录" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            提交作业
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { JobSubmission } from '@/types'
import { submitJob } from '@/api/modules/jobs'

const formRef = ref<FormInstance>()

const formData = reactive<JobSubmission>({
  name: '',
  script: '',
  partition: '',
  nodes: 1,
  cpus: 1,
  gpus: 0,
  memory: '',
  walltime: '',
  outputDir: '',
  errorDir: '',
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入作业名称', trigger: 'blur' },
    { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' },
  ],
  partition: [
    { required: true, message: '请选择分区/队列', trigger: 'change' },
  ],
  script: [
    { required: true, message: '请输入作业脚本', trigger: 'blur' },
  ],
}

const submitting = ref(false)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await submitJob(formData)
    ElMessage.success(`作业提交成功，作业ID: ${res.data.jobId}`)
    handleReset()
  } catch {
    ElMessage.error('作业提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

function handleReset() {
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px;
    font-size: 20px;
    color: #303133;
  }

  .page-desc {
    margin: 0;
    font-size: 14px;
    color: #909399;
  }
}

.form-card {
  max-width: 780px;
}
</style>
