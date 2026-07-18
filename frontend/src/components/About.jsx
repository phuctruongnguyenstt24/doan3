// frontend/src/components/Features.jsx
import { FaUserTie, FaCode, FaShieldAlt, FaGlobe } from 'react-icons/fa'

function Features() {
  const features = [
    {
      icon: <FaUserTie className="w-8 h-8 text-purple-400" />,
      title: 'Professional Profile',
      description: 'Present your education, experience, and achievements in a modern portfolio.'
    },
    {
      icon: <FaCode className="w-8 h-8 text-purple-400" />,
      title: 'Projects Showcase',
      description: 'Display your best projects with descriptions, technologies, and live demo links.'
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-purple-400" />,
      title: 'Web3 Powered',
      description: 'Securely connect with MetaMask and showcase a decentralized portfolio on Polygon.'
    },
    {
      icon: <FaGlobe className="w-8 h-8 text-purple-400" />,
      title: 'Responsive Design',
      description: 'Optimized for desktop, tablet, and mobile devices with a clean user experience.'
    }
  ]

  return (
    <section 
      id="features" 
      className="min-h-screen   from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Header Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Why Choose My Portfolio?
        </h2>
        <p className="mt-4 text-lg text-purple-200 font-medium tracking-wide uppercase">
          Web3/Blockchain Resume
        </p>
      </div>

      {/* Grid Features */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 px-4">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="relative group bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col items-center text-center"
          >
            <div className="p-4 bg-purple-900/30 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-350 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Footer Quote Section */}
      <div className="max-w-3xl mx-auto text-center mt-20 px-4">
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
          <p className="text-purple-250 text-base sm:text-lg italic leading-relaxed">
            <strong className="text-purple-400 not-italic">In short:</strong> It is like a "LinkedIn for the Blockchain Era"—helping you prove your skills, make connections, and establish your brand in the decentralized world.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Features