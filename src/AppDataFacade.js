class AppDataFacade {
  constructor({ store }) {
    this.latestEntriesByDate = null;
    this.allEntries = null;
    this.numberOfDaysInLatest = 30;
    this.store = store;
  }
  async getSelectables() {
    return [
      {
        key: "poop",
        icon: "💩",
        humanDescription: "poop",
        type: "checkbox"
      },
      {
        key: "pee",
        icon: "💧",
        humanDescription: "pee",
        type: "checkbox"
      },
      {
        key: "fed",
        icon: "🍽️",
        humanDescription: "fed",
        type: "checkbox"
      },
      {
        key: "meds",
        icon: "💊",
        humanDescription: "gave medication",
        type: "checkbox"
      },
      {
        key: "flag",
        icon: "🚩",
        humanDescription: "flag",
        type: "checkbox"
      }
    ];
  }
  makeDateKey(from) {
    let key = new Date(from);
    key.setHours(0, 0, 0, 0);
    return key.toDateString();
  }
  async getLatestEntriesByDate() {
    return this.store.getLatestEntriesByDate();
  }

  async getAllEntries() {
    return this.store.getAllEntries();
  }

  async addEntry(toCreate) {
    let dateKey = this.makeDateKey(toCreate.when);

    let entry = this.store.addEntry(toCreate);

    return entry;
    // if (this.latestEntriesByDate === null) {
    //   this.latestEntriesByDate = {};
    // }
    // if (!this.latestEntriesByDate[dateKey]) {
    //   this.latestEntriesByDate[dateKey] = {
    //     entries: [],
    //     dateKey: dateKey,
    //     date: new Date(dateKey)
    //   };
    // }
    // this.latestEntriesByDate[dateKey].entries.unshift(entry);

    // if (this.allEntries === null) {
    //   this.allEntries = {};
    // }
    // this.allEntries[entry.id] = entry;
  }
}

export default AppDataFacade;
