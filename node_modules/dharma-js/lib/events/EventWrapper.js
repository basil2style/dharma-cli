import uuidV4 from 'uuid';

class EventWrapper {
  constructor(event, queue, callback) {
    this.event = event;
    this.id = uuidV4();
    this.queue = queue;

    if (callback) {
      this.watch(callback);
    }
  }

  watch(callback) {
    this.queue.enqueue(this.id, callback);
  }

  get(callback) {
    this.event.get(callback);
  }

  stopWatching(callback) {
    this.queue.remove(this.id, callback);
  }
}

module.exports = EventWrapper;
