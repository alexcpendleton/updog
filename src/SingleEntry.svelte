<script>
  import SingleEntry from "./SingleEntry.svelte";
  import SelectableIcon from "./SelectableIcon.svelte";
  export let entry;
  export let selectableMap;

  function getSelectableFromMap(keyed) {
    return selectableMap.find(i => i.key == keyed.key);
  }

  function toTime() {
    return new Intl.DateTimeFormat("default", {
      hour12: true,
      hour: "numeric",
      minute: "numeric"
    }).format(entry.when);
  }
  // entry.selectables will only have the keys, but we want the whole meta
  // so we can display the object. Look in our map for the ones with matching keys
  export let usedSelectables = entry.selectables.map(getSelectableFromMap);
  export let note = entry.note;
  export let time = toTime();
</script>

<div class="single-entry">
  <strong class="time">{time}</strong>
  {#if usedSelectables}
    <ul class="selectables-used">
      {#each usedSelectables as item (item.key)}
        <li>
          <SelectableIcon selectable={item} />
        </li>
      {/each}
    </ul>
  {/if}
  {#if note}
    <span class="note">{note}</span>
  {/if}
</div>
