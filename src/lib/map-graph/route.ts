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



import { Distance } from "$lib/utils/distance";
import { arrayPairEqualContent, sequenceHasPair } from "$lib/utils/pairs";
import { get } from "svelte/store";
import { ControlMapNode, MapNode, WaypointMapNode } from "./node";
import type { Path } from "./path";
import { via_map } from "$lib/state";


const route_colours =
[
    "blue",
    "red",
    "green",
    "cyan",
    "mediumpurple",
    "deeppink",
    "yellowgreen",
    "skyblue",
    "olive"
];


export class Route
{
    static #next_id = 0;
    id: number;

    from: WaypointMapNode | null;
    to: WaypointMapNode | null;

    paths: Path[];

    distance: Distance = new Distance(0, "m");
    elevation_gain: number = 0;

    colour: string = "gray";
    highlighted: boolean = false;

    constructor(other?: Route)
    {
        this.id = Route.#next_id++;
        this.from = other ? other.from : null;
        this.to = other ? other.to : null;
        this.paths = other ? [...other.paths] : [];
        this.#measure();
    }

    static shortest(routes: Route[])
    {
        if (routes.length > 0)
        {
            const shortest_routes = [...routes];

            shortest_routes.sort(Route.sortByDistance);
            const shortest_distance = shortest_routes[0].distance;
            const longer_route_index = shortest_routes.findIndex(route => route.distance.greaterThan(shortest_distance));

            if (longer_route_index !== -1)
            {
                shortest_routes.splice(longer_route_index);
            }

            shortest_routes.sort(Route.sortByElevation);
            const least_elevation = shortest_routes[0].elevation_gain;
            const steeper_route_index = shortest_routes.findIndex(route => route.elevation_gain > least_elevation);

            if (steeper_route_index !== -1)
            {
                shortest_routes.splice(steeper_route_index);
            }

            return shortest_routes;
        }
        
        return [];
    }

    static leastElevation(routes: Route[])
    {
        if (routes.length > 0)
        {
            const flattest_routes = [...routes];

            flattest_routes.sort(Route.sortByElevation);
            const least_elevation = flattest_routes[0].elevation_gain;
            const steeper_route_index = flattest_routes.findIndex(route => route.elevation_gain > least_elevation);
            
            if (steeper_route_index !== -1)
            {
                flattest_routes.splice(steeper_route_index)
            }

            flattest_routes.sort(Route.sortByDistance);
            const shortest_distance = flattest_routes[0].distance;
            const longer_route_index = flattest_routes.findIndex(route => route.distance.greaterThan(shortest_distance));

            if (longer_route_index !== -1)
            {
                flattest_routes.splice(longer_route_index);
            }

            return flattest_routes;
        }
        
        return [];
    }

    static sharedDistance(a: Route, b: Route)
    {
        let pixel_distance = 0;

        const flat_a = Route.flatten(a);
        const flat_b = Route.flatten(b);
        
        for (let index = 1; index < flat_a.length; index++)
        {
            const first = flat_a[index - 1];
            const second = flat_a[index];

            if (sequenceHasPair(flat_b, { a: first, b: second }, "direct"))
            {
                pixel_distance += first.distanceToPosition(second);
            }
        }

        return get(via_map).mapPixelsToDistance(pixel_distance, "measure");
    }

    static sortByDistance(a: Route, b: Route)
    {
        return a.distance.value() - b.distance.value();
    }

    static sortByElevation(a: Route, b: Route)
    {
        const elevation_comparison = a.elevation_gain - b.elevation_gain;
        return elevation_comparison === 0 ? Route.sortByDistance(a, b) : elevation_comparison;
    }

    static flatten(route: Route)
    {
        const flattened_route: Set<MapNode> = new Set();
    
        route.paths.forEach(path =>
        {
            path.nodes.forEach(node =>
            {
                flattened_route.add(node);
            });
        });
    
        return [...flattened_route];
    }

    #measure()
    {
        this.distance.set(0);
        this.elevation_gain = 0;

        for (const path of this.paths)
        {
            this.distance.add(path.distance);
            this.elevation_gain += path.elevation_gain;
        }
    }

    push(path: Path)
    {
        this.paths.push(path);

        if (path.to instanceof WaypointMapNode)
        {
            this.to = path.to;
        }

        if (this.paths.length === 1 && path.from instanceof WaypointMapNode)
        {
            this.from = path.from;
        }
        
        this.#measure();
    }

    pop()
    {
        const popped = this.paths.pop();

        if (this.paths.length === 0)
        {
            this.from = null;
            this.to = null;
        }
        else if (popped?.from instanceof WaypointMapNode)
        {
            this.to = popped.from;
        }

        this.#measure();
    }

    isEqual(other: Route)
    {
        return arrayPairEqualContent(this.paths, other.paths);
    }

    updateColour(index: number)
    {
        this.colour = (route_colours.at(index) ?? "gray");
    }

    createBranched(branch: Route)
    {
        const branched_route = new Route();

        for (const path of this.paths)
        {
            if (path.from !== null && path.from === branch.paths.at(0)?.from)
            {
                branch.paths.forEach(branch_path =>
                {
                    branched_route.push(branch_path);
                });

                return branched_route;
            }

            branched_route.push(path);
        }

        return branched_route;
    }

    mandatoryDistance()
    {
        return new Distance().add(this.from?.deadEndDistance() ?? 0).add(this.to?.deadEndDistance() ?? 0);
    }
}


export class RouteStep
{
    waypoint: WaypointMapNode;
    parent: RouteStep | null;
    distance: Distance;

    constructor(waypoint: WaypointMapNode, parent: RouteStep | null, distance: Distance)
    {
        this.waypoint = waypoint;
        this.parent = parent;
        this.distance = new Distance(distance);
    }

    static sortByDistance(a: RouteStep, b: RouteStep)
    {
        return a.distance.value() - b.distance.value();
    }

    hasSeen(waypoint: WaypointMapNode): boolean
    {
        if (this.waypoint === waypoint)
        {
            return true;
        }
        else if (this.parent === null)
        {
            return false;
        }
        else
        {
            return this.parent.hasSeen(waypoint);
        }
    }

    buildRoute()
    {
        if (!parent || !(this.waypoint instanceof ControlMapNode))
        {
            return;
        }

        const waypoints: WaypointMapNode[] = [];

        let last_step: RouteStep | null = this;

        while (last_step)
        {
            waypoints.push(last_step.waypoint);
            last_step = last_step.parent;
        }

        const route = new Route();
        let current_waypoint = waypoints.pop();
        let next_waypoint = waypoints.pop();

        while (current_waypoint && next_waypoint)
        {
            const path = current_waypoint.shortestPath(next_waypoint);
            
            if (path)
            {
                route.push(path);
            }
            else
            {
                return;
            }

            current_waypoint = next_waypoint;
            next_waypoint = waypoints.pop();
        }

        return route;
    }
}
