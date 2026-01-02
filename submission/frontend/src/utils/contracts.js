export const TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function MAX_SUPPLY() view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export const FAUCET_ABI = [
    "function requestTokens() external",
    "function canClaim(address user) public view returns (bool)",
    "function remainingAllowance(address user) public view returns (uint256)",
    "function lastClaimAt(address user) public view returns (uint256)",
    "function FAUCET_AMOUNT() public view returns (uint256)",
    "function COOLDOWN_TIME() public view returns (uint256)",
    "function MAX_CLAIM_AMOUNT() public view returns (uint256)",
    "function isPaused() public view returns (bool)",
    "event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp)"
];

export const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS || "";
export const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_ADDRESS || "";
export const RPC_URL = import.meta.env.VITE_RPC_URL || "";
