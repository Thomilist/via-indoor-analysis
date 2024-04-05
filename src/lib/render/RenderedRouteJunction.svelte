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
    import { via_map } from "$lib/state";
    import type { RouteJunctionRenderData } from "./render-data";


    export let data: RouteJunctionRenderData;


    const radius = $via_map.distanceToMapPixels(new Distance(0.4, "m"), "measure") * (data.highlighted ? 1.5 : 1);
</script>



<circle
    cx={data.node.x}
    cy={data.node.y}
    r={radius}
    fill="white"
    fill-opacity={data.dimmed ? 0.1 : 1}
    stroke="black"
    stroke-width=1
    stroke-opacity={data.dimmed ? 0.1 : 1}
/>
