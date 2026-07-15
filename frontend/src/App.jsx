// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext.jsx'
import Home from './pages/Home'
import Profile from './pages/Profile/Profile.jsx'
import ViewProfile from './pages/Profile/ViewProfile.jsx'
import SendCV from './pages/SendCV.jsx'
import About from './components/About.jsx'
import ViewCV from './components/ViewCV.jsx'
import './App.css'

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/viewprofile" element={<ViewProfile />} />
          <Route path="/sendcv" element={<SendCV />} />
          <Route path="/aboutpage" element={<About />} />
          <Route path="/viewcv" element={<ViewCV />} />
        </Routes>
      </Router>
    </WalletProvider>
  )
}

export default App
