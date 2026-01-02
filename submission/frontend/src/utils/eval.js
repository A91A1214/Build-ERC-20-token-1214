import { ethers } from "ethers";
import { TOKEN_ABI, FAUCET_ABI, TOKEN_ADDRESS, FAUCET_ADDRESS } from "./contracts";
import { connectWallet as walletConnect, getProvider, getSigner } from "./wallet";

window.__EVAL__ = {
    connectWallet: async () => {
        try {
            const address = await walletConnect();
            return address;
        } catch (error) {
            throw new Error("Failed to connect wallet: " + error.message);
        }
    },

    requestTokens: async () => {
        try {
            const signer = await getSigner();
            if (!signer) throw new Error("Wallet not connected");

            const faucet = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);
            const tx = await faucet.requestTokens();
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            throw new Error("Request failed: " + (error.reason || error.message));
        }
    },

    getBalance: async (address) => {
        try {
            const provider = getProvider();
            if (!provider) throw new Error("No provider found");

            const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
            const balance = await token.balanceOf(address);
            return balance.toString();
        } catch (error) {
            throw new Error("Failed to get balance: " + error.message);
        }
    },

    canClaim: async (address) => {
        try {
            const provider = getProvider();
            if (!provider) throw new Error("No provider found");

            const faucet = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider);
            return await faucet.canClaim(address);
        } catch (error) {
            throw new Error("Failed to check eligibility: " + error.message);
        }
    },

    getRemainingAllowance: async (address) => {
        try {
            const provider = getProvider();
            if (!provider) throw new Error("No provider found");

            const faucet = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider);
            const allowance = await faucet.remainingAllowance(address);
            return allowance.toString();
        } catch (error) {
            throw new Error("Failed to get allowance: " + error.message);
        }
    },

    getContractAddresses: async () => {
        return {
            token: TOKEN_ADDRESS,
            faucet: FAUCET_ADDRESS
        };
    }
};
