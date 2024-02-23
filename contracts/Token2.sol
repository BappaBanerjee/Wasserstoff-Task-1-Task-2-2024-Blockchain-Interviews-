//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Token2 is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    // constructor() ERC20("MyToken", "MY") {
    // }

    function initialize() external initializer {
        __ERC20_init("Token2", "T1");
        __Ownable_init(msg.sender);
    }

    function mint(address to, uint amount) external onlyOwner {
        _mint(to, amount);
    }
}