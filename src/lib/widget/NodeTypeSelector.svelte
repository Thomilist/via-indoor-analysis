<script lang="ts">
    import { type MapNodeName } from "$lib/map-graph/node";
    import { add_node_type, lang } from "$lib/state";

    const options: { value: MapNodeName, DA: string, EN: string }[] =
    [
        { value: "Normal", DA: "Standard", EN: "Basic"},
        { value: "Waypoint", DA: "Pejlemærke", EN: "Waypoint"},
        { value: "Control", DA: "Post", EN: "Control"},
        { value: "Start", DA: "Start", EN: "Start"},
        { value: "Finish", DA: "Mål", EN: "Finish"}
    ];
</script>



<style>
    @import "$lib/style/radio-fieldset.css";
</style>



<fieldset class="radio-fieldset">
    <legend>{({DA: "Tilføj punkt", EN: "Add node"}[$lang])}</legend>
    
    {#each options as option}
        <label>
            <input type="radio" value={option.value} bind:group={$add_node_type}/>
            {option[$lang]}
        </label>
    {/each}
</fieldset>
