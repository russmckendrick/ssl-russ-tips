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
    // We'll implement the API call later
    console.log('Checking URL:', url)
  } catch (error) {
    console.error('Error checking SSL:', error)
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