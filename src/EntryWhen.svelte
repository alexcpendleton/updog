<script>
  import Flatpickr from "svelte-flatpickr";
  export let handleWhenChange = function() {};
  let placeholder = "Choose a date/time";
  export let selectedValue = "";
  let humanValue = "";

  let flatpickrOptions = {
    enableTime: true,
    wrap: true,
    element: "#flatpickr-container",
    defaultDate: new Date(),
    inline: false
  };
  function toHumanDateTime(dateValue) {
    let time = new Intl.DateTimeFormat("default", {
      hour12: true,
      hour: "numeric",
      minute: "numeric"
    }).format(dateValue);
    let result = `${dateValue.getFullYear()}-${dateValue.getMonth() +
      1}-${dateValue.getDate()} ${time}`;
    return result;
  }
  function handleChange(event) {
    if (event && event.detail && event.detail.length > 1) {
      let selectedDates = event.detail[0];
      if (selectedDates) {
        selectedValue = selectedDates[0];
        humanValue = toHumanDateTime(selectedValue);
        handleWhenChange(selectedValue);
      }
    }
  }
  function getClassForLabel() {
    let result = "block";
    if (selectedValue == "") {
      result += " visually-hidden";
    }
    return result;
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
      <button type="button" data-toggle>
        📆
        {#if humanValue}
          <time class="when-human-value text-xs" datetime={selectedValue}>
            {humanValue}
          </time>
        {/if}
      </button>

      <label class={getClassForLabel()}>
        <input type="text" placeholder="Date/Time" data-input />
        <div class="visually-hidden">When</div>
      </label>
    </div>
  </Flatpickr>
</div>
