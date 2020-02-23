<script>
  export let data;
  var auth = data.getAuth();
  let userID = auth.userId || "";

  var query = `
mutation insert_entries($objects: [entries_insert_input!]!) {
  insert_entries(
    objects: $objects,
    on_conflict: {
        constraint: entries_pkey,
        update_columns: [note, selectables, is_deleted, when, created_at, updated_at, user_id]
    }) {
    returning {
      id
    }
  }
}`;
  async function handleExportClick() {
    if (userID === "") {
      alert("put in a user id please :)");
      return;
    }
    console.log(userID);
    let all = await data.getAllEntries();
    let entriesToPush = all.rows.map(i => {
      let output = {};
      let doc = i.doc;
      output.id = i.id;
      output.selectables = doc.selectables;
      output.note = doc.note;
      output.when = doc.when;
      output.user_id = userID;
      if (doc.created_at) {
        output.created_at = doc.created_at;
      }
      if (doc.updated_at) {
        output.updated_at = doc.updated_at;
      }
      return output;
    });
    console.dir(entriesToPush);
    //return;
    // var blob = new Blob([result], {
    //   type: "text/plain;charset=utf-8"
    // });
    // saveAs(blob, "UpDogExport.json.txt");
    var uri = "https://updog-heroku-postgres.herokuapp.com/v1/graphql";
    var response = await fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query,
        variables: {
          objects: entriesToPush
        }
      })
    });
    console.dir(response);
  }

  async function handleMigrateFromPouch() {
    data.store.migrateFromPouch();
  }
</script>

<div class="">
  <input
    type="text"
    bind:value={userID}
    name="temp_userID"
    class="text-gray-800 px-2 text-xs" />

  <button
    type="button"
    on:click={handleExportClick}
    class="inline-block bg-purple-600 hover:bg-purple-400 text-white font-bold
    py-1 px-4 rounded my-2">
    push
  </button>

  <button
    type="button"
    on:click={handleMigrateFromPouch}
    class="inline-block bg-purple-600 hover:bg-purple-400 text-white font-bold
    py-1 px-4 rounded my-2">
    migrate from pouch
  </button>
</div>
