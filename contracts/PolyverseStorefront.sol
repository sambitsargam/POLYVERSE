// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PolyverseStorefront
 * @dev Smart contract for managing the Polyverse creator storefront
 * Handles payments, creator registration, and content access control
 */
contract PolyverseStorefront is Ownable, ReentrancyGuard {
    
    // Supported payment tokens
    IERC20 public usdcToken;
    IERC20 public usdfcToken;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeRate = 250;
    
    // Creator structure
    struct Creator {
        address wallet;
        string handle;
        string name;
        bool isVerified;
        uint256 totalEarnings;
        uint256 subscriberCount;
        bool isActive;
        uint256 createdAt;
    }
    
    // Product structure
    struct Product {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 priceUSD; // Price in USD cents (e.g., 999 = $9.99)
        string contentHash; // IPFS or Filecoin hash
        string productType; // "course", "ebook", "digital_art", etc.
        bool isActive;
        uint256 purchaseCount;
        uint256 createdAt;
    }
    
    // Subscription tier structure
    struct SubscriptionTier {
        uint256 id;
        address creator;
        string name;
        uint256 priceUSD; // Monthly price in USD cents
        string[] features;
        bool isActive;
        uint256 subscriberCount;
    }
    
    // Purchase record
    struct Purchase {
        address buyer;
        address creator;
        uint256 productId;
        uint256 amountPaid;
        address paymentToken;
        uint256 timestamp;
        string transactionType; // "product", "subscription", "tip"
    }
    
    // Storage mappings
    mapping(address => Creator) public creators;
    mapping(string => address) public handleToAddress; // handle -> creator address
    mapping(uint256 => Product) public products;
    mapping(uint256 => SubscriptionTier) public subscriptionTiers;
    mapping(address => mapping(uint256 => bool)) public hasAccess; // buyer -> productId -> hasAccess
    mapping(address => mapping(address => uint256)) public subscriptions; // subscriber -> creator -> expiry
    mapping(bytes32 => bool) public processedPayments; // Prevent double spending
    
    // Counters
    uint256 public nextProductId = 1;
    uint256 public nextTierId = 1;
    uint256 public totalCreators;
    uint256 public totalProducts;
    uint256 public totalPurchases;
    
    // Events
    event CreatorRegistered(address indexed creator, string handle, string name);
    event ProductCreated(uint256 indexed productId, address indexed creator, string title, uint256 price);
    event ProductPurchased(uint256 indexed productId, address indexed buyer, address indexed creator, uint256 amount);
    event SubscriptionPurchased(uint256 indexed tierId, address indexed subscriber, address indexed creator, uint256 duration);
    event TipSent(address indexed from, address indexed to, uint256 amount, address token);
    event PlatformFeeUpdated(uint256 newFeeRate);
    
    constructor(address _usdcToken, address _usdfcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        usdfcToken = IERC20(_usdfcToken);
    }
    
    /**
     * @dev Register as a creator
     */
    function registerCreator(string memory _handle, string memory _name) external {
        require(bytes(_handle).length > 0, "Handle cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(handleToAddress[_handle] == address(0), "Handle already taken");
        require(creators[msg.sender].wallet == address(0), "Already registered");
        
        creators[msg.sender] = Creator({
            wallet: msg.sender,
            handle: _handle,
            name: _name,
            isVerified: false,
            totalEarnings: 0,
            subscriberCount: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        handleToAddress[_handle] = msg.sender;
        totalCreators++;
        
        emit CreatorRegistered(msg.sender, _handle, _name);
    }
    
    /**
     * @dev Create a new product
     */
    function createProduct(
        string memory _title,
        string memory _description,
        uint256 _priceUSD,
        string memory _contentHash,
        string memory _productType
    ) external returns (uint256) {
        require(creators[msg.sender].isActive, "Not a registered creator");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_priceUSD > 0, "Price must be greater than 0");
        
        uint256 productId = nextProductId++;
        
        products[productId] = Product({
            id: productId,
            creator: msg.sender,
            title: _title,
            description: _description,
            priceUSD: _priceUSD,
            contentHash: _contentHash,
            productType: _productType,
            isActive: true,
            purchaseCount: 0,
            createdAt: block.timestamp
        });
        
        totalProducts++;
        
        emit ProductCreated(productId, msg.sender, _title, _priceUSD);
        return productId;
    }
    
    /**
     * @dev Purchase a product with USDC/USDFC
     */
    function purchaseProduct(uint256 _productId, address _paymentToken) external nonReentrant {
        Product storage product = products[_productId];
        require(product.isActive, "Product not active");
        require(!hasAccess[msg.sender][_productId], "Already purchased");
        
        IERC20 paymentToken;
        if (_paymentToken == address(usdcToken)) {
            paymentToken = usdcToken;
        } else if (_paymentToken == address(usdfcToken)) {
            paymentToken = usdfcToken;
        } else {
            revert("Unsupported payment token");
        }
        
        uint256 totalAmount = product.priceUSD;
        uint256 platformFee = (totalAmount * platformFeeRate) / 10000;
        uint256 creatorAmount = totalAmount - platformFee;
        
        // Transfer payment
        require(paymentToken.transferFrom(msg.sender, address(this), totalAmount), "Payment failed");
        require(paymentToken.transfer(product.creator, creatorAmount), "Creator payment failed");
        // Platform fee stays in contract
        
        // Grant access
        hasAccess[msg.sender][_productId] = true;
        product.purchaseCount++;
        creators[product.creator].totalEarnings += creatorAmount;
        totalPurchases++;
        
        emit ProductPurchased(_productId, msg.sender, product.creator, totalAmount);
    }
    
    /**
     * @dev Send tip to creator
     */
    function sendTip(address _creator, uint256 _amount, address _paymentToken) external nonReentrant {
        require(creators[_creator].isActive, "Creator not found");
        require(_amount > 0, "Amount must be greater than 0");
        
        IERC20 paymentToken;
        if (_paymentToken == address(usdcToken)) {
            paymentToken = usdcToken;
        } else if (_paymentToken == address(usdfcToken)) {
            paymentToken = usdfcToken;
        } else {
            revert("Unsupported payment token");
        }
        
        uint256 platformFee = (_amount * platformFeeRate) / 10000;
        uint256 creatorAmount = _amount - platformFee;
        
        require(paymentToken.transferFrom(msg.sender, address(this), _amount), "Payment failed");
        require(paymentToken.transfer(_creator, creatorAmount), "Creator payment failed");
        
        creators[_creator].totalEarnings += creatorAmount;
        
        emit TipSent(msg.sender, _creator, _amount, _paymentToken);
    }
    
    /**
     * @dev Check if user has access to product
     */
    function checkAccess(address _user, uint256 _productId) external view returns (bool) {
        return hasAccess[_user][_productId];
    }
    
    /**
     * @dev Get creator info by handle
     */
    function getCreatorByHandle(string memory _handle) external view returns (Creator memory) {
        address creatorAddress = handleToAddress[_handle];
        require(creatorAddress != address(0), "Creator not found");
        return creators[creatorAddress];
    }
    
    /**
     * @dev Get products by creator
     */
    function getProductsByCreator(address _creator) external view returns (uint256[] memory) {
        uint256[] memory creatorProducts = new uint256[](totalProducts);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextProductId; i++) {
            if (products[i].creator == _creator && products[i].isActive) {
                creatorProducts[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = creatorProducts[i];
        }
        
        return result;
    }
    
    /**
     * @dev Verify creator (only owner)
     */
    function verifyCreator(address _creator) external onlyOwner {
        require(creators[_creator].isActive, "Creator not found");
        creators[_creator].isVerified = true;
    }
    
    /**
     * @dev Update platform fee rate (only owner)
     */
    function updatePlatformFeeRate(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _newFeeRate;
        emit PlatformFeeUpdated(_newFeeRate);
    }
    
    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawPlatformFees(address _token, uint256 _amount) external onlyOwner {
        IERC20 token = IERC20(_token);
        require(token.transfer(owner(), _amount), "Withdrawal failed");
    }
    
    /**
     * @dev Emergency pause/unpause creator (only owner)
     */
    function toggleCreatorStatus(address _creator) external onlyOwner {
        creators[_creator].isActive = !creators[_creator].isActive;
    }
}