<!--

via-indoor-analysis: Route choice analysis tool for indoor sprint 
orienteering at VIA University College Horsens.
Copyright (C) 2024 Thomas Emil Jensen

via-indoor-analysis is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

via-indoor-analysis is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with via-indoor-analysis. If not, see <https://www.gnu.org/licenses/>.

-->



<script lang="ts">
    import { findLegSuggestions } from "$lib/pathfinding/suggest-legs";
    import { rerender } from "$lib/render/rerender";
    import { calculateState, lang } from "$lib/state";
    import CalculationViewSelector from "./CalculationViewSelector.svelte";
    import RouteFilteringWidget from "./RouteFilteringWidget.svelte";


    function calculate()
    {
        calculateState();
        rerender();
    }

    function suggestLegs()
    {
        findLegSuggestions();
        rerender();
    }
</script>



<button on:click={calculate}>{({DA: "Beregn", EN: "Calculate"}[$lang])}</button>

<button on:click={suggestLegs}>{({DA: "Foreslå stræk", EN: "Suggest legs"}[$lang])}</button>

<hr>
<CalculationViewSelector/>
<hr>
<RouteFilteringWidget/>
