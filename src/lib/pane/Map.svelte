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
    import { add_node_height, add_node_type, course_index, courses, map_graph, edit_mode, mode, via_map, viewbox } from "$lib/state";
    import { ControlMapNode, FinishControlMapNode, StartControlMapNode } from "$lib/map-graph/node";
    import { name } from "$lib/names";
    import RenderedGraph from "$lib/render/RenderedGraph.svelte";
    import type { Point } from "$lib/utils/vector";
    import { deleteNode, numberRangeMapping } from "$lib/utils/misc";
    import { rerender, rr } from "$lib/render/rerender";
    import { paneRect } from "$lib/viewbox";


    let mouse_moved: boolean = false;
    let hovered_node: number = -1;


    function debugPrint(event: MouseEvent)
    {
        const pane_rect = paneRect(name.pane.map);
        
        console.log(`DEBUG PRINT
        click: ${event.x} ${event.y}
        rect: ${pane_rect?.width} ${pane_rect?.height}
        vbox: ${$viewbox.serialise()}`);
    }


    function mapCoords(click: Pick<Point, "x" | "y">): Point
    {
        const pane_rect = paneRect(name.pane.map);

        if (!pane_rect) { return { x: 0, y: 0, z: 0 }; }

        const mapX = numberRangeMapping(click.x, 0, pane_rect.width, 0, $viewbox.getWidth()) + $viewbox.getX();
        const mapY = numberRangeMapping(click.y, 0, pane_rect.height, 0, $viewbox.getHeight()) + $viewbox.getY();

        return { x: mapX, y: mapY, z: 0 };
    }


    function pan(event: MouseEvent)
    {
        if (event.buttons === 1)
        {
            const pane_rect = paneRect(name.pane.map);

            if (!pane_rect) { return; }

            $viewbox.pan2D
            ({
                x: event.movementX * ($viewbox.getWidth() / pane_rect.width),
                y: event.movementY * ($viewbox.getHeight() / pane_rect.height)
            });
        }
    }


    function zoom(event: WheelEvent)
    {
        const zoom_scale = event.deltaY > 0 ? 1.2 : 0.8;
        const pane_rect = paneRect(name.pane.map);

        if (!pane_rect) { return; }

        const map_offset = mapCoords({ x: event.offsetX, y: event.offsetY });

        $viewbox.x.update(x => x + ($viewbox.getWidth() - $viewbox.getWidth() * zoom_scale) * (map_offset.x - $viewbox.getX()) / $viewbox.getWidth());
        $viewbox.y.update(y => y + ($viewbox.getHeight() - $viewbox.getHeight() * zoom_scale) * (map_offset.y - $viewbox.getY()) / $viewbox.getHeight());
        $viewbox.width.update(w => w * zoom_scale);
        $viewbox.height.update(h => h * zoom_scale);
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


    $: viewbox_string = $viewbox.serialise();

    function updateViewbox()
    {
        viewbox_string = $viewbox.serialise();
    }

    $viewbox.x.subscribe(updateViewbox);
    $viewbox.y.subscribe(updateViewbox);
    $viewbox.width.subscribe(updateViewbox);
    $viewbox.height.subscribe(updateViewbox);
</script>



<style>
    @import "$lib/style/map-pane.css";
</style>



<div class="map pane" id={name.pane.map}>
    <svg
        id="map"
        role="none"
        viewBox={viewbox_string}
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
