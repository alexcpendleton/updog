<script>
  import Flatpickr from "svelte-flatpickr";
  export let handleWhenChange = function() {};
  let placeholder = "Choose a date/time";
  export let selectedValue = "";

  let flatpickrOptions = {
    enableTime: true,
    wrap: true,
    element: "#flatpickr-container",
    defaultDate: new Date(),
    inline: false
  };
  function handleChange(event) {
    if (event && event.detail && event.detail.length > 1) {
      let selectedDates = event.detail[0];
      if (selectedDates) {
        selectedValue = selectedDates[0];
        handleWhenChange(selectedValue);
      }
    }
  }
</script>

<div class="when-container block">
  <Flatpickr
    options={flatpickrOptions}
    {placeholder}
    on:change={handleChange}
    bind:value={selectedValue}
    element="#flatpickr-container">
    <div class="flatpickr" id="flatpickr-container">
      <button type="button" data-toggle>📆</button>

      <label class="visually-hidden display-block" style="display:block">

        <input
          type="text"
          placeholder="Select Date and Time of the event..."
          data-input />
        <div>When:</div>
      </label>
    </div>
  </Flatpickr>
</div>
