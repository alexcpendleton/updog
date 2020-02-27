<script>
  export let auth;
  let isLoggedIn = false;
  let isSyncing = false;

  let isReady = true;

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

{#if isReady}
  <div>
    {#if isLoggedIn}
      <button type="button" class="" on:click={handleLogOutClick}>
        Log out
      </button>
    {:else}
      <button type="button" class="" on:click={handleLogInClick}>Log in</button>
    {/if}
  </div>
{/if}
