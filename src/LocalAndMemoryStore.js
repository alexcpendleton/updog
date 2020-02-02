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
    debugger;
    if (this.latestEntriesByDate === null) {
      let s = (await this.storage.getItem("latestEntriesByDate")) || "{}";
      let got = JSON.parse(s);
      this.latestEntriesByDate = got;
    }

    return this.latestEntriesByDate;
  }

  async getAllEntries() {
    if (this.allEntries === null) {
      let s = (await this.storage.getItem("allEntries")) || "{}";
      let got = JSON.parse(s);
      this.allEntries = got;
    }
    return this.allEntries;
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

  async addEntry(entry) {
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
  }
}

export default LocalAndMemoryStore;
