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
