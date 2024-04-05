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



import { ControlMapNode, WaypointMapNode } from "$lib/map-graph/node";
import type { Path } from "$lib/map-graph/path";
import { Route, RouteStep } from "$lib/map-graph/route";
import { courses, map_graph } from "$lib/state";
import { Distance } from "$lib/utils/distance";
import { isUturn } from "$lib/utils/misc";
import { arrayPairEqualContent } from "$lib/utils/pairs";
import { SortedSet } from "$lib/utils/sorted-set";
import { get } from "svelte/store";


export function findRoutes()
{
    console.log("Finding routes...");
    const start_time = Date.now();

    const completed_legs: Map<ControlMapNode, Set<ControlMapNode>> = new Map();
    
    const all_controls = get(map_graph).nodes.filter(node => ControlMapNode.isControlMapNode(node)) as ControlMapNode[];
    all_controls.forEach(control => findControlNeighbours(control));

    get(courses).forEach((course, index, courses) =>
    {
        console.log(`Finding routes for course "${course.name}"... (${index + 1}/${courses.length})`);

        const controls = course.segment("start", "finish");

        if (controls.length < 2) { return; }

        for (let index = 1; index < controls.length; index++)
        {
            const from = controls[index - 1];
            const to = controls[index];

            const from_label = index - 1 === 0 ? "S" : `${index - 1}`;
            const to_label = index === controls.length - 1 ? "F" : `${index}`;

            if (completed_legs.get(from)?.has(to))
            {
                console.log(`[${from_label}-${to_label}] Routes already found, skipping... (${index}/${controls.length - 1})`);
                continue;
            }
            
            console.log(`[${from_label}-${to_label}] Finding routes... (${index}/${controls.length - 1})`);
            findRoutesForLeg(from, to);
            
            if (!completed_legs.has(from))
            {
                completed_legs.set(from, new Set());
            }

            completed_legs.get(from)?.add(to);
        }
    });

    map_graph.update(g => g);
    
    const time = Date.now() - start_time;
    console.log(`Route finding complete (${time.valueOf()} ms)`);
}


function findRoutesForLeg(from: ControlMapNode, to: ControlMapNode, distance_threshold?: number)
{
    if (from === to) { return; }
    if (!from.control_neighbours.has(to)) { return; }
    
    const applied_distance_threshold = distance_threshold ?? 2;
    const shortest_routes: Route[] = [];
    const shortest_route_candidates: SortedSet<Route> = new SortedSet(Route.sortByDistance);
    const first_shortest_route = findShortestRoute(from, to);

    if (first_shortest_route)
    {
        console.log(`Found shortest route (${Math.round(first_shortest_route.distance.value())} m)`);
        shortest_routes.push(first_shortest_route);
    }
    else
    {
        return;
    }

    while (true)
    {
        const paths_to_exclude: Set<Path> = new Set();
        const waypoints_to_exclude: Set<WaypointMapNode> = new Set();
        const last_shortest_route = shortest_routes[shortest_routes.length - 1];

        last_shortest_route.paths.forEach((excluded_path, excluded_index) =>
        {
            const root_route_paths = last_shortest_route.paths.toSpliced(excluded_index);
            
            shortest_routes.forEach(short_route =>
            {
                if (arrayPairEqualContent(root_route_paths, short_route.paths.toSpliced(excluded_index)))
                {
                    const path_to_exclude = short_route.paths.at(excluded_index);

                    if (path_to_exclude)
                    {
                        paths_to_exclude.add(path_to_exclude);
                    }
                }
            });

            root_route_paths.forEach(path =>
            {
                const waypoint_to_exlude = path.nodes.at(0);

                if (WaypointMapNode.isWaypointMapNode(waypoint_to_exlude))
                {
                    waypoints_to_exclude.add(waypoint_to_exlude);
                }
            });
            
            const branch_waypoint = excluded_path.waypoints.at(0);

            if (!branch_waypoint)
            {
                return;
            }

            const root_route = new Route();
            root_route_paths.forEach(path => root_route.push(path));
            
            const next_shortest_route_branch = findShortestRoute(branch_waypoint, to, { last_path: root_route_paths.at(-1), excluded_paths: paths_to_exclude, excluded_waypoints: waypoints_to_exclude });

            if (next_shortest_route_branch)
            {
                const next_shortest_route = last_shortest_route.createBranched(next_shortest_route_branch);

                if ((!shortest_routes.some(route => route.isEqual(next_shortest_route))) &&
                    (next_shortest_route.distance.value() < applied_distance_threshold * shortest_routes[0].distance.value()))
                {
                    shortest_route_candidates.add(next_shortest_route);
                }
            }

            paths_to_exclude.clear();
            waypoints_to_exclude.clear();
        });

        const best_candidate = shortest_route_candidates.shift();

        if (best_candidate)
        {
            console.log(`Found next shortest route (${Math.round(best_candidate.distance.value())} m)`);
            shortest_routes.push(best_candidate);
        }
        else
        {
            break;
        }
        
        shortest_route_candidates.elements.splice(shortest_route_candidates.elements.length / 2);
    }

    from.control_neighbours.set(to, shortest_routes);
}


