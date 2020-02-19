import PouchDB from "pouchdb-browser";

class PouchDbSettingsProvider {
  constructor() {
    this.dbs = {
      local: new PouchDB("settings")
    };
  }
  async getAll() {
    let everything = await this.dbs.local.allDocs({ include_docs: true });
    return everything;
  }
  async put(key, value) {
    return await this.dbs.local.put({
      _id: key,
      value
    });
  }
  async getOne(key) {
    return this.dbs.local.get(key);
  }
}
