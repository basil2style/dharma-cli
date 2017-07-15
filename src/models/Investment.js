"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Investment = function () {
  function Investment(loan) {
    _classCallCheck(this, Investment);

    this.loan = loan;
    this.state = null;
    this.investor = null;
    this.bids = [];
    this.events = {};
    this.withdrawn = false;
    this.balance = null;
    this.termBeginDate = null;
  }

  _createClass(Investment, [{
    key: "getState",
    value: function getState() {
      return this.state;
    }
  }, {
    key: "setState",
    value: function setState(state) {
      this.state = state;
    }
  }, {
    key: "getBalance",
    value: function getBalance() {
      return this.balance;
    }
  }, {
    key: "setBalance",
    value: function setBalance(balance) {
      this.balance = balance;
    }
  }, {
    key: "setTermBeginDate",
    value: function setTermBeginDate(date) {
      this.termBeginDate = date;
    }
  }, {
    key: "addBid",
    value: function addBid(bid) {
      this.bids.push(bid);
    }
  }, {
    key: "setInvestor",
    value: function setInvestor(investor) {
      this.investor = investor;
    }
  }, {
    key: "getInvestor",
    value: function getInvestor() {
      return this.investor;
    }
  }, {
    key: "getBids",
    value: function getBids() {
      return this.bids;
    }
  }, {
    key: "addEvent",
    value: function addEvent(eventName, event) {
      this.events[eventName] = event;
    }
  }, {
    key: "getEvent",
    value: function getEvent(eventName) {
      return this.events[eventName];
    }
  }, {
    key: "setWithdrawn",
    value: function setWithdrawn(withdrawn) {
      this.withdrawn = withdrawn;
    }
  }, {
    key: "getWithdrawn",
    value: function getWithdrawn() {
      return this.withdrawn;
    }

    // isDelinquent() {
    //
    // }

  }, {
    key: "toJson",
    value: function toJson() {
      return {
        loan: this.loan.toJson(),
        state: this.state,
        bids: this.bids,
        withdrawn: this.withdrawn,
        balance: this.balance,
        investor: this.investor,
        termBeginDate: this.termBeginDate
      };
    }
  }], [{
    key: "fromJson",
    value: function fromJson(json, dharma) {
      return new Promise(async function (resolve, reject) {
        var loan = await dharma.loans.get(json.loan.uuid);
        var state = await loan.getState();

        var investment = new Investment(loan);
        investment.setState(state);
        json.bids.forEach(function (bid) {
          investment.addBid(bid);
        });

        investment.setWithdrawn(json.withdrawn);
        investment.setBalance(json.balance);
        investment.setInvestor(json.investor);

        resolve(investment);
      });
    }
  }]);

  return Investment;
}();

module.exports = Investment;