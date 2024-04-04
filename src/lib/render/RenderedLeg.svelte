<script lang="ts">
    import { FinishControlMapNode, type ControlMapNode } from "$lib/map-graph/node";
    import { mode } from "$lib/state";
    import { Vector } from "$lib/utils/vector";
    import { iof_print } from "./iof";
    import type { CourseLegRenderData } from "./render-data";

    export let data: CourseLegRenderData;
    
    const iof_line_attributes =
    {
        fill: "none",
        stroke: iof_print.colour,
        "stroke-opacity": iof_print["opacity"],
        "stroke-width": iof_print["stroke-width"]
    };

    const outline_attributes =
    {
        fill: "none",
        stroke: "white",
        "stroke-opacity": iof_print["opacity"],
        "stroke-width": iof_print["stroke-width"] * 1.5
    };

    const vector_ab = new Vector(data);
    const unit_vector_ab = vector_ab.unitVector(["x", "y"]);

    function offsetMagnitude(control: ControlMapNode)
    {
        if (control instanceof FinishControlMapNode)
        {
            return iof_print.finish_radius_outer + 2 * iof_print["stroke-width"];
        }
        else
        {
            return iof_print.control_radius + 2 * iof_print["stroke-width"];
        }
    }

    const offset_magnitude_a = offsetMagnitude(data.a);
    const offset_magnitude_b = offsetMagnitude(data.b);

    const vector_ab_offset = vector_ab
        .translateWithOriginVector(unit_vector_ab.scale(offset_magnitude_a))
        .addOriginVector(unit_vector_ab.scale(- (offset_magnitude_a + offset_magnitude_b)));
</script>



{#if $mode === "View"}
    <line
        x1={vector_ab_offset.a.x} y1={vector_ab_offset.a.y}
        x2={vector_ab_offset.b.x} y2={vector_ab_offset.b.y}
        {...outline_attributes}
    />
{/if}

<line
    x1={vector_ab_offset.a.x} y1={vector_ab_offset.a.y}
    x2={vector_ab_offset.b.x} y2={vector_ab_offset.b.y}
    {...iof_line_attributes}
/>
