// import PouchDB from "pouchdb-browser";

// class PouchDbStore {
//   constructor() {
//     this.dbs = {
//       local: {} // new PouchDB("updog")
//     };
//     this.settings = {
//       latestNumberOfDays: 30
//     };
//   }
//   async getLatestEntriesByDate() {
//     let everything = await this.dbs.local.get();
//     // todo: have this query using a lib once performance is an issue
//     let max = new Date();
//     let min = new Date(max.getDate() - this.settings.latestNumberOfDays);
//     let filtered = everything.filter(i => i.date >= min);
//     let output = {};
//     for (let i = 0; i < filtered.length; i++) {
//       this.insertIntoDateContainer(filtered[i], output);
//     }
//     return output;
//   }

//   async addEntry(toCreate) {
//     let entry = await this.dbs.local.put(toCreate);
//     return entry;
//   }

//   insertIntoDateContainer(entry, into) {
//     let dateKey =
//       this.injectEntryInto.dateKey || this.makeDateKey(injectEntryInto.when);

//     if (!into[dateKey]) {
//       into[dateKey] = {
//         entries: [],
//         dateKey: dateKey,
//         date: new Date(dateKey)
//       };
//     }
//     into[dateKey].entries.unshift(entry);
//   }

//   async getAllEntries() {
//     let everything = await this.dbs.local.get();
//     return everything;
//   }
// }

// export default PouchDbStore;
