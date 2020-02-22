<script>
  import saveAs from "file-saver";
  export let data;
  async function handleExportClick() {
    var result = await data.dump();
    var blob = new Blob([result], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "UpDogExport.json.txt");
  }
</script>

<div class="">
  <button
    type="button"
    on:click={handleExportClick}
    class="bg-purple-600 hover:bg-purple-400 text-white font-bold py-1 px-4
    rounded my-2">
    download db
  </button>
</div>
