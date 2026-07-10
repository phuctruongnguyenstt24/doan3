// frontend/src/components/Navbar.jsx
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../utils/wallet';
import {
    FaWallet,
    FaUser,
    FaSignOutAlt,
    FaHome,
    FaUserCircle
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const { wallet, isConnected, connect, disconnect, isConnecting } = useWallet();
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <img src="/logo.svg" alt="Logo" />
                    <span>Web3 Portfolio</span>
                </Link>

                <div className="nav-links">
                    <Link
                        to="/"
                        className={location.pathname === '/' ? 'active' : ''}
                    >
                        <FaHome /> Home
                    </Link>

                    {isConnected && (
                        <>
                            <Link
                                to="/profile"
                                className={location.pathname === '/profile' ? 'active' : ''}
                            >
                                <FaUserCircle /> My Profile
                            </Link>
                            <Link
                                to="/sendcv"
                                className={location.pathname === '/sendcv' ? 'active' : ''}
                            >
                                <FaUserCircle /> Send CV
                            </Link>
                        </>
                    )}

                    <a href="#features">Features</a>
                </div>

                <div className="nav-wallet">
                    {!isConnected ? (
                        <button
                            className="connect-btn duration-300 ease-in"
                            onClick={connect}
                            disabled={isConnecting}
                        >
                            <FaWallet />
                            {isConnecting
                                ? 'Connecting...'
                                : 'Connect MetaMask'}
                        </button>
                    ) : (
                        <div className="wallet-info">
                            <div className="wallet-address">
                                <FaUser />
                                <span>{formatAddress(wallet.address)}</span>
                            </div>

                            <button
                                className="disconnect-btn"
                                onClick={disconnect}
                                title="Disconnect Wallet"
                            >
                                <FaSignOutAlt />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;