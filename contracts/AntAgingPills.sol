// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "abdk-libraries-solidity/ABDKMathQuad.sol";


interface BasicNft is IERC721,IERC721Enumerable {
    function mint(address to) external;
    function batchMint(address to,uint256  number) external;
    function setTokenURL(string memory prefix_,string memory suffix_) external;
}
contract AntAgingPills is Initializable,Ownable{
    using ABDKMathQuad for bytes16;
    struct lockedInfo{
       uint256 lockedAmount;
       uint256 startTime;
       uint256 endTime;
       uint256 exponent;
       uint256 withdrawnAmount;
       bool exists;
    }
    address public  feeToken;
    address public  nftAddress;
    mapping (uint256=>lockedInfo) public lockInfoById;
    event lockAntAgingCreated(uint256 tokenId,address to,uint256 startTime,uint256 endTime,uint256 exponent,uint256 tokenAmount);
    event lockAntAgingWithdrawal(uint256 tokenId,address user,uint256 withdrawnAmount,uint256 releasedTokens);
    
    //test tokenId
    // uint256 public tokenId;
    function initialize(address nftAddress_,address feeToken_) public initializer {
        feeToken=feeToken_;
        nftAddress=nftAddress_;
        // tokenId=1;
    }
    
    /*
     exponent 幂传递*100的整数,例如0.25*100=25
    */
    function createAntAging(address to,uint256 tokenAmount,uint256 startTime,uint256 endTime,uint256 exponent) public {
       require(to!=address(0),"faild address");
       require(tokenAmount>0,"Can't be less than 0");
       require(endTime>startTime,"Can't be less than now");
       //  TO DO:
       IERC20 tokenContract=IERC20(feeToken);
       tokenContract.transferFrom(msg.sender,address(this),tokenAmount);
       BasicNft nftContract=BasicNft(nftAddress);
       nftContract.mint(to);
       uint256 tokenId=nftContract.totalSupply();
       lockInfoById[tokenId]=lockedInfo(tokenAmount,startTime,endTime,exponent,0,true);
    //    lockInfoById[tokenId]=lockedInfo(tokenAmount,block.timestamp,block.timestamp+60,exponent,0,true);
    //    tokenId+=1;
       emit lockAntAgingCreated(tokenId,to,startTime,endTime,exponent,tokenAmount);
    }
    
    //查询tokenId对应的释放数量
    function getReleasedTokens(uint256 tokenId) view public  returns(uint256 releasedTokens) {
           require(lockInfoById[tokenId].exists,"The tokenId does not exist");
           require(block.timestamp>lockInfoById[tokenId].startTime,"The token is not released");
           uint256 elapsedTime = block.timestamp - lockInfoById[tokenId].startTime; // 已过时间
           uint256 totalReleaseTime=lockInfoById[tokenId].endTime-lockInfoById[tokenId].startTime;// 总释放时间
           //已过时间大于等于总释放时间，返回剩余所有locked；
           if (elapsedTime >= totalReleaseTime) {
               return lockInfoById[tokenId].lockedAmount;
           }
           releasedTokens=calculatePower(lockInfoById[tokenId].lockedAmount,elapsedTime,totalReleaseTime,lockInfoById[tokenId].exponent,100);
           return  releasedTokens;
    } 
    
        
    //查询tokenId对应的释放数量
    function getblckTime() view public  returns(uint256) {
          return block.timestamp;
    } 

    // 计算幂释放token数量
    function calculatePower(
      uint256 totalTokens, 
      uint256 elapsedTime,
      uint256 totalTime,
      uint256 exponentNumerator,
      uint256 exponentDenominator
   ) internal  pure returns (uint256) {
      // 确保 totalTime 不为零
      require(totalTime > 0, "Total time must be greater than zero");
      // 确保 elapsedTime 不大于 totalTime
      require(elapsedTime <= totalTime, "Elapsed time cannot exceed total time");
      // 确保 exponentDenominator 不为零
      require(exponentDenominator > 0, "Exponent denominator must be greater than zero");

      // 计算时间比例 ratio = elapsedTime / totalTime
      bytes16 ratio = ABDKMathQuad.div(
         ABDKMathQuad.fromUInt(elapsedTime),
         ABDKMathQuad.fromUInt(totalTime)
      );

      // 确保比例大于零
      require(
         ABDKMathQuad.cmp(ratio, ABDKMathQuad.fromUInt(0)) > 0,
         "Ratio must be greater than zero"
      );

      // 计算 exponent = exponentNumerator / exponentDenominator
      bytes16 exponent = ABDKMathQuad.div(
         ABDKMathQuad.fromUInt(exponentNumerator),
         ABDKMathQuad.fromUInt(exponentDenominator)
      );

      // 计算 powerResult = exp(exponent * ln(ratio))
      bytes16 powerResult = ABDKMathQuad.exp(
         ABDKMathQuad.mul(
               exponent,
               ABDKMathQuad.ln(ratio)
         )
      );

      // 直接计算 releasedTokensQuad = totalTokens * powerResult
      bytes16 releasedTokensQuad = ABDKMathQuad.mul(
         ABDKMathQuad.fromUInt(totalTokens),
         powerResult
      );

      // 将结果转换回 uint256
      uint256 releasedTokens = ABDKMathQuad.toUInt(releasedTokensQuad);

      return releasedTokens;
   }


    // 提取当前奖励
    function withdrawReleasedTokens(uint256 tokenId) external {
      require(lockInfoById[tokenId].exists,"The tokenId does not exist");
      // TO DO:
      BasicNft nftContract=BasicNft(nftAddress);
      require(nftContract.ownerOf(tokenId)==msg.sender,"Not the tokenId owner");

      require(lockInfoById[tokenId].lockedAmount>lockInfoById[tokenId].withdrawnAmount,"The token has been extracted.");
      uint256 releasedTokens=getReleasedTokens(tokenId);
      require(releasedTokens>0,"Invalid token count");
      uint256 amount=releasedTokens-lockInfoById[tokenId].withdrawnAmount;
      require(amount>0,"Invalid token amount");
      lockInfoById[tokenId].withdrawnAmount+=amount;
      emit lockAntAgingWithdrawal(tokenId,msg.sender,amount,releasedTokens);
      // TO DO:
      IERC20 tokenContract=IERC20(feeToken);
      require(amount>0,"Invalid token amount");
      tokenContract.transfer(msg.sender,amount);
    }

    function setTokenURL(string memory prefix,string memory suffix) external onlyOwner{
       BasicNft nftContract=BasicNft(nftAddress);
       nftContract.setTokenURL(prefix,suffix);
    }

}




