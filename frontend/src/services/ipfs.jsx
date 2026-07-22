// frontend/src/services/ipfs.js

const IPFS_AUTH = `Basic ${btoa(
    `${import.meta.env.VITE_IPFS_PROJECT_ID}:${import.meta.env.VITE_IPFS_PROJECT_SECRET}`
)}`;

export async function uploadToIPFS(data) {
    try {
        const jsonData = JSON.stringify(data);
        const blob = new Blob([jsonData], { type: 'application/json' });

        const formData = new FormData();
        formData.append('file', blob, 'data.json');

        const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': IPFS_AUTH }
        });

        const result = await response.json();
        return {
            hash: result.Hash,
            url: `https://ipfs.io/ipfs/${result.Hash}`
        };
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Failed to upload to IPFS');
    }
}

export async function uploadImageToIPFS(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': IPFS_AUTH }
        });

        const result = await response.json();
        return {
            hash: result.Hash,
            url: `https://ipfs.io/ipfs/${result.Hash}`
        };
    } catch (error) {
        console.error('Error uploading image to IPFS:', error);
        throw new Error('Failed to upload image to IPFS');
    }
}

export async function getFromIPFS(hash) {
    try {
        const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching from IPFS:', error);
        throw new Error('Failed to fetch from IPFS');
    }
}

export function getIPFSUrl(hash) {
    return `https://ipfs.io/ipfs/${hash}`;
}
