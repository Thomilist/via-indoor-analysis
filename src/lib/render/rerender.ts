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



import { browser } from "$app/environment";
import { mode } from "$lib/state";
import { get, writable } from "svelte/store";


export const rr = writable(1);


export function rerender(source?: any)
{
    if (!browser) { return; }
    
    switch (get(mode))
    {
        case "View":
        {
            if (source instanceof MouseEvent)
            {
                return;
            }

            break;
        }
        case "Edit": break;
    }

    rr.update(r => r === 1 ? 2 : 1);
}
