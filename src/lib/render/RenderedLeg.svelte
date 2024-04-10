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
    import { FinishControlMapNode, type ControlMapNode, StartControlMapNode } from "$lib/map-graph/node";
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
        else if (control instanceof StartControlMapNode)
        {
            return iof_print.start_side_length / 2 + 1.3825 * iof_print["stroke-width"];
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



<line
    x1={vector_ab_offset.a.x} y1={vector_ab_offset.a.y}
    x2={vector_ab_offset.b.x} y2={vector_ab_offset.b.y}
    {...outline_attributes}
/>


<line
    x1={vector_ab_offset.a.x} y1={vector_ab_offset.a.y}
    x2={vector_ab_offset.b.x} y2={vector_ab_offset.b.y}
    {...iof_line_attributes}
/>
