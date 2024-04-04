<script lang="ts">
    import { svgTrianglePoints } from "$lib/utils/svg-helpers";
    import type { PanDirection } from "$lib/viewbox";

    export let direction: PanDirection;
    export let size: number;

    const rotation = Math.PI * (() =>
    {
        switch (direction)
        {
            case "right": return 0;
            case "down": return 0.5;
            case "left": return 1;
            case "up": return 1.5;
        }
    })();

    const offset_x = (() =>
    {
        switch (direction)
        {
            case "right": return -size / 5;
            case "left": return size / 5;
            default: return 0;
        }
    })();

    const offset_y = (() =>
    {
        switch (direction)
        {
            case "up": return size / 5;
            case "down": return -size / 5;
            default: return 0;
        }
    })();
</script>



<style>
    @import "$lib/style/pan-direction.css";
</style>



<svg width={size} height={size}>
    <polygon class="pan-direction-triangle" points={svgTrianglePoints({x: size / 2 + offset_x, y: size / 2 + offset_y, z: 0}, size, rotation)}/>
</svg>
