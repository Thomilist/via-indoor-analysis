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



import { Blockade } from "$lib/map-graph/blockade";
import { BlockadeMapNode, MapNode, WaypointMapNode } from "$lib/map-graph/node";
import { PathStep } from "$lib/map-graph/path";
import { blockades, map_graph } from "$lib/state";
import { Distance } from "$lib/utils/distance";
import { SortedSet } from "$lib/utils/sorted-set";
import { get } from "svelte/store";


export function findPaths()
{
    console.log("Finding paths...");
    const start_time = Date.now();

    updateBlockades();
    
    get(map_graph).nodes
        .filter(node => WaypointMapNode.isWaypointMapNode(node))
        .forEach((waypoint, index, waypoints) =>
        {
            if (waypoint instanceof WaypointMapNode)
            {
                console.log(`Finding paths from waypoint ${waypoint.id}... (${index + 1}/${waypoints.length})`);
                findShortestPaths(waypoint);
            }
        });
    
    const time = Date.now() - start_time;
    console.log(`Path finding complete (${time.valueOf()} ms)`);
}


function updateBlockades()
{
    blockades.set([]);

    const blockade_nodes = new Set<BlockadeMapNode>(get(map_graph).nodes
        .filter(node => BlockadeMapNode.isBlockadeMapNode(node)));

    while (blockade_nodes.size > 0)
    {
        const blockade_node = blockade_nodes.values().next().value;

        if (!blockade_node)
        {
            break;
        }

        blockade_node.all_neighbours.forEach(node =>
        {
            if (blockade_nodes.has(node))
            {
                get(blockades).push(new Blockade(blockade_node, node));
                console.log("Added blockade");
            }
        });

        blockade_nodes.delete(blockade_node);
    }
}


function findShortestPaths(from: WaypointMapNode)
{
    from.waypoint_neighbours.clear();
    const unvisited_nodes: Set<MapNode> = new Set();

    get(map_graph).nodes.forEach(node =>
    {
        if (node !== from)
        {
            node.distance_note.set(Infinity);
            unvisited_nodes.add(node);
        }
    });

    const pending_steps = new SortedSet(PathStep.sortByDistance);
    let current: PathStep | undefined = new PathStep(from, null, new Distance());

    while (current)
    {
        if (WaypointMapNode.isWaypointMapNode(current.node) && current.node !== from)
        {
            const path = current.buildPath();

            if (path)
            {
                //console.log(`Found shortest path to waypoint ${current.node.id} (${Math.round(path.distance.value())} m)`);
                from.addWaypointNeighbour(current.node, path);
            }
        }
        else
        {
            current.node.all_neighbours.forEach(node =>
            {
                if (current && unvisited_nodes.has(node))
                {
                    let blocked = false;

                    if (!current.node.portal_neighbours.has(node))
                    {
                        for (const blockade of get(blockades))
                        {
                            if (blockade.obstructsConnection({a: current.node, b: node}))
                            {
                                console.log("BLOCKED");
                                blocked = true;
                                return;
                            }
                        }
                    }

                    const current_distance = current.distance.value();
                    const other_distance = node.distance_note.value();
                    const distance_between = current.node.distanceToPosition(node);
    
                    if ((current_distance + distance_between) < other_distance)
                    {
                        node.distance_note.set(current_distance + distance_between);
                        pending_steps.add(new PathStep(node, current, new Distance(current_distance + distance_between)));
                    }
                }
            });
        }

        unvisited_nodes.delete(current.node);

        current = pending_steps.shift();
        
        if (current && current.distance.value() === Infinity)
        {
            break;
        }
    }

    return;
}
