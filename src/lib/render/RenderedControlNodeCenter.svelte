<script lang="ts">
    import { Distance } from "$lib/utils/distance";
    import { via_map } from "$lib/state";
    import { iof_print } from "./iof";
    import type { ControlNodeCenterRenderData } from "./render-data";

    export let data: ControlNodeCenterRenderData;

    const radius = $via_map.distanceToMapPixels(new Distance(0.1, "m"), "measure");
</script>



<circle
    cx={data.control.x}
    cy={data.control.y}
    r={radius}
    fill={iof_print.colour}
    fill-opacity={iof_print["opacity"]}
/>
