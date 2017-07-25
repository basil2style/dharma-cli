
pragma solidity ^0.4.8;

import "./RedeemableTokenLib.sol";


/**
 * @title Loan
 *
 * @dev Simple unsecured loan implementation with simple interest.
 * @dev Heavily based on the CrowdsaleToken contract in the
 *        OpenZeppelin reference contracts.
 */
library LoanLib {
  using RedeemableTokenLib for RedeemableTokenLib.Accounting;
  using SafeMath for uint;

  enum PeriodType { Daily, Weekly, Monthly, Yearly, FixedDate }
  enum LoanState { Null, Auction, Review, Accepted, Rejected }

  /*
      MODIFIERS
    ========================================================================
  */
  function isLoanState(Loan storage self, LoanState state) returns (bool) {
    updateCurrentLoanState(self);
    return self.state == state;
  }

  modifier assert(bool condition) {
    if (!condition) {
      throw;
    }
    _;
  }

  modifier assertOr(bool conditionOne, bool conditionTwo) {
    if (!conditionOne && !conditionTwo){
      throw;
    }
    _;
  }

  function fromBorrower(Loan storage self) returns (bool) {
    return msg.sender == self.borrower;
  }

  function fromBidder(Loan storage self) returns (bool) {
    return self.bids[msg.sender].investor == msg.sender;
  }

  /**
   EVENTS
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

  event LoanBidsRejected(
    bytes32 indexed uuid,
    address indexed borrower,
    uint blockNumber
  );

  uint8 public constant MAX_INVESTORS_PER_LOAN = 10;

  struct Bid {
    address investor;
    uint256 amount;
    uint256 minInterestRate;
  }

  struct Loan {
    address[] bidders;
    mapping (address => Bid) bids;
    LoanState state;
    RedeemableTokenLib.Accounting token;
    address borrower;
    uint256 principal;
    bytes terms;
    address attestor;
    uint256 attestorFee;
    uint256 defaultRisk;
    uint256 interestRate;
    bytes32 r;
    bytes32 s;
    uint8 v;
    uint256 auctionEndBlock;
    uint256 reviewPeriodEndBlock;
  }

  function bid(Loan storage self, address tokenRecipient, uint256 minInterestRate)
    assert(isLoanState(self, LoanState.Auction))
    {

    if (msg.value == 0) {
      throw;
    }

    if (self.bids[tokenRecipient].investor != address(0)) {
      throw;
    }

    self.bids[tokenRecipient] = Bid(tokenRecipient, msg.value, minInterestRate);
    self.bidders.push(tokenRecipient);
  }

  function acceptBids(
    Loan storage self,
    bytes32 uuid,
    address[] bidders,
    uint256[] bidAmounts
  ) assert(fromBorrower(self))
    assert(isLoanState(self, LoanState.Review))
  {

    if (bidders.length > MAX_INVESTORS_PER_LOAN ||
          bidAmounts.length > MAX_INVESTORS_PER_LOAN) {
      throw;
    }

    uint256 totalBalanceAccepted = 0;

    for (uint8 i = 0; i < bidders.length; i++) {
      // Subtract the amount accepted by the borrower from the bid amount
      self.bids[bidders[i]].amount =
        self.bids[bidders[i]].amount.sub(bidAmounts[i]);

      // The price of 1 token in Wei is calculated as
      //      (principal + attestorFee) / principal
      // Hence, we calculate the amount of tokens alloted to an investor as
      //      amountInvested / price
      //          = amountInvested * principal / (principal + attestorFee)
      self.token.balances[bidders[i]] =
        bidAmounts[i]
          .mul(self.principal)
          .div(self.principal.add(self.attestorFee));

      totalBalanceAccepted = totalBalanceAccepted.add(bidAmounts[i]);

      if (self.bids[bidders[i]].minInterestRate > self.interestRate)
        self.interestRate = self.bids[bidders[i]].minInterestRate;
    }

    if (totalBalanceAccepted != self.principal + self.attestorFee) {
      throw;
    }

    if (!self.borrower.send(self.principal)) {
      throw;
    }

    if (!self.attestor.send(self.attestorFee)) {
      throw;
    }

    self.state = LoanState.Accepted;

    LoanTermBegin(uuid, self.borrower, block.number);
  }

  function rejectBids(Loan storage self, bytes32 uuid)
    assert(fromBorrower(self))
    assert(isLoanState(self, LoanState.Review))
  {
    self.state = LoanState.Rejected;
    LoanBidsRejected(uuid, self.borrower, block.number);
  }

  function getNumBids(Loan storage self) returns (uint256) {
    return self.bidders.length;
  }

  function getBidByIndex(Loan storage self, uint256 index) returns (address, uint256, uint256) {
    return (
      self.bids[self.bidders[index]].investor,
      self.bids[self.bidders[index]].amount,
      self.bids[self.bidders[index]].minInterestRate
    );
  }

  function getBidByAddress(Loan storage self, address bidder) returns (address, uint256, uint256) {
    return (
      self.bids[bidder].investor,
      self.bids[bidder].amount,
      self.bids[bidder].minInterestRate
    );
  }
  /**
   * @dev If the time lock period has lapsed and the loan is, as of yet,
   *    not fully funded, withdrawInvestment allows investors to withdraw
   *    their deposited ether from the contract.  If the contract is fully
   *    emptied out, the contract self destructs.
   */
  function withdrawInvestment(Loan storage self)
    assert(fromBidder(self))
    assertOr(isLoanState(self, LoanState.Accepted), isLoanState(self, LoanState.Rejected))
  {
    if (self.bids[msg.sender].amount == 0)
      throw;

    uint256 amount = self.bids[msg.sender].amount;
    self.bids[msg.sender].amount = 0;

    if (!msg.sender.send(amount))
      throw;
  }

  /**
   * @dev Method used by borrowers to make repayments to the loan contract
   *  at the end of each of payment period.
   */
  function periodicRepayment(Loan storage self, bytes32 uuid)
    assert(isLoanState(self, LoanState.Accepted))
  {
    if (msg.value == 0)
      throw;

    self.token.totalValueAccrued = self.token.totalValueAccrued.add(msg.value);

    PeriodicRepayment(uuid, msg.sender, msg.value, block.number);
  }

  function getAmountRepaid(Loan storage self) returns (uint256) {
    return self.token.totalValueAccrued;
  }

  /**
   * @dev Overrides the isRedeemable abstract funciton in RedeemableToken
   *   in order to specify that investors can only withdraw the returned
   *    principal + interest once a loan has been fully funded and
   *    the borrower is in the midst of their loan term.
   * @return Whether investors should be allowed to redeem repayments yet.
   */
  function isRedeemable(Loan storage self, address owner) returns (bool redeemable) {
    return (self.token.balanceOf(owner) > 0);
  }

  function getCurrentLoanState(Loan storage self) returns (LoanState) {
    if (self.auctionEndBlock == 0)
      return LoanState.Null;

    if (block.number <= self.auctionEndBlock)
      return LoanState.Auction;

    if (block.number > self.auctionEndBlock) {
      if (self.state != LoanState.Accepted && self.state != LoanState.Rejected) {
        if (block.number <= self.reviewPeriodEndBlock) {
          return LoanState.Review;
        } else {
          return LoanState.Rejected;
        }
      }
    }

    return self.state;
  }

  function updateCurrentLoanState(Loan storage self) {
    self.state = getCurrentLoanState(self);
  }
}
