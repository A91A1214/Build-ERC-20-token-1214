# Full-Stack ERC-20 Token Faucet

A complete decentralized application (DApp) demonstrating end-to-end Web3 development. It implements a token distribution system with enforced rate limits, cooldown periods, and lifetime claim limits directly on the blockchain.

## Project Overview

This DApp allows users to connect their Ethereum wallets and request a fixed amount of tokens every 24 hours. The on-chain rules ensure that no single address exceeds the maximum lifetime allowance.

### Architecture

- **Smart Contracts**: Built with Solidity 0.8.20 and OpenZeppelin.
  - `YourToken.sol`: ERC-20 compliant token with a 1,000,000 max supply.
  - `TokenFaucet.sol`: Logic for rate-limited distribution and access control.
- **Frontend**: Built with React and Vite.
  - `ethers.js`: For blockchain interaction and wallet connection.
  - Real-time state synchronization with the blockchain.
- **DevOps**: Fully containerized using Docker and Docker Compose.

## Deployed Contracts (Sepolia)

- **Token**: [0xYourDeployedTokenAddress](https://sepolia.etherscan.io/address/0xYourDeployedTokenAddress)
- **Faucet**: [0xYourDeployedFaucetAddress](https://sepolia.etherscan.io/address/0xYourDeployedFaucetAddress)

> [!NOTE]
> Please replace the addresses above with your actual deployed contract addresses.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js (for local testing/deployment)
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository and navigate to the `submission` directory.
2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your RPC URL and contract addresses.

### Running the Application

```bash
docker compose up
```

The frontend will be accessible at [http://localhost:3000](http://localhost:3000).

## Design Decisions

- **Faucet amount**: 100 tokens per claim. This provides a balance between user utility and faucet longevity.
- **Cooldown**: 24 hours. Encourages regular engagement while preventing sybil attacks by rate-limiting claims.
- **Lifetime Limit**: 1000 tokens per address. Limits the total amount of tokens any single user can collect from the faucet.
- **Max Supply**: 1,000,000 tokens. Ensures the token has a finite scarcity.

## Testing

Run the smart contract unit tests:
```bash
npx hardhat test
```

Tests cover:
- Successful claims
- Cooldown period enforcement
- Lifetime limit enforcement
- Pause/Unpause functionality
- Unauthorized access prevention

## Security Considerations

- **Access Control**: Only the admin can pause the faucet. Only the faucet can mint new tokens.
- **Reentrancy**: Used `ReentrancyGuard` on the `requestTokens` function.
- **State Management**: Implemented checks-effects-interactions pattern to prevent common vulnerabilities.

## Evaluation Interface

The application exposes a `window.__EVAL__` object for automated testing:
- `connectWallet()`: Triggers wallet connection and returns address.
- `requestTokens()`: Initiates a claim and returns transaction hash.
- `getBalance(address)`: Returns token balance for an address.
- `canClaim(address)`: Returns boolean eligibility.
- `getRemainingAllowance(address)`: Returns remaining claimable amount.
- `getContractAddresses()`: Returns deployed contract addresses.
