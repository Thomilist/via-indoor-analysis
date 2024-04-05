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
    import type { ConnectionRenderData } from "./render-data";

    export let data: ConnectionRenderData;

    const stroke_width = 1.5;
    const highlight_scaling = data.highlighted ? 4 : 1;
</script>



<line
    x1={data.a.x} y1={data.a.y}
    x2={data.b.x} y2={data.b.y}
    stroke-width={stroke_width * highlight_scaling}
    stroke={data.dimmed ? "gray" : "aqua"}
    stroke-dasharray={data.relation === "Portal" ? `${stroke_width * highlight_scaling} ${stroke_width * highlight_scaling * 2}` : ""}
/>