function findShortestRoute(from: WaypointMapNode, to: WaypointMapNode, branching?: { last_path?: Path, excluded_paths: Set<Path>, excluded_waypoints: Set<WaypointMapNode> })
{
    const unvisited_waypoints: Set<WaypointMapNode> = new Set();
    
    get(map_graph).nodes.forEach(node =>
    {
        if (WaypointMapNode.isWaypointMapNode(node) && node !== from && (!branching || !branching.excluded_waypoints.has(node)))
        {
            node.distance_note.set(Infinity);
            unvisited_waypoints.add(node);
        }
    });

    const pending_steps = new SortedSet(RouteStep.sortByDistance);
    let current: RouteStep | undefined = new RouteStep(from, null, new Distance());

    while (current)
    {
        if (current.waypoint === to)
        {
            return current.buildRoute();
        }
        
        current.waypoint.waypoint_neighbours.forEach((paths, waypoint) =>
        {
            if (current)
            {
                // Must be unvisited.
                if (!unvisited_waypoints.has(waypoint)) { return; }

                // Controls are not placed to indicate distinct route choices, so disregard them.
                if (waypoint !== to && waypoint instanceof ControlMapNode) { return; }

                // Don't make use of excluded paths and waypoints (obviously).
                if (branching && (branching.excluded_paths.has(paths[0]) || branching.excluded_waypoints.has(waypoint))) { return; }

                // Taking a waypoint just to turn around and go back is not useful,
                // but can happen if different neighbouring MapNodes are in close angular proximity.
                if (current.parent || branching?.last_path)
                {
                    const last_node = current.parent
                        ? current.parent.waypoint.shortestPath(current.waypoint)?.nodes.at(-2)
                        : branching?.last_path?.nodes.at(-2);
                    const next_node = current.waypoint.shortestPath(waypoint)?.nodes.at(1);

                    if (last_node && next_node
                        && !last_node.portal_neighbours.has(current.waypoint)
                        && !current.waypoint.portal_neighbours.has(next_node)
                        && isUturn({ a: last_node, b: current.waypoint, c: next_node })) { return; }
                }
                
                const current_distance = current.distance.value();
                const other_distance = waypoint.distance_note.value();
                const distance_between = current.waypoint.shortestPath(waypoint)?.distance.value() ?? Infinity;
                
                if ((current_distance + distance_between) < other_distance)
                {
                    waypoint.distance_note.set(current_distance + distance_between);
                    pending_steps.add(new RouteStep(waypoint, current, new Distance(current_distance + distance_between)));
                }
            }
        });

        unvisited_waypoints.delete(current.waypoint);
        
        current = pending_steps.shift();

        if (current && current.distance.value() === Infinity)
        {
            break;
        }
    }

    return;
}


function findControlNeighbours(control: ControlMapNode)
{
    // Clear old relations.
    control.control_neighbours.clear()

    // Find new relations.
    const connected_waypoints: Set<WaypointMapNode> = new Set();
    findConnectedWaypoints(connected_waypoints, control);

    for (const waypoint of connected_waypoints)
    {
        if (ControlMapNode.isControlMapNode(waypoint) && waypoint !== control)
        {
            control.control_neighbours.set(waypoint, []);
        }
    }
}


function findConnectedWaypoints(connected_waypoints: Set<WaypointMapNode>, next_waypoint: WaypointMapNode)
{
    for (const waypoint of next_waypoint.waypoint_neighbours.keys())
    {
        if (!connected_waypoints.has(waypoint))
        {
            connected_waypoints.add(waypoint);
            findConnectedWaypoints(connected_waypoints, waypoint);
        }
    }

    return;
}
