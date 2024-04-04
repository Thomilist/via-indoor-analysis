import { get } from "svelte/store";
import { course_index, courses, current_routes, map_graph, mode } from "../state";
import { ControlMapNode, WaypointMapNode } from "../map-graph/node";
import { Route } from "../map-graph/route";
import { groupIncludesOther, powSelf } from "$lib/utils/misc";
import type { Course } from "$lib/map-graph/course";
import { sequenceHasPair } from "$lib/utils/pairs";

function selectedControls()
{
    const selected_controls = get(map_graph).nodes.filter(node => (node.selected && node instanceof ControlMapNode)) as ControlMapNode[];
    
    if (get(mode) === "View" && selected_controls.length === 2)
    {
        const course = get(courses)[get(course_index)];

        if (!sequenceHasPair(course.segment("start", "finish"), { a: selected_controls[0], b: selected_controls[1] }, "direct"))
        {
            selected_controls.reverse();
        }
    }

    return selected_controls;
}

function routesBetweenControls(controls: ControlMapNode[])
{
    const routes: Route[] = [];
    
    while (controls.length > 0)
    {
        const control = controls.shift();

        if (control)
        {
            control.control_neighbours.forEach((route, control) =>
            {
                if (controls.includes(control))
                {
                    routes.push(...route);
                }
            });
        }
    }

    return routes;
}

function routeWithLeastElevation(routes: Route[])
{
    routes.sort(Route.sortByElevation);
    return routes.at(0);
}

function restoreRoute(routes: Route[], restore: Route)
{
    if (!routes.includes(restore))
    {
        routes.push(restore);
    }
}

function excludeDuplicates(routes: Route[])
{
    if (routes.length === 0) { return; }

    const unique_routes: Route[] = [];

    routes.forEach(route =>
    {
        if (!unique_routes.some(unique_route => unique_route.isEqual(route)))
        {
            unique_routes.push(route);
        }
    });

    routes.splice(0, Infinity, ...unique_routes);
}

function excludeOutliersByDistance(routes: Route[], threshold: number)
{
    if (!(routes.length > 2)) { return; }
    
    routes.sort(Route.sortByDistance);

    const middle_indexes: Set<number> = new Set();

    middle_indexes.add(Math.floor((routes.length - 1) / 2));
    middle_indexes.add(Math.ceil((routes.length - 1) / 2));

    const median_distance = [...middle_indexes]
        .map(index => routes[index].distance.value())
        .reduce((sum, current) => { return sum + current}, 0)
        / middle_indexes.size;
    
    for (let index = 0; index < routes.length; index++)
    {
        if (routes[index].distance.value() > (threshold * median_distance))
        {
            routes.splice(index);
            break;
        }
    }
}

// If all waypoints of one route are also in another, exclude the longer route.
function excludeBasicDetours(routes: Route[])
{
    if (routes.length === 0) { return; }

    const waypoint_sequences = routes.map(route =>
    {
        const waypoint_sequence: Set<WaypointMapNode> = new Set();

        route.paths.forEach(path =>
        {
            path.nodes.forEach(node =>
            {
                if (node instanceof WaypointMapNode)
                {
                    waypoint_sequence.add(node);
                }
            });
        });

        return { route: route, waypoints: waypoint_sequence };
    });

    while (waypoint_sequences.length > 0)
    {
        const reference_sequence = waypoint_sequences.pop();

        if (!reference_sequence) { break; }

        let index = 0;
        
        while (index < waypoint_sequences.length)
        {
            const other_sequence = waypoint_sequences[index];
            
            if (groupIncludesOther(reference_sequence.waypoints, other_sequence.waypoints))
            {
                const route_index = reference_sequence.route.distance.lessThan(other_sequence.route.distance)
                    ? routes.indexOf(other_sequence.route)
                    : routes.indexOf(reference_sequence.route);

                if (route_index !== -1)
                {
                    routes.splice(route_index, 1);
                }

                break;
            }
            else if (groupIncludesOther(other_sequence.waypoints, reference_sequence.waypoints))
            {
                const route_index = reference_sequence.route.distance.lessThan(other_sequence.route.distance)
                    ? routes.indexOf(other_sequence.route)
                    : routes.indexOf(reference_sequence.route);

                if (route_index !== -1)
                {
                    routes.splice(route_index, 1);
                }
            }

            index++;
        }
    }
}

