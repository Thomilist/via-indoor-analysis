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
    import { iof_print } from "./iof";
    import type { BlockadeRenderData } from "./render-data";


    export let data: BlockadeRenderData;

    
    const iof_line_attributes =
    {
        fill: "none",
        stroke: iof_print.colour,
        "stroke-opacity": iof_print["opacity"],
        "stroke-width": iof_print["stroke-width"] * 1.5
    };
</script>


<line
    x1={data.a.x} y1={data.a.y}
    x2={data.b.x} y2={data.b.y}
    {...iof_line_attributes}
/>
