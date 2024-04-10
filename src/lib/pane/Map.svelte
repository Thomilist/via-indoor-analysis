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
    import { ViewBox, paneRect } from "$lib/viewbox";


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


    const active_pointers: Map<number, Pick<Point, "x" | "y">> = new Map();


    function pointerPan(event: PointerEvent)
    {
        if (event.pointerType === "mouse" && event.buttons === 1)
        {
            panMap({ x: event.movementX, y: event.movementY });
        }
        else if (event.pointerType !== "mouse" && active_pointers.size === 1)
        {
            const last_position = active_pointers.get(event.pointerId) ?? { x: event.x, y: event.y };
            const movement = { x: event.x - last_position.x, y: event.y - last_position.y };
            panMap(movement);
        }

        active_pointers.set(event.pointerId, event);
    }


    function panMap(screen_movement: Pick<Point, "x" | "y">)
    {
        const pane_rect = paneRect(name.pane.map);

        if (!pane_rect) { return; }

        $viewbox.pan2D
        ({
            x: screen_movement.x * ($viewbox.getWidth() / pane_rect.width),
            y: screen_movement.y * ($viewbox.getHeight() / pane_rect.height)
        });
    }


    function pinchZoom(event: PointerEvent)
    {
        if (active_pointers.size === 2)
        {
            const a_old = active_pointers.get(event.pointerId) ?? { x: event.x, y: event.y };
            const a_new: Pick<Point, "x" | "y"> = { x: event.x, y: event.y };
            let b: Pick<Point, "x" | "y"> = { x: event.x, y: event.y };

            active_pointers.forEach((position, pointerId) =>
            {
                if (pointerId !== event.pointerId)
                {
                    b = position;
                }
            });

            const old_distance = Math.sqrt(((b.x - a_old.x) ** 2) + ((b.y - a_old.y) ** 2));
            const new_distance = Math.sqrt(((b.x - a_new.x) ** 2) + ((b.y - a_new.y) ** 2));
            const scale = old_distance / new_distance;

            const old_center: Pick<Point, "x" | "y"> =
            {
                x: (b.x + a_old.x) / 2,
                y: (b.y + a_old.y) / 2
            };

            const new_center: Pick<Point, "x" | "y"> =
            {
                x: (b.x + a_new.x) / 2,
                y: (b.y + a_new.y) / 2
            };

            const offset: Pick<Point, "x" | "y"> =
            {
                x: new_center.x - old_center.x,
                y: new_center.y - old_center.y
            };

            panMap(offset);
            zoomMap(new_center, scale);
        }

        active_pointers.set(event.pointerId, event);
    }


    function wheelZoom(event: WheelEvent)
    {
        const center = { x: event.offsetX, y: event.offsetY };
        const scale = event.deltaY > 0 ? 1.2 : 1 / 1.2;

        zoomMap(center, scale);
    }


    function zoomMap(center: Pick<Point, "x" | "y">, scale: number)
    {
        const pane_rect = paneRect(name.pane.map);

        if (!pane_rect) { return; }

        const map_offset = mapCoords(center);

        $viewbox.x.update(x => x + ($viewbox.getWidth() - $viewbox.getWidth() * scale) * (map_offset.x - $viewbox.getX()) / $viewbox.getWidth(), ViewBox.tween_fast);
        $viewbox.y.update(y => y + ($viewbox.getHeight() - $viewbox.getHeight() * scale) * (map_offset.y - $viewbox.getY()) / $viewbox.getHeight(), ViewBox.tween_fast);
        $viewbox.width.update(w => w * scale, ViewBox.tween_fast);
        $viewbox.height.update(h => h * scale, ViewBox.tween_fast);
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


    function handlePointerDown(event: PointerEvent)
    {
        event.preventDefault();
        mouse_moved = false;
        active_pointers.set(event.pointerId, event);
        rerender(event);
    }


    function handlePointerUp(event: PointerEvent)
    {
        event.preventDefault();
        active_pointers.delete(event.pointerId);
    }


    function handlePointerMove(event: PointerEvent)
    {
        event.preventDefault();
        mouse_moved = true;

        switch (active_pointers.size)
        {
            case 1: pointerPan(event); break;
            case 2: pinchZoom(event); break;
            default: break;
        }
        
        if (event.pointerType === "mouse")
        {
            const hover_changed = highlightNodeUnderMouse(event);
        
            if (hover_changed)
            {
                rerender(event);
            }
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
        wheelZoom(event);

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
        on:pointerdown={handlePointerDown}
        on:pointerup={handlePointerUp}
        on:pointermove={handlePointerMove}
        on:wheel={handleWheel}
        on:contextmenu={handleRightClick}>
        <image {...$via_map.attributes()}/>

        {#key $rr}
            <RenderedGraph/>
        {/key}
    </svg>
</div>
