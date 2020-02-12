<script>
  import Flatpickr from "svelte-flatpickr";
  import { beforeUpdate } from "svelte";
  export let when = "";
  export let handleWhenChange = function() {};
  export let isOpen = false;
  export let pleaseRerender = "";
  let placeholder = "Choose a date/time";
  let flatpickrValue = when || new Date();

  let flatpickrOptions = {
    enableTime: true,
    wrap: true,
    element: "#flatpickr-container",
    defaultDate: flatpickrValue,
    inline: false
  };
  beforeUpdate(() => {
    console.log("the component has beforeUpdated");
  });
  function handleChange(event) {
    if (event && event.detail && event.detail.length > 1) {
      let selectedDates = event.detail[0];
      let dateStr = event.detail[1];
      if (selectedDates) {
        when = selectedDates[0];
        handleWhenChange(when);
      }
    }
  }
  function handleToggleClick() {
    if (isOpen) {
      // Reset to "no date/time selected when closed"
      isOpen = false;
      when = "";
    } else {
      isOpen = true;
    }
  }
</script>

<div
  class="when-container block"
  data-open={isOpen}
  data-pleasererender={pleaseRerender}>
  <Flatpickr
    options={flatpickrOptions}
    {placeholder}
    on:change={handleChange}
    {pleaseRerender}
    element="#flatpickr-container">
    <div class="flatpickr" id="flatpickr-container">
      <button type="button" data-toggle>📆</button>

      <label class="visually-hidden display-block" style="display:block">

        <input
          type="text"
          placeholder="Select Date and Time of the event..."
          data-input
          bind-value={flatpickrValue} />
        <div>When:</div>
      </label>
    </div>
  </Flatpickr>
</div>
