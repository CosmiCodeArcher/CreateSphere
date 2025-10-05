// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// import "@openzeppelin/contracts/utils/Counters.sol"; // Removed as it's deprecated in v5

/**
 * @title RewardNFT
 * @dev NFT contract for backer rewards with different tiers
 */
contract RewardNFT is ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Reward tier structure
    struct RewardTier {
        string name;
        uint256 minContribution;
        string baseURI;
        bool active;
    }
    
    // NFT metadata
    struct NFTMetadata {
        uint256 projectId;
        uint256 contribution;
        uint256 tier;
        uint256 mintedAt;
    }
    
    // State variables
    address public projectFactory;
    mapping(uint256 => RewardTier) public rewardTiers;
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(uint256 => mapping(address => uint256[])) public projectBackerNFTs;
    
    uint256 public tierCount;
    
    // Events
    event RewardMinted(
        address indexed backer,
        uint256 indexed tokenId,
        uint256 indexed projectId,
        uint256 tier
    );
    
    event TierCreated(
        uint256 indexed tierId,
        string name,
        uint256 minContribution
    );
    
    modifier onlyFactory() {
        require(msg.sender == projectFactory, "Only factory can call");
        _;
    }
    
    constructor(address _projectFactory, address initialOwner) ERC721("CreateSphere Backer NFT", "CSNFT") Ownable(initialOwner) {
        projectFactory = _projectFactory;
        _initializeDefaultTiers();
    }
    
    /**
     * @dev Initialize default reward tiers
     */
    function _initializeDefaultTiers() internal {
        // Bronze tier - 0.1 ETH
        _createTier("Bronze Supporter", 0.1 ether, "ipfs://bronze/");
        
        // Silver tier - 0.5 ETH
        _createTier("Silver Supporter", 0.5 ether, "ipfs://silver/");
        
        // Gold tier - 1 ETH
        _createTier("Gold Supporter", 1 ether, "ipfs://gold/");
        
        // Platinum tier - 5 ETH
        _createTier("Platinum Supporter", 5 ether, "ipfs://platinum/");
    }
    
    /**
     * @dev Create a new reward tier
     */
    function _createTier(
        string memory _name,
        uint256 _minContribution,
        string memory _baseURI
    ) internal {
        tierCount++;
        rewardTiers[tierCount] = RewardTier({
            name: _name,
            minContribution: _minContribution,
            baseURI: _baseURI,
            active: true
        });
        
        emit TierCreated(tierCount, _name, _minContribution);
    }
    
    /**
     * @dev Mint reward NFT for backer
     */
    function mintReward(
        address _backer,
        uint256 _projectId,
        uint256 _contribution
    ) external onlyFactory returns (uint256) {
        uint256 tier = _calculateTier(_contribution);
        require(tier > 0, "Contribution too low for reward");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(_backer, tokenId);
        
        // Store metadata
        nftMetadata[tokenId] = NFTMetadata({
            projectId: _projectId,
            contribution: _contribution,
            tier: tier,
            mintedAt: block.timestamp
        });
        
        // Track backer's NFTs for this project
        projectBackerNFTs[_projectId][_backer].push(tokenId);
        
        // Set token URI
        string memory tierURI = string(abi.encodePacked(
            rewardTiers[tier].baseURI,
            Strings.toString(_projectId),
            ".json"
        ));
        _setTokenURI(tokenId, tierURI);
        
        emit RewardMinted(_backer, tokenId, _projectId, tier);
        
        return tokenId;
    }
    
    /**
     * @dev Calculate reward tier based on contribution
     */
    function _calculateTier(uint256 _contribution) internal view returns (uint256) {
        uint256 highestTier = 0;
        
        for (uint256 i = 1; i <= tierCount; i++) {
            if (rewardTiers[i].active && _contribution >= rewardTiers[i].minContribution) {
                highestTier = i;
            }
        }
        
        return highestTier;
    }
    
    /**
     * @dev Get NFT metadata
     */
    function getNFTMetadata(uint256 _tokenId) 
        external 
        view 
        returns (NFTMetadata memory) 
    {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        return nftMetadata[_tokenId];
    }
    
    /**
     * @dev Get backer's NFTs for a project
     */
    function getBackerNFTs(uint256 _projectId, address _backer)
        external
        view
        returns (uint256[] memory)
    {
        return projectBackerNFTs[_projectId][_backer];
    }
    
    /**
     * @dev Get tier information
     */
    function getTierInfo(uint256 _tier)
        external
        view
        returns (RewardTier memory)
    {
        require(_tier > 0 && _tier <= tierCount, "Invalid tier");
        return rewardTiers[_tier];
    }
    
    /**
     * @dev Add custom tier (only owner)
     */
    function addTier(
        string memory _name,
        uint256 _minContribution,
        string memory _baseURI
    ) external onlyOwner {
        _createTier(_name, _minContribution, _baseURI);
    }
    
    /**
     * @dev Update tier status (only owner)
     */
    function setTierStatus(uint256 _tier, bool _active) external onlyOwner {
        require(_tier > 0 && _tier <= tierCount, "Invalid tier");
        rewardTiers[_tier].active = _active;
    }
    
    /**
     * @dev Update project factory address (only owner)
     */
    function setProjectFactory(address _newFactory) external onlyOwner {
        require(_newFactory != address(0), "Invalid address");
        projectFactory = _newFactory;
    }
    
    // Override required functions
    function _increaseBalance(address account, uint128 value) internal virtual override(ERC721Enumerable, ERC721) {
        super._increaseBalance(account, value);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721Enumerable, ERC721) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage, ERC721)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}