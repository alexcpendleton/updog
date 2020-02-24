<script>
  export let auth;
  let isLoggedIn = false;
  let isSyncing = false;

  let isReady = false;

  async function init() {
    await auth.init();
    auth.emitter.on("isloggedin", handleIsLoggedIn);
    auth.emitter.on("isloggedout", handleIsLoggedOut);
  }
  function handleIsLoggedIn() {
    isLoggedIn = true;
    isReady = true;
  }
  function handleIsLoggedOut() {
    isLoggedIn = false;
    isReady = true;
  }
  function handleLogInClick() {
    auth.login();
  }
  function handleLogOutClick() {
    auth.logout();
  }
  init();
</script>

<div class="absolute bottom-0 right-0">
  {#if isLoggedIn}
    {#if isSyncing}
      <div>Syncing...</div>
    {/if}
    <button type="button" class="" on:click={handleLogOutClick}>Log out</button>
  {:else}
    <button type="button" class="" on:click={handleLogInClick}>Log in</button>
  {/if}
</div>
