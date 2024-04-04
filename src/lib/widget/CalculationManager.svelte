<script lang="ts">
    import { calculateState, lang, rerender } from "$lib/state";
    import CalculationViewSelector from "./CalculationViewSelector.svelte";

    function calculate()
    {
        calculateState();
        rerender();
    }
</script>



<button on:click={calculate}>{({DA: "Beregn", EN: "Calculate"}[$lang])}</button>
<hr class="secondary">
<CalculationViewSelector/>