// If route X includes waypoint A from route Y and waypoint B from route Z,
// but neither Y nor Z have both A and B, and route X is longer than Y and Z,
// then discard route X.
function excludeCrossoverDetours(routes: Route[])
{
    if (routes.length < 3) { return; }

    routes.sort(Route.sortByDistance);

    // Find the routes each waypoint is used in.
    const waypoint_usage: Map<WaypointMapNode, Set<Route>> = new Map();

    routes.forEach(route =>
    {
        route.paths.forEach(path =>
        {
            path.waypoints.forEach(waypoint =>
            {
                if (!waypoint_usage.has(waypoint))
                {
                    waypoint_usage.set(waypoint, new Set());
                }

                waypoint_usage.get(waypoint)?.add(route);
            });
        });
    });

    // Filter crossovers.

    // Routes are sorted by distance. Starting at index 2 and comparing to pairs of routes before 2
    // means only longer crossover routes are discarded.
    let index_X = 2;
    let match_Y = false;
    let match_Z = false;

    while (index_X < routes.length)
    {
        for (let index_Y = 0; (!(match_Y && match_Z) && (index_Y < (index_X - 1))); index_Y++)
        {
            for (let index_Z = index_Y + 1; (!(match_Y && match_Z) && (index_Z < index_X)); index_Z++)
            {
                match_Y = false;
                match_Z = false;

                const route_X = routes[index_X];
                const route_Y = routes[index_Y];
                const route_Z = routes[index_Z];

                for (const [waypoint, in_routes] of waypoint_usage)
                {
                    // Waypoint in X... and in Y xor Z.
                    if (in_routes.has(route_X))
                    {
                        match_Y ||= (in_routes.has(route_Y) && !in_routes.has(route_Z));
                        match_Z ||= (!in_routes.has(route_Y) && in_routes.has(route_Z));

                        if (match_Y && match_Z) { break; }
                    }
                }
            }
        }

        if (match_Y && match_Z)
        {
            routes.splice(index_X, 1);
        }
        else
        {
            index_X++;
        }
    }
}

// Exclude pointlessly long routes.
// For routes with equal elevation gain:
// threshold = (distance of longest included route) / (distance of shortest route)
// For long routes with extra elevation, the threshold is reduced for every floor extra.
function filterByDistance(routes: Route[], threshold: number)
{
    if (routes.length === 0) { return; }

    routes.sort(Route.sortByDistance);
    const shortest_route = routes[0];
    const mandatory_distance = shortest_route.mandatoryDistance();

    const filtered_routes = routes.filter(route =>
    {
        const adjusted_threshold = 1 + (threshold - 1) ** (((1 + route.elevation_gain) / (1 + shortest_route.elevation_gain)) ** 2);
        return (route.distance.value() - mandatory_distance.value()) < (adjusted_threshold * (shortest_route.distance.value() - mandatory_distance.value()));
    });

    routes.splice(0, Infinity, ...filtered_routes);
}

// Exclude very similar routes, keeping only the shortest variant.
function filterBySameness(routes: Route[], max_sameness: number)
{
    if (routes.length === 0) { return; }
    
    routes.sort(Route.sortByDistance);
    const shortest_route = routes[0];
    const mandatory_distance = shortest_route.mandatoryDistance().value();

    let index = 1;

    while (index < routes.length)
    {
        const current_route = routes[index];
        let filtered = false;

        for (const shorter_route of routes)
        {
            if (shorter_route === current_route) { break; }
            
            const extra_elevation_gain = current_route.elevation_gain > shortest_route.elevation_gain
                ? current_route.elevation_gain - shortest_route.elevation_gain
                : 0;

            const shortest_distance = shortest_route.distance.value() - mandatory_distance;
            const shared_distance = Route.sharedDistance(shorter_route, current_route).value() - mandatory_distance;
            const sameness = shared_distance / (shorter_route.distance.value() - mandatory_distance);
            const detour_ratio = (current_route.distance.value() - mandatory_distance) / (shortest_distance);
            const short_leg_detour_penalty = [20, 25].reduce((penalty, threshold) => { return Math.round(threshold / shortest_distance) + penalty; }, 0);
            const weighted_max_sameness = 0.95 ** (1.3 * powSelf(detour_ratio, (1 + 2 * extra_elevation_gain + 2 * short_leg_detour_penalty)));

            if (sameness > Math.min(max_sameness, weighted_max_sameness))
            {
                routes.splice(index, 1);
                filtered = true;
                break;
            }
        }

        if (!filtered)
        {
            index++;
        }
    }
}

function useRoutes(routes: Route[])
{
    routes.sort(Route.sortByDistance);
    routes.forEach((route, index) => route.updateColour(index));
    current_routes.set(routes);
}

export function fetchRoutes()
{
    const selected_controls = selectedControls();
    const routes = routesBetweenControls(selected_controls);

    const least_elevation = routeWithLeastElevation(routes);

    if (!least_elevation) { return []; }

    excludeDuplicates(routes);
    excludeOutliersByDistance(routes, 1.2);
    excludeBasicDetours(routes);
    filterByDistance(routes, 1.7);
    filterBySameness(routes, 0.5);
    excludeCrossoverDetours(routes);

    restoreRoute(routes, least_elevation);

    useRoutes(routes);
    return routes;
}

export function findShortestRoute(course: Course)
{
    course.distance.set(0);
    course.elevation_gain = 0;
    const controls = course.segment("start", "finish");
    const shortest_route_choices: Route[] = [];

    for (let index = 1; index < controls.length; index++)
    {
        const routes = routesBetweenControls(controls.slice(index - 1, index + 1));

        if (routes.length === 0) { return; }

        routes.sort(Route.sortByDistance);
        course.distance.add(routes[0].distance);
        course.elevation_gain += routes[0].elevation_gain;
        shortest_route_choices.push(routes[0]);
    }

    return shortest_route_choices;
}
