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
