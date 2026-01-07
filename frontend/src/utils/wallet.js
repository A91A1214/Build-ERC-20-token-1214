import { ethers } from "ethers";

export const connectWallet = async () => {
    if (!window.ethereum) {
        throw new Error("No crypto wallet found. Please install MetaMask.");
    }

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });

    return accounts[0];
};

export const getProvider = () => {
    if (window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
};

export const getSigner = async () => {
    const provider = getProvider();
    if (provider) {
        return await provider.getSigner();
    }
    return null;
};
