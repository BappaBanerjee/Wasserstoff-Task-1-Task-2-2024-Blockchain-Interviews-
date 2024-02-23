# Proxy Smart Contract with ProxyAdmin

## Overview

This repository contains a set of Ethereum smart contracts implementing a proxy pattern with an admin contract, allowing for upgradable contracts in a secure and controlled manner. The main components are `Proxy.sol` for the proxy contract and `ProxyAdmin.sol` for the admin contract.

## Contracts

proxy -> https://sepolia.etherscan.io/address/0x25a913afafF2BE67258e19c27030D030EFCa0B1d
proxyAdmin -> https://sepolia.etherscan.io/address/0x4C37157Dc252dAcF1c88941138362F573E338F87

### Proxy Contract (`Proxy.sol`)

The `Proxy` contract serves as a proxy for other contracts, enabling seamless upgrades without changing the contract address. Key features include:

- **Admin Functionality:** An admin is designated during deployment and can change later. Admin permissions are required for functions modifying the implementation contract or changing the admin.

- **Implementation Storage:** Function IDs are mapped to implementation contract addresses, facilitating dynamic upgrades without altering the proxy contract.

- **Fallback Function:** The fallback function delegates the call to the corresponding implementation contract based on the received function ID.

- **Delegatecall:** The `_delegate` function uses `delegatecall` to execute the implementation contract code in the context of the proxy contract, preserving storage and state.

### ProxyAdmin Contract (`ProxyAdmin.sol`)

The `ProxyAdmin` contract serves as the admin for the proxy contracts. Key features include:

- **Ownership:** The admin contract is owned by an address designated during deployment, ensuring only the owner can perform administrative actions on the proxy contracts.

- **Proxy Interaction:** ProxyAdmin facilitates changing the admin of a proxy, upgrading the implementation contract, and deleting implementations. Functions in `ProxyAdmin` interact with the respective functions in the `Proxy` contract using delegate calls.

## Deployment and Usage

1. Deploy the `Proxy.sol` contract, setting the initial admin.
2. Deploy the `ProxyAdmin.sol` contract, setting the initial owner.
3. Use the `ProxyAdmin` contract to manage proxy contracts:
   - Change the admin of a proxy contract.
   - Upgrade the implementation contract.
   - Delete implementations.

## Challenges and Solutions

- **Writing to Any Slot:** Secure storage slot manipulation was achieved using the `StorageSlot` library, ensuring safe read and write operations.

- **Interaction with Implementation Contract:** Rigorous testing and research were conducted to align state variables and function signatures between the proxy and implementation contracts for reliable `delegatecall` execution.

## Conclusion

This repository provides a flexible and upgradable smart contract architecture for Ethereum, allowing projects to evolve without disrupting existing deployments. The combination of the proxy and admin contracts enables efficient contract management and controlled upgrades.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
