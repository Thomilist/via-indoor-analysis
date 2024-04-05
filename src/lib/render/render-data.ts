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



import type { ControlMapNode, MapNode, NodeRelation } from "$lib/map-graph/node";
import type { Route } from "$lib/map-graph/route";


export type NodeRenderData =
{
    node: MapNode,
    dimmed: boolean,
    rotation: number
};


export type NodeHighlightRenderData =
{
    node: MapNode
};


export type ControlNodeCenterRenderData =
{
    control: ControlMapNode
};


export type ConnectionRenderData =
{
    a: MapNode,
    b: MapNode,
    dimmed: boolean,
    highlighted: boolean,
    relation: NodeRelation
};


export type CourseLegRenderData =
{
    a: ControlMapNode,
    b: ControlMapNode
};


export type ControlNumberRenderData =
{
    control: ControlMapNode
};


export class RouteSegmentRenderData
{
    nodes: MapNode[] = [];
    routes: Route[] = [];
    highlighted: boolean = false;
    dimmed: boolean = false;
};


export type RouteJunctionRenderData =
{
    node: MapNode,
    highlighted: boolean,
    dimmed: boolean
};
