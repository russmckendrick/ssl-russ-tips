<template>
  <div class="ssl-checker">
    <h1>SSL Certificate Checker</h1>
    <url-input @check-url="handleUrlCheck" :loading="loading" />
    <ssl-results 
      v-if="results" 
      :results="results" 
      :sslLabsStarted="sslLabsStarted"
      @start-full-analysis="startFullAnalysis" 
    />
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import UrlInput from './UrlInput.vue'
import SslResults from './SslResults.vue'

const loading = ref(false)
const results = ref(null)
const currentHost = ref('')
const sslLabsStarted = ref(false)
let pollInterval = null

const handleUrlCheck = async (url) => {
  loading.value = true
  results.value = null
  currentHost.value = url
  sslLabsStarted.value = false
  clearInterval(pollInterval)
  
  try {
    const response = await fetch(`/analyze?host=${encodeURIComponent(url)}&action=basic`)
    const data = await response.json()
    if (response.ok) {
      results.value = data
    } else {
      throw new Error(data.error || 'Failed to check SSL')
    }
  } catch (error) {
    console.error('Error checking SSL:', error)
    alert(error.message)
  } finally {
    loading.value = false
  }
}

const startFullAnalysis = async () => {
  if (!currentHost.value) return

  loading.value = true
  sslLabsStarted.value = true
  
  try {
    const response = await fetch(`/analyze?host=${encodeURIComponent(currentHost.value)}&action=start-full`)
    const data = await response.json()
    if (response.ok) {
      results.value = { ...data, status: 'IN_PROGRESS' }
      startPolling()
    } else {
      throw new Error(data.error || 'Failed to start SSL Labs analysis')
    }
  } catch (error) {
    console.error('Error starting SSL Labs analysis:', error)
    alert(error.message)
    sslLabsStarted.value = false
  } finally {
    loading.value = false
  }
}

const checkProgress = async () => {
  try {
    const response = await fetch(`/analyze?host=${encodeURIComponent(currentHost.value)}&action=check-progress`)
    const data = await response.json()
    if (response.ok) {
      results.value = data
      if (data.status === 'READY' || data.status === 'ERROR') {
        clearInterval(pollInterval)
      }
    } else {
      throw new Error(data.error || 'Failed to check progress')
    }
  } catch (error) {
    console.error('Error checking progress:', error)
    clearInterval(pollInterval)
  }
}

const startPolling = () => {
  clearInterval(pollInterval)
  pollInterval = setInterval(checkProgress, 10000) // Check every 10 seconds
}

// Clean up interval when component is unmounted
onUnmounted(() => {
  clearInterval(pollInterval)
})
</script>

<style scoped>
.ssl-checker {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style> 