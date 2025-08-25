import AuthGuard from '@/app/components/AuthGuard'
import Sidebar from '@/app/components/Sidebar'
import MoiSection from '@/app/components/MoiSection'
import CompetencesSection from '@/app/components/CompetencesSection'
import ProjetsSection from '@/app/components/ProjetsSection'
import GalerieSection from '@/app/components/GalerieSection'
import ReseauSection from '@/app/components/ReseauSection'

export default function PortfolioPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Sidebar />
        
        {/* Contenu principal centré */}
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="w-full max-w-6xl">
            {/* En-tête */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-3">
                Édition du Portfolio
              </h1>
              <p className="text-gray-400 text-lg">
                Gérez et modifiez les informations de votre portfolio
              </p>
            </div>

            {/* Sections du portfolio */}
            <div className="space-y-6">
              {/* Section Moi */}
              <MoiSection />
              
              {/* Section Compétences */}
              <CompetencesSection />
              
              {/* Section Projets */}
              <ProjetsSection />
              
              {/* Section Galerie */}
              <GalerieSection />
              
              {/* Section Réseau */}
              <ReseauSection />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 