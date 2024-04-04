<script lang="ts">
    import { add_node_height, add_node_type, course_index, courses, map_graph, edit_mode, mode, rerender, via_map, viewbox, rr } from "$lib/state";
    import { ControlMapNode, FinishControlMapNode, StartControlMapNode } from "$lib/map-graph/node";
    import { mapPaneRect } from "$lib/viewbox";
    import { name } from "$lib/names";
    import RenderedGraph from "$lib/render/RenderedGraph.svelte";
    import type { Point } from "$lib/utils/vector";
    import { deleteNode, numberRangeMapping } from "$lib/utils/misc";

    let mouse_moved: boolean = false;
    let hovered_node: number = -1;

    function debugPrint(event: MouseEvent)
    {
        const pane_rect = mapPaneRect();
        
        console.log(`DEBUG PRINT
        click: ${event.x} ${event.y}
        rect/full: ${pane_rect?.full.width} ${pane_rect?.full.height}
        rect/visible: ${pane_rect?.visible.width} ${pane_rect?.visible.height}
        vbox: ${$viewbox.serialise()}`);
    }

    function mapCoords(click: Pick<Point, "x" | "y">): Point
    {
        const pane_rect = mapPaneRect()?.full;

        if (!pane_rect) { return { x: 0, y: 0, z: 0 }; }

        const mapX = numberRangeMapping(click.x, 0, pane_rect.width, 0, $viewbox.width) + $viewbox.x;
        const mapY = numberRangeMapping(click.y, 0, pane_rect.height, 0, $viewbox.height) + $viewbox.y;

        return { x: mapX, y: mapY, z: 0 };
    }

    function pan(event: MouseEvent)
    {
        if (event.buttons === 1)
        {
            const pane_rect = mapPaneRect()?.full;

            if (!pane_rect) { return; }

            $viewbox.x -= event.movementX * ($viewbox.width / pane_rect.width);
            $viewbox.y -= event.movementY * ($viewbox.height / pane_rect.height);
        }
    }

    function zoom(event: WheelEvent)
    {
        const zoom_scale = event.deltaY > 0 ? 1.2 : 0.8;
        const pane_rect = mapPaneRect()?.full;

        if (!pane_rect) { return; }

        const map_offset = mapCoords({ x: event.offsetX, y: event.offsetY });

        $viewbox.x += ($viewbox.width - $viewbox.width * zoom_scale) * (map_offset.x - $viewbox.x) / $viewbox.width;
        $viewbox.y += ($viewbox.height - $viewbox.height * zoom_scale) * (map_offset.y - $viewbox.y) / $viewbox.height;
        $viewbox.width *= zoom_scale;
        $viewbox.height *= zoom_scale;
    }

    function highlightNodeUnderMouse(event: MouseEvent)
    {
        const nearby = $map_graph.nearbyNode(mapCoords({ x: event.offsetX, y: event.offsetY }), { hovered: true });
        let newly_hovered_node = -1;

        if (nearby)
        {
            nearby.node.hovered = true;
            newly_hovered_node = nearby.node.id;
        }

        const hover_changed = hovered_node !== newly_hovered_node;
        hovered_node = newly_hovered_node;

        return hover_changed;
    }

    function selectNodeUnderMouse(event: MouseEvent)
    {
        const nearby = $map_graph.nearbyNode(mapCoords({ x: event.offsetX, y: event.offsetY }), { selected: !event.ctrlKey });

        if (nearby)
        {
            nearby.node.selected = !nearby.was_selected;
        }
    }

    function addNodeUnderMouse(event: MouseEvent)
    {
        const map_coords = mapCoords({x: event.offsetX, y: event.offsetY});

        if (!$via_map.containsCoords(map_coords)) { return; }

        $map_graph.addNode({...map_coords, z: $add_node_height}, $add_node_type);
        highlightNodeUnderMouse(event);
    }

    function deleteNodeUnderMouse(event: MouseEvent)
    {
        const nearby = $map_graph.nearbyNode(mapCoords({ x: event.offsetX, y: event.offsetY }));
        
        if (nearby)
        {
            deleteNode(nearby.node);
            highlightNodeUnderMouse(event);
        }
    }

    function addConnectionUnderMouse(event: MouseEvent)
    {
        const nearby = $map_graph.nearbyNode(mapCoords({ x: event.offsetX, y: event.offsetY }));

        if (nearby)
        {
            $map_graph.nodes.forEach(entry =>
            {
                if (entry.selected)
                {
                    if (event.altKey)
                    {
                        entry.connect(nearby.node, "Portal");
                    }
                    else
                    {
                        entry.connect(nearby.node, "Normal");
                    }
                }
            });
        }
    }

    function deleteConnectionUnderMouse(event: MouseEvent)
    {
        const nearby = $map_graph.nearbyNode(mapCoords({ x: event.offsetX, y: event.offsetY }));

        if (nearby)
        {
            $map_graph.nodes.forEach(entry =>
            {
                if (entry.selected)
                {
                    entry.disconnect(nearby.node);
                }
            });
        }
    }

    function addControlUnderMouse(event: MouseEvent)
    {
        const nearby = $map_graph.nearbyNode(mapCoords({ x: event.offsetX, y: event.offsetY }));

        if (nearby?.node instanceof StartControlMapNode)
        {
            $courses[$course_index].setStart(nearby.node);
        }
        else if (nearby?.node instanceof FinishControlMapNode)
        {
            $courses[$course_index].setFinish(nearby.node);
        }
        else if (nearby?.node instanceof ControlMapNode)
        {
            $courses[$course_index].addControl(nearby.node);
        }
    }

    function removeControlUnderMouse(event: MouseEvent)
    {
        const nearby = $map_graph.nearbyNode(mapCoords({ x: event.offsetX, y: event.offsetY }));

        if (nearby?.node instanceof StartControlMapNode)
        {
            $courses[$course_index].setStart(null);
        }
        else if (nearby?.node instanceof FinishControlMapNode)
        {
            $courses[$course_index].setFinish(null);
        }
        else if (nearby?.node instanceof ControlMapNode)
        {
            $courses[$course_index].removeControl(nearby.node);
        }
    }

    function handleMouseDown(event: MouseEvent)
    {
        event.preventDefault();
        mouse_moved = false;
        rerender(event);
    }

    function handleMouseMove(event: MouseEvent)
    {
        mouse_moved = true;
        pan(event);
        const hover_changed = highlightNodeUnderMouse(event);
        
        if (hover_changed)
        {
            rerender(event);
        }
    }

    function handleLeftClick(event: MouseEvent)
    {
        event.preventDefault();
        if (mouse_moved) { return; }

        switch ($mode)
        {
            case "Edit":
            {
                switch ($edit_mode)
                {
                    case "Nodes":
                    {
                        if (event.shiftKey)
                            { deleteNodeUnderMouse(event); }
                        else
                            { addNodeUnderMouse(event); }
                        break;
                    }
                    case "Connections":
                    {
                        if (event.shiftKey)
                            { deleteConnectionUnderMouse(event); }
                        else
                            { addConnectionUnderMouse(event); }
                        break;
                    }
                    case "Courses":
                    {
                        if (event.shiftKey)
                            { removeControlUnderMouse(event); }
                        else
                            { addControlUnderMouse(event); }
                        break;
                    }
                }
            }
            case "View": break;
        }

        rerender(event);
    }

    function handleRightClick(event: MouseEvent)
    {
        event.preventDefault();
        debugPrint(event);
        selectNodeUnderMouse(event);
        rerender(event);
    }

    function handleWheel(event: WheelEvent)
    {
        zoom(event);

        if (hovered_node !== -1)
        {
            rerender(event);
        }
    }
</script>



<style>
    @import "$lib/style/map-pane.css";
</style>



<div class="map pane" id={name.pane.map}>
    <svg
        id="map"
        role="none"
        viewBox={$viewbox.serialise()}
        on:click={handleLeftClick}
        on:mousemove={handleMouseMove}
        on:wheel={handleWheel}
        on:mousedown={handleMouseDown}
        on:contextmenu={handleRightClick}>
        <image {...$via_map.attributes()}/>

        {#key $rr}
            <RenderedGraph/>
        {/key}
    </svg>
</div>
