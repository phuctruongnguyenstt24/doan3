/*
Hash IPFS trong dự án này dùng SHA2-256 — cụ thể là chuẩn CID v0 của IPFS.
Khi bạn upload file lên IPFS (qua Infura), IPFS tự động:
1.Lấy nội dung file
2.Băm bằng SHA2-256
3.Encode kết quả bằng Base58
4.Trả về CID (Content Identifier) dạng Qm... — đây chính là result.Hash trong code
Điểm quan trọng:
Đây là hash để định danh nội dung (content addressing), không phải mã hóa bảo mật
Cùng một nội dung file → luôn ra cùng một CID
Ai cũng có thể truy cập file nếu biết CID: https://ipfs.io/ipfs/Qm...
Dữ liệu không được mã hóa, chỉ được băm để tạo địa chỉ

Infura là một dịch vụ cung cấp hạ tầng (Infrastructure as a Service) cho các ứng dụng blockchain và IPFS. 
Thay vì bạn phải tự cài đặt và vận hành một node IPFS hoặc Ethereum, Infura cung cấp sẵn các node để ứng dụng của bạn kết nối thông qua API.
*/
// frontend/src/services/ipfs.js
//Import hàm create() từ thư viện ipfs-http-client.
import { create } from 'ipfs-http-client';

// Sử dụng fetch thay vì buffer
//Khởi tạo IPFS Client (Tạo một đối tượng IPFS Client kết nối tới IPFS Node của Infura.)
const ipfs = create({
    url: 'https://ipfs.infura.io:5001/api/v0'//chính là địa chỉ API của Infura.
});


export async function uploadToIPFS(data) {
    try {
        const jsonData = JSON.stringify(data);//Chuyển dữ liệu JSON thành chuỗi JSON (VD:name:"Nhan" ==> {"name":"Nhan"})
        const blob = new Blob([jsonData], { type: 'application/json' });//Blob là đối tượng đại diện cho một file (Ở đây là file JSON).
        
        // Tạo FormData (Tạo dữ liệu multipart/form-data.Giống như khi upload file trên website.)
        const formData = new FormData();
        formData.append('file', blob, 'data.json');//Thêm file vào FormData.
        
        //Gửi request tới ipfs ==> lệnh /add ==> thêm file vào IPFS.
        const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
            method: 'POST',//POST vì đang gửi dữ liệu.
            body: formData,//Dữ liệu gửi Dạng formData(data.json)
            headers: {
                //Infura yêu cầu đăng nhập. ==> phải gửi Project ID + Project Secret
                //btoa() ==> VD: abc123...xyz789==> abc123:xyz789 ==> Base64 ==> YWJjMTIzOnh5ejc4OQ==
                'Authorization': `Basic ${btoa(
                    `${process.env.VITE_IPFS_PROJECT_ID}:${process.env.VITE_IPFS_PROJECT_SECRET}`
                )}`
            }
        });
        //Chuyển JSON thành object.
        const result = await response.json();
        
                
        /*
        hash: CID (Content Identifier) của file trên IPFS.
        url: Đường dẫn qua IPFS Gateway để truy cập file.
        */
        return {
            hash: result.Hash,
            url: `https://ipfs.io/ipfs/${result.Hash}`
        };
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Failed to upload to IPFS');
    }
}

//Đây là hàm upload ảnh lên IPFS.
export async function uploadImageToIPFS(file) {
    try {
        //Tạo FormData. FormData dùng để gửi file theo chuẩn HTTP.
        const formData = new FormData();
        formData.append('file', file);//Đưa file ảnh vào FormData.
        
        //Gửi file đến Infura.
        const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Basic ${btoa(
                    `${process.env.VITE_IPFS_PROJECT_ID}:${process.env.VITE_IPFS_PROJECT_SECRET}`
                )}`
            }
        });
        
        const result = await response.json();

        //trả về như vậy giúp Frontend có thể lưu Hash vào Smart Contract hoặc DB.
        return {
            hash: result.Hash,
            url: `https://ipfs.io/ipfs/${result.Hash}`
        };
    } catch (error) { 
        console.error('Error uploading image to IPFS:', error);
        throw new Error('Failed to upload image to IPFS');
    }
}

//Hàm này dùng để đọc dữ liệu JSON từ IPFS.
export async function getFromIPFS(hash) {
    try {
        //Gateway IPFS sẽ tìm CID này trong mạng IPFS rồi trả về nội dung.
        const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
        const data = await response.json();
        return data;//Trả object về cho chương trình.
    } catch (error) {
        console.error('Error fetching from IPFS:', error);
        throw new Error('Failed to fetch from IPFS');
    }
}

//Đây là hàm không gọi mạng.Chỉ ghép chuỗi URL. (VD :https://ipfs.io/ipfs/QmABC (với:QmABC là mã hash))
export function getIPFSUrl(hash) {
    return `https://ipfs.io/ipfs/${hash}`;
}