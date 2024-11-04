## Deployment Guide for `DynamicPriceERC20`

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




# Deployment Guide for ApprovalService and ApprovalListener

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



