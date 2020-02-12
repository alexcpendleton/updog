<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import AppDataFacade from "./AppDataFacade.js";
  import SelectableIcon from "./SelectableIcon.svelte";
  import EntryForm from "./EntryForm.svelte";
  import History from "./History.svelte";
  import HomeScreen from "./HomeScreen.svelte";
  import FlatpickrCss from "./FlatpickrCss.svelte";
  import FlatpickrThemeCss from "./FlatpickrThemeCss.svelte";

  import PouchDbStore from "./PouchDbStore.js";
  let data = new AppDataFacade({ store: new PouchDbStore() });

  // import LocalAndMemoryStore from "./LocalAndMemoryStore.js";
  // let data = new AppDataFacade({ store: new LocalAndMemoryStore() });

  function adaptSelectable(i) {
    return Object.assign({}, i, { checked: false });
  }

  let pleaseRerender = new Date().toUTCString();
  let defaultSelectables;
  let selectables = [];
  let latestEntriesByDate = [];

  async function init() {
    // copy the source data version, slap on a "checked attribute" for the view
    // keep those clean and make a copy for working data
    if (!defaultSelectables || defaultSelectables.length === 0) {
      defaultSelectables = (await data.getSelectables()).map(adaptSelectable);
    }

    if (!selectables || selectables.length === 0) {
      selectables = defaultSelectables.map(adaptSelectable);
    }

    let latestAsObj = await data.getLatestEntriesByDate();
    let latestArray = [];
    // transform the object into an array, then maybe sort it?
    for (let key in latestAsObj) {
      latestAsObj[key].change = new Date();
      latestArray.push(latestAsObj[key]);
    }
    latestArray.sort((a, b) => a.date - b.date);
    latestEntriesByDate = latestArray;
    pleaseRerender = new Date().toUTCString();
  }

  async function onEntryAdded(newEntry) {
    await data.addEntry(newEntry);
    await init();
  }
  init();
</script>

<style type="text/css">

</style>

<Tailwindcss />
<FlatpickrCss />
<FlatpickrThemeCss />
<HomeScreen
  {defaultSelectables}
  {selectables}
  {latestEntriesByDate}
  {pleaseRerender}
  {onEntryAdded} />
