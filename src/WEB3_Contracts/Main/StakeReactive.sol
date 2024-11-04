// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.0;

import '../../IReactive.sol';
import '../../AbstractReactive.sol';
import '../../ISystemContract.sol';

contract StakeReactive is IReactive, AbstractReactive {
    event Event(
        uint256 indexed chain_id,
        address indexed _contract,
        uint256 indexed topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3,
        bytes data,
        uint256 counter
    );

    uint256 private constant SEPOLIA_CHAIN_ID = 11155111;
    uint64 private constant GAS_LIMIT = 1000000;

    // State specific to reactive network instance of the contract
    address private _callback;

    // Counter for events
    uint256 public counter;

    constructor(address _service, address _contract) {
        service = ISystemContract(payable(_service));
        
        // Subscribe to the Withdrawn event
        // topic_0 is the event signature hash: 0xd8b7f4bb2039c9b48d880e35ed6f97af88652cdd5070f403bb6eacd26eb6e9dd
        bytes memory payload = abi.encodeWithSignature(
            "subscribe(uint256,address,uint256,uint256,uint256,uint256)",
            SEPOLIA_CHAIN_ID,
            _contract,
            0xd8b7f4bb2039c9b48d880e35ed6f97af88652cdd5070f403bb6eacd26eb6e9dd,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
        (bool subscription_result,) = address(service).call(payload);
        vm = !subscription_result;
        _callback = _contract;
    }

    receive() external payable {}

    // React function that gets called when the Withdrawn event is detected
    function react(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3,
        bytes calldata data,
        uint256 /* block_number */,
        uint256 /* op_code */
    ) external vmOnly {
        emit Event(chain_id, _contract, topic_0, topic_1, topic_2, topic_3, data, ++counter);
        
        // Call the WithdrawEther function on the callback contract
        bytes memory payload = abi.encodeWithSignature("WithdrawEther(address)", address(0));
        emit Callback(chain_id, _callback, GAS_LIMIT, payload);
    }

    // Testing utilities
    function pretendVm() external {
        vm = true;
    }

    function subscribe(address _contract) external {
        service.subscribe(
            SEPOLIA_CHAIN_ID,
            _contract,
            0xd8b7f4bb2039c9b48d880e35ed6f97af88652cdd5070f403bb6eacd26eb6e9dd,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
    }

    function unsubscribe(address _contract) external {
        service.unsubscribe(
            SEPOLIA_CHAIN_ID,
            _contract,
            0xd8b7f4bb2039c9b48d880e35ed6f97af88652cdd5070f403bb6eacd26eb6e9dd,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
    }

    function resetCounter() external {
        counter = 0;
    }
}