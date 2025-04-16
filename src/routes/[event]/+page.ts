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



import { MapMeta } from "$lib/map";
import { course_index, courses, loadStateFromObject, via_map } from "$lib/state";
import { get } from "svelte/store";
import type { PageLoad } from "./$types";
import { Distance } from "$lib/utils/distance";
import { rerender } from "$lib/render/rerender";

export const load: PageLoad = async ({ params, fetch }) =>
{
    const meta = await (await fetch(`/${params.event}/meta.json`)).json();

    const map_meta = new MapMeta({
        source: `/${params.event}/${meta.map.source}`,
        width: meta.map.width,
        height: meta.map.height,
        resolution: meta.map.resolution,
        scale: meta.map.scale,
        print_scale: meta.map.print_scale
    });

    via_map.set(map_meta);

    const state = await (await fetch(`/${params.event}/${meta.state.source}`)).json();
    loadStateFromObject(state, true);

    let longest_course_distance: Distance = new Distance();
    let longest_course_index: number = 0;

    get(courses).forEach((course, index) =>
    {
        if (course.distance.greaterThan(longest_course_distance))
        {
            longest_course_distance = course.distance;
            longest_course_index = index;
        }
    });

    course_index.set(longest_course_index);
    rerender();
}