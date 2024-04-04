<script lang="ts">
    import type { ControlMapNode } from "$lib/map-graph/node";
    import { course_index, courses, mode } from "$lib/state";
    import { Vector } from "$lib/utils/vector";
    import { iof_print } from "./iof";
    import type { ControlNumberRenderData } from "./render-data";

    export let data: ControlNumberRenderData;

    const inline_style = `
        font-size: ${iof_print.font_size}px;
        font-family: "${iof_print.font}", sans-serif;
    `;

    const numbers: number[] = [];
    const control_neighbours: Set<ControlMapNode> = new Set();
    
    const controls = $mode === "View"
        ? $courses[$course_index].selectedLeg()
        : $courses[$course_index].segment("start", "finish");
    
    controls.forEach((control, index, controls) =>
    {
        if (control === data.control)
        {
            if ($mode === "View")
            {
                numbers.push($courses[$course_index].selected_leg + index);
            }
            else
            {
                numbers.push(index);
            }
        }
        else if (controls[index + 1] === data.control || controls[index - 1] === data.control)
        {
            control_neighbours.add(control);
        }
    });

    let average_vector = new Vector();

    [...control_neighbours].forEach(neighbour =>
    {
        average_vector = average_vector.addOriginVector(new Vector({ a: data.control, b: neighbour }));
    });

    const number_position_vector = average_vector
        .unitVector(["x", "y"])
        .scale(-2.25 * iof_print.control_radius)
        .translateWithOriginVector(new Vector({ b: data.control }));
</script>



<text
    x={number_position_vector.b.x}
    y={number_position_vector.b.y}
    text-anchor="middle"
    dominant-baseline="middle"
    fill={iof_print.colour}
    fill-opacity={iof_print.opacity}
    paint-order="stroke"
    stroke="white"
    stroke-width={iof_print.font_size / 24}
    stroke-opacity={iof_print.opacity}
    style={inline_style}
>
    {numbers.join("/")}
</text>