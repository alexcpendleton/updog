<script>
  import Tailwindcss from "./Tailwindcss.svelte";
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

<style type="text/css">

</style>

<Tailwindcss />
<main
  class="bg-gray-800 text-white text-center mx-auto py-2"
  style="width:280px">
  <section id="log-form">
    <form name="updog" method="post">
      <div class="selectables">
        {#each selectables as item (item.key)}
          <label class="cursor-pointer text-center inline-block text-2xl px-2">
            <SelectableIcon selectable={item} />
            <div class="text-center">
              <input
                type="checkbox"
                name={item.key}
                id={item.key}
                bind:checked={item.checked} />
            </div>
          </label>
        {/each}
      </div>

      <label class="note">
        <span class="hidden">Note:</span>
        <textarea
          id="note"
          name="note"
          bind:value={note}
          placeholder="enter a note, if you want"
          class="text-gray-800 px-2 text-sm" />
      </label>
      <div>
        <button
          type="button"
          on:click={handleSave}
          class="bg-purple-600 hover:bg-purple-400 text-white font-bold py-1
          px-4 rounded my-2">
          save
        </button>
      </div>
    </form>
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
