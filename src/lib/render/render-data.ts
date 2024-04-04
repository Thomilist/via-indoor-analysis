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
