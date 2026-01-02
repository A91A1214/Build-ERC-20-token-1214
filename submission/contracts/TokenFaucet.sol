// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TokenFaucet is Ownable, ReentrancyGuard {
    YourToken public token;
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;
    uint256 public constant COOLDOWN_TIME = 24 hours;
    uint256 public constant MAX_CLAIM_AMOUNT = 1000 * 10**18;

    bool public paused;
    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = YourToken(_tokenAddress);
    }

    /**
     * @dev Allows users to claim a fixed amount of tokens every 24 hours until lifetime limit.
     */
    function requestTokens() external nonReentrant {
        require(!paused, "Faucet is paused");
        
        // Specific cooldown check
        require(block.timestamp >= lastClaimAt[msg.sender] + COOLDOWN_TIME, "Cooldown period not elapsed");
        
        // Specific lifetime limit check
        require(totalClaimed[msg.sender] + FAUCET_AMOUNT <= MAX_CLAIM_AMOUNT, "Lifetime claim limit reached");
        
        // Ensure minting doesn't exceed token balance/max supply
        require(token.totalSupply() + FAUCET_AMOUNT <= token.MAX_SUPPLY(), "Faucet has insufficient token balance");

        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        token.mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    /**
     * @dev Returns true if the address is currently eligible to claim tokens.
     */
    function canClaim(address user) public view returns (bool) {
        if (paused) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        return true;
    }

    /**
     * @dev Returns the remaining amount of tokens an address can claim in their lifetime.
     */
    function remainingAllowance(address user) public view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return 0;
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    /**
     * @dev Pauses or unpauses the faucet. Only callable by admin.
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit FaucetPaused(_paused);
    }

    /**
     * @dev Returns current pause state.
     */
    function isPaused() external view returns (bool) {
        return paused;
    }
}
