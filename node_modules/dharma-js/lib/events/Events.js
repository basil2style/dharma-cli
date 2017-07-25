import LoanContract from '../contract_wrappers/LoanContract.js';
import AuctionCompleted from './AuctionCompleted.js';
import ReviewPeriodCompleted from './ReviewPeriodCompleted.js';
import EventWrapper from './EventWrapper.js';
import EventQueue from './EventQueue.js';

const EVENTS = {
  created: 'LoanCreated',
  termBegin: 'LoanTermBegin',
  bidsRejected: 'LoanBidsRejected',
  repayment: 'PeriodicRepayment',
  valueRedeemed: 'ValueRedeemed',
  transfer: 'Transfer',
  approval: 'Approval'
}

class Events {
  constructor(web3, defaultOptions) {
    this.web3 = web3;
    this.defaultOptions = defaultOptions || {};
    this.queues = {};

    for (let eventName in EVENTS) {
      this[eventName] = async (filter, additionalFilter, callback) => {
        return await this.getEvent(EVENTS[eventName], filter, additionalFilter, callback);
      }
    }

    this.auctionCompleted = async (callback) => {
      const identifier =
        EventQueue.getIdentifier('AuctionCompleted', defaultOptions, {});

      const event = await AuctionCompleted.create(web3, defaultOptions, callback)

      if (!(identifier in this.queues)) {
        this.queues[identifier]= new EventQueue(identifier, event);
      }

      const queue = this.queues[identifier];
      return new EventWrapper(event, queue, callback);
    }

    this.reviewPeriodCompleted = async (callback) => {
      const identifier =
        EventQueue.getIdentifier('ReviewPeriodCompleted', defaultOptions, {});

      const event = await ReviewPeriodCompleted.create(web3, defaultOptions, callback)

      if (!(identifier in this.queues)) {
        this.queues[identifier]= new EventQueue(identifier, event);
      }

      const queue = this.queues[identifier];
      return new EventWrapper(event, queue, callback);
    }
  }

  async getEvent(eventName, filter, additionalFilter, callback) {
    const contract = await LoanContract.instantiate(this.web3);

    if (arguments.length === 2 && typeof filter === 'function') {
      callback = filter;
      filter = {};
    } else if (arguments.length === 3 && typeof additionalFilter === 'function') {
      callback = additionalFilter;
      additionalFilter = {};
    }

    filter = filter || this.defaultOptions;

    Object.assign(filter, this.defaultOptions);

    const event = contract[eventName](filter, additionalFilter)

    const queueIdentifier = EventQueue.getIdentifier(eventName, filter, additionalFilter);

    if (!(queueIdentifier in this.queues)) {
      this.queues[queueIdentifier] = new EventQueue(queueIdentifier, event);
    }

    const queue = this.queues[queueIdentifier]

    return new EventWrapper(event, queue, callback);
  }
}

module.exports = Events;
