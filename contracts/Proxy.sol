// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";
import "./StorageSlot.sol";

contract Proxy {
    // need reserved slot, will change with StorageSlot.
    // uint x;
    // address implementation;

    function changeImplementation(address _implementation) external {
        // implementation = _implementation;

        StorageSlot.getAddressSlot(keccak256("_impl")).value = _implementation;
    }

    // Forward from function calls to all upgraded contracts...
    fallback() external {
        // (bool s, ) = implementation.call(msg.data);

        // delegatecall same with call method, but storage values placed own it.
        // target storage values placed this (proxy) contract...
        // if want to change or upgrade can with not change storage slots.

        // (bool s, ) = implementation.delegatecall(msg.data);
        (bool s, ) = StorageSlot
            .getAddressSlot(keccak256("_impl"))
            .value
            .delegatecall(msg.data);

        require(s);
    }

    // Don't need this method, it's need to fallback for all functions after upgraded.
    // function changeX(uint _x) external {
    //     Logic1(implementation).changeX(_x);
    // }
}

contract Logic1 {
    uint public x;

    function changeX(uint _x) external {
        x = _x;
    }
}

contract Logic2 {
    uint public x;

    function changeX(uint _x) external {
        x = _x;
    }

    function tripleX() external {
        x *= 3;
    }
}
