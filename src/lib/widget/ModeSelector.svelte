<script lang="ts">
    import { lang, mode, type Mode } from "$lib/state";

    const options: { value: Mode, DA: string, EN: string }[] =
    [
        { value: "View", DA: "Vis", EN: "View"},
        { value: "Edit", DA: "Rediger", EN: "Edit"}
    ];
</script>



<select bind:value={$mode}>
    {#each options as option}
        <option value={option.value}>{option[$lang]}</option>
    {/each}
</select>
