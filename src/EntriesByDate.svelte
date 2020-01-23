<script>
  import SingleEntry from "./SingleEntry.svelte";
  //export let group = {};
  export let selectableMap = {};

  export let headerText = "";
  export let entries = [];
  export let date;

  if (date && !headerText) {
    headerText = `${date.getFullYear()}-${date.getMonth() +
      1}-${date.getDay()}`;
  }
  export function css(i) {
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
        <SingleEntry {entry} {selectableMap} />
      </li>
    {/each}
  </ol>
</div>
