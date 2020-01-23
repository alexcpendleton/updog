<script>
    import SingleEntry from './SingleEntry.svelte'
    //export let group = {};
    export let selectableMap = {};

    export let headerText = "";
    export let entries = [];
    export let date;

    if (date && !headerText) {
        headerText = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDay()}`;
    }    
</script>

<div>
    <div><strong>{headerText}</strong></div>
    <ol>
        {#each entries as entry (entry.id)}
        <li>
            <SingleEntry {entry} {selectableMap} />
        </li>
        {/each}
    </ol>
</div>