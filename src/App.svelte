<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import AppDataFacade from "./AppDataFacade.js";
  import FlatpickrCss from "./FlatpickrCss.svelte";
  import FlatpickrThemeCss from "./FlatpickrThemeCss.svelte";

  import SettingsScreen from "./SettingsScreen.svelte";
  import EntryAndHistoryScreen from "./EntryAndHistoryScreen.svelte";

  //import PouchDbStore from "./PouchDbStore.js";
  import RxDBStore from "./RxDBStore.js";

  let data = new AppDataFacade({ store: new RxDBStore() });

  let ready = false;
  async function init() {
    await data.init();
    ready = true;
  }

  export let pageName = "";
  init();
</script>

<style type="text/css">

</style>

<Tailwindcss />
<FlatpickrCss />
<FlatpickrThemeCss />
<div>
  {#if ready}
    {#if pageName == 'settings'}
      <SettingsScreen {data} />
    {:else}
      <EntryAndHistoryScreen {data} />
    {/if}
  {/if}

</div>
