import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background avec effet futuriste */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Grille futuriste */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Particules flottantes */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
        <div className="absolute top-1/2 right-20 w-1 h-1 bg-green-400 rounded-full animate-pulse" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Logo/Titre principal */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            FABRICE
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full" />
        </div>

        {/* Sous-titre */}
        <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-2xl leading-relaxed">
          Développeur Full-Stack passionné par la création d'expériences numériques innovantes
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-6 mb-20">
          <Link
            href="/dashboard/portfolio"
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
          >
            <span className="relative z-10">Accéder au Portfolio</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          
          <Link
            href="/dashboard/cv"
            className="group relative px-8 py-4 border-2 border-gray-600 rounded-lg font-semibold text-lg transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:scale-105"
          >
            <span className="relative z-10">Éditer mon CV</span>
          </Link>
        </div>

        {/* Stats/Infos rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="text-center p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
            <div className="text-3xl font-bold text-blue-400 mb-2">5+</div>
            <div className="text-gray-400">Années d'expérience</div>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
            <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
            <div className="text-gray-400">Projets réalisés</div>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
            <div className="text-3xl font-bold text-cyan-400 mb-2">15+</div>
            <div className="text-gray-400">Technologies maîtrisées</div>
          </div>
        </div>
      </div>

      {/* Footer minimaliste */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-gray-500 text-sm">
          <span className="text-blue-400">©</span> 2024 Fabrice Folly - Portfolio Personnel
        </div>
      </div>

      {/* Effet de bordure lumineuse */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-30" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-30" />
      </div>
    </div>
  );
}
