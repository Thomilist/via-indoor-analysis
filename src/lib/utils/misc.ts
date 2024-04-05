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



import { ControlMapNode, type MapNode } from "$lib/map-graph/node";
import { courses, map_graph } from "$lib/state";
import { get } from "svelte/store";
import { Vector, type Point } from "./vector";
import type { RouteSegmentRenderData } from "$lib/render/render-data";


export function isArrayOfNumbers(value: any): value is number[]
{
    return true
        && Array.isArray(value)
        && value.every(item => typeof item === "number");
}


export function groupIncludesOther<Group extends T[] | Set<T> | Map<any, T>, T extends any>(group: Group, other: Group)
{
    const group_array = [...group];
    const other_array = [...other];
    
    return other_array.every(item => group_array.includes(item));
}


export function deleteNode(node: MapNode)
{
    if (node instanceof ControlMapNode)
    {
        get(courses).forEach(course =>
        {
            while (course.removeControl(node))
            { }
        });
    }
    
    get(map_graph).deleteNode(node);
    node.dropFromNeighbours();
}


export function numberRangeMapping(value: number, min1: number, max1: number, min2: number, max2: number)
{
    return (value - min1) / (max1 - min1) * (max2 - min2) + min2;
}


export function directionChange(points: { a: Point, b: Point, c: Point })
{
    const first = new Vector({ a: points.a, b: points.b });
    const second = new Vector({ a: points.b, b: points.c });

    return second.directionXY() - first.directionXY();
}


export function isUturn(points: { a: Point, b: Point, c: Point }, tolerance?: number)
{
    return Math.cos(directionChange(points)) < (tolerance ?? -0.3);
}


export function radiusFromArc(chord_length: number, arc_height: number)
{
    return ((chord_length ** 2) / (8 * arc_height) + (arc_height / 2));
}


export function powSelf(x: number, n: number)
{
    for (let index = 0; index < n; index++)
    {
        x = x ** x;
    }

    return x;
}


export function averageHeight(points: Point[])
{
    const total_height = points.reduce((sum, point) =>
    {
        return sum + point.z;
    }, 0);

    return total_height / points.length;
}


export function isPortalRouteSegment(segment: RouteSegmentRenderData)
{
    return (segment.nodes.length === 2 && segment.nodes[0].portal_neighbours.has(segment.nodes[1])) ? true : false;
}
