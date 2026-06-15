<template>
  <div class="login-container">
    <div class="login-card-wrapper">
      <el-card shadow="always" class="login-card">
        <div class="login-header">
          <h2 class="login-title">算力支撑管理系统</h2>
          <p class="login-subtitle">Computing Resource Management System</p>
        </div>

        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          size="large"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="formData.username"
              placeholder="用户名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loggingIn"
              style="width: 100%"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const loggingIn = ref(false)

const formData = reactive({
  username: '',
  password: '',
})

const rememberPassword = ref(false)

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loggingIn.value = true
  try {
    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Save token to localStorage
    localStorage.setItem('token', 'mock-token-' + Date.now())

    ElMessage.success('登录成功')

    // Redirect to the page the user was trying to access, or home
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    ElMessage.error('登录失败，请重试')
  } finally {
    loggingIn.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card-wrapper {
  width: 400px;
}

.login-card {
  border-radius: 8px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .login-title {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 700;
    color: #303133;
  }

  .login-subtitle {
    margin: 0;
    font-size: 14px;
    color: #909399;
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }
}
</style>
