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
    event.preventDefault();
    event.stopImmediatePropagation();

    var newEntry = {};

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

    resetForm();
    await onEntryAdded(newEntry);
  }
  function amendCss(item, i) {
    let corner = "";
    if (i === 0) {
      corner = "rounded-l";
    } else if (i === selectables.length - 1) {
      corner = "rounded-r";
    } else {
      corner = " border-l-0 ";
    }
    let checked = "";
    if (item.checked) {
      checked = " bg-purple-500 ";
    }
    return `${corner} ${checked}`;
  }
  function inlineStyle(item, i) {
    return "width: 50px; height: 50px; line-height: 42px;";
  }
  function svgStyle(item, i) {
    if (item.checked) {
      return "position:absolute; bottom:1px; right:1px; width:12px; height:12px;";
    }
    return "display:none";
  }
</script>

<form name="updog" method="post">
  <div class="selectables inline-flex my-2">
    {#each selectables as item, i (item.key)}
      <label
        class="cursor-pointer text-center inline-block text-2xl px-2
        hover:bg-purple-500 border border-purple-400 relative {amendCss(item, i)}"
        style={inlineStyle(item, i)}>
        <SelectableIcon selectable={item} />
        <div class="text-center hidden">
          <input
            type="checkbox"
            name={item.key}
            id={item.key}
            bind:checked={item.checked} />
        </div>
        <svg
          style={svgStyle(item, i)}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="text-purple-900 fill-current opacity-75">
          <path
            d="M21.856 10.303c.086.554.144 1.118.144 1.697 0 6.075-4.925 11-11
            11s-11-4.925-11-11 4.925-11 11-11c2.347 0 4.518.741 6.304
            1.993l-1.422 1.457c-1.408-.913-3.082-1.45-4.882-1.45-4.962 0-9
            4.038-9 9s4.038 9 9 9c4.894 0 8.879-3.928
            8.99-8.795l1.866-1.902zm-.952-8.136l-9.404 9.639-3.843-3.614-3.095
            3.098 6.938 6.71 12.5-12.737-3.096-3.096z" />
        </svg>
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
