<!-- @migration-task Error while migrating Svelte code: `<div>` cannot be a child of `<tr>`. `<tr>` only allows these children: `<th>`, `<td>`, `<style>`, `<script>`, `<template>`. The browser will 'repair' the HTML (by moving, removing, or inserting elements) which breaks Svelte's assumptions about the structure of your components.
https://svelte.dev/e/node_invalid_placement -->
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
    import { Route } from "$lib/map-graph/route";
    import { rerender } from "$lib/render/rerender";
    import UpstairsSymbol from "$lib/render/symbol/UpstairsSymbol.svelte";
    import { current_routes, lang } from "$lib/state";
</script>



<style>
    @import "$lib/style/route-selector.css";
</style>



<div class="route-selector">
    <table class="route-selector-table">
        <thead>
            <tr>
                <th class="highlight">
                    🔍
                </th>

                <th class="route-choice-header">
                    {({DA: "Vejvalg", EN: "Route choices"}[$lang])}
                </th>
            </tr>
        </thead>
    
        <tbody>
            {#each $current_routes as route, index (`RouteSelectorEntry ${route.id} ${Route.flatten(route).map(node => node.id)}`)}
                <tr onclick={() => {route.highlighted = !route.highlighted; rerender()}}>
                    <td>
                        <div class="highlight">
                            <input type="checkbox" id="route{index}" bind:checked={route.highlighted} onchange={rerender}/>
                        </div>

                        <div class="number">
                            {`${index + 1}`}
                        </div>

                        <div class="colour">
                            <svg>
                                <rect width=100% height=100% fill={route.colour}/>
                            </svg>
                        </div>
                    </td>

                    <td>
                        <div class="distance-value">
                            {Math.round(route.distance.value())}
                        </div>

                        <div class="distance-unit">
                            m
                        </div>
                    </td>

                    <td>
                        <div class="elevation-value">
                            {route.elevation_gain}
                        </div>

                        <div class="elevation-unit">
                            <UpstairsSymbol/>
                        </div>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
