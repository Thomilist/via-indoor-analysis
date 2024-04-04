import type { MapNode } from "$lib/map-graph/node";
import { Route } from "$lib/map-graph/route";
import { arrayPairEqualContent } from "$lib/utils/pairs";
import { RouteSegmentRenderData } from "$lib/render/render-data";
import { NodeTraffic } from "./node-traffic";



function updateRouteSegmentDimming(segments: RouteSegmentRenderData[])
{
    if (segments.some(segment => segment.highlighted))
    {
        segments.forEach(segment => segment.dimmed = !segment.highlighted);
    }
}

// Note: All routes between same pair of controls must have same direction.
function nodeTrafficMap(routes: Route[])
{
    const node_traffic_map: Map<MapNode, NodeTraffic> = new Map();

    if (!(routes.length > 0)) { return node_traffic_map; }

    routes.forEach(route =>
    {
        const flattened_route = Route.flatten(route);

        if (flattened_route.length > 1)
        {
            for (let index = 0; index < flattened_route.length; index++)
            {
                const from = (index === 0 ? undefined : flattened_route.at(index - 1));
                const here = flattened_route[index];
                const to = flattened_route.at(index + 1);

                if (!node_traffic_map.has(here))
                {
                    node_traffic_map.set(here, new NodeTraffic(here));
                }

                if (from)
                {
                    node_traffic_map.get(here)?.addArrival(from, route);
                }

                if (to)
                {
                    node_traffic_map.get(here)?.addDeparture(to, route);
                }
            }
        }
    });
    
    return node_traffic_map;
}

function nodesUntilJunction(node_traffic_map: Map<MapNode, NodeTraffic>, last: MapNode, current: MapNode)
{
    const nodes: MapNode[] = [current];
    
    const node_traffic = node_traffic_map.get(current);

    if (node_traffic)
    {
        if (node_traffic.isLinear() && !node_traffic.jumps())
        {
            const next = [...node_traffic.departures.keys()][0];
            
            if (next)
            {
                nodes.push(...nodesUntilJunction(node_traffic_map, current, next));
            }
        }
    }

    return nodes;
}

function withoutDuplicateSegments(segments: RouteSegmentRenderData[])
{
    const source_segments = [...segments];
    const unique_segments: RouteSegmentRenderData[] = [];

    while (source_segments.length > 0)
    {
        const reference_segment = source_segments.pop();

        if (reference_segment)
        {
            for (let index = 0; index < source_segments.length; index++)
            {
                const other_segment = source_segments[index];
                
                if (arrayPairEqualContent(reference_segment.nodes, other_segment.nodes.toReversed()) || arrayPairEqualContent(reference_segment.nodes, other_segment.nodes))
                {
                    reference_segment.routes.push(...other_segment.routes);
                    source_segments.splice(index, 1);
                }
            }

            unique_segments.push(reference_segment);
        }
    }

    return unique_segments;
}

export function routeSegments(routes: Route[])
{
    const segments: RouteSegmentRenderData[] = [];
    const node_traffic_map = nodeTrafficMap(routes);

    for (const node_traffic of node_traffic_map.values())
    {
        if (node_traffic.isSource() || node_traffic.branches() || node_traffic.merges() || node_traffic.jumps())
        {
            node_traffic.departures.forEach((departure, destination) =>
            {
                const segment = new RouteSegmentRenderData();
                segment.nodes.push(node_traffic.node, ...nodesUntilJunction(node_traffic_map, node_traffic.node, destination));
                segment.routes.push(...departure.values());
                segment.highlighted = segment.routes.some(route => route.highlighted);
                segments.push(segment);
            });
        }
    }

    updateRouteSegmentDimming(segments);

    return withoutDuplicateSegments(segments);
}
