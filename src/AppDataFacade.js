class AppDataFacade {
  constructor({ store }) {
    this.latestEntriesByDate = null;
    this.allEntries = null;
    this.numberOfDaysInLatest = 30;
    this.store = store;
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
  async getAuth() {
    // todo: make this better once auth0 is set up
    function b(a) {
      return a
        ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
        : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
    }
    let userId = localStorage.getItem("__manual_user_id") || "";
    if (userId === "") {
      userId = b();
      localStorage.setItem("__manual_user_id", userId);
    }
    return {
      userId,
      idToken: ""
    };
  }
}

export default AppDataFacade;
