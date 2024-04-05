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
    import { current_routes, lang } from "$lib/state";
</script>



<style>
    @import "$lib/style/route-selector.css";
</style>



<table id="route-selector">
    <thead>
        <tr>
            <div>
                <td class="highlight">
                    🔍
                </td>
                
                <td class="route-choice-header">
                    {({DA: "Vejvalg", EN: "Route choices"}[$lang])}
                </td>
            </div>
        </tr>
    </thead>

    <tbody>
        {#each $current_routes as route, index (`RouteSelectorEntry ${route.id} ${Route.flatten(route).map(node => node.id)}`)}
            <tr>
                <label for="route{index}">
                    <div>
                        <td class="highlight">
                            <input type="checkbox" id="route{index}" bind:checked={route.highlighted} on:change={rerender}/>
                        </td>
                        <td class="number">
                            {`${index + 1}`}
                        </td>

                        <td class="colour">
                            <svg>
                                <rect width=100% height=100% fill={route.colour}/>
                            </svg>
                        </td>
                    </div>

                    <div>
                        <td class="distance-value">
                            {Math.round(route.distance.value())}
                        </td>

                        <td class="distance-unit">
                            m
                        </td>
                    </div>

                    <div>
                        <td class="elevation-value">
                            {route.elevation_gain}
                        </td>

                        <td class="elevation-unit">
                            ↑
                        </td>
                    </div>
                </label>
            </tr>
        {/each}
    </tbody>
</table>
