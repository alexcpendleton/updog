<script>
  import AppDataFacade from "./AppDataFacade.js";
  import EntriesByDate from "./EntriesByDate.svelte";
  import SelectableIcon from "./SelectableIcon.svelte";
  let data = new AppDataFacade();
  function adaptSelectable(i) {
    return Object.assign({}, i, { checked: false });
  }

  let defaultSelectables;
  export let selectables = [];
  export let note = "";
  export let latestEntriesByDate = [];

  async function init() {
    // copy the source data version, slap on a "checked attribute" for the view
    // keep those clean and make a copy for working data
    defaultSelectables = (await data.getSelectables()).map(adaptSelectable);

    selectables = defaultSelectables.map(adaptSelectable);
    let latestAsObj = await data.getLatestEntriesByDate();
    let latestArray = [];
    // transform the object into an array, then maybe sort it?
    for (let key in latestAsObj) {
      latestArray.push(latestAsObj[key]);
    }
    latestEntriesByDate = latestArray;
    console.log("init.latestEntriesByDate", latestEntriesByDate);
  }

  export async function resetForm() {
    note = "";
    // todo: this doesn't seem to be resetting the checked status in the form...
    selectables = defaultSelectables.map(Object.assign);
  }

  export async function handleSave(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    var newEntry = {};
    newEntry.id = new Date(); // todo make this a real id?
    newEntry.selectables = selectables
      .filter(i => i.checked)
      .map(i => {
        i.key;
      });
    newEntry.note = note;
    // todo put this in the form?
    newEntry.when = new Date();

    data.addEntry(newEntry);
    onEntryAdded(newEntry);
    resetForm();
  }

  async function onEntryAdded(entry) {
    await init();
  }

  init();
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  <section id="log-form">
    <form name="updog" method="post">
      <div class="selectables">
        {#each selectables as item (item.key)}
          <label class="selectable-target">
            <input
              type="checkbox"
              name={item.key}
              id={item.key}
              bind:checked={item.checked} />
            <SelectableIcon selectable={item} />
          </label>
        {/each}
      </div>

      <label class="note">
        Note:
        <textarea id="note" name="note" bind:value={note} />
      </label>
      <div>
        <button type="button" on:click={handleSave}>save</button>
      </div>
    </form>
  </section>
  <section id="history">
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
