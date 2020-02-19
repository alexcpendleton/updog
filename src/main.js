import App from "./App.svelte";

const pageName = document.body.getAttribute("data-page");
debugger;
const app = new App({
  target: document.body,
  props: { pageName }
});

export default app;
