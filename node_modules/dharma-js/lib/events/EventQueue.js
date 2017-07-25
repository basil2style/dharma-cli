import _ from 'lodash';
import stringify from 'json-stable-stringify';

class EventQueue {
  constructor(identifier, event) {
    this.identifier = identifier;
    this.event = event;
    this.queue = [];
    this.callbacks = {};
    this.length = 0;
    this.watching = false;

    this.execute = this.execute.bind(this);
  }

  enqueue(id, callback) {
    this.callbacks[id] = callback;
    this.queue.push(id);
    this.length += 1;

    if (!this.watching) {
      this.event.watch(this.execute)
      this.watching = true;
    }
  }


  remove(id, callback) {
    // console.log("trying to stop " + this.identifier);

    delete this.callbacks[id]
    this.queue = _.remove(this.queue, (_id) => {
      return id == _id;
    })

    this.length -= 1;

    if (this.length == 0 && this.watching) {
      // console.log("actually stopped " + this.identifier);
      this.event.stopWatching(callback);
    } else {
      if (callback)
        callback();
    }
  }

  async execute(err, result) {
    const executionQueue = _.clone(this.queue)
    for (let i = 0; i < executionQueue.length; i++) {
      const id = executionQueue[i];
      const callback = this.callbacks[id];
      await callback(err, result);
    }
  }

  static getIdentifier(eventName, filter, additionalFilter) {
    return eventName + stringify(filter) + stringify(additionalFilter);
  }
}

module.exports = EventQueue;
