# 1 Deployment Guide for `DynamicPriceERC20`

### Constructor Parameters

When deploying the `DynamicPriceERC20` contract, you need to provide the following parameters:

- **name** (`string`): The name of the token.  
  - *Example*: `"Dynamic Token"`

- **symbol** (`string`): The symbol for the token.  
  - *Example*: `"DYN"`

- **_initialPrice** (`uint256`): The initial mint price per token, specified in wei (1 ETH = 10^18 wei).  
  - *Example*: `1000000000000000000` (equivalent to 1 ETH)

- **_maxSupply** (`uint256`): The maximum number of tokens that can ever be minted.  
  - *Example*: `1000000`

- **_mintIncrease** (`uint256`): The percentage by which the mint price will increase for each mint action, in basis points (1 basis point = 0.01%).  
  - *Example*: `100` (equivalent to a 1% increase per mint)

- **_burnDecrease** (`uint256`): The percentage by which the mint price will decrease for each burn action, also in basis points.  
  - *Example*: `50` (equivalent to a 0.5% decrease per burn)


**deploy it three times with your own values and note the addresses**




# 2 Deployment Guide for ApprovalService and ApprovalListener

## Constructor Values

### ApprovalService Contract
To deploy the `ApprovalService` contract, provide the following constructor values:

- **Subscription Fee (in wei)**: The cost in wei for subscribing to the service.
  - **Example**: `100` (equivalent to 100 wei)
- **Gas Price Coefficient**: Multiplier for calculating gas price.
  - **Example**: `1`
- **Extra Gas for Reactive Service**: Additional gas required for executing reactive calls.
  - **Example**: `10`

### ApprovalListener Contract
To deploy the `ApprovalListener` contract, provide the following constructor value:

- **Approval Service Address**: The address of the deployed `ApprovalService` contract.
  - **Example**: `0xEDb3ab6Dd9D5A8818C175324C8196804085bDEc3`

## Deployment Instructions

1. **Deploy ApprovalService**
   - Use your preferred deployment tool (e.g., Hardhat or Remix) to deploy the `ApprovalService` contract.
   - **Constructor Arguments**:
     - `100` (Subscription Fee)
     - `1` (Gas Price Coefficient)
     - `10` (Extra Gas)
   - Note the deployed contract address and assign it to `APPROVAL_SRV_ADDR`.

2. **Fund ApprovalService**
   - Ensure `APPROVAL_SRV_ADDR` has an ETH balance for callback executions by sending 0.1 ether to `APPROVAL_SRV_ADDR`.

3. **Deploy ApprovalListener**
   - Deploy the `ApprovalListener` contract using `APPROVAL_SRV_ADDR` as the constructor argument.
   - **Constructor Argument**:
     - `<APPROVAL_SRV_ADDR>`
   - Assign the deployed contract address to `APPROVAL_RCT_ADDR`.

4. **Fund ApprovalListener**
   - The `APPROVAL_RCT_ADDR` contract requires an ETH balance for callback functionality. Send 0.1 ether to `APPROVAL_RCT_ADDR`.

## Note
- For callback proxy setups, send funds to the proxy with the target address (`APPROVAL_SRV_ADDR` or `APPROVAL_RCT_ADDR`) as needed.



# MySwap Contract Deployment Guide

## Overview
This guide details the deployment process for the `MySwap` contract, which enables token swaps between two ERC20 tokens.

## Prerequisites
- Access to an Ethereum RPC endpoint
- Private key with sufficient ETH
- ERC20 token addresses
- ApprovalService deployment

## Environment Variables
```bash
export RPC_URL="YOUR_RPC_URL"
export PRIVATE_KEY="YOUR_PRIVATE_KEY"
export APPROVAL_SRV_ADDR="APPROVAL_SERVICE_ADDRESS"
export TOKEN0_ADDR="FIRST_TOKEN_ADDRESS"
export TOKEN1_ADDR="SECOND_TOKEN_ADDRESS"
```

## Deployment Steps

### 1. Deploy MySwap Contract
Deploy the main contract with the following parameters:
- `ApprovalService service_`: `APPROVAL_SRV_ADDR`
- `IERC20 token0_`: First token address (`TOKEN0_ADDR`)
- `IERC20 token1_`: Second token address (`TOKEN1_ADDR`)

```bash
cast create MySwap \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $APPROVAL_SRV_ADDR $TOKEN0_ADDR $TOKEN1_ADDR
```

After deployment, save the contract address:
```bash
export MY_SWAP_ADDR="DEPLOYED_CONTRACT_ADDRESS"
```

