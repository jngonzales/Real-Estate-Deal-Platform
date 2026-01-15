// Health Check Configuration
// Functions to test each endpoint and service

export interface HealthCheck {
  id: string;
  name: string;
  category: 'api' | 'database' | 'integration' | 'feature';
  endpoint: string;
  method: 'GET' | 'POST' | 'HEAD';
  timeout: number;
  description: string;
}

export interface HealthResult {
  id: string;
  name: string;
  category: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime: number | null;
  message: string;
  lastChecked: string;
  endpoint: string;
}

// Health check definitions
export const healthChecks: HealthCheck[] = [
  // API Routes
  {
    id: 'api-usage',
    name: 'Usage API',
    category: 'api',
    endpoint: '/api/usage',
    method: 'HEAD',
    timeout: 5000,
    description: 'Usage tracking endpoint',
  },
  {
    id: 'api-user-role',
    name: 'User Role API',
    category: 'api',
    endpoint: '/api/user/role',
    method: 'GET',
    timeout: 5000,
    description: 'User role endpoint',
  },
  {
    id: 'api-user-org',
    name: 'User Organization API',
    category: 'api',
    endpoint: '/api/user/organization',
    method: 'GET',
    timeout: 5000,
    description: 'User organization endpoint',
  },

  // Database
  {
    id: 'database',
    name: 'Supabase Database',
    category: 'database',
    endpoint: '/api/health/database',
    method: 'GET',
    timeout: 5000,
    description: 'Database connectivity check',
  },

  // Features
  {
    id: 'feature-deals',
    name: 'Deals Feature',
    category: 'feature',
    endpoint: '/dashboard/deals',
    method: 'HEAD',
    timeout: 5000,
    description: 'Deals management page',
  },
  {
    id: 'feature-analytics',
    name: 'Analytics Feature',
    category: 'feature',
    endpoint: '/dashboard/analytics',
    method: 'HEAD',
    timeout: 5000,
    description: 'Analytics dashboard page',
  },
  {
    id: 'feature-calculators',
    name: 'Calculators Feature',
    category: 'feature',
    endpoint: '/calculators',
    method: 'HEAD',
    timeout: 5000,
    description: 'Financial calculators page',
  },
  {
    id: 'feature-formulas',
    name: 'Formula Builder',
    category: 'feature',
    endpoint: '/dashboard/formulas',
    method: 'HEAD',
    timeout: 5000,
    description: 'Custom formula builder page',
  },

  // Integrations
  {
    id: 'integration-geoapify',
    name: 'Geoapify Maps',
    category: 'integration',
    endpoint: '/api/integrations/geoapify',
    method: 'GET',
    timeout: 10000,
    description: 'Geoapify geocoding service',
  },
  {
    id: 'integration-gemini',
    name: 'Google Gemini AI',
    category: 'integration',
    endpoint: '/api/integrations/gemini',
    method: 'GET',
    timeout: 10000,
    description: 'Gemini AI deal scoring',
  },
  {
    id: 'integration-docusign',
    name: 'DocuSign',
    category: 'integration',
    endpoint: '/api/integrations/docusign',
    method: 'GET',
    timeout: 10000,
    description: 'DocuSign e-signatures',
  },
  {
    id: 'integration-email',
    name: 'Email Service',
    category: 'integration',
    endpoint: '/api/integrations/email',
    method: 'GET',
    timeout: 5000,
    description: 'Resend email service',
  },
];

// Run a single health check
export async function runHealthCheck(check: HealthCheck): Promise<HealthResult> {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), check.timeout);
    
    const response = await fetch(check.endpoint, {
      method: check.method,
      signal: controller.signal,
      headers: {
        'X-Health-Check': 'true',
      },
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    // Determine status based on response and time
    let status: HealthResult['status'] = 'healthy';
    let message = 'Operational';
    
    if (!response.ok) {
      status = 'error';
      message = `HTTP ${response.status}: ${response.statusText}`;
    } else if (responseTime > 1000) {
      status = 'warning';
      message = `Slow response (${responseTime}ms)`;
    }
    
    return {
      id: check.id,
      name: check.name,
      category: check.category,
      status,
      responseTime,
      message,
      lastChecked: new Date().toISOString(),
      endpoint: check.endpoint,
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    let message = 'Unknown error';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        message = `Timeout after ${check.timeout}ms`;
      } else {
        message = error.message;
      }
    }
    
    return {
      id: check.id,
      name: check.name,
      category: check.category,
      status: 'error',
      responseTime: responseTime > check.timeout ? null : responseTime,
      message,
      lastChecked: new Date().toISOString(),
      endpoint: check.endpoint,
    };
  }
}

// Run all health checks
export async function runAllHealthChecks(): Promise<HealthResult[]> {
  const results: HealthResult[] = [];
  
  for (const check of healthChecks) {
    const result = await runHealthCheck(check);
    results.push(result);
  }
  
  return results;
}
