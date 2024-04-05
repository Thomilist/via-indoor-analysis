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
import { isArrayOfNumbers } from "$lib/utils/misc";
import { isPoint, type Point } from "$lib/utils/vector";
import { Path } from "./path";
import { Route } from "./route";


export class MapNode
{
    static next_id = 0;
    id: number;

    x: number;
    y: number;
    z: number;

    static node_relations: NodeRelation[] = ["Normal", "Portal"] as const;

    all_neighbours: Set<MapNode> = new Set();
    normal_neighbours: Set<MapNode> = new Set();
    portal_neighbours: Set<MapNode> = new Set();

    visible: boolean = false;
    hovered: boolean = false;
    selected: boolean = false;

    interact_range: number = 10;
    
    distance_note: Distance = new Distance(Infinity);

    constructor(id: number, position: Partial<Point>)
    {
        this.id = id;
        this.x = position.x ?? 0;
        this.y = position.y ?? 0;
        this.z = position.z ?? 0;
    }

    static isMapNode(value: any): value is MapNode
    {
        return value instanceof MapNode;
    }

    toJSON(): MapNodeJSON
    {
        return {
            type: this.nodeType(),
            id: this.id,
            position:
            {
                x: this.x,
                y: this.y,
                z: this.z
            },
            normal_neighbours: [...this.normal_neighbours].map(node => node.id),
            portal_neighbours: [...this.portal_neighbours].map(node => node.id)
        };
    }

    nodeType(): MapNodeName
    {
        return this instanceof FinishControlMapNode ?
            "Finish" :
        this instanceof StartControlMapNode ?
            "Start" :
        this instanceof ControlMapNode ?
            "Control" :
        this instanceof WaypointMapNode ?
            "Waypoint" :
            "Normal";
    }

    dropFromNeighbours()
    {
        this.all_neighbours.forEach(neighbour =>
        {
            neighbour.all_neighbours.delete(this);
            neighbour.normal_neighbours.delete(this);
            neighbour.portal_neighbours.delete(this);
        });
    }

    connect(other: MapNode, relation: NodeRelation)
    {
        if (this.all_neighbours.has(other)) { return; }

        this.disconnect(other);

        this.all_neighbours.add(other);
        other.all_neighbours.add(this);

        switch (relation)
        {
            case "Normal":
            {
                this.normal_neighbours.add(other);
                other.normal_neighbours.add(this);
                break;
            }
            case "Portal":
            {
                this.portal_neighbours.add(other);
                other.portal_neighbours.add(this);
                break;
            }
        }
    }

    disconnect(other: MapNode)
    {
        this.all_neighbours.delete(other);
        this.normal_neighbours.delete(other);
        this.portal_neighbours.delete(other);
        other.all_neighbours.delete(this);
        other.normal_neighbours.delete(this);
        other.portal_neighbours.delete(this);
    }

    distanceToPosition(position: { x: number, y: number })
    {
        if (position instanceof MapNode && this.portal_neighbours.has(position))
        {
            return 0;
        }
        
        return Math.sqrt((position.x - this.x) ** 2 + (position.y - this.y) ** 2)
    }

    directionToPosition(position: { x: number, y: number })
    {
        return Math.atan2(position.y - this.y, position.x - this.x);
    }

    elevationToPosition(position: { z: number })
    {
        return position.z - this.z;
    }
    
    hasNeighbour(maybe_neighbour: { node: MapNode, relation: NodeRelation })
    {
        switch (maybe_neighbour.relation)
        {
            case "Normal": return this.normal_neighbours.has(maybe_neighbour.node);
            case "Portal": return this.portal_neighbours.has(maybe_neighbour.node);
        }
    }
}


export class WaypointMapNode extends MapNode
{
    waypoint_neighbours: Map<WaypointMapNode, Path[]> = new Map();
    
    static isWaypointMapNode(value: any): value is WaypointMapNode
    {
        return value instanceof WaypointMapNode;
    }

    addWaypointNeighbour(waypoint: WaypointMapNode, path: Path)
    {
        const neighbour = this.waypoint_neighbours.get(waypoint);
        
        if (!neighbour)
        {
            this.waypoint_neighbours.set(waypoint, [path]);
        }
        else
        {
            neighbour.push(path);
        }
    }

