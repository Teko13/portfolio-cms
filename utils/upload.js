// Utilitaire pour les uploads de fichiers avec authentification
export async function uploadFile(url, formData) {
  const options = {
    method: 'POST',
    credentials: 'include', // Inclure automatiquement les cookies
    body: formData,
  }

  try {
    const response = await fetch(url, options)
    
    // Si la réponse est 401, rediriger vers la page de connexion
    if (response.status === 401) {
      window.location.href = '/login'
      return null
    }

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'upload')
    }

    return data
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    throw error
  }
}
