async function basicSslCheck(host) {
  try {
    // Try HTTPS connection
    const response = await fetch(`https://${host}`, {
      method: 'HEAD',
      headers: { 'User-Agent': 'SSL Checker (ssl.russ.tips)' }
    });

    // Get response headers
    const headers = Object.fromEntries(response.headers);
    
    // Extract Cloudflare SSL/TLS info from the connection
    const cfResponse = await response.cf;
    
    const sslInfo = {
      protocol: 'HTTPS',
      tlsVersion: cfResponse?.tlsVersion || headers['cf-tls-version'],
      tlsCipher: cfResponse?.tlsCipher || headers['cf-tls-cipher'],
      isCloudflareProtected: !!headers['cf-ray'],
      serverLocation: {
        datacenter: cfResponse?.colo || 'Unknown',
        country: cfResponse?.country || 'Unknown',
        city: cfResponse?.city || 'Unknown'
      },
      connection: {
        httpVersion: cfResponse?.httpProtocol || 'Unknown',
        clientTLS: {
          version: cfResponse?.tlsVersion || 'Unknown',
          cipher: cfResponse?.tlsCipher || 'Unknown'
        }
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
      }
    };

    return {
      status: 'ok',
      basicChecks: {
        httpsAvailable: true,
        ...sslInfo,
        responseCode: response.status,
        fullHeaders: headers
      }
    };
  } catch (error) {
    // Try HTTP as fallback to check if the site is available at all
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

async function startSslLabsAnalysis(host) {
  const response = await fetch(`https://api.ssllabs.com/api/v4/analyze?host=${encodeURIComponent(host)}&startNew=on`, {
    headers: {
      'email': context.env.SSLLABS_EMAIL
    }
  });
  return await response.json();
}

async function checkSslLabsProgress(host) {
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
        data = await basicSslCheck(host);
        break;
      case 'start-full':
        data = await startSslLabsAnalysis(host);
        break;
      case 'check-progress':
        data = await checkSslLabsProgress(host);
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