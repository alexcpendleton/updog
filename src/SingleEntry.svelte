<script>
  import SelectableIcon from "./SelectableIcon.svelte";
  export let entry;
  export let selectableMap;
  export let canDelete = true;
  export let handleDelete = function() {};
  export let shouldConfirmDelete = true;
  export let confirmDeleteMessage = "Do you really want to delete this?";

  function getSelectableFromMap(keyed) {
    return selectableMap.find(i => i.key == keyed.key);
  }

  function toTime() {
    let when = entry.when;

    if (!when.getFullYear) {
      when = new Date(when);
    }
    return new Intl.DateTimeFormat("default", {
      hour12: true,
      hour: "numeric",
      minute: "numeric"
    }).format(when);
  }
  // entry.selectables will only have the keys, but we want the whole meta
  // so we can display the object. Look in our map for the ones with matching keys
  export let usedSelectables = entry.selectables.map(getSelectableFromMap);
  export let note = entry.note;
  export let time = toTime();

  function triggerDelete() {
    if (shouldConfirmDelete && confirm(confirmDeleteMessage)) {
      if (handleDelete) {
        handleDelete(entry);
      }
    }
  }
</script>

<div
  class="single-entry text-xs flex flex-no-wrap items-stretch content-center">
  <div class="entry-details">
    <strong class="time inline">{time}</strong>
    {#if usedSelectables}
      <ul class="inline">
        {#each usedSelectables as item (item.key)}
          <li class="inline">
            <SelectableIcon selectable={item} />
          </li>
        {/each}
      </ul>
    {/if}
    {#if note}
      <span class="note">{note}</span>
    {/if}
  </div>
  {#if canDelete}
    <div class="entry-controls flex-inital">
      <button
        type="button"
        class="pointer h-full px-1"
        on:click={triggerDelete}>
        <span class="" aria-hidden="true">🗑️</span>
        <span class="visually-hidden">Delete</span>
      </button>
    </div>
  {/if}
</div>
