// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext.jsx';
import MainLayout from './components/MainLayout';
import Home from './components/Home.jsx';
import Profile from './components/Profile.jsx';
import ViewProfile from './components/ViewProfile.jsx';
import SendCV from './components/SendCV.jsx';
import About from './components/About.jsx';
import ViewCV from './components/ViewCV.jsx';
import Donate from './components/Donate.jsx';
import './App.css';

function App() {
  return (  
    <WalletProvider>
      <Router>
        <Routes>
          {/* Sử dụng MainLayout cho tất cả các route */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/viewprofile" element={<ViewProfile />} />
            <Route path="/sendcv" element={<SendCV />} />
            <Route path="/aboutpage" element={<About />} />
            <Route path="/viewcv" element={<ViewCV />} />
            <Route path="/donate" element={<Donate />} />
          </Route>
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;