### 2. Fund the Contract
Send ETH to cover settlement and subscription costs:

```bash
cast send $MY_SWAP_ADDR \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --value 0.1ether
```

### 3. Subscribe to ApprovalService
Enable the approval service integration:

```bash
cast send $MY_SWAP_ADDR "subscribe()" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

## Optional: Pool Initialization
Initialize the liquidity pool with custom token amounts:

```bash
cast send $MY_SWAP_ADDR "initializePool(uint256,uint256)" 1000 2000 \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### Pool Initialization Parameters
- First parameter (1000): Amount of `token0` for initial liquidity
- Second parameter (2000): Amount of `token1` for initial liquidity

Adjust these values based on your requirements.

## Important Security Notes
1. Ensure sufficient ETH funding for:
   - Contract deployment
   - Callback operations
   - Subscription fees
   
2. Securely store the following addresses:
   - `APPROVAL_SRV_ADDR`
   - `MY_SWAP_ADDR`
   - Token addresses

## Verification
After deployment, verify that:
- Contract is properly funded with ETH
- Subscription to ApprovalService is active
- Initial liquidity is set (if initialized)

## Troubleshooting
If deployment fails:
1. Check ETH balance in deploying account
2. Verify all addresses are correct
3. Ensure RPC endpoint is responsive
4. Confirm gas settings are appropriate




# MyExch Contract Deployment Guide

## Overview
This guide details the deployment process for the `MyExch` contract, which enables token exchanges with dynamic pricing. The contract works with specific allowed token addresses and requires an ApprovalService integration.

## Prerequisites
- Access to an Ethereum RPC endpoint
- Private key with sufficient ETH
- ApprovalService contract deployment
- Allowed tokens must be DynamicPriceERC20 compatible tokens

## Environment Variables
```bash
export RPC_URL="YOUR_RPC_URL"
export PRIVATE_KEY="YOUR_PRIVATE_KEY"
export APPROVAL_SRV_ADDR="APPROVAL_SERVICE_ADDRESS"
```

## Deployment Steps

### 1. Deploy MyExch Contract
Deploy the main contract with the ApprovalService address as constructor parameter. Note that the allowed tokens are hardcoded in the contract:
```
0x6Af1483f4cFe00906bC6542B72279B871C502204
0x798585e2A8F308f89858B19d01BC915102FFf4Cc
0x8611876cbADE782C5A600D41eD0Af00217F056Af
```

```bash
cast create MyExch \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $APPROVAL_SRV_ADDR
```

After deployment, save the contract address:
```bash
export MY_EXCH_ADDR="DEPLOYED_CONTRACT_ADDRESS"
```

### 2. Fund the Contract
Send ETH to cover settlement, exchanges, and subscription costs:

```bash
cast send $MY_EXCH_ADDR \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --value 1ether
```

### 3. Subscribe to ApprovalService
Enable the approval service integration:

```bash
cast send $MY_EXCH_ADDR "subscribe()" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

## Contract Management Functions

### Check Token Allowance
To verify if a token is allowed:
```bash
cast call $MY_EXCH_ADDR "isAllowedToken(address)" TOKEN_ADDRESS \
  --rpc-url $RPC_URL
```

### Withdraw ETH Only
To withdraw only ETH from the contract:
```bash
cast send $MY_EXCH_ADDR "withdrawEther()" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### Withdraw All Assets
To withdraw both ETH and all allowed tokens:
```bash
cast send $MY_EXCH_ADDR "withdraw()" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### Unsubscribe from ApprovalService
To unsubscribe from the approval service:
```bash
cast send $MY_EXCH_ADDR "unsubscribe()" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

## Important Security Notes

1. Contract Owner Responsibilities:
   - Only the owner can withdraw funds
   - Only the owner can subscribe/unsubscribe from ApprovalService
   - Owner should monitor contract ETH balance for settlements

2. Fund Management:
   - Maintain sufficient ETH for:
     - Token exchange operations
     - Settlement payments
     - Subscription fees

3. Token Integration:
   - Only pre-defined allowed tokens can be exchanged
   - All tokens must implement the IDynamicPriceERC20 interface
   - Token prices are determined by their Cost() function

## Verification Steps

After deployment, verify:
1. Contract ownership is correct
2. ETH funding is sufficient
3. ApprovalService subscription is active
4. Allowed tokens are correctly registered
5. Contract can receive ETH (test with small amount)

## Troubleshooting

1. If deployment fails:
   - Verify ETH balance in deploying account
   - Confirm ApprovalService address is correct
   - Check gas settings

