# Smart Contract API Reference

This document details the API for the Synthetic Stablecoin Platform's smart contracts.

## MasterControl Contract

The main contract managing synthetic stablecoin operations.

### Contract Information

- **Name**: MasterControl
- **Network**: Polygon
- **Solidity Version**: ^0.8.19
- **Standards**: ERC20, AccessControl, ReentrancyGuard

### Constants

```solidity
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
uint256 public constant PRICE_PRECISION = 1e8;
```

### State Variables

```solidity
AggregatorV3Interface internal priceFeed;
uint256 public minCollateralRatio = 150; // 150% collateralization ratio
mapping(address => uint256) public collateralBalances;
```

### Events

```solidity
event CollateralDeposited(address indexed user, uint256 amount);
event CollateralWithdrawn(address indexed user, uint256 amount);
event PriceUpdated(uint256 newPrice);
event CollateralRatioUpdated(uint256 newRatio);
```

### Constructor

```solidity
constructor(
    string memory name,
    string memory symbol,
    address _priceFeedAddress
)
```

Initializes the contract with token details and price feed.

Parameters:
- `name`: Token name
- `symbol`: Token symbol
- `_priceFeedAddress`: Chainlink price feed address

### Public Functions

#### mint

```solidity
function mint(uint256 amount) external nonReentrant
```

Mints new synthetic tokens.

Parameters:
- `amount`: Amount of tokens to mint (in wei)

Requirements:
- Caller must have MINTER_ROLE
- Amount must be greater than 0
- Price feed must be valid

#### burn

```solidity
function burn(uint256 amount) external nonReentrant
```

Burns synthetic tokens.

Parameters:
- `amount`: Amount of tokens to burn (in wei)

Requirements:
- Caller must have BURNER_ROLE
- Amount must be greater than 0
- Caller must have sufficient balance

#### depositCollateral

```solidity
function depositCollateral() external payable nonReentrant
```

Deposits ETH as collateral.

Requirements:
- Must send some ETH

#### withdrawCollateral

```solidity
function withdrawCollateral(uint256 amount) external nonReentrant
```

Withdraws ETH collateral.

Parameters:
- `amount`: Amount of ETH to withdraw (in wei)

Requirements:
- Must have sufficient collateral
- Withdrawal must not break collateral ratio

#### getLatestPrice

```solidity
function getLatestPrice() public view returns (uint256)
```

Gets the latest price from Chainlink oracle.

Returns:
- Current price with 8 decimal precision

#### setMinCollateralRatio

```solidity
function setMinCollateralRatio(uint256 newRatio) external
```

Updates minimum collateral ratio.

Parameters:
- `newRatio`: New minimum collateral ratio (in percentage)

Requirements:
- Caller must have ADMIN_ROLE
- Ratio must be at least 100%

### Admin Functions

#### pause

```solidity
function pause() external
```

Pauses contract operations.

Requirements:
- Caller must have ADMIN_ROLE

#### unpause

```solidity
function unpause() external
```

Unpauses contract operations.

Requirements:
- Caller must have ADMIN_ROLE

### View Functions

#### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view override returns (bool)
```

Checks if contract supports an interface.

Parameters:
- `interfaceId`: Interface identifier

Returns:
- Boolean indicating support

### Fallback Function

```solidity
receive() external payable
```

Handles direct ETH transfers by calling depositCollateral.

## Integration Examples

### Web3.js Integration

```javascript
const contract = new web3.eth.Contract(MasterControlABI, contractAddress);

// Mint tokens
await contract.methods.mint(web3.utils.toWei('100')).send({
    from: userAddress
});

// Burn tokens
await contract.methods.burn(web3.utils.toWei('50')).send({
    from: userAddress
});

// Deposit collateral
await contract.methods.depositCollateral().send({
    from: userAddress,
    value: web3.utils.toWei('1')
});
```

### Ethers.js Integration

```javascript
const contract = new ethers.Contract(address, MasterControlABI, signer);

// Mint tokens
await contract.mint(ethers.utils.parseEther('100'));

// Burn tokens
await contract.burn(ethers.utils.parseEther('50'));

// Deposit collateral
await contract.depositCollateral({
    value: ethers.utils.parseEther('1')
});
```

## Error Codes

| Error Code | Description |
|------------|-------------|
| `Must have minter role` | Caller doesn't have minting permission |
| `Must have burner role` | Caller doesn't have burning permission |
| `Must have admin role` | Caller doesn't have admin permission |
| `Amount must be greater than 0` | Invalid amount specified |
| `Invalid price feed` | Price feed not working |
| `Insufficient balance` | Not enough tokens to burn |
| `Would break collateral ratio` | Operation would violate minimum collateral ratio |
| `ETH transfer failed` | Failed to transfer ETH |

## Security Considerations

1. **Access Control**
   - Use appropriate roles for operations
   - Keep private keys secure
   - Monitor role assignments

2. **Transaction Safety**
   - Check gas prices
   - Verify transaction success
   - Handle failed transactions

3. **Price Feed**
   - Monitor oracle health
   - Have fallback mechanisms
   - Validate price data

4. **Collateral Management**
   - Monitor collateral ratios
   - Handle liquidations properly
   - Verify collateral balances 