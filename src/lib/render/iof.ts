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



import { via_map } from "$lib/state";
import { Distance } from "$lib/utils/distance";
import { get } from "svelte/store";


// Definitions from IOF ISOM 2017.
// Dimensions in millimeters.
export const iof =
{
    scale: 15000,
    start_side_length: 6.0,
    control_diameter: 5.0,
    finish_diameter_inner: 4.0,
    finish_diameter_outer: 6.0,
    line_thickness: 0.35,
    font_size: 4.0,

    pixelDimension: function(iof_dimension: Distance)
    {
        return iof.scale * get(via_map).distanceToMapPixels(iof_dimension, "print");
    },

    pixelRadius: function (iof_diameter: Distance)
    {
        return (iof.pixelDimension(iof_diameter) - iof_print["stroke-width"]) / 2;
    }
};


// Derived values for "printing".
export const iof_print =
{
    colour: "magenta",
    "opacity": 0.8,
    "stroke-width": iof.pixelDimension(new Distance(iof.line_thickness, "mm")),

    font: "Arial",
    font_size: iof.pixelDimension(new Distance(iof.font_size, "mm")),

    control_radius: 0,
    finish_radius_inner: 0,
    finish_radius_outer: 0,
    start_side_length: 0
};

iof_print.control_radius = iof.pixelRadius(new Distance(iof.control_diameter, "mm"));
iof_print.finish_radius_inner = iof.pixelRadius(new Distance(iof.finish_diameter_inner, "mm"));
iof_print.finish_radius_outer = iof.pixelRadius(new Distance(iof.finish_diameter_outer, "mm"));
iof_print.start_side_length = iof.pixelDimension(new Distance(iof.start_side_length, "mm")) - iof_print["stroke-width"];
