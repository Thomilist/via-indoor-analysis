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
import { loadStateFromObject, via_map } from "$lib/state";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) =>
{
    const meta = await (await fetch(`/${params.event}/meta.json`)).json();
    console.log(meta);

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
}