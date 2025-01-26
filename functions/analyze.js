async function basicSslCheck(host, context) {
  try {
    // Try HTTPS connection to verify it's available
    const response = await fetch(`https://${host}`, {
      method: 'HEAD',
      headers: { 'User-Agent': 'SSL Checker (ssl.russ.tips)' }
    });

    // Get response headers
    const headers = Object.fromEntries(response.headers);
    
    // Get SSL certificate info using Cloudflare SSL/TLS Verification API
    const sslVerify = await fetch(`https://ssl.${host}`, {
      cf: {
        // Request SSL/TLS certificate details
        scrapeShield: false,
        apps: false,
        cacheEverything: false,
        certificateInfo: true
      }
    });
    
    const cert = sslVerify.cf?.certificate;

    const sslInfo = {
      protocol: 'HTTPS',
      certificate: {
        issuer: cert?.issuer || 'Unknown',
        subject: cert?.subject || 'Unknown',
        notBefore: cert?.notBefore || 'Unknown',
        notAfter: cert?.notAfter || 'Unknown',
        fingerprint: cert?.fingerprint || 'Unknown',
        serialNumber: cert?.serialNumber || 'Unknown'
      },
      security: {
        isHTTPS: true,
        hasHSTS: !!headers['strict-transport-security'],
        securityHeaders: {
          'X-Content-Type-Options': headers['x-content-type-options'] || 'Not Set',
          'X-Frame-Options': headers['x-frame-options'] || 'Not Set',
          'X-XSS-Protection': headers['x-xss-protection'] || 'Not Set',
          'Content-Security-Policy': headers['content-security-policy'] || 'Not Set',
          'Referrer-Policy': headers['referrer-policy'] || 'Not Set',
          'Permissions-Policy': headers['permissions-policy'] || 'Not Set'
        }
      },
      isCloudflareProtected: !!headers['cf-ray']
    };

    return {
      status: 'ok',
      basicChecks: {
        httpsAvailable: true,
        ...sslInfo,
        responseCode: response.status
      }
    };
  } catch (error) {
    // Try HTTP as fallback
    try {
      const httpResponse = await fetch(`http://${host}`, {
        method: 'HEAD',
        headers: { 'User-Agent': 'SSL Checker (ssl.russ.tips)' }
      });

      return {
        status: 'warning',
        basicChecks: {
          httpsAvailable: false,
          httpAvailable: true,
          protocol: 'HTTP',
          responseCode: httpResponse.status,
          warning: 'Site is available over HTTP but not HTTPS',
          error: error.message
        }
      };
    } catch (httpError) {
      return {
        status: 'error',
        basicChecks: {
          httpsAvailable: false,
          httpAvailable: false,
          error: `HTTPS Error: ${error.message}, HTTP Error: ${httpError.message}`
        }
      };
    }
  }
}

async function startSslLabsAnalysis(host, context) {
  const response = await fetch(`https://api.ssllabs.com/api/v4/analyze?host=${encodeURIComponent(host)}&startNew=on`, {
    headers: {
      'email': context.env.SSLLABS_EMAIL
    }
  });
  return await response.json();
}

async function checkSslLabsProgress(host, context) {
  const response = await fetch(`https://api.ssllabs.com/api/v4/analyze?host=${encodeURIComponent(host)}`, {
    headers: {
      'email': context.env.SSLLABS_EMAIL
    }
  });
  return await response.json();
}

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const url = new URL(context.request.url);
  const host = url.searchParams.get('host');
  const action = url.searchParams.get('action') || 'basic'; // basic, start-full, check-progress

  if (!host) {
    return new Response(JSON.stringify({ error: 'Host parameter is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    let data;
    switch (action) {
      case 'basic':
        data = await basicSslCheck(host, context);
        break;
      case 'start-full':
        data = await startSslLabsAnalysis(host, context);
        break;
      case 'check-progress':
        data = await checkSslLabsProgress(host, context);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
} 