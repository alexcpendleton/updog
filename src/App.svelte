<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import AppDataFacade from "./AppDataFacade.js";
  import EntriesByDate from "./EntriesByDate.svelte";
  import SelectableIcon from "./SelectableIcon.svelte";
  import EntryForm from "./EntryForm.svelte";
  //import PouchDbStore from "./PouchDbStore.js";
  import LocalAndMemoryStore from "./LocalAndMemoryStore.js";
  
  let data = new AppDataFacade({ store: new LocalAndMemoryStore() });
  function adaptSelectable(i) {
    return Object.assign({}, i, { checked: false });
  }

  let defaultSelectables;
  let selectables = [];
  export let latestEntriesByDate = [];

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
      latestArray.push(latestAsObj[key]);
    }
    latestArray.sort((a, b) => b.date - a.date);
    latestEntriesByDate = latestArray;
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
<main class="mx-auto" style="width:280px">
  <section id="log-form">
    <EntryForm {selectables} {onEntryAdded} />
  </section>
  <section id="history" class=" text-sm text-left ">
    <ol>
      {#each latestEntriesByDate as group (group.id)}
        <li>
          <EntriesByDate
            entries={group.entries}
            date={group.date}
            selectableMap={defaultSelectables} />
        </li>
      {/each}
    </ol>
  </section>
</main>
