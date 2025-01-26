<template>
  <div class="ssl-results">
    <div v-if="results" class="results-container">
      <h2>SSL Check Results</h2>
      <pre>{{ results }}</pre>
    </div>
  </div>
</template>

<script setup>
defineProps({
  results: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.ssl-results {
  margin-top: 20px;
}

.results-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 