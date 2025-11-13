'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/app/components/Sidebar'

export default function ApiDocsPage() {
  const [selectedTable, setSelectedTable] = useState('moi')
  const [baseUrl, setBaseUrl] = useState('')
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    // Récupérer l'URL de base dynamiquement
    setBaseUrl(window.location.origin)
  }, [])

  const copyToClipboard = async (tableName) => {
    const endpoint = apiEndpoints[tableName]
    const documentation = {
      endpoint: `${baseUrl}${endpoint.path}`,
      method: 'GET',
      authentication: 'Non requise (lecture publique)',
      description: endpoint.description,
      response_structure: endpoint.response,
      example_response: getExampleResponse(tableName)
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(documentation, null, 2))
      setCopyMessage(`Documentation de ${tableName} copiée !`)
      setTimeout(() => setCopyMessage(''), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
      setCopyMessage('Erreur lors de la copie')
      setTimeout(() => setCopyMessage(''), 2000)
    }
  }

  const getExampleResponse = (tableName) => {
    switch (tableName) {
      case 'moi':
        return {
          success: true,
          data: {
            id: 1,
            nom: "Folly",
            prenom: "Fabrice",
            email: "teko.fabrice@gmail.com",
            telephone: "+33 7 45 17 88 05",
            date_naissance: "2000-05-17T00:00:00.000Z",
            titre: "Développeur Web et Mobile web full-stack",
            ma_photo_url: "https://example.com/photo.jpg",
            resume: "Résumé professionnel...",
            cv_url: "https://example.com/cv.pdf"
          }
        }
      case 'competences':
        return {
          success: true,
          data: [
            {
              id: 1,
              titre: "React",
              description: "Framework JavaScript pour le développement d'interfaces utilisateur."
            }
          ]
        }
      case 'projets':
        return {
          success: true,
          data: [
            {
              id: 1,
              titre: "Portfolio CMS",
              description: "Application de gestion de portfolio...",
              image_url: "https://example.com/image.jpg",
              video_url: "https://example.com/video.mp4",
              acces_url: "https://example.com",
              source_url: "https://github.com/example",
              category: "Web",
              index: 1,
              cree_le: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      case 'parcours':
        return {
          success: true,
          data: [
            {
              id: 1,
              obtenu_en: "2020-01-01T00:00:00.000Z",
              titre: "Master en Informatique",
              ecole: "Université Example",
              diplome_pdf_url: "https://example.com/diplome.pdf"
            }
          ]
        }
      case 'loisirs':
        return {
          success: true,
          data: [
            {
              id: 1,
              description: "Photographie, lecture, sport"
            }
          ]
        }
      case 'reseau':
        return {
          success: true,
          data: [
            {
              id: 1,
              nom: "GitHub",
              url: "https://github.com/example",
              icon_url: "https://example.com/icon.svg"
            }
          ]
        }
      case 'galerie':
        return {
          success: true,
          data: [
            {
              id: 1,
              photo_url: "https://example.com/photo.jpg",
              titre: "Photo de voyage"
            }
          ]
        }
      default:
        return {}
    }
  }

  const apiEndpoints = {
    moi: {
      path: '/api/portfolio/moi',
      description: 'Récupère les informations personnelles (nom, prénom, email, téléphone, date de naissance, titre, photo, description, résumé, CV)',
      response: {
        success: 'boolean',
        data: {
          id: 'number',
          nom: 'string',
          prenom: 'string',
          email: 'string',
          telephone: 'string',
          date_naissance: 'string (ISO date)',
          titre: 'string',
          ma_photo_url: 'string (URL)',
          resume: 'string',
          cv_url: 'string (URL)'
        }
      }
    },
    competences: {
      path: '/api/portfolio/competences',
      description: 'Récupère la liste des compétences techniques avec leur titre et description',
      response: {
        success: 'boolean',
        data: [
          {
            id: 'number',
            titre: 'string',
            description: 'string'
          }
        ]
      }
    },
    projets: {
      path: '/api/portfolio/projets',
      description: 'Récupère la liste des projets avec leurs détails, images, vidéos et liens',
      response: {
        success: 'boolean',
        data: [
          {
            id: 'number',
            titre: 'string',
            description: 'string',
            image_url: 'string (URL, nullable)',
            video_url: 'string (URL, nullable)',
            acces_url: 'string (URL)',
            source_url: 'string (URL)',
            category: 'string',
            index: 'number',
            cree_le: 'string (ISO date)'
          }
        ]
      }
    },
    parcours: {
      path: '/api/portfolio/parcours',
      description: 'Récupère le parcours éducatif avec diplômes et certifications',
      response: {
        success: 'boolean',
        data: [
          {
            id: 'number',
            obtenu_en: 'string (ISO date)',
            titre: 'string',
            ecole: 'string',
            diplome_pdf_url: 'string (URL)'
          }
        ]
      }
    },
    loisirs: {
      path: '/api/portfolio/loisirs',
      description: 'Récupère la description des loisirs et centres d\'intérêt',
      response: {
        success: 'boolean',
        data: [
          {
            id: 'number',
            description: 'string'
          }
        ]
      }
    },
    reseau: {
      path: '/api/portfolio/reseau',
      description: 'Récupère les liens vers les réseaux sociaux et professionnels',
      response: {
        success: 'boolean',
        data: [
          {
            id: 'number',
            nom: 'string',
            url: 'string (URL)',
            icon_url: 'string (URL)'
          }
        ]
      }
    },
    galerie: {
      path: '/api/portfolio/galerie',
      description: 'Récupère la galerie d\'images personnelles',
      response: {
        success: 'boolean',
        data: [
          {
            id: 'number',
            photo_url: 'string (URL)',
            titre: 'string'
          }
        ]
      }
    }
  }

  const tables = Object.keys(apiEndpoints)

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Documentation API
            </h1>
            <p className="text-gray-300 text-lg">
              Documentation complète des endpoints GET de l'application portfolio
            </p>
          </div>

          {/* Navigation des tables */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {tables.map((table) => (
                <button
                  key={table}
                  onClick={() => setSelectedTable(table)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedTable === table
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {table.charAt(0).toUpperCase() + table.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Message de copie */}
          {copyMessage && (
            <div className="mb-6 p-4 bg-green-600 text-white rounded-lg text-center">
              {copyMessage}
            </div>
          )}

          {/* Documentation de l'endpoint sélectionné */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-blue-400 mb-2">
                  {selectedTable.charAt(0).toUpperCase() + selectedTable.slice(1)}
                </h2>
                <p className="text-gray-300 mb-4">
                  {apiEndpoints[selectedTable].description}
                </p>
              </div>
              
              {/* Bouton Copier */}
              <button
                onClick={() => copyToClipboard(selectedTable)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                title="Copier toute la documentation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copier
              </button>
            </div>

            {/* URI */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">URI</h3>
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <code className="text-green-400 break-all">
                  {baseUrl}{apiEndpoints[selectedTable].path}
                </code>
              </div>
            </div>

            {/* Méthode HTTP */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Méthode</h3>
              <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">
                GET
              </span>
            </div>

            {/* Authentification */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Authentification</h3>
            <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">
              Non requise (lecture publique)
            </span>
            <p className="text-gray-400 text-sm mt-2">
              Note : Seuls les endpoints de modification (POST, PUT, DELETE) nécessitent une authentification
            </p>
          </div>

          {/* Structure de la réponse */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Structure de la réponse</h3>
            <div className="bg-gray-800 p-4 rounded border border-gray-700 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{JSON.stringify(apiEndpoints[selectedTable].response, null, 2)}</code>
              </pre>
            </div>
          </div>

          {/* Exemple de réponse */}
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Exemple de réponse</h3>
            <div className="bg-gray-800 p-4 rounded border border-gray-700 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>
                  {JSON.stringify(getExampleResponse(selectedTable), null, 2)}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">Informations générales</h3>
          <div className="space-y-3 text-gray-300">
            <p><strong>Base URL :</strong> <code className="text-green-400">{baseUrl}</code></p>
            <p><strong>Format de réponse :</strong> JSON</p>
            <p><strong>Encodage :</strong> UTF-8</p>
            <p><strong>Limite de taux :</strong> Aucune limite spécifiée</p>
            <p><strong>Version :</strong> 1.0</p>
          </div>
          
          {/* Politique d'authentification */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">Politique d'authentification</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">GET</span>
                <span>Lecture publique - Aucune authentification requise</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium">POST/PUT/DELETE</span>
                <span>Modification protégée - Authentification requise (cookies de session)</span>
              </div>
            </div>
          </div>
          
          {/* Structure des réponses */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">Structure des réponses</h4>
            <div className="text-gray-300">
              <p className="mb-2">Toutes les réponses suivent le format standard :</p>
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <pre className="text-sm text-gray-300">
                  <code>{JSON.stringify({
                    success: true,
                    data: "contenu de la réponse"
                  }, null, 2)}</code>
                </pre>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                <strong>success</strong> : Indique si la requête a réussi (true/false)<br/>
                <strong>data</strong> : Contient les données demandées (objet ou tableau)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
