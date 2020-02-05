import PouchDB from "pouchdb-browser";

class PouchDbStore {
  constructor() {
    this.dbs = {
      local: new PouchDB("updog")
    };
    this.settings = {
      latestNumberOfDays: 30
    };
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
}

export default PouchDbStore;
