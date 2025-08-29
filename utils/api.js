// Utilitaire pour les appels API avec authentification automatique
export async function apiCall(url, options = {}) {
  const defaultOptions = {
    credentials: 'include', // Inclure automatiquement les cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, finalOptions)
    
    // Si la réponse est 401, rediriger vers la page de connexion
    if (response.status === 401) {
      window.location.href = '/login'
      return null
    }

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur API')
    }

    return data
  } catch (error) {
    console.error('Erreur lors de l\'appel API:', error)
    throw error
  }
}

// Méthodes HTTP spécifiques
export const api = {
  get: (url) => apiCall(url, { method: 'GET' }),
  post: (url, data) => apiCall(url, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (url, data) => apiCall(url, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (url) => apiCall(url, { method: 'DELETE' }),
}
