<script>
  import SelectableIcon from "./SelectableIcon.svelte";
  import EntriesByDate from "./EntriesByDate.svelte";
  export let latestEntriesByDate = [];
  export let defaultSelectables = {};
</script>

<ol>
  {#each latestEntriesByDate as group (group.dateKey)}
    <li>
      <EntriesByDate
        entries={group.entries}
        date={group.date}
        selectableMap={defaultSelectables} />
    </li>
  {/each}
</ol>