    shortestPath(waypoint: WaypointMapNode)
    {
        return this.waypoint_neighbours.get(waypoint)?.sort(Path.sortByDistance).at(0);
    }

    deadEndDistance(exclude?: WaypointMapNode)
    {
        const dead_end_distance = new Distance();

        if (this.waypoint_neighbours.size === 0) { return dead_end_distance; }

        const relevant_neighbour_count = this.waypoint_neighbours.size - (exclude && this.waypoint_neighbours.has(exclude) ? 1 : 0);

        if (relevant_neighbour_count === 1)
        {
            this.waypoint_neighbours.forEach((paths, waypoint) =>
            {
                if (waypoint !== exclude)
                {
                    dead_end_distance.add(waypoint.deadEndDistance(this))
                }
            });
        }
        else
        {
            const shared_path = new Path();
            const next_nodes: Set<MapNode> = new Set();

            let index = 0;

            while (true)
            {
                this.waypoint_neighbours.forEach((paths, waypoint) =>
                {
                    if (waypoint !== exclude)
                    {
                        const next_node = paths.at(0)?.nodes.at(index);

                        if (next_node)
                        {
                            next_nodes.add(next_node);
                        }
                    }
                });

                if (next_nodes.size === 1)
                {
                    shared_path.push([...next_nodes][0]);
                    next_nodes.clear();
                    index++;
                }
                else
                {
                    break;
                }
            }

            dead_end_distance.add(shared_path.distance);
        }

        return dead_end_distance;
    }
}


export class ControlMapNode extends WaypointMapNode
{
    control_neighbours: Map<ControlMapNode, Route[]> = new Map();
    
    static isControlMapNode(value: any): value is ControlMapNode
    {
        return value instanceof ControlMapNode;
    }

    addControlNeighbour(control: ControlMapNode, route: Route)
    {
        const neighbour = this.control_neighbours.get(control);
        
        if (!neighbour)
        {
            this.control_neighbours.set(control, [route]);
        }
        else
        {
            neighbour.push(route);
        }
    }

    shortestRoute(control: ControlMapNode)
    {
        return this.control_neighbours.get(control)?.sort(Route.sortByDistance).at(0);
    }
}


export class StartControlMapNode extends ControlMapNode
{
    static isStartControlMapNode(value: any): value is StartControlMapNode
    {
        return value instanceof StartControlMapNode;
    }
}


export class FinishControlMapNode extends ControlMapNode
{
    static isFinishControlMapNode(value: any): value is FinishControlMapNode
    {
        return value instanceof FinishControlMapNode;
    }
}


export type MapNodeConstructor = typeof MapNode;
export type WaypointMapNodeConstructor = typeof WaypointMapNode;
export type ControlMapNodeConstructor = typeof ControlMapNode;
export type StartControlMapNodeConstructor = typeof StartControlMapNode;
export type FinishControlMapNodeConstructor = typeof FinishControlMapNode;


export type AnyMapNodeConstructor
= MapNodeConstructor
| WaypointMapNodeConstructor
| ControlMapNodeConstructor
| StartControlMapNodeConstructor
| FinishControlMapNodeConstructor;


export type AnyMapNode
= InstanceType<MapNodeConstructor>
| InstanceType<WaypointMapNodeConstructor>
| InstanceType<ControlMapNodeConstructor>
| InstanceType<StartControlMapNodeConstructor>
| InstanceType<FinishControlMapNodeConstructor>;


const MapNodeNames = ["Normal", "Waypoint", "Control", "Start", "Finish"] as const;
export type MapNodeName = typeof MapNodeNames[number];
export type NodeRelation = "Normal" | "Portal";


export type MapNodeJSON =
{
    type: MapNodeName,
    id: number,
    position: Point,
    normal_neighbours: number[],
    portal_neighbours: number[]
};


export function isMapNodeJSON(obj: any): obj is MapNodeJSON
{
    return true
        && "type" in obj
        && MapNodeNames.includes(obj.type)

        && "id" in obj
        && typeof obj.id === "number"

        && "position" in obj
        && isPoint(obj.position)

        && "normal_neighbours" in obj
        && isArrayOfNumbers(obj.normal_neighbours)

        && "portal_neighbours" in obj
        && isArrayOfNumbers(obj.portal_neighbours);
}
