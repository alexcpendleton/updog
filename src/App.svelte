<script>
  import AppDataFacade from "./AppDataFacade.js";
  import AuthHandler from "./AuthHandler.js";

  import Tailwindcss from "./Tailwindcss.svelte";
  import FlatpickrCss from "./FlatpickrCss.svelte";
  import FlatpickrThemeCss from "./FlatpickrThemeCss.svelte";

  import SettingsScreen from "./SettingsScreen.svelte";
  import EntryAndHistoryScreen from "./EntryAndHistoryScreen.svelte";
  import AuthPrompt from "./AuthPrompt.svelte";

  //import PouchDbStore from "./PouchDbStore.js";
  import RxDBStore from "./RxDBStore.js";

  let authHandler = new AuthHandler();
  let data = new AppDataFacade({ store: new RxDBStore(), authHandler });

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
