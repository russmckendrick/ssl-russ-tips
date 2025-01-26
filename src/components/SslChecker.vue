<template>
  <div class="ssl-checker">
    <h1>SSL Certificate Checker</h1>
    
    <!-- Registration form if not registered -->
    <div v-if="!registeredEmail" class="registration-form">
      <h2>Register to use SSL Checker</h2>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <input 
            type="text" 
            v-model="registration.firstName" 
            placeholder="First Name"
            required
          >
          <input 
            type="text" 
            v-model="registration.lastName" 
            placeholder="Last Name"
            required
          >
        </div>
        <div class="form-group">
          <input 
            type="email" 
            v-model="registration.email" 
            placeholder="Organization Email"
            required
          >
          <input 
            type="text" 
            v-model="registration.organization" 
            placeholder="Organization Name"
            required
          >
        </div>
        <button type="submit" :disabled="registering">
          {{ registering ? 'Registering...' : 'Register' }}
        </button>
      </form>
    </div>

    <!-- SSL checker form if registered -->
    <template v-else>
      <url-input @check-url="handleUrlCheck" :loading="loading" />
      <ssl-results v-if="results" :results="results" />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UrlInput from './UrlInput.vue'
import SslResults from './SslResults.vue'

const WORKER_URL = 'https://your-worker.workers.dev' // Update this with your worker URL

const loading = ref(false)
const results = ref(null)
const registering = ref(false)
const registeredEmail = ref(localStorage.getItem('registeredEmail'))

const registration = ref({
  firstName: '',
  lastName: '',
  email: '',
  organization: ''
})

const handleRegister = async () => {
  registering.value = true
  try {
    const response = await fetch(`${WORKER_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registration.value)
    })
    
    const data = await response.json()
    if (data.status === 'success') {
      registeredEmail.value = registration.value.email
      localStorage.setItem('registeredEmail', registration.value.email)
    } else {
      alert(data.message || 'Registration failed')
    }
  } catch (error) {
    alert('Error during registration: ' + error.message)
  } finally {
    registering.value = false
  }
}

const handleUrlCheck = async (url) => {
  loading.value = true
  results.value = null
  
  try {
    const response = await fetch(`${WORKER_URL}/analyze?host=${encodeURIComponent(url)}`, {
      headers: {
        'email': registeredEmail.value
      }
    })
    
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

.registration-form {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  gap: 10px;
}

.form-group input {
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
</style> 