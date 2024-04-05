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
