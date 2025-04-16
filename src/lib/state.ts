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



import { get, readable, writable } from "svelte/store";
import { MapMeta } from "./map";
import { MapGraph } from "./map-graph/graph";
import { ViewBox } from "./viewbox";
import { Course, isCourseJSON, type CourseJSON } from "./map-graph/course";
import { isMapNodeJSON, MapNode, StartControlMapNode, type MapNodeJSON, type MapNodeName, type NodeRelation, FinishControlMapNode, ControlMapNode } from "./map-graph/node";
import { deleteNode } from "./utils/misc";
import { findPaths } from "./pathfinding/build-paths";
import { findRoutes } from "./pathfinding/build-routes";
import { findShortestRoute } from "./pathfinding/pick-routes";
import { Route } from "./map-graph/route";
import { rerender } from "./render/rerender";
import type { Blockade } from "./map-graph/blockade";


export const lang = writable<Language>("DA");
export const mode = writable<Mode>("View");
export const via_map = readable(new MapMeta({ source: "/via-map.jpg", width: 3470, height: 4844, resolution: 300, scale: 750, print_scale: 7500 }));
export const viewbox = writable(new ViewBox(get(via_map)));
export const edit_mode = writable<EditMode>("Nodes");
export const map_graph = writable(new MapGraph());
export const add_node_type = writable<MapNodeName>("Normal");
export const add_node_height = writable<number>(1);
export const courses = writable<Course[]>([new Course()]);
export const course_index = writable<number>(0);
export const calculation_view = writable<CalculationView>("Paths");
export const current_leg = writable<ControlMapNode[]>([]);
export const current_routes = writable<Route[]>([]);
export const elevation_plot = writable<boolean>(true);
export const blockades = writable<Blockade[]>([]);

export type Language = "DA" | "EN";
export type Mode = "View" | "Edit";
export type EditMode = "Nodes" | "Connections" | "Courses" | "Calculations" | "Files";
export type CalculationView = "Paths" | "Legs";


export function calculateState()
{
    findPaths();
    findRoutes();
    get(courses).forEach(course => findShortestRoute(course));
}


export function writeStateToBlob()
{
    const state_data: StateData =
    {
        nodes: get(map_graph).nodes.map(node => node.toJSON()),
        courses: get(courses).map(course => course.toJSON())
    };

    const json = JSON.stringify(state_data);
    return new Blob([json], { type: "application/json" });
}


export async function loadStateFromFile(file: File)
{
    const json = await file.text();
    const data = JSON.parse(json);
    loadStateFromObject(data);
}


export function loadStateFromObject(data: any, silent?: boolean)
{
    if (isStateData(data))
    {
        const map_graph_store = get(map_graph);
        const courses_store = get(courses);
        
        // Clear old state.

        while (map_graph_store.nodes.length > 0)
        {
            deleteNode(map_graph_store.nodes[0]);
        }

        courses_store.splice(0, Infinity);

        // Load new state.

        // Create nodes.
        const node_map: Map<number, { data: MapNodeJSON, node: MapNode }> = new Map();

        data.nodes.forEach(node_data =>
        {
            map_graph_store.addNode(node_data.position, node_data.type);
            node_map.set(node_data.id, { data: node_data, node: map_graph_store.nodes[map_graph_store.nodes.length - 1] });
        });

        // Assign connections.
        data.nodes.forEach(node =>
        {
            const mapped_node = node_map.get(node.id);

            if (mapped_node)
            {
                const assignConnections = (neighbour_ids: number[], relation: NodeRelation) =>
                {
                    neighbour_ids.forEach(neighbour_id =>
                    {
                        const neighbour = node_map.get(neighbour_id);

                        if (neighbour)
                        {
                            mapped_node.node.connect(neighbour.node, relation);
                        }
                    });
                };
                
                assignConnections(mapped_node.data.normal_neighbours, "Normal");
                assignConnections(mapped_node.data.portal_neighbours, "Portal");
            }
        });

        // Create courses.
        data.courses.forEach(course_data =>
        {
            const new_course = new Course(course_data.name);

            const start = node_map.get(course_data.start)?.node;
            if (start instanceof StartControlMapNode)
            {
                new_course.setStart(start);
            }

            const finish = node_map.get(course_data.finish)?.node;
            if (finish instanceof FinishControlMapNode)
            {
                new_course.setFinish(finish);
            }

            course_data.controls.forEach(control_id =>
            {
                const control = node_map.get(control_id)?.node;

                if (control instanceof ControlMapNode)
                {
                    new_course.addControl(control);
                }
            })

            courses_store.push(new_course);
        });

        // Ensure at least one (possibly empty) course exists.
        if (courses_store.length < 1)
        {
            courses_store.push(new Course());
        }

        course_index.set(0);

        // Refresh state.
        courses.update(c => c);
        course_index.update(i => i);
        calculateState();
        rerender();

        if (!silent)
        {
            alert({DA: "Data indlæst.", EN: "Data loaded."}[get(lang)]);
        }
    }
    else
    {
        if (!silent)
        {
            alert({DA: "Data kunne ikke indlæses (forkert format).", EN: "The data could not be loaded (wrong format)."}[get(lang)]);
        }
    }
}


type StateData =
{
    nodes: MapNodeJSON[],
    courses: CourseJSON[]
};


function isStateData(obj: any): obj is StateData
{
    return true
        && "nodes" in obj
        && Array.isArray(obj.nodes)
        && obj.nodes.every((node: any) => isMapNodeJSON(node))

        && "courses" in obj
        && Array.isArray(obj.courses)
        && obj.courses.every((course: any) => isCourseJSON(course));
}
