import { plugin, create, removeDatabase } from "rxdb";
import idb from "pouchdb-adapter-idb";
import GraphQLReplicator from "./GraphQLReplicator.js";
import httpadapter from "pouchdb-adapter-http";
import PouchDB from "pouchdb-browser";

plugin(idb);

const entrySchema = {
  title: "entry schema",
  version: 0,
  description: "describes a simple entry",
  type: "object",
  additionalProperties: true,
  properties: {
    id: {
      type: "string",
      primary: true
    },
    note: {
      type: "string"
    },
    when: {
      type: "string"
    },
    userId: {
      type: "string"
    },
    isDeleted: {
      type: "boolean",
      default: false
    },
    selectables: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: {
            type: "string"
          }
        },
        additionalProperties: true
      }
    }
  }
};
class RxDBStore {
  constructor() {
    this.dbs = { local: {} };
    this.settings = {
      latestNumberOfDays: 30
    };
    this.replicator = new GraphQLReplicator();
  }
  async init() {
    //await removeDatabase("updogrx", "idb");

    this.dbs.local = await create({ name: "updogrx", adapter: "idb" });
    await this.dbs.local.collection({
      name: "entries",
      schema: entrySchema
    });
  }
  rxRowToNice(rxrow) {
    var nice = {}; // rxrow.get();
    nice.selectables = rxrow.get("selectables");
    nice.id = rxrow.get("id");
    nice.note = rxrow.get("note");
    nice.when = rxrow.get("when");
    return nice;
  }
  async getLatestEntriesByDate() {
    let everything = await this.dbs.local.entries
      .find()
      // .where("isDeleted")
      // .eq(false)
      .exec();
    // todo: have this query using a lib once performance is an issue
    let max = new Date();
    let min = new Date(max.getDate() - this.settings.latestNumberOfDays);

    let filtered = everything.reduce(
      (accumulator, current, idx, calledUpon) => {
        var doc = this.rxRowToNice(current);
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

  b(a) {
    return a
      ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
      : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, this.b);
  }
  async addEntry(toCreate) {
    let id = toCreate.id;
    if (!id) {
      id = this.b();
    }
    var forDB = {
      id: id,
      note: toCreate.note || ""
    };
    if (toCreate.when.toISOString) {
      forDB.when = toCreate.when.toISOString();
    } else {
      forDB.when = toCreate.when;
    }
    forDB.selectables = toCreate.selectables;

    await this.dbs.local.entries.insert(forDB);
    let actual = await this.dbs.local.entries
      .findOne()
      .where("id")
      .eq(id)
      .exec();
    let nice = this.rxRowToNice(actual);
    return nice;
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

  // async getAllEntries() {
  //   let everything = await this.dbs.local.allDocs({ include_docs: true });
  //   return everything;
  // }
  async deleteEntry(entryToDelete) {
    return this.dbs.local.entries.find(entryToDelete.id).update({
      isDeleted: true
    });
  }
  // async dump() {
  //   let everything = await this.dbs.local.allDocs({ include_docs: true });
  //   return JSON.stringify(everything);
  // }
  async initReplication(auth) {
    if (!auth) {
      console.log("No auth detected, no replication will occur.");
      return;
    }
    await this.replicator.setupGraphQLReplication(auth);
  }
}

export default RxDBStore;