2. If operations fail:
   - Ensure sufficient ETH balance for operations
   - Verify caller has appropriate permissions
   - Check token implementations for compatibility
   - Confirm ApprovalService subscription is active

## Monitoring

Regular monitoring should include:
1. Contract ETH balance
2. Token balances for all allowed tokens
3. ApprovalService subscription status
4. Successful settlement operations





# Staking Contract Deployment Guide

## Overview
This guide details the deployment process for the `StakingContract`, which enables ETH staking with a 5% fee on withdrawals. The contract includes a hardcoded withdrawal address: `0x17862a8DeC8833b326C2360c05729e30510cA565`.

## Prerequisites
- Access to an Ethereum RPC endpoint
- Private key with sufficient ETH for deployment and initial funding
- Understanding that 5% of all withdrawals are kept in the contract
- Note that the withdrawal address is hardcoded and cannot be changed after deployment

## Environment Variables
```bash
export RPC_URL="YOUR_RPC_URL"
export PRIVATE_KEY="YOUR_PRIVATE_KEY"
export WITHDRAWAL_ADDR="0x17862a8DeC8833b326C2360c05729e30510cA565"
```

## Deployment Steps

### 1. Deploy StakingContract
Deploy the contract with optional initial ETH funding:

```bash
# Deploy without initial funding
cast create StakingContract \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# Or deploy with initial funding (e.g., 1 ETH)
cast create StakingContract \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --value 1ether
```

After deployment, save the contract address:
```bash
export STAKING_CONTRACT_ADDR="DEPLOYED_CONTRACT_ADDRESS"
```

### 2. Verify Contract Deployment
Check the contract's initial balance:

```bash
cast call $STAKING_CONTRACT_ADDR "getContractBalance()" \
  --rpc-url $RPC_URL
```

## Contract Interaction Functions

### Stake ETH
To stake ETH in the contract:
```bash
cast send $STAKING_CONTRACT_ADDR "stake()" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --value 1ether
```

### Check Staked Balance
To check your staked balance:
```bash
cast call $STAKING_CONTRACT_ADDR "getStakedBalance()" \
  --rpc-url $RPC_URL \
  --from YOUR_ADDRESS
```

### Withdraw Staked ETH
To withdraw your staked ETH (95% will be returned, 5% stays in contract):
```bash
cast send $STAKING_CONTRACT_ADDR "withdraw()" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### Check Contract Balance
To check the total contract balance:
```bash
cast call $STAKING_CONTRACT_ADDR "getContractBalance()" \
  --rpc-url $RPC_URL
```

## Important Notes

1. Withdrawal Specifics:
   - Hardcoded withdrawal address: `0x17862a8DeC8833b326C2360c05729e30510cA565`<Use Exchange address here>
   - 5% fee on all withdrawals
   - The contract retains the fee automatically

2. Security Considerations:
   - The withdrawal address cannot be changed after deployment
   - Contract inherits from AbstractCallback
   - Contract can receive direct ETH transfers
   - No time locks or withdrawal limits implemented

3. Fee Structure:
   - 5% fee is automatically calculated on withdrawal
   - Fee remains in the contract
   - 95% is returned to the staker

## Verification Steps

After deployment verify:
1. Contract can receive ETH
2. Staking functionality works:
   ```bash
   # Test stake
   cast send $STAKING_CONTRACT_ADDR "stake()" --value 0.1ether
   # Verify balance
   cast call $STAKING_CONTRACT_ADDR "getStakedBalance()"
   ```
2. Withdrawal functionality works correctly (95% return)
3. Contract balance updates properly
4. Events are emitted correctly:
   - `Staked(address indexed user, uint256 amount)`
   - `Withdrawn(uint256 indexed amount)`

## Troubleshooting

1. If deployment fails:
   - Check deploying account has sufficient ETH
   - Verify gas settings
   - Ensure AbstractCallback contract is properly imported

2. If operations fail:
   - For stakes: Ensure sent value is greater than 0
   - For withdrawals: Verify staked balance is sufficient
   - Check ETH balance for gas fees

## Monitoring Best Practices

1. Regular monitoring should include:
   - Total contract balance
   - Individual staked balances
   - Successful withdrawals
   - Fee accumulation

2. Event monitoring:
   - Track Staked events for new deposits
   - Monitor Withdrawn events for fee collection
   - Verify withdrawal amounts are 95% of staked amounts




# Similarly Deploy the StakeReactive on Kopli Network with origin contract address as STAKE contract address
