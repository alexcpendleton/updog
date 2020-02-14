<script>
  import SelectableIcon from "./SelectableIcon.svelte";
  import EntriesByDate from "./EntriesByDate.svelte";
  export let latestEntriesByDate = [];
  export let defaultSelectables = {};
  export let handleDelete = function() {};
</script>

<ol>
  {#each latestEntriesByDate as group (group.dateKey)}
    <li>
      <EntriesByDate
        entries={group.entries}
        date={group.date}
        selectableMap={defaultSelectables}
        {handleDelete} />
    </li>
  {/each}
</ol>
