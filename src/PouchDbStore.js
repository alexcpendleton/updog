import PouchDB from "pouchdb-browser";
import EventEmitter from "events";
class PouchDbStore {
  constructor({ options = {} }) {
    this.dbs = {
      local: new PouchDB("updog"),
      remote: null
    };
    this.settings = Object.assign(
      {},
      {
        latestNumberOfDays: 30
      },
      options
    );
    this.emitter = new EventEmitter();
    this.syncCompleteEvent = "sync.complete";
    this.registerSync();
  }
  on(event, listener) {
    this.emitter.on(event, listener);
  }

  handleSyncComplete(info) {
    console.log("handleSyncComplete", info);
    this.emitter.emit(this.syncCompleteEvent, {
      info
    });
  }
  registerSync() {
    if (!this.settings.sync || !this.settings.sync.uri) {
      return;
    }
    this.dbs.remote = new PouchDB(this.settings.sync.uri);
    this.dbs.sync = PouchDB.sync(this.dbs.local, this.dbs.remote, {
      live: false,
      retry: false,
      ajax: { withCredentials: false }
    }).on("complete", this.handleSyncComplete);
  }
  async getLatestEntriesByDate() {
    let everything = await this.dbs.local.allDocs({ include_docs: true });
    // todo: have this query using a lib once performance is an issue
    let max = new Date();
    let min = new Date(max.getDate() - this.settings.latestNumberOfDays);
    let filtered = everything.rows.reduce(
      (accumulator, current, idx, calledUpon) => {
        let doc = Object.assign({}, current.doc);
        // Gets stored as a string for whatever reason
        doc.when = new Date(doc.when);
        if (doc.when > min) {
          accumulator.push(doc);
        }
        return accumulator;
      },
      []
    );
    let output = {};
    filtered.sort((a, b) => a.when - b.when);
    for (let i = 0; i < filtered.length; i++) {
      this.insertIntoDateContainer(filtered[i], output);
    }
    return output;
  }

  async addEntry(toCreate) {
    let record = await this.dbs.local.post(toCreate);
    let id = record.id;
    let actual = await this.dbs.local.get(id);
    return actual;
  }

  makeDateKey(from) {
    let key = new Date(from);
    key.setHours(0, 0, 0, 0);
    return key.toDateString();
  }
  insertIntoDateContainer(entry, into) {
    let dateKey = entry.dateKey || this.makeDateKey(entry.when);

    if (!into[dateKey]) {
      into[dateKey] = {
        entries: [],
        dateKey: dateKey,
        date: new Date(dateKey)
      };
    }
    into[dateKey].entries.unshift(entry);
  }

  async getAllEntries() {
    let everything = await this.dbs.local.allDocs();
    return everything;
  }
  async deleteEntry(entryToDelete) {
    return this.dbs.local.remove(entryToDelete);
  }
}

export default PouchDbStore;
