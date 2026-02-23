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
    import { type Point, Vector } from "$lib/utils/vector";
    import { iof_print } from "./iof";
    import type { BlockadeRenderData } from "./render-data";


    interface Props {
        data: BlockadeRenderData;
    }

    let { data }: Props = $props();

    
    const iof_line_attributes =
    {
        fill: "none",
        stroke: iof_print.colour,
        "stroke-opacity": iof_print["opacity"],
        "stroke-width": iof_print["stroke-width"] * 1.5,
    };

    const mid_point: Point = $derived({
        x: (data.a.x + data.b.x) / 2,
        y: (data.a.y + data.b.y) / 2,
        z: (data.a.z + data.b.z) / 2,
    });

    const blockade_vector = $derived(new Vector(data));
    const direction_vector = $derived(Vector.createFromPointAndVector(mid_point, blockade_vector.normalXY()
        .unitVector(["x", "y"])
        .scale(20)));
</script>


<line
    x1={data.a.x} y1={data.a.y}
    x2={data.b.x} y2={data.b.y}
    {...iof_line_attributes}
    stroke-dasharray={data.relation === "Portal" ? "4 4" : ""}
/>

{#if data.relation === "Portal"}
    <polyline
        points={`${data.a.x},${data.a.y} ${direction_vector.b.x},${direction_vector.b.y} ${data.b.x},${data.b.y}`}
        {...iof_line_attributes}
        stroke-width="4"
    />
{/if}