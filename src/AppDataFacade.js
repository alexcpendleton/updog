import EventEmitter from "events";

class AppDataFacade {
  constructor({ store, authHandler }) {
    this.latestEntriesByDate = null;
    this.allEntries = null;
    this.numberOfDaysInLatest = 30;
    this.store = store;
    this.authHandler = authHandler;
    this.replicator = null;
    this.handleLoggedIn = this.handleLoggedIn.bind(this);
    this.handleLoggedOut = this.handleLoggedOut.bind(this);
    this.init = this.init.bind(this);
    this.emitter = new EventEmitter();
  }
  async init() {
    await this.store.init();
    if (this.authHandler) {
      this.authHandler.emitter.on("isloggedin", this.handleLoggedIn);
      this.authHandler.emitter.on("isloggedout", this.handleLoggedOut);
    }
  }
  async handleLoggedIn() {
    this.runReplication();
  }
  async runReplication() {
    if (!this.authHandler.isLoggedIn()) {
      return false;
    }
    const user = {
      userId: this.authHandler.userId,
      idToken: this.authHandler.idToken
    };
    await this.store.runReplication(user);
  }
  async handleLoggedOut(user) {}
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
    this.runReplication();
    return entry;
  }

  async deleteEntry(entryToDelete) {
    await this.store.deleteEntry(entryToDelete);
    this.runReplication();
  }
  async dump() {
    return this.store.dump();
  }
}

export default AppDataFacade;
