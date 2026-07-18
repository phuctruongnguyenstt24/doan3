// frontend/src/components/Hero.jsx
import { useWallet } from '../context/WalletContext'
import { FaEthereum, FaRocket, FaShieldAlt, FaChartLine } from 'react-icons/fa'
import './Hero.css'

function Hero() {
  const { isConnected, connect, isConnecting } = useWallet()

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          Web3 Developer Portfolio
        </div>

        <h1 className="hero-title">
          Build Your <span>Web3 Portfolio</span>
          <br />on Polygon
        </h1>

        <p className="hero-description">
          Showcase your skills, projects, and professional experience through
          a modern decentralized portfolio powered by blockchain technology.
        </p>

        <div className="hero-actions">
          {!isConnected ? (
            <button
              className="hero-btn-primary"
              onClick={connect}
              disabled={isConnecting}
            >
              <FaEthereum />
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          ) : (
            <button className="hero-btn-primary">
              <FaRocket />
              View My Portfolio
            </button>
          )}

          <a href="#features" className="hero-btn-secondary">
            Explore More
            <span>→</span>
          </a>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">20+</span>
            <span className="stat-label">Projects Completed</span>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <span className="stat-number">10+</span>
            <span className="stat-label">Technologies</span>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">GitHub Repositories</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="floating-card card-1">
          <FaChartLine />
          <span>20+ Projects</span>
        </div>

        <div className="floating-card card-2">
          <FaShieldAlt />
          <span>Web3 Ready</span>
        </div>

        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
    </section>
  )
}

export default Hero