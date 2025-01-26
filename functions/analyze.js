async function basicSslCheck(host) {
  try {
    // Try HTTPS connection
    const response = await fetch(`https://${host}`, {
      method: 'HEAD',
      headers: { 'User-Agent': 'SSL Checker (ssl.russ.tips)' }
    });

    // Get SSL certificate info from response
    const cfSslInfo = {
      protocol: response.headers.get('cf-ray') ? 'HTTPS' : 'HTTP',
      tlsVersion: response.headers.get('cf-tls-version'),
      tlsCipher: response.headers.get('cf-tls-cipher'),
      isCloudflareProtected: !!response.headers.get('cf-ray')
    };

    return {
      status: 'ok',
      basicChecks: {
        httpsAvailable: true,
        ...cfSslInfo,
        responseCode: response.status,
        headers: Object.fromEntries(response.headers)
      }
    };
  } catch (error) {
    return {
      status: 'error',
      basicChecks: {
        httpsAvailable: false,
        error: error.message
      }
    };
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