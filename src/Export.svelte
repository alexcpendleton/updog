<script>
  export let data;
  var auth = {};
  let userID = auth.userId || "";

  function handleFixDates() {
    data.store.fixDates();
  }
</script>

<div class="">
  <button
    type="button"
    on:click={handleFixDates}
    class="inline-block bg-purple-600 hover:bg-purple-400 text-white font-bold
    py-1 px-4 rounded my-2">
    Fix Dates Hopefully
  </button>
</div>
