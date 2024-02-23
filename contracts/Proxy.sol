// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import "./StorageSlot.sol";

contract Proxy{

    // Custom errors
    error Implementation_NotFound();
    error Invalid_Contract_Address();

    // Storage slots for admin and implementation addresses
    bytes32 private constant ADMIN_SLOT = bytes32(uint256(
            keccak256("eip1967.proxy.admin")) - 1
        );

    bytes32 private constant IMPLEMENTATION_SLOT = bytes32(uint256(
            keccak256("eip1967.proxy.implementation")) - 1
        );

    // Modifier to check if the sender is the admin
    modifier isAdmin() {
        if(msg.sender == _getAdmin()){
            _;
        }else{
            _fallback();
        }
    }

    // Constructor sets the deployer as the admin
    constructor() {
        _setAdmin(msg.sender);
    }

    // Internal function to set the admin address in storage
    function _setAdmin(address _addr) private {
        StorageSlot.getAddressSlot(ADMIN_SLOT).value[bytes4(keccak256("admin"))] = _addr;
    }

    // Internal function to get the admin address from storage
    function _getAdmin() private view returns(address) {
        return StorageSlot.getAddressSlot(ADMIN_SLOT).value[bytes4(keccak256("admin"))];
    }

    // Internal function to set the implementation address for a function in storage
    function _setImplementation(bytes4 _functionId, address _implementation) private {
        if(_implementation == address(0)) revert Invalid_Contract_Address();
        StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value[_functionId] = _implementation;
    }

    // Internal function to get the implementation address for a function from storage
    function _getImplementation(bytes4 _functionId) private view returns (address) {
        return StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value[_functionId];
    }

    //admin interface

    function upgradeTo(bytes4 _functionId, address _implementation) external isAdmin   {
        // Upgrade implementation for a specific function
        _setImplementation(_functionId, _implementation);
    }

    function changeAdmin(address _admin) public isAdmin {
         // Change the admin address
        _setAdmin(_admin);
    }

    function admin() external isAdmin returns (address) {
        // Get the admin address
        return _getAdmin();
    }

    function implementation(bytes4 _functionId) external isAdmin returns (address) {
        // Get the implementation address for a specific function
        return _getImplementation(_functionId);
    }

    function deleteImplementation(bytes4 _functionId) public isAdmin{
         // Delete the implementation address for a specific function
        delete StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value[_functionId];
    }

    //user Interface
    fallback() external payable { 
        // Fallback function redirects the call to the appropriate implementation
        _fallback();
    }

    receive() external payable { 
        // Receive function redirects the call to the appropriate implementation
        _fallback();
    }

    // Internal function to handle fallback logic
    function _fallback() private  {
        bytes4 functionId = _getFunctionId(msg.data);
        address _implementation = _getImplementation(functionId);
        if(_implementation == address(0)) revert Implementation_NotFound();
        _delegate(_implementation);
    }

    // Internal function to extract the function ID from calldata
    function _getFunctionId(bytes memory data) private pure returns (bytes4) {
        bytes4 functionId;
        assembly {
            functionId := mload(add(data, 32))
        }
        return functionId;
    }

    // Internal function to delegate call to the implementation
    function _delegate(address _implementation) internal virtual {
        assembly {
            
            calldatacopy(0, 0, calldatasize())

            let result := delegatecall(gas(), _implementation, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}