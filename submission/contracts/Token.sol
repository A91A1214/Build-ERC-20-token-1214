// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourToken is ERC20, Ownable {
    uint256 public immutable MAX_SUPPLY;
    address public minter;

    constructor(string memory name, string memory symbol, uint256 maxSupply) ERC20(name, symbol) Ownable(msg.sender) {
        MAX_SUPPLY = maxSupply;
    }

    /**
     * @dev Sets the minter address (the faucet).
     * @param _minter The address allowed to mint.
     */
    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    /**
     * @dev Mints tokens to a specific address. Restricted to the minter address.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only minter can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds MAX_SUPPLY");
        _mint(to, amount);
    }
}
