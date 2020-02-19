<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import AppDataFacade from "./AppDataFacade.js";
  import SelectableIcon from "./SelectableIcon.svelte";
  import EntryForm from "./EntryForm.svelte";
  import History from "./History.svelte";
  import HomeScreen from "./HomeScreen.svelte";
  import FlatpickrCss from "./FlatpickrCss.svelte";
  import FlatpickrThemeCss from "./FlatpickrThemeCss.svelte";

  import PouchDbStore from "./PouchDbStore.js";
  let data = new AppDataFacade({ store: new PouchDbStore() });
</script>

<style type="text/css">

</style>

<Tailwindcss />
<FlatpickrCss />
<FlatpickrThemeCss />
<HomeScreen {data} />
