<script>
  import SelectableIcon from "./SelectableIcon.svelte";
  export let selectables = [];
  export let note = "";
  export let onEntryAdded = function() {};

  export function resetForm() {
    note = "";
    // todo: this doesn't seem to be resetting the checked status in the form...
    selectables = selectables.map(i =>
      Object.assign({}, i, { checked: false })
    );
  }

  async function handleSave(event) {
    console.log("handleSave", arguments);
    event.preventDefault();
    event.stopImmediatePropagation();

    var newEntry = {};
    newEntry.id = new Date(); // todo make this a real id?
    let checked = selectables.filter(i => i.checked);
    if (checked && checked.length > 0) {
      let chosen = [];
      for (let i = 0; i < checked.length; i++) {
        let keyVersion = {};
        keyVersion.key = checked[i].key;
        chosen.push(keyVersion);
      }
      newEntry.selectables = chosen;
    } else {
      newEntry.selectables = [];
    }
    newEntry.note = note;
    // todo put this in the form?
    newEntry.when = new Date();

    if (newEntry.selectables.count === 0 && note.length === 0) {
      // don't save an empty entry
      return;
    }

    onEntryAdded(newEntry);
    resetForm();
  }
</script>

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
      class="bg-purple-600 hover:bg-purple-400 text-white font-bold py-1 px-4
      rounded my-2">
      save
    </button>
  </div>
</form>
