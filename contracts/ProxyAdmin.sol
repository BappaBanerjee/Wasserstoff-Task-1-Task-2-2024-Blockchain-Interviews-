// SPDX-License-Identifier: MIT
pragma solidity 0.8;

import "./Proxy.sol";

contract ProxyAdmin {
    error NOT_AUTHORIZED();

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if(msg.sender != owner) revert NOT_AUTHORIZED();
        _;
    }

    function getProxyAdmin(address proxy) external view returns (address) {
        (bool ok, bytes memory res) = proxy.staticcall(abi.encodeCall(Proxy.admin, ()));
        require(ok, "call failed");
        return abi.decode(res, (address));
    }

    function changeProxyAdmin(address payable proxy, address admin) external onlyOwner {
        Proxy(proxy).changeAdmin(admin);
    }

    function getProxyImplementation(address proxy, bytes4 functionId) external view returns (address) {
       (bool ok, bytes memory res) = proxy.staticcall(
            abi.encodeCall(Proxy.implementation, (functionId))
        );
        require(ok, "call failed");
        return abi.decode(res, (address));
    }

    function upgradeImplementation(address payable proxy, address implementation, bytes4 functionId) external onlyOwner {
        Proxy(proxy).upgradeTo(functionId, implementation);
    }

    function deleteImplementation(address payable proxy, bytes4 functionId) external onlyOwner {
        Proxy(proxy).deleteImplementation(functionId);
    }
}