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
    import { name } from "$lib/names";
    import { iof_print } from "$lib/render/iof";
    import PanDirectionSymbol from "$lib/render/symbol/PanDirectionSymbol.svelte";
    import { lang, mode, viewbox } from "$lib/state";
    import { type PanDirection, type ZoomDirection, fitViewToCurrentLeg, fitViewToMap, paneRect } from "$lib/viewbox";


    function pan(direction: PanDirection)
    {
        const granularity = 10;
        
        switch (direction)
        {
            case "left": $viewbox.x -= $viewbox.width / granularity; break;
            case "right": $viewbox.x += $viewbox.width / granularity; break;
            case "up": $viewbox.y -= $viewbox.height / granularity; break;
            case "down": $viewbox.y += $viewbox.height / granularity; break;
        }
    }


    function zoom(direction: ZoomDirection)
    {
        const map_pane_rect = paneRect(name.pane.map);
        if (!map_pane_rect) { return; }

        const scale = direction === "out" ? 1.2 : 1 / 1.2;

        $viewbox.x += ($viewbox.width - $viewbox.width * scale) * (map_pane_rect.width / 2) / map_pane_rect.width;
        $viewbox.y += ($viewbox.height - $viewbox.height * scale) * (map_pane_rect.height / 2) / map_pane_rect.height;
        $viewbox.width *= scale;
        $viewbox.height *= scale;
    }


    function reset()
    {
        fitViewToMap();
    }


    function fit()
    {
        switch ($mode)
        {
            case "View":
            {
                fitViewToCurrentLeg(2 * iof_print.control_radius);
                break;
            }
            case "Edit": break;
        }
    }


    const pan_directions: PanDirection[] = ["left", "right", "up", "down"];
    const zoom_directions: { value: ZoomDirection, label: string }[] =
    [
        { value: "in", label: "+"},
        { value: "out", label: "-"}
    ];
</script>



<style>
    @import "$lib/style/view-controls.css";
</style>



<div id="view-controls">
    <div id="view-pan-controls">
        {#each pan_directions as direction}
            <label id="view-pan-{direction}">
                <button class="view-pan-button" on:click={() => pan(direction)}></button>
                <PanDirectionSymbol {direction} size={40}/>
            </label>
        {/each}
    </div>

    <div id="view-zoom-controls">
        {#each zoom_directions as direction}
            <button class="view-zoom-button" id="view-zoom-{direction.value}" on:click={() => zoom(direction.value)}>{direction.label}</button>
        {/each}
    </div>

    <div id="view-fit-controls">
        <button id="view-fit" on:click={fit}>{({DA: "Tilpas visning", EN: "Fit view"}[$lang])}</button>
        <button id="view-reset" on:click={reset}>{({DA: "Nulstil visning", EN: "Reset view"}[$lang])}</button>
    </div>
</div>
