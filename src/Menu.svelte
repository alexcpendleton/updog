<script>
  import AuthPrompt from "./AuthPrompt.svelte";
  export let auth = null;
  export let isOpen = false;

  let hiddenClass = "hidden";
  let shownClass = "block";
  let navClass = `${hiddenClass}`;

  function resetNavClass() {
    let hideShow = isOpen ? shownClass : hiddenClass;
    navClass = `${hideShow} block border bg-purple-600 border-purple-400 rounded text-sm `;
  }
  function handleToggle() {
    isOpen = !isOpen;
    resetNavClass();
  }
</script>

<nav class="absolute top-0 right-0 text-right pt-2" aria-haspopup="true">
  <button
    aria-expanded="false"
    aria-controls="nav-menu"
    style="width:50px; height:50px;"
    class="text-center"
    on:click={handleToggle}>
    <span class="visually-hidden">Menu</span>
    <span class="" aria-hidden="true">⚙️</span>
  </button>
  <ul id="nav-menu" class={navClass} style="min-width:120px">
    <li class="pr-2">
      <AuthPrompt {auth} />
    </li>
  </ul>
</nav>
