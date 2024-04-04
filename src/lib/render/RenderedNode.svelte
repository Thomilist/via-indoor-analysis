<script lang="ts">
    import { via_map } from "$lib/state";
    import { Distance } from "$lib/utils/distance";
    import { ControlMapNode, FinishControlMapNode, StartControlMapNode, WaypointMapNode, MapNode } from "$lib/map-graph/node";
    import { iof_print } from "./iof";
    import type { NodeRenderData } from "./render-data";
    import { svgTrianglePoints } from "$lib/utils/svg-helpers";

    export let data: NodeRenderData;

    const dimming_factor = 0.4;
    const normal_node_radius = $via_map.distanceToMapPixels(new Distance(0.4, "m"), "measure");
    const landmark_node_radius = normal_node_radius * 1.25;

    const iof_node_attributes =
    {
        fill: "none",
        stroke: iof_print.colour,
        "stroke-opacity": iof_print["opacity"] * (data.dimmed ? dimming_factor : 1),
        "stroke-width": iof_print["stroke-width"]
    };

    const outline_attributes =
    {
        fill: "none",
        stroke: "white",
        "stroke-opacity": iof_print["opacity"],
        "stroke-width": iof_print["stroke-width"] * 1.5
    };

    const node_position =
    {
        cx: data.node.x,
        cy: data.node.y
    };
</script>



<!-- The node itself -->
{#if data.node instanceof FinishControlMapNode}
    <circle {...node_position} {...outline_attributes} r={iof_print.finish_radius_inner} />
    <circle {...node_position} {...outline_attributes} r={iof_print.finish_radius_outer} />
    <circle {...node_position} {...iof_node_attributes} r={iof_print.finish_radius_inner} />
    <circle {...node_position} {...iof_node_attributes} r={iof_print.finish_radius_outer} />
{:else if data.node instanceof StartControlMapNode}
    <polygon {...outline_attributes} points={svgTrianglePoints(data.node, iof_print.start_side_length, data.rotation)}/>
    <polygon {...iof_node_attributes} points={svgTrianglePoints(data.node, iof_print.start_side_length, data.rotation)}/>
{:else if data.node instanceof ControlMapNode}
    <circle {...node_position} {...outline_attributes} r={iof_print.control_radius} />
    <circle {...node_position} {...iof_node_attributes} r={iof_print.control_radius} />
{:else if data.node instanceof WaypointMapNode}
    {#each [{colour: "red", scale: 1}, {colour: "white", scale: 0.8}, {colour: "red", scale: 0.6}] as params}
        <circle {...node_position} r={landmark_node_radius * params.scale} fill={params.colour} fill-opacity={data.node.hovered ? params.scale * 0.4 : 1} />
    {/each}
{:else if data.node instanceof MapNode}
    {#each [{colour: "blue", scale: 1}, {colour: "white", scale: 0.8}, {colour: "blue", scale: 0.6}] as params}
        <circle {...node_position} r={normal_node_radius * params.scale} fill={params.colour} fill-opacity={data.node.hovered ? params.scale * 0.4 : 1} />
    {/each}
{/if}
