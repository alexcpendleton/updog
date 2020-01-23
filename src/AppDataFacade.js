class AppDataFacade {
  constructor() {
    this.latestEntriesByDate = null;
    this.allEntries = null;
    this.numberOfDaysInLatest = 30;
    
    this.initData();
  }
  initData() {
    this.addEntry({
      id: 1000,
      selectables: [
        {key:"poop"},
        {key:"pee"},
      ],
      when: new Date("2020-01-22T02:00:00")
    })
    this.addEntry({
      id: 1001,
      selectables: [
        {key:"pee"},
        {key:"fed"},
        {key:"meds"},
      ],
      when: new Date("2020-01-22T04:00:00")
    })
    this.addEntry({
      id: 1003,
      selectables: [
        {key:"pee"},
      ],
      note:"peed a few times",
      when: new Date("2020-01-22T06:00:00")
    })
    this.addEntry({
      id: 1004,
      selectables: [],
      note: "was playful",
      when: new Date("2020-01-21T06:00:00")
    })
    this.addEntry({
      id: 1005,
      selectables: [
        {key:"flag"},
      ],
      note:"this one is old",
      when: new Date("2019-01-21T06:00:00")
    })
    this.addEntry({
      id: 1006,
      selectables: [
        {key:"pee"},
        {key:"flag"},
      ],
      note:"xmas",
      when: new Date("2019-12-25T14:00:00")
    })
    console.log(this);
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
    return new Date(from.getFullYear(), from.getMonth(), from.getDay());
  }
  async getLatestEntriesByDate() {
    if(this.latestEntriesByDate === null) {
      this.latestEntriesByDate = {
      };
      // fetch from data store
    }
    
    return this.latestEntriesByDate;
  }

  async getAllEntries() {
    if(this.allEntries === null) {
      this.allEntries = {}; // fetch from data store
    }
    return this.allEntries;
  }

  async addEntry(entry) {
    let dateKey = this.makeDateKey(entry.when);

    if(this.latestEntriesByDate === null) {
      this.latestEntriesByDate = {};
    }
    if(!this.latestEntriesByDate[dateKey]) {
      this.latestEntriesByDate[dateKey] = {
        entries:[],
        dateKey:dateKey,
        date:new Date(dateKey)
      }
    }
    this.latestEntriesByDate[dateKey].entries.unshift(entry);

    if(this.allEntries === null) {
      this.allEntries = {};
    }
    this.allEntries[entry.id] = entry;
  }
}

export default AppDataFacade;
