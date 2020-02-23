<script>
  export let data;
  var query = `
mutation insert_dumps($objects: [dumps_insert_input!]!) {
  insert_dumps(objects: $objects) {
    returning {
      id
    }
  }
}`;
  async function handleExportClick() {
    var result = await data.dump();
    // var blob = new Blob([result], {
    //   type: "text/plain;charset=utf-8"
    // });
    // saveAs(blob, "UpDogExport.json.txt");
    var uri = "https://updog-heroku-postgres.herokuapp.com/v1/graphql";
    var obj = {
      blob: result
    };
    fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query,
        variables: {
          objects: [obj]
        }
      })
    });
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
