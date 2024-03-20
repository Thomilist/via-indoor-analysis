<script lang="ts">
    import { map, viewbox } from "../map";

    function paneRect()
    {
        return document.getElementById("map-pane")?.getBoundingClientRect();
    }

    function noDefault(event: Event)
    {
        event.preventDefault();
        console.log(viewbox_attribute);
    }

    function pan(event: MouseEvent)
    {
        if (event.buttons === 1)
        {
            const pane_rect = paneRect();

            if (pane_rect)
            {
                $viewbox.x -= event.movementX * ($viewbox.width / pane_rect.width);
                $viewbox.y -= event.movementY * ($viewbox.height / pane_rect.height);
            }
        }
    }

    function zoom(event: WheelEvent)
    {
        const scale = event.deltaY > 0 ? 1.2 : 0.8;
        const pane_rect = paneRect();

        if (!pane_rect)
        {
            return;
        }

        $viewbox.x += ($viewbox.width - $viewbox.width * scale) * event.offsetX / pane_rect.width;
        $viewbox.y += ($viewbox.height - $viewbox.height * scale) * event.offsetY / pane_rect.height;
        $viewbox.width *= scale;
        $viewbox.height *= scale;
    }

    $: viewbox_attribute = `${$viewbox.x} ${$viewbox.y} ${$viewbox.width} ${$viewbox.height}`;
</script>



<style>
    @import "$lib/style/map-pane.css";
</style>



<div class="map pane" id="map-pane">
    <svg
        id="map"
        role="application"
        viewBox={viewbox_attribute}
        on:mousemove={pan}
        on:wheel={zoom}
        on:mousedown={noDefault}
        on:contextmenu={noDefault}>
        <image {...map}/>
    </svg>
</div>
