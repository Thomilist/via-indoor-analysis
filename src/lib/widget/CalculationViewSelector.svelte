<script lang="ts">
    import { calculation_view, lang, type CalculationView, rerender } from "$lib/state";

    const options: { value: CalculationView, DA: string, EN: string }[] =
    [
        { value: "Paths", DA: "Stier", EN: "Paths"},
        { value: "Legs", DA: "Stræk", EN: "Legs"}
    ];

    $: $calculation_view, rerender();
</script>



<style>
    @import "$lib/style/radio-fieldset.css";
</style>



<fieldset class="radio-fieldset">
    <legend>{({DA: "Vis", EN: "View"}[$lang])}</legend>

    {#each options as option}
        <label>
            <input type="radio" value={option.value} bind:group={$calculation_view}/>
            {option[$lang]}
        </label>
    {/each}
</fieldset>
