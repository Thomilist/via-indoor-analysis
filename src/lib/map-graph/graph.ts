import type { Point } from "$lib/utils/vector";
import { FinishControlMapNode, ControlMapNode, WaypointMapNode, MapNode, type MapNodeName, StartControlMapNode, type AnyMapNode } from "./node";

export class MapGraph
{
    nodes: MapNode[] = [];

    nearbyNode(point: Point, clear?: { hovered?: boolean, selected?: boolean })
    {
        const nodes_under_mouse: { node: MapNode, distance: number, was_hovered: boolean, was_selected: boolean }[] = [];

        this.nodes.forEach(entry =>
        {
            if (!entry.visible) { return; }
            
            const mouse_node_distance = entry.distanceToPosition(point);

            if (mouse_node_distance < entry.interact_range)
            {
                nodes_under_mouse.push({ node: entry, distance: mouse_node_distance, was_hovered: entry.hovered, was_selected: entry.selected });
            }
            
            if (clear?.hovered) { entry.hovered = false; }
            if (clear?.selected) { entry.selected = false; }
        });

        if (nodes_under_mouse.length > 0)
        {
            let nearby_node = nodes_under_mouse[0];

            nodes_under_mouse.forEach(entry =>
            {
                if (entry.distance < nearby_node.distance)
                {
                    nearby_node = entry;
                }
            });

            return nearby_node;
        }
    }

    addNode(position: { x: number, y: number, z: number }, type: MapNodeName)
    {
        let new_node: AnyMapNode;
        const node_id = MapNode.next_id++;

        switch (type)
        {
            case "Finish":
            {
                new_node = new FinishControlMapNode(node_id, position);
                break;
            }
            case "Start":
            {
                new_node = new StartControlMapNode(node_id, position);
                break;
            }
            case "Control":
            {
                new_node = new ControlMapNode(node_id, position);
                break;
            }
            case "Waypoint":
            {
                new_node = new WaypointMapNode(node_id, position);
                break;
            }
            case "Normal":
            {
                new_node = new MapNode(node_id, position);
                break;
            }
        }

        this.nodes.push(new_node);
        return new_node;
    }

    deleteNode(node: MapNode)
    {
        const index = this.nodes.indexOf(node);

        if (index > -1)
        {
            this.nodes.splice(index, 1);
        }
    }
}
