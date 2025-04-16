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

import { Course } from "$lib/map-graph/course";
import { ControlMapNode } from "$lib/map-graph/node";
import { calculateState, courses, map_graph } from "$lib/state";
import { get } from "svelte/store";



export function findLegSuggestions()
{
    const controls = new Set<ControlMapNode>();

    get(map_graph).nodes.forEach(node =>
    {
        if (ControlMapNode.isControlMapNode(node))
        {
            console.log("Found control");
            controls.add(node);
        }
    });

    while (controls.size > 1)
    {
        const firstControl = controls.values().next().value;

        if (!firstControl)
        {
            break;
        }

        controls.delete(firstControl);

        controls.forEach((secondControl) =>
        {
            const single_leg_course = new Course(`_generated_${firstControl.id}_${secondControl.id}`);
            single_leg_course.addControl(firstControl);
            single_leg_course.addControl(secondControl);
            get(courses).push(single_leg_course);
            console.log(`Added course ${single_leg_course.name}`);
        });
    }

    calculateState();

    let index = get(courses).length - 1;

    while (index >= 0)
    {
        const course = get(courses)[index];

        if (course.name.startsWith("_generated_"))
        {
            if (course.controlCount() < 2 || !legIsInteresting(course.segment(0, 1)))
            {
                get(courses).splice(index, 1);
            }
        }

        --index;
    }
}

function legIsInteresting(segment: ControlMapNode[]): boolean
{
    const shortest_route = segment[0].shortestRoute(segment[1]);

    if (!shortest_route)
    {
        return false;
    }

    if (shortest_route.elevation_gain < 3)
    {
        return false;
    }

    if (!shortest_route.from)
    {
        return false;
    }

    let height = shortest_route.from.z;

    for (const node of shortest_route.paths.flatMap(path => path.nodes))
    {
        if (node.z < height)
        {
            return true;
        }

        height = node.z;
    }

    return false;
}