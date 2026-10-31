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



import { readdir } from "node:fs/promises";
import type { PageServerLoad } from "../../.svelte-kit/types/src/routes/$types";



export const load: PageServerLoad = async ({ params }) => {
    const events: string[] = [];

    try
    {
        const files = await readdir( "./static", { withFileTypes: true } );
        for ( const file of files )
        {
            if ( !file.isDirectory() )
            {
                continue;
            }

            events.push(file.name);
        }
    }
    catch ( error )
    {
        console.error( error );
    }

    return {
        events: events
    };
};
