// contracts/MyToken.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        // 初始供应量铸造给合约的部署者
        _mint(msg.sender, initialSupply);
    }
}
