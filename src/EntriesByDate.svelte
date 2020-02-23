<script>
  import SingleEntry from "./SingleEntry.svelte";
  //export let group = {};
  export let selectableMap = {};

  let headerText = "";
  export let entries = [];
  export let date;
  export let handleDelete = function() {};

  if (!date.getFullYear) {
    date = new Date(date);
  }

  if (date && !headerText) {
    headerText = `${date.getFullYear()}-${date.getMonth() +
      1}-${date.getDate()}`;
  }
  function css(i) {
    let bg = "";
    if (i % 2 == 0) {
      bg = "bg-gray-700";
    }
    return `px-1 py-1 ${bg}`;
  }
</script>

<div class="mb-2 text-xs">
  <strong class="underline px-1">{headerText}</strong>
  <ol>
    {#each entries as entry, i (entry.id)}
      <li class={css(i)}>
        <SingleEntry {entry} {selectableMap} {handleDelete} />
      </li>
    {/each}
  </ol>
</div>
