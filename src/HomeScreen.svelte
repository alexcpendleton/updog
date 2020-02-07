<script>
  import SelectableIcon from "./SelectableIcon.svelte";
  import EntryForm from "./EntryForm.svelte";
  import History from "./History.svelte";

  export let defaultSelectables;
  export let latestEntriesByDate = [];
  export let selectables = [];

  export let onEntryAdded;
</script>

<main class="mx-auto" style="width:280px">
  <section id="log-form">
    <EntryForm {selectables} {onEntryAdded} />
  </section>
  <section id="history" class=" text-sm text-left ">
    <History {latestEntriesByDate} {defaultSelectables} />
  </section>
  <section id="icon-attribution" class="text-xs">
    Icons made by
    <a href="https://www.flaticon.com/authors/freepik" title="Freepik">
      Freepik
    </a>
    from
    <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
  </section>
</main>
