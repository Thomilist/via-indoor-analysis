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
import { BlockadeMapNode } from "$lib/map-graph/node";
import { blockades, map_graph } from "$lib/state";
import { get } from "svelte/store";

export function updateBlockades()
{
    console.log( "Updating blockades..." );

    blockades.set( [] );

    const blockade_nodes = new Set<BlockadeMapNode>( get( map_graph )
        .nodes
        .filter( node => BlockadeMapNode.isBlockadeMapNode( node ) ) );

    while ( blockade_nodes.size > 0 )
    {
        const blockade_node = blockade_nodes.values().next().value;

        if ( !blockade_node )
        {
            break;
        }

        blockade_node.normal_neighbours.forEach( node =>
        {
            get( blockades )
                .push( new Blockade( blockade_node, node, "normal" ) );
        } );

        blockade_node.portal_neighbours.forEach( node =>
        {
            get( blockades )
                .push( new Blockade( blockade_node, node, "directional" ) );
        } );

        blockade_nodes.delete( blockade_node );
    }
}