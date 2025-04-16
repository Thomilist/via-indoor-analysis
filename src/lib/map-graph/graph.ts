/*

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

*/



import type { Point } from "$lib/utils/vector";
import { FinishControlMapNode, ControlMapNode, WaypointMapNode, MapNode, type MapNodeName, StartControlMapNode, type AnyMapNode, BlockadeMapNode } from "./node";


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
            case "Blockade":
            {
                new_node = new BlockadeMapNode(node_id, position);
                break;
            }
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
