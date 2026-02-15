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

    static #partitionSize: number = 32;
    #nodePartitions: Map<number, Map<number, Set<MapNode>>> = new Map();
    #selectedNodes: Set<MapNode> = new Set();
    #hoveredNodes: Set<MapNode> = new Set();

    nearbyNode(point: Point, clear?: { hovered?: boolean, selected?: boolean })
    {
        const nodes_under_mouse: { node: MapNode, distance: number, was_hovered: boolean, was_selected: boolean }[] = [];

        this.#relevantNodePartitions(point).forEach(partition => partition.forEach(node => 
        {
            if (!node.visible) { return; }
            
            const mouse_node_distance = node.distanceToPosition(point);

            if (mouse_node_distance < node.interact_range)
            {
                nodes_under_mouse.push({ node: node, distance: mouse_node_distance, was_hovered: node.hovered, was_selected: node.selected });
            }
        }));

        if (clear?.hovered)
        {
            this.clearHoveredNodes();
        }

        if (clear?.selected)
        {
            this.clearSelectedNodes();
        }

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

        for (const partition of this.#relevantNodePartitions(new_node))
        {
            partition.add(new_node);
        }

        return new_node;
    }

    deleteNode(node: MapNode)
    {
        const index = this.nodes.indexOf(node);

        if (index > -1)
        {
            this.nodes.splice(index, 1);
        }

        for (const partition of this.#relevantNodePartitions(node))
        {
            partition.delete(node);
        }
    }

    clearHoveredNodes()
    {
        for (const node of this.#hoveredNodes)
        {
            node.hovered = false;
        }

        this.#hoveredNodes.clear();
    }

    clearSelectedNodes()
    {
        for (const node of this.#selectedNodes)
        {
            node.selected = false;
        }

        this.#selectedNodes.clear();
    }

    setNodeHovered(node: MapNode, hovered?: boolean)
    {
        hovered ??= true;

        node.hovered = hovered;

        if (hovered)
        {
            this.#hoveredNodes.add(node);
        }
        else
        {
            this.#hoveredNodes.delete(node);
        }
    }

    setNodeSelected(node: MapNode, selected?: boolean)
    {
        selected ??= true;

        node.selected = selected;

        if (selected)
        {
            this.#selectedNodes.add(node);
        }
        else
        {
            this.#selectedNodes.delete(node);
        }
    }

    toggleNodeSelected(node: MapNode)
    {
        this.setNodeSelected(node, !node.selected);
    }

    #relevantNodePartitions(position: { x: number, y: number }): Set<MapNode>[]
    {
        const x_indices = this.#partitionIndices(position.x);
        const y_indices = this.#partitionIndices(position.y);

        return [
            this.#nodePartition({ x: x_indices.under, y: y_indices.under }),
            this.#nodePartition({ x: x_indices.under, y: y_indices.adjacent }),
            this.#nodePartition({ x: x_indices.adjacent, y: y_indices.under }),
            this.#nodePartition({ x: x_indices.adjacent, y: y_indices.adjacent })
        ];
    }

    #nodePartition(partition: { x: number, y: number }): Set<MapNode>
    {
        if (!this.#nodePartitions.has(partition.x))
        {
            this.#nodePartitions.set(partition.x, new Map());
        }

        if (!this.#nodePartitions.get(partition.x)!.has(partition.y))
        {
            this.#nodePartitions.get(partition.x)!.set(partition.y, new Set());
        }

        return this.#nodePartitions.get(partition.x)!.get(partition.y)!;
    }

    #partitionIndices(position: number): { under: number, adjacent: number }
    {
        const unrounded_index = position / MapGraph.#partitionSize;
        const rounded_index = Math.round(unrounded_index);
        const adjacent_index = rounded_index < unrounded_index ? rounded_index - 1 : rounded_index + 1;

        return { under: rounded_index, adjacent: adjacent_index };
    }
}
