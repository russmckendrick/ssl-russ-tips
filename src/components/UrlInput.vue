<template>
  <div class="url-input">
    <form @submit.prevent="handleSubmit">
      <div class="input-group">
        <input 
          type="text" 
          v-model="url" 
          placeholder="Enter domain (e.g., example.com)"
          :disabled="loading"
          required
        >
        <input 
          type="email" 
          v-model="email" 
          placeholder="Your email address"
          :disabled="loading"
          required
        >
        <button type="submit" :disabled="loading">
          {{ loading ? 'Checking...' : 'Check SSL' }}
        </button>
      </div>
      <div class="help-text">
        Email required by SSL Labs API - not stored or used for marketing
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['check-url'])
const url = ref('')
const email = ref(localStorage.getItem('lastEmail') || '')

const handleSubmit = () => {
  localStorage.setItem('lastEmail', email.value)
  emit('check-url', { url: url.value, email: email.value })
}
</script>

<style scoped>
.url-input {
  margin: 20px 0;
}

.input-group {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.help-text {
  margin-top: 8px;
  font-size: 0.8em;
  color: #666;
}
</style> 