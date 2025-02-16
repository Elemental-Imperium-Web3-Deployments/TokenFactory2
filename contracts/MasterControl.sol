// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MasterControl is ERC20, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    AggregatorV3Interface internal priceFeed;
    
    uint256 public constant PRICE_PRECISION = 1e8;
    uint256 public minCollateralRatio = 150; // 150% collateralization ratio
    
    mapping(address => uint256) public collateralBalances;
    
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event PriceUpdated(uint256 newPrice);
    event CollateralRatioUpdated(uint256 newRatio);

    constructor(
        string memory name,
        string memory symbol,
        address _priceFeedAddress
    ) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
        
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }
    
    function mint(uint256 amount) external nonReentrant {
        require(hasRole(MINTER_ROLE, msg.sender), "Must have minter role");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 currentPrice = getLatestPrice();
        require(currentPrice > 0, "Invalid price feed");
        
        _mint(msg.sender, amount);
    }
    
    function burn(uint256 amount) external nonReentrant {
        require(hasRole(BURNER_ROLE, msg.sender), "Must have burner role");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
    }
    
    function depositCollateral() external payable nonReentrant {
        require(msg.value > 0, "Must deposit some ETH");
        
        collateralBalances[msg.sender] += msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }
    
    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(collateralBalances[msg.sender] >= amount, "Insufficient collateral");
        
        uint256 userDebt = balanceOf(msg.sender);
        if (userDebt > 0) {
            uint256 collateralValue = (collateralBalances[msg.sender] - amount) * getLatestPrice() / PRICE_PRECISION;
            uint256 requiredCollateral = (userDebt * minCollateralRatio) / 100;
            require(collateralValue >= requiredCollateral, "Would break collateral ratio");
        }
        
        collateralBalances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit CollateralWithdrawn(msg.sender, amount);
    }
    
    function getLatestPrice() public view returns (uint256) {
        (
            ,
            int256 price,
            ,
            ,
        ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        return uint256(price);
    }
    
    function setMinCollateralRatio(uint256 newRatio) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        require(newRatio >= 100, "Ratio must be at least 100%");
        minCollateralRatio = newRatio;
        emit CollateralRatioUpdated(newRatio);
    }
    
    function pause() external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        _pause();
    }
    
    function unpause() external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        _unpause();
    }
    
    // Required override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    receive() external payable {
        depositCollateral();
    }
} 