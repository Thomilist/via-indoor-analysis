<script lang="ts">
    import { Route } from "$lib/map-graph/route";
    import { current_routes, lang, rerender } from "$lib/state";

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
