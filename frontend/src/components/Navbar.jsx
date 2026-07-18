// frontend/src/components/Navbar.jsx
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../utils/wallet';
import {
    FaWallet,
    FaUser,
    FaSignOutAlt,
    FaHome,
    FaUserCircle,
    FaInfoCircle // Thêm icon cho About nếu muốn
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import './Navbar.css';

function Navbar() {
    const { wallet, isConnected, connect, disconnect, isConnecting } = useWallet();
    const location = useLocation();
    const navigate = useNavigate(); // Khai báo navigate

    // Đưa hàm xử lý vào trong component
    const handleAboutPage = (e) => {
        e.preventDefault();
        // Kiểm tra kết nối ví thông qua isConnected của WalletContext
        if (!isConnected) {
            alert("Please connect your wallet first!");
            return;
        }
        navigate("/aboutpage");
    };

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

                    {/* Thêm link About vào đây */}
                    <a 
                        href="/aboutpage" 
                        onClick={handleAboutPage}
                        className={location.pathname === '/aboutpage' ? 'active' : ''}
                    >
                        <FaInfoCircle /> About
                    </a>

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