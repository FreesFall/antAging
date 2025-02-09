// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// import "@openzeppelin/contracts/utils/Counters.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC721/ERC721.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicNfts is ERC721,Ownable,ERC721Enumerable  {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    bool private _isInitialized;
    // Redefine the name and symbol variables
    string private _name;
    string private _symbol;
    // token url
    string public prefix;
    string public suffix;
    uint256 public maxSupply;


    constructor() ERC721("", "") {_isInitialized = false;}
    function initialize(
        address create_,
        string memory name_,
        string memory symbol_,
        string memory prefix_,
        string memory suffix_,
        uint256 maxSupply_
    ) external onlyOwner {
        require(!_isInitialized, 'NFT: not initialized!');
        // set owner
        transferOwnership(create_);
        _name = name_;
        _symbol = symbol_;
        // set token URI
        prefix=prefix_;
        suffix=suffix_;

        maxSupply=maxSupply_;
        _tokenIdCounter.increment();   // skip 0
        _isInitialized = true;
    }

    function name() public view override returns (string memory) {
        return _name;
    }
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return prefix;
    }

    function _mintTo(address to) internal {
        uint256 tokenId = _tokenIdCounter.current(); 
        require(tokenId <= maxSupply, "Max supply reached");
        _safeMint(to, tokenId);
        _tokenIdCounter.increment();
    }

    function mint(address to) external onlyOwner {
        _mintTo(to);
    }

    function batchMint(address to, uint256 number) external onlyOwner {
        for (uint256 i = 0; i < number; i++) {
            _mintTo(to);
        }
    }

    function setTokenURI(string memory prefix_,string memory suffix_) external onlyOwner {
        prefix = prefix_;
        suffix = suffix_;
    }
    /**
     * @dev See {IERC721Metadata-tokenURI}.
    */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tokenId.toString(), suffix))
            : '';
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
