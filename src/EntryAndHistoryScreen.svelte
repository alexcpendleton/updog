<script>
  import SelectableIcon from "./SelectableIcon.svelte";
  import EntryForm from "./EntryForm.svelte";
  import History from "./History.svelte";
  export let data;
  let defaultSelectables;
  let selectables = [];
  let latestEntriesByDate = [];

  let ready = false;

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
    latestArray.reverse();
    latestEntriesByDate = latestArray;
    ready = true;
  }

  function adaptSelectable(i) {
    return Object.assign({}, i, { checked: false });
  }

  async function onEntryAdded(newEntry) {
    await data.addEntry(newEntry);
    await init();
  }
  async function handleDelete(entryToDelete) {
    await data.deleteEntry(entryToDelete);
    await init();
  }
  init();
</script>

<main class="mx-auto " style="max-width:500px;">
  {#if ready}
    <section id="log-form">
      <EntryForm {selectables} {onEntryAdded} />
    </section>
    <section id="history" class=" text-sm text-left ">
      <History {latestEntriesByDate} {defaultSelectables} {handleDelete} />
    </section>
    <section id="icon-attribution" class="text-xs">
      Icons made by
      <a href="https://www.flaticon.com/authors/freepik" title="Freepik">
        Freepik
      </a>
      from
      <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
    </section>
  {/if}
</main>
