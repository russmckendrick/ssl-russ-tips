<template>
  <div class="ssl-checker">
    <h1>SSL Certificate Checker</h1>
    <url-input @check-url="handleUrlCheck" :loading="loading" />
    <ssl-results v-if="results" :results="results" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UrlInput from './UrlInput.vue'
import SslResults from './SslResults.vue'

const loading = ref(false)
const results = ref(null)

const handleUrlCheck = async (url) => {
  loading.value = true
  results.value = null
  
  try {
    const response = await fetch(`/analyze?host=${encodeURIComponent(url)}`)
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
</script>

<style scoped>
.ssl-checker {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style> 