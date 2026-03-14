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

import type { Blockade } from "$lib/map-graph/blockade";
import { BlockadeMapNode, type MapNode } from "$lib/map-graph/node";
import { isBlocked } from "$lib/pathfinding/check-blockades";

export class StronglyConnectedComponents
{
    #blockades: Blockade[];
    #inbound_neighbours: Map<MapNode, Set<MapNode>> = new Map();
    #components: Map<MapNode, Set<MapNode>> = new Map();
    #visited: Set<MapNode> = new Set();
    #assignment_list: MapNode[] = [];

    constructor( nodes: MapNode[], blockades: Blockade[] )
    {
        this.#blockades = blockades;
        const relevant_nodes: MapNode[] = nodes.filter( node => !BlockadeMapNode.isBlockadeMapNode( node ) );
        relevant_nodes.forEach( node => this.#map_inbound_neighbours_from( node ) );
        relevant_nodes.forEach( node => this.#visit( node ) );
        this.#assignment_list.findLast( node => this.#assign( node ) );
    }

    [Symbol.iterator]()
    {
        return this.#components.values();
    }

    components()
    {
        return this.#components;
    }

    #map_inbound_neighbours_from( node: MapNode )
    {
        for ( const neighbour of node.all_neighbours )
        {
            if ( isBlocked( this.#blockades, { a: neighbour, b: node } ) )
            {
                continue;
            }

            if ( !this.#inbound_neighbours.has( node ) )
            {
                this.#inbound_neighbours.set( node, new Set() );
            }

            this.#inbound_neighbours.get( node )?.add( neighbour );
        }
    }

    #visit( node: MapNode )
    {
        const stack: MapNode[] = [];

        for ( let current: MapNode | undefined = node; current != undefined; current = stack.pop() )
        {
            if ( this.#visited.has( current ) )
            {
                continue;
            }

            this.#visited.add( current );

            let all_neighbours_visited = true;

            for ( const neighbour of current.all_neighbours )
            {
                if ( isBlocked( this.#blockades, { a: current, b: neighbour } ) )
                {
                    continue;
                }

                if ( !this.#visited.has( neighbour ) )
                {
                    all_neighbours_visited = false;
                    stack.push( neighbour );
                }
            }

            if ( all_neighbours_visited )
            {
                this.#assignment_list.push( current );
            }
        }
    }

    #assign( root: MapNode )
    {
        const stack: MapNode[] = [];

        for ( let current: MapNode | undefined = root; current != undefined; current = stack.pop() )
        {
            if ( this.#components.values().find( nodes => nodes.has( current ) ) )
            {
                continue;
            }

            if ( !this.#components.has( root ) )
            {
                this.#components.set( root, new Set() );
            }

            this.#components.get( root )?.add( current );

            for ( const neighbour of this.#inbound_neighbours.get( current ) ?? [] )
            {
                stack.push( neighbour );
            }
        }
    }
}