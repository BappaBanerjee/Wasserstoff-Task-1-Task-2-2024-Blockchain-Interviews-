// SPDX-License-Identifier: MIT
pragma solidity 0.8;

import "./Proxy.sol";

contract ProxyAdmin {
    // Custom error for unauthorized access
    error NOT_AUTHORIZED();

     // Owner of the ProxyAdmin contract
    address public owner;

    // Constructor sets the deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    // Modifier to ensure that only the owner can execute a function
    modifier onlyOwner() {
        if(msg.sender != owner) revert NOT_AUTHORIZED();
        _;
    }

    // Get the admin address of a proxy contract
    function getProxyAdmin(address proxy) external view returns (address) {
        (bool ok, bytes memory res) = proxy.staticcall(abi.encodeCall(Proxy.admin, ()));
        require(ok, "call failed");
        return abi.decode(res, (address));
    }

    // Change the admin address of a proxy contract
    function changeProxyAdmin(address payable proxy, address admin) external onlyOwner {
        Proxy(proxy).changeAdmin(admin);
    }   

    // Get the implementation address for a specific function in a proxy contract
    function getProxyImplementation(address proxy, bytes4 functionId) external view returns (address) {
       (bool ok, bytes memory res) = proxy.staticcall(
            abi.encodeCall(Proxy.implementation, (functionId))
        );
        require(ok, "call failed");
        return abi.decode(res, (address));
    }

    // Upgrade the implementation address for a specific function in a proxy contract
    function upgradeImplementation(address payable proxy, address implementation, bytes4 functionId) external onlyOwner {
        Proxy(proxy).upgradeTo(functionId, implementation);
    }

    // Delete the implementation address for a specific function in a proxy contract
    function deleteImplementation(address payable proxy, bytes4 functionId) external onlyOwner {
        Proxy(proxy).deleteImplementation(functionId);
    }
}