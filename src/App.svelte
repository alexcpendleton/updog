<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import AppDataFacade from "./AppDataFacade.js";
  import FlatpickrCss from "./FlatpickrCss.svelte";
  import FlatpickrThemeCss from "./FlatpickrThemeCss.svelte";

  import SettingsScreen from "./SettingsScreen.svelte";
  import EntryAndHistoryScreen from "./EntryAndHistoryScreen.svelte";

  import PouchDbStore from "./PouchDbStore.js";
  let settings = {
    // sync: {
    //   uri: "http://localhost:6942/db"
    // }
  };
  let data = new AppDataFacade({
    store: new PouchDbStore({
      options: settings
    })
  });

  export let pageName = "";
</script>

<style type="text/css">

</style>

<Tailwindcss />
<FlatpickrCss />
<FlatpickrThemeCss />
{#if pageName == 'settings'}
  <SettingsScreen {data} />
{:else}
  <EntryAndHistoryScreen {data} />
{/if}
