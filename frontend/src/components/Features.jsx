// frontend/src/components/Features.jsx
import { FaUserTie, FaCode, FaShieldAlt, FaGlobe } from 'react-icons/fa'
import './Features.css'

function Features() {
  const features = [
    {
      icon: <FaUserTie />,
      title: 'Professional Profile',
      description: 'Present your education, experience, and achievements in a modern portfolio.'
    },
    {
      icon: <FaCode />,
      title: 'Projects Showcase',
      description: 'Display your best projects with descriptions, technologies, and live demo links.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Web3 Powered',
      description: 'Securely connect with MetaMask and showcase a decentralized portfolio on Polygon.'
    },
    {
      icon: <FaGlobe />,
      title: 'Responsive Design',
      description: 'Optimized for desktop, tablet, and mobile devices with a clean user experience.'
    }
  ]

  return (
    <section id="features" className="features">
      <div className="features-header">
        <h2>Why Choose My Portfolio?</h2>
        <p>Everything you need to showcase your professional journey.</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features