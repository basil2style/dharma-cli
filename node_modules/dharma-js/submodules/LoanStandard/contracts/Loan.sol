pragma solidity ^0.4.8;

import "./LoanLib.sol";
import "./RedeemableTokenLib.sol";


/**
 * @title Loan
 *
 * @dev Simple unsecured loan implementation with simple interest.
 * @dev Heavily based on the CrowdsaleToken contract in the
 *        OpenZeppelin reference contracts.
 * @dev The loan contract stores data associated with all unsecured loans
 *        in the Dharma Network's v0.1.0 release.
 */
contract Loan {
  using LoanLib for LoanLib.Loan;
  using RedeemableTokenLib for RedeemableTokenLib.Accounting;
  /**
   * EVENTS
   */
  event PeriodicRepayment(
    bytes32 indexed uuid,
    address indexed from,
    uint value,
    uint blockNumber
  );

  event LoanTermBegin(
    bytes32 indexed uuid,
    address indexed borrower,
    uint blockNumber
  );

  event LoanCreated(
    bytes32 indexed uuid,
    address indexed borrower,
    address indexed attestor,
    uint blockNumber
  );

  event Transfer(
    bytes32 indexed uuid,
    address from,
    address indexed to,
    uint value,
    uint blockNumber
  );

  event Approval(
    bytes32 indexed uuid,
    address indexed owner,
    address spender,
    uint value,
    uint blockNumber
  );

  event LoanBidsRejected(
    bytes32 indexed uuid,
    address indexed borrower,
    uint blockNumber
  );

  event ValueRedeemed(
    bytes32 indexed uuid,
    address indexed investor,
    address indexed recipient,
    uint value,
    uint blockNumber
  );

  // Mapping associating loan data stores with their corresponding 32 byte UUIDs
  mapping (bytes32 => LoanLib.Loan) loans;
  uint256 public constant DECIMALS = 18;

  function () payable {
    throw;
  }

  /**
   * @dev Creates a loan request with the given terms and borrower-chosen UUID.
   *      UUIDs cannot conflict with existing loan request UUIDs.
   * @param uuid Borrower-chosen UUID for the given loan.
   * @param borrower the address to which principal wil be paid out
   * @param principal the amount in Wei desired by the borrower.
   * @param terms byte array defining the terms around which defaults will be
   *   evaluated off chain.  The first 32 bytes of any terms string are the
   *   Keccak-256 hash of the terms schema version, and all following values
   *   adhere to a schema published off chain.
   * @param attestorFee the amount in Wei paid out to the attestor on top of
   *   the principal when the loan is funded.
   * @param defaultRisk the likelihood of default, as predicted by the attestor
   * @param r ECDSA Signature of the above arguments, as signed by the attestor
   * @param s ECDSA Signature of the above arguments, as signed by the attestor
   * @param v ECDSA Signature of the above arguments, as signed by the attestor
   * @param auctionLengthInBlocks The number of blocks for which the loan
   *    auction will last, after which, if the loan is funded, the borrower
   *    will have the choice of either accepting or rejecting the terms
   * @param reviewPeriodLengthInBlocks The number of blocks which the borrower
   *    has to decide whether to accept the given terms after an auction has
   *    ended (during which all funding bids cannot be withdrawn)
   */
  function createLoan(
    bytes32 uuid,
    address borrower,
    uint256 principal,
    bytes terms,
    address attestor,
    uint256 attestorFee,
    uint256 defaultRisk,
    bytes32 r,
    bytes32 s,
    uint8 v,
    uint256 auctionLengthInBlocks,
    uint256 reviewPeriodLengthInBlocks
  ) {
    if (loans[uuid].borrower > 0)
      throw;

    /*
      Each loan has a borrower and an attestor.
    */
    loans[uuid].borrower = borrower;
    loans[uuid].attestor = attestor;

    /*
      The total amount of funds raised will be the sum of the desired principal
      and desired attestorFee.
    */
    loans[uuid].principal = principal;
    loans[uuid].attestorFee = attestorFee;
    loans[uuid].token.totalSupply = principal;

    /*
      Data points evaluated by clients off chain in making investment decisions
    */
    loans[uuid].defaultRisk = defaultRisk;
    loans[uuid].terms = terms;

    /* Attestor's ECDSA signature */
    loans[uuid].r = r;
    loans[uuid].s = s;
    loans[uuid].v = v;

    /* Auction Data */
    if (auctionLengthInBlocks == 0)
      throw;
    if (reviewPeriodLengthInBlocks == 0)
      throw;

    loans[uuid].auctionEndBlock = block.number + auctionLengthInBlocks;
    loans[uuid].reviewPeriodEndBlock = loans[uuid].auctionEndBlock + reviewPeriodLengthInBlocks;

    LoanCreated(uuid, borrower, attestor, block.number);
  }

  function getData(bytes32 uuid)
    returns (
      address,
      uint256,
      bytes,
      address,
      uint256,
      uint256
    ) {
    return (
      loans[uuid].borrower,
      loans[uuid].principal,
      loans[uuid].terms,
      loans[uuid].attestor,
      loans[uuid].attestorFee,
      loans[uuid].defaultRisk
    );
  }

  function getBorrower(bytes32 uuid) returns (address) {
    return loans[uuid].borrower;
  }

  function getPrincipal(bytes32 uuid) returns (uint) {
    return loans[uuid].principal;
  }

  function getTerms(bytes32 uuid) returns (bytes) {
    return loans[uuid].terms;
  }

  function getAttestor(bytes32 uuid) returns (address) {
    return loans[uuid].attestor;
  }

  function getAttestorFee(bytes32 uuid) returns (uint256) {
    return loans[uuid].attestorFee;
  }

  function getDefaultRisk(bytes32 uuid) returns (uint256) {
    return loans[uuid].defaultRisk;
  }

  function getAttestorSignature(bytes32 uuid)
    returns (bytes32, bytes32, uint8) {
    return (loans[uuid].r, loans[uuid].s, loans[uuid].v);
  }

  function getInterestRate(bytes32 uuid) returns (uint256) {
    return loans[uuid].interestRate;
  }

  function getTotalSupply(bytes32 uuid) returns (uint) {
    return loans[uuid].token.totalSupply;
  }

  function getAuctionEndBlock(bytes32 uuid) returns (uint) {
    return loans[uuid].auctionEndBlock;
  }

  function getReviewPeriodEndBlock(bytes32 uuid) returns (uint) {
    return loans[uuid].reviewPeriodEndBlock;
  }

  function getState(bytes32 uuid) returns (LoanLib.LoanState) {
    return loans[uuid].getCurrentLoanState();
  }

  /**
   * @dev Funds the loan request, refunds any remaining ether if the transaction
   *    fully funds the loan, issues tokens representing ownership in the loan
   *    to tokenRecipient, and transfers the principal to the borrower if the
   *    loan is fully funded.
   * @param tokenRecipient The address which will recieve the new loan tokens.
   */
  function bid(bytes32 uuid, address tokenRecipient, uint256 minInterestRate) payable {
    loans[uuid].bid(tokenRecipient, minInterestRate);
  }

  function acceptBids(bytes32 uuid, address[] bidders, uint256[] bidAmounts) {
    loans[uuid].acceptBids(uuid, bidders, bidAmounts);
  }

  function rejectBids(bytes32 uuid) {
    loans[uuid].rejectBids(uuid);
  }

  function getNumBids(bytes32 uuid) returns (uint256) {
    return loans[uuid].bidders.length;
  }

  function getBidByIndex(bytes32 uuid, uint256 index) returns (address, uint256, uint256) {
    return loans[uuid].getBidByIndex(index);
  }

  function getBidByAddress(bytes32 uuid, address bidder) returns (address, uint256, uint256) {
    return loans[uuid].getBidByAddress(bidder);
  }

  function getAmountRepaid(bytes32 uuid) returns (uint256) {
    return loans[uuid].getAmountRepaid();
  }

  /**
   * @dev If the time lock period has lapsed and the loan is, as of yet,
   *    not fully funded, withdrawInvestment allows investors to withdraw
   *    their deposited ether from the contract.  If the contract is fully
   *    emptied out, the contract self destructs.
   */
  function withdrawInvestment(bytes32 uuid) {
    loans[uuid].withdrawInvestment();
  }

  /**
   * @dev Method used by borrowers to make repayments to the loan contract
   *  at the end of each of payment period.
   */
  function periodicRepayment(bytes32 uuid) payable {
    loans[uuid].periodicRepayment(uuid);
  }

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(bytes32 uuid, address _to, uint _value) {
    loans[uuid].token.transfer(uuid, _to, _value);
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint representing the amount owned by the passed address.
  */
  function balanceOf(bytes32 uuid, address _owner) constant returns (uint balance) {
    return loans[uuid].token.balanceOf(_owner);
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint the amout of tokens to be transfered
   */
  function transferFrom(bytes32 uuid, address _from, address _to, uint _value) {
    loans[uuid].token.transferFrom(uuid, _from, _to, _value);
  }

  /**
   * @dev Aprove the passed address to spend the specified amount of tokens on beahlf of msg.sender.
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(bytes32 uuid, address _spender, uint _value) {
    loans[uuid].token.approve(uuid, _spender, _value);
  }

  /**
   * @dev Function to check the amount of tokens than an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint specifing the amount of tokens still avaible for the spender.
   */
  function allowance(bytes32 uuid, address _owner, address _spender) constant returns (uint remaining) {
    return loans[uuid].token.allowance(_owner, _spender);
  }

  /*
    At any point in time in which token value is redeemable, the amount of
   tokens an investor X is entitled to equals:
      ((amountXInvested / totalSupply) * redeemableValue) - amountRedeemedByX
  */
  function redeemValue(bytes32 uuid, address recipient) {
    loans[uuid].token.redeemValue(uuid, recipient);
  }

  function getRedeemableValue(bytes32 uuid, address investor) returns (uint) {
    return loans[uuid].token.getRedeemableValue(investor);
  }
}
