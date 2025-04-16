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
import { via_map } from "$lib/state";
import { get } from "svelte/store";
import { MapNode, WaypointMapNode, type NodeRelation } from "./node";


export class Path
{
    distance: Distance = new Distance(0, "m");
    elevation_gain: number = 0;

    from: MapNode | null;
    to: MapNode | null;

    nodes: MapNode[];
    waypoints: WaypointMapNode[];

    constructor(other?: Path)
    {
        this.from = other ? other.from : null;
        this.to = other ? other.to : null;
        this.nodes = other ? [...other.nodes] : [];
        this.waypoints = other ? [...other.waypoints] : [];
        this.#measure();
    }

    static sortByDistance(a: Path, b: Path)
    {
        return a.distance.value("m") - b.distance.value("m");
    }

    static sortByElevation(a: Path, b: Path)
    {
        const elevation_comparison = a.elevation_gain - b.elevation_gain;
        return elevation_comparison === 0 ? Path.sortByDistance(a, b) : elevation_comparison;
    }

    #measure()
    {
        if (this.nodes.length > 1)
        {
            let pixel_distance = 0;
            this.elevation_gain = 0;

            const segments = this.segments();

            for (const segment of segments)
            {
                for (let index = 1; index < segment.nodes.length; index++)
                {
                    const a = segment.nodes[index - 1];
                    const b = segment.nodes[index];

                    const elevation_change = a.elevationToPosition(b);

                    if (elevation_change > 0)
                    {
                        this.elevation_gain += a.elevationToPosition(b);
                    }

                    if (segment.type === "Normal")
                    {
                        pixel_distance += a.distanceToPosition(b);
                    }
                }
            }

            this.distance.set(get(via_map).mapPixelsToDistance(pixel_distance, "measure"));
        }
        else
        {
            this.distance.set(0, "m");
            this.elevation_gain = 0;
        }
    }

    push(node: MapNode)
    {
        this.nodes.push(node);

        if (node instanceof WaypointMapNode)
        {
            this.waypoints.push(node);
        }

        this.to = node;

        if (this.nodes.length === 1)
        {
            this.from = node;
        }

        this.#measure();
    }

    pop()
    {
        const popped = this.nodes.pop();

        if (popped instanceof WaypointMapNode)
        {
            this.waypoints.pop();
        }

        if (this.nodes.length === 0)
        {
            this.from = null;
            this.to = null;
        }
        else
        {
            this.to = this.nodes.at(-1) ?? null;
        }

        this.#measure();
    }

    segments()
    {
        if (this.nodes.length > 1)
        {
            const segments: { nodes: MapNode[], type: NodeRelation }[] = [];

            let index = 1;

            while (index < this.nodes.length)
            {
                for (const relation of MapNode.node_relations)
                {
                    const segment_nodes: MapNode[] = [];
                    
                    while (index < this.nodes.length && this.nodes[index - 1].hasNeighbour({ node: this.nodes[index], relation: relation }))
                    {
                        if (segment_nodes.length === 0)
                        {
                            segment_nodes.push(this.nodes[index - 1]);
                        }

                        segment_nodes.push(this.nodes[index]);
                        index++;
                    }

                    if (segment_nodes.length > 1)
                    {
                        segments.push({ nodes: [...segment_nodes], type: relation });
                    }
                }
            }

            return segments;
        }
        else
        {
            return [];
        }
    }
}


export class PathStep
{
    node: MapNode;
    parent: PathStep | null;
    distance: Distance;

    constructor(node: MapNode, parent: PathStep | null, distance: Distance)
    {
        this.node = node;
        this.parent = parent;
        this.distance = new Distance(distance);
    }

    static sortByDistance(a: PathStep, b: PathStep)
    {
        return a.distance.value() - b.distance.value();
    }

    hasSeen(node: MapNode): boolean
    {
        if (this.node === node)
        {
            return true;
        }
        else if (this.parent === null)
        {
            return false;
        }
        else
        {
            return this.parent.hasSeen(node);
        }
    }

    buildPath()
    {
        if (!this.parent || !(this.node instanceof WaypointMapNode))
        {
            return;
        }

        const nodes: MapNode[] = [];

        let last_step: PathStep | null = this;

        while (last_step)
        {
            nodes.push(last_step.node);
            last_step = last_step.parent;
        }

        const path = new Path();
        let current_node = nodes.pop();

        while (current_node)
        {
            path.push(current_node);
            current_node = nodes.pop();
        }

        return path;
    }
}
