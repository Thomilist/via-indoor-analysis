<script lang="ts">
    import { edit_mode, lang, type EditMode } from "$lib/state";


    const options: { value: EditMode, DA: string, EN: string }[] =
    [
        { value: "Nodes", DA: "Punkter", EN: "Nodes"},
        { value: "Connections", DA: "Forbindelser", EN: "Connections"},
        { value: "Courses", DA: "Baner", EN: "Courses"},
        { value: "Calculations", DA: "Beregninger", EN: "Calculations"},
        { value: "Files", DA: "Filer", EN: "Files"}
    ];
</script>



<style>
    @import "$lib/style/radio-fieldset.css";
</style>



<fieldset class="radio-fieldset">
    {#each options as option}
        <label>
            <input type="radio" value={option.value} bind:group={$edit_mode}/>
            {option[$lang]}
        </label>
    {/each}
</fieldset>
