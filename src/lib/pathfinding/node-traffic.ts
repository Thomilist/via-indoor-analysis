import type { MapNode } from "$lib/map-graph/node";
import type { Route } from "$lib/map-graph/route";

export class NodeTraffic
{
    node: MapNode;
    arrivals: Map<MapNode, Set<Route>> = new Map();
    departures: Map<MapNode, Set<Route>> = new Map();

    constructor(node: MapNode)
    {
        this.node = node;
    }

    #addTraffic(direction: "arrival" | "departure", node: MapNode, route: Route)
    {
        const traffic = direction === "arrival" ? this.arrivals : this.departures;

        if (!traffic.has(node))
        {
            traffic.set(node, new Set());
        }

        traffic.get(node)?.add(route);
    }

    addArrival(from: MapNode, along: Route)
    {
        this.#addTraffic("arrival", from, along);
    }

    addDeparture(to: MapNode, along: Route)
    {
        this.#addTraffic("departure", to, along);
    }

    merges()
    {
        return this.arrivals.size > 1;
    }

    branches()
    {
        return this.departures.size > 1;
    }

    jumps()
    {
        const routed_neighbours = [...this.arrivals.keys(), ...this.departures.keys()];
        
        return routed_neighbours.some(node =>
        {
            return this.node.portal_neighbours.has(node);
        }, this);
    }

    isSource()
    {
        return (this.arrivals.size === 0) && (this.departures.size > 0);
    }

    isSink()
    {
        return (this.arrivals.size > 0) && (this.departures.size === 0);
    }

    isLinear()
    {
        return (this.arrivals.size === 1) && (this.departures.size === 1);
    }
}