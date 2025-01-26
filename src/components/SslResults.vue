<template>
  <div class="ssl-results">
    <div v-if="results" class="results-container">
      <h2>SSL Check Results</h2>
      
      <!-- Basic Check Results -->
      <div v-if="results.basicChecks" class="basic-checks">
        <h3>Basic SSL Check</h3>
        <div class="status-indicator" :class="results.basicChecks.httpsAvailable ? 'success' : 'error'">
          <span class="icon">{{ results.basicChecks.httpsAvailable ? '✓' : '✗' }}</span>
          <span>HTTPS {{ results.basicChecks.httpsAvailable ? 'Available' : 'Not Available' }}</span>
        </div>
        
        <div v-if="results.basicChecks.httpsAvailable" class="details">
          <div class="detail-item">
            <strong>Connection:</strong>
            <div class="sub-details">
              <div>HTTP Version: {{ results.basicChecks.connection.httpVersion }}</div>
              <div>TLS Version: {{ results.basicChecks.connection.clientTLS.version }}</div>
              <div>TLS Cipher: {{ results.basicChecks.connection.clientTLS.cipher }}</div>
            </div>
          </div>

          <div class="detail-item">
            <strong>Server Location:</strong>
            <div class="sub-details">
              <div>Datacenter: {{ results.basicChecks.serverLocation.datacenter }}</div>
              <div>Country: {{ results.basicChecks.serverLocation.country }}</div>
              <div>City: {{ results.basicChecks.serverLocation.city }}</div>
            </div>
          </div>

          <div class="detail-item">
            <strong>Security Headers:</strong>
            <div class="sub-details security-headers">
              <div v-for="(value, header) in results.basicChecks.security.securityHeaders" 
                   :key="header"
                   :class="value !== 'Not Set' ? 'present' : 'missing'"
              >
                {{ header }}: {{ value }}
              </div>
            </div>
          </div>

          <div class="detail-item">
            <strong>Cloudflare Protected:</strong> {{ results.basicChecks.isCloudflareProtected ? 'Yes' : 'No' }}
          </div>
        </div>

        <div v-if="results.status === 'warning'" class="warning">
          {{ results.basicChecks.warning }}
        </div>

        <button 
          v-if="results.basicChecks.httpsAvailable && !sslLabsStarted" 
          @click="$emit('start-full-analysis')"
          class="full-analysis-btn"
        >
          Run Full SSL Analysis
        </button>
      </div>

      <!-- SSL Labs Results -->
      <div v-if="results.status === 'IN_PROGRESS'" class="ssl-labs-progress">
        <h3>SSL Labs Analysis in Progress</h3>
        <div class="progress-indicator">
          <div class="spinner"></div>
          <span>{{ results.statusMessage || 'Analyzing...' }}</span>
        </div>
      </div>

      <div v-if="results.status === 'READY'" class="ssl-labs-results">
        <h3>SSL Labs Analysis Results</h3>
        <div v-for="endpoint in results.endpoints" :key="endpoint.ipAddress" class="endpoint">
          <h4>Endpoint: {{ endpoint.ipAddress }}</h4>
          <div class="grade" :class="endpoint.grade?.toLowerCase()">
            Grade: {{ endpoint.grade || 'N/A' }}
          </div>
          <div class="details">
            <div class="detail-item">
              <strong>Server Name:</strong> {{ endpoint.serverName || 'N/A' }}
            </div>
            <!-- Add more details as needed -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  results: {
    type: Object,
    required: true
  },
  sslLabsStarted: {
    type: Boolean,
    default: false
  }
})

defineEmits(['start-full-analysis'])
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

.basic-checks, .ssl-labs-results {
  margin-top: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.status-indicator.success {
  background-color: #e7f7ed;
  color: #0a7b2d;
}

.status-indicator.error {
  background-color: #fde7e7;
  color: #cf1322;
}

.details {
  margin-top: 15px;
}

.detail-item {
  margin: 5px 0;
}

.full-analysis-btn {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.full-analysis-btn:hover {
  background-color: #096dd9;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.grade {
  font-size: 24px;
  font-weight: bold;
  padding: 10px;
  border-radius: 4px;
  display: inline-block;
  margin: 10px 0;
}

.grade.a {
  background-color: #e7f7ed;
  color: #0a7b2d;
}

.grade.b {
  background-color: #e6f7ff;
  color: #096dd9;
}

.grade.c {
  background-color: #fff7e6;
  color: #d46b08;
}

.grade.f {
  background-color: #fff1f0;
  color: #cf1322;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 