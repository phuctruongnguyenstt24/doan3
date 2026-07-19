// frontend/src/context/WalletContext.jsx
//Import thư viện
/*
React
createContext() tạo Context.
useContext() lấy dữ liệu từ Context.
useState() lưu trạng thái.
useEffect() chạy khi component mount hoặc state thay đổi.
*/
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';//Thư viện giao tiếp Ethereum.
import profileABI from '../contracts/ProfileABI.json';//ABI của Smart Contract ==> Dùng để gọi các hàm trong contract.

//Địa chỉ Smart Contract ==> Lấy địa chỉ contract từ file .env Nếu chưa cấu hình thì trả về chuỗi rỗng.
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

//Tạo Context chứa account,balance,contract,signer,connectWallet(),disconnectWallet() ==> để component nào cũng sử dụng được.
const WalletContext = createContext();

//Custom Hook ==> Cho phép gọi const { account } = useWallet(); thay vì const context = useContext(WalletContext);
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
//quản lý toàn bộ trạng thái ví.và export ra để coponent khác dùng (Ví mặc định sẽ chưa có gì hết)
/*
Provider → Chỉ đọc dữ liệu từ blockchain.
Signer → Đọc + ghi dữ liệu (gửi transaction, ký message, gọi hàm thay đổi dữ liệu). 
*/
export const WalletProvider = ({ children }) => {
  const [account, setAccount]       = useState(null);
  const [balance, setBalance]       = useState(null);
  const [chainId, setChainId]       = useState(null);//Lưu network (mỗi coin sẽ có ChainId khác nhau)
  const [contract, setContract]     = useState(null);
  const [signer, setSigner]         = useState(null);//signer là đối tượng đại diện cho tài khoản của người dùng có quyền ký (sign) và gửi giao dịch lên blockchain.
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError]           = useState(null);

  // Khởi tạo contract instance có signer từ provider + address (Khởi tạo Contract sau khi kết nối MetaMask.)
  //
  const buildContract = async (provider, address) => {
    try {
      //startsWith('0x') Vì ví MetaMask bắt đầu bằng 0x+hash
      if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x')) {
        console.warn('VITE_CONTRACT_ADDRESS chưa được cấu hình. Bỏ qua khởi tạo contract.');
        return {};
      }
      const _signer = await provider.getSigner();
      //Tạo Contract gồm Address,ABI,Signer Sau đó có thể gọi:await contract.createProfile(...)...
      const _contract = new ethers.Contract(CONTRACT_ADDRESS, profileABI.abi, _signer);
      //Lưu state
      setSigner(_signer);
      setContract(_contract);
      return { signer: _signer, contract: _contract };
    } catch (e) {
      console.error('buildContract error:', e);
      return {};
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.ethereum) {
        throw new Error('Vui lòng cài MetaMask!');
      }

      //Xin quyền truy cập ví (hiện pop up lên web)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      //Browser -> ethers Provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      setAccount(accounts[0]);//accounts[0]: Trong MetaMask, chỉ có một tài khoản đang được chọn (active account) để ký giao dịch. ==> Theo chuẩn EIP-1193, tài khoản đang hoạt động sẽ nằm ở vị trí đầu tiên của mảng.

      //Lấy số dư Ethereum lưu bằng Wei nên phải ethers.formatEther(balanceWei) để đổi qua ETH
      const balanceWei = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(balanceWei));

      // ChainId parseInt(chainIdHex, 16)==> đổi hash vd: 0xaa36a7 thành số : 11155111
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainIdHex, 16));

      // Contract + signer
      await buildContract(provider, accounts[0]);
    } catch (err) {
      console.error('Lỗi kết nối:', err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  //Xóa toàn bộ state. ==> Không thực sự "đăng xuất" MetaMask vì website không thể ép MetaMask ngắt kết nối; chỉ xóa dữ liệu trong ứng dụng.
  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setContract(null);
    setSigner(null);
  };

  //để hiển thị gọn hơn.
  const formatAddress = (address) => {
    if (!address) return '';
    //address.slice(0, 6) Lấy từ vị trí 0 đến trước vị trí 6, address.slice(-4):Số âm nghĩa là đếm từ cuối chuỗi. (VD: 0x8A4F3D91B2C7E8F6A5D4C3B2A1F0987654321ABC = 0x8A4F...1ABC)
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Tự động reconnect nếu ví đã cho phép trước đó
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setAccount(accounts[0]);

          const balanceWei = await provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balanceWei));

          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(chainIdHex, 16));

          await buildContract(provider, accounts[0]);
        }
      } catch (e) {
        console.error('autoConnect error:', e);
      }
    };
    autoConnect();
  }, []);


  /* window.ethereum là một đối tượng (object) được ví tiền điện tử (crypto wallet) như MetaMask, Rabby Wallet, Coinbase Wallet... chèn (inject) vào trình duyệt để website có thể giao tiếp với blockchain.*/
  // Lắng nghe sự kiện thay đổi ví / chain
  //Khi đổi ví Ứng dụng sẽ cập nhật account,cập nhật balance,tạo lại signer,tạo lại contract
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balanceWei));
        await buildContract(provider, accounts[0]);
      } else {
        //accounts.length==0 ==> MetaMask không còn tài khoản được kết nối ==> disconnectWallet()
        disconnectWallet();
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);//Làm mới toàn bộ ứng dụng để tránh dùng sai network.

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  //cúng cấpdữ liệu cho tất cả component con. ==> Tất cả các component trên đều có thể lấy dữ liệu của ví.
  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        chainId,
        contract,
        signer,
        isConnected: !!account && !!contract,
        loading: isConnecting,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        formatAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
