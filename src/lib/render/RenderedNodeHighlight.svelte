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
    import { Distance } from "$lib/utils/distance";
    import { ControlMapNode, FinishControlMapNode, MapNode, StartControlMapNode, WaypointMapNode } from "$lib/map-graph/node";
    import { via_map, viewbox } from "$lib/state";
    import { mapPaneRect } from "$lib/viewbox";
    import { iof_print } from "./iof";
    import type { NodeHighlightRenderData } from "./render-data";


    export let data: NodeHighlightRenderData;


    $: colour = { hovered: "red", selected: "blue" };

    const normal_node_radius = $via_map.distanceToMapPixels(new Distance(0.4, "m"), "measure");
    const landmark_node_radius = normal_node_radius * 2;

    const base_interact_range =
        ( data.node instanceof FinishControlMapNode ? iof_print.finish_radius_outer
        : data.node instanceof StartControlMapNode ? iof_print.start_side_length / 1.6
        : data.node instanceof ControlMapNode ? iof_print.control_radius
        : data.node instanceof WaypointMapNode ? landmark_node_radius
        : data.node instanceof MapNode ? normal_node_radius
        : 0 );

    const highlight_stroke_width = 16;
    const inner_highlight_radius = base_interact_range * 1.2 + highlight_stroke_width;
    const highlight_segments = 2;
    const inner_highlight_segment_size = inner_highlight_radius * Math.PI / highlight_segments;
    const outer_highlight_radius = inner_highlight_radius + highlight_stroke_width * 1.2;
    const outer_highlight_segment_size = outer_highlight_radius * Math.PI / highlight_segments;

    // Make partially transparent at high zoom levels.
    $: highlight_opacity = (() =>
    {
        const map_pane_rect = mapPaneRect();

        if (map_pane_rect)
        {
            const scale =
            {
                // Portion of screen normal_node_radius takes up.
                // Bigger min: More zoom before opacity reduction begins.
                // Bigger max: More zoom before opacity reduction ends.
                // Bigger (max - min): More gradual opacity change.
                size_fraction: { min: 0.001, max: 0.03 },

                // size_fraction scale is mapped to opacity_reduction scale.
                opacity_reduction: { min: 0, max: 0.9 }
            };
            
            const smallest_map_pane_dimension
                = map_pane_rect.visible.height < map_pane_rect.visible.width
                    ? map_pane_rect.visible.height
                    : map_pane_rect.visible.width;

            const size_fraction = ((normal_node_radius) * $via_map.width / $viewbox.width) / smallest_map_pane_dimension;
            
            if (size_fraction > scale.size_fraction.max)
            {
                return 1 - scale.opacity_reduction.max;
            }

            return 1 - ((size_fraction - scale.size_fraction.min) * (scale.opacity_reduction.max - scale.opacity_reduction.min) / (scale.size_fraction.max - scale.size_fraction.min) + scale.opacity_reduction.min);
        }

        return 1;
    })();

    $: { data.node.interact_range = Math.max(( data.node.selected ? base_interact_range * 1.2 + highlight_stroke_width * 1.5 : base_interact_range * 1.2 ), 20); }
</script>



{#each ["Inner", "Outer"] as ring}
    {#if ring === "Inner" || data.node.selected}
        <circle
            cx={data.node.x}
            cy={data.node.y}
            r={ring === "Inner" ? inner_highlight_radius : outer_highlight_radius}
            fill="none"
            stroke={(ring === "Inner" && data.node.selected) ? colour.selected : colour.hovered}
            stroke-opacity={highlight_opacity}
            stroke-width={highlight_stroke_width}
            stroke-dasharray={ring === "Inner" ? `${inner_highlight_segment_size} ${inner_highlight_segment_size}` : `${outer_highlight_segment_size} ${outer_highlight_segment_size}`}>

            <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="{(ring === "Inner" && data.node.selected) ? 359 : 0} {data.node.x} {data.node.y}"
                to="{(ring === "Inner" && data.node.selected) ? 0 : 359} {data.node.x} {data.node.y}"
                dur="10s"
                repeatCount="indefinite"
                />
        </circle>
    {/if}
{/each}
