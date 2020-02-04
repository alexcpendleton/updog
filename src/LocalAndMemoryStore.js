import { cloneDeep, clone } from "lodash-es";

//import localforage from "localforage";

class LocalAndMemoryStore {
  constructor() {
    this.latestEntriesByDate = null;
    this.allEntries = null;
    this.numberOfDaysInLatest = 30;
    // this.storage = localforage.createInstance({
    //   name: "updog"
    // });
    this.storage = window.localStorage;
  }
  makeDateKey(from) {
    let key = new Date(from);
    key.setHours(0, 0, 0, 0);
    return key.toDateString();
  }
  async getLatestEntriesByDate() {
    console.log(
      "LocalAndMemoryStore.getLatestEntriesByDate",
      this.latestEntriesByDate
    );
    if (this.latestEntriesByDate === null) {
      let s = (await this.storage.getItem("latestEntriesByDate")) || "{}";
      let got = this.parseJson(s);
      this.latestEntriesByDate = got;
    }

    return cloneDeep(this.latestEntriesByDate);
  }

  async getAllEntries() {
    if (this.allEntries === null) {
      let s = (await this.storage.getItem("allEntries")) || "{}";
      let got = this.parseJson(s);
      this.allEntries = got;
    }
    return this.allEntries;
  }

  parseJson(toParse) {
    let dateTimeReviver = function(key, value) {
      var a;
      if (typeof value === "string") {
        a = /\/Date\((\d*)\)\//.exec(value);
        if (a) {
          return new Date(+a[1]);
        }
      }
      return value;
    };
    return JSON.parse(toParse, dateTimeReviver);
  }

  async triggerStorageSync() {
    await this.storage.setItem("allEntries", JSON.stringify(this.allEntries));
    await this.storage.setItem(
      "latestEntriesByDate",
      JSON.stringify(this.latestEntriesByDate)
    );
  }

  async pruneTooOld() {
    let keys = Object.keys(this.getLatestEntriesByDate);
    if (keys.length > this.settings.numberOfDaysInLatest) {
      keys.sort((a, b) => b - a);
      let removed = keys.splice(this.settings.numberOfDaysInLatest);
      console.log(removed);
    }
  }

  async addEntry(source) {
    let entry = cloneDeep(source);
    entry.id = entry.when;
    let dateKey = this.makeDateKey(entry.when);

    if (this.latestEntriesByDate === null) {
      this.latestEntriesByDate = {};
    }
    if (!this.latestEntriesByDate[dateKey]) {
      this.latestEntriesByDate[dateKey] = {
        entries: [],
        dateKey: dateKey,
        date: new Date(dateKey)
      };
    }
    this.latestEntriesByDate[dateKey].entries.unshift(entry);

    if (this.allEntries === null) {
      this.allEntries = {};
    }
    this.allEntries[entry.id] = entry;
    this.triggerStorageSync();
    return entry;
  }
}

export default LocalAndMemoryStore;
