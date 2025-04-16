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
    import { lang, routeFilters } from "$lib/state";

    
</script>



<style>
    @import "$lib/style/route-filters.css";
</style>



<fieldset>
    <legend>{({DA: "Filtre", EN: "Filters"}[$lang])}</legend>

    <label>
        <input type="checkbox" bind:checked={$routeFilters.exclude_duplicates.enabled}>
        {({DA: "Eksludér dubletter", EN: "Exclude duplicates"}[$lang])}
    </label>

    <label>
        <input type="checkbox" bind:checked={$routeFilters.exclude_outliers_by_distance.enabled}>
        {({DA: "Eksludér ekstrem distance", EN: "Exclude outliers by distance"}[$lang])}
    </label>

    <label class="filter-value">
        {({DA: "Grænseværdi:", EN: "Threshold:"}[$lang])}
        <input type="number" min=1 max=9 step=0.1 bind:value={$routeFilters.exclude_outliers_by_distance.threshold}>
    </label>

    <label>
        <input type="checkbox" bind:checked={$routeFilters.exclude_basic_detours.enabled}>
        {({DA: "Eksludér simple omveje", EN: "Exclude basic detours"}[$lang])}
    </label>

    <label>
        <input type="checkbox" bind:checked={$routeFilters.filter_by_distance.enabled}>
        {({DA: "Filtrér efter distance", EN: "Filter by distance"}[$lang])}
    </label>

    <label class="filter-value">
        {({DA: "Grænseværdi:", EN: "Threshold:"}[$lang])}
        <input type="number" min=1 max=9 step=0.1 bind:value={$routeFilters.filter_by_distance.threshold}>
    </label>

    <label>
        <input type="checkbox" bind:checked={$routeFilters.filter_by_sameness.enabled}>
        {({DA: "Filtrér efter lighed", EN: "Filter by sameness"}[$lang])}
    </label>

    <label class="filter-value">
        {({DA: "Grænseværdi:", EN: "Threshold:"}[$lang])}
        <input type="number" min=0 max=1 step=0.1 bind:value={$routeFilters.filter_by_sameness.max_sameness}>
    </label>

    <label>
        <input type="checkbox" bind:checked={$routeFilters.exclude_crossover_detours.enabled}>
        {({DA: "Eksludér krydsende omveje", EN: "Exclude crossover detours"}[$lang])}
    </label>
</fieldset>