// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

library StorageSlot {
    struct AddressSlot {
        mapping(bytes4 => address) value;
    }

    function getAddressSlot(
        bytes32 slot
    ) internal pure returns (AddressSlot storage r) {
        assembly {
            r.slot := slot
        }
    }
}
