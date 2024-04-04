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
