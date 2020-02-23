class AppDataFacade {
  constructor({ store, authHandler }) {
    this.latestEntriesByDate = null;
    this.allEntries = null;
    this.numberOfDaysInLatest = 30;
    this.store = store;
    this.authHandler = authHandler;
  }
  async init() {
    await this.store.init();
  }
  async initReplication() {
    const auth = this.getAuth();
    await this.store.initReplication(auth);
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
  }

  async deleteEntry(entryToDelete) {
    return this.store.deleteEntry(entryToDelete);
  }
  async dump() {
    return this.store.dump();
  }
}

export default AppDataFacade;
