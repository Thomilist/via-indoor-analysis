<script lang="ts">
    import { Distance } from "$lib/utils/distance";
    import { MapNode } from "$lib/map-graph/node";
    import { via_map } from "$lib/state";
    import { polarToCartesian, svgPolylinePoints, svgQuadraticBezier } from "$lib/utils/svg-helpers";
    import { Vector, type Point } from "$lib/utils/vector";
    import type { RouteSegmentRenderData } from "./render-data";
    import { directionChange, isPortalRouteSegment, radiusFromArc } from "$lib/utils/misc";

    export let data: RouteSegmentRenderData;

    const portal = isPortalRouteSegment(data);
    const portal_dimming_factor = 1;
    const portal_arc_size_ratio = 6;

    const width = $via_map.distanceToMapPixels(new Distance(0.65, "m"), "measure") * (data.highlighted ? 1.5 : 1);
    const portal_dash_length = 3 * width;

    const lane_count = data.highlighted
        ? data.routes.reduce((accumulator, route) => route.highlighted ? accumulator + 1 : accumulator, 0)
        : data.routes.length;
    const lane_width = width / lane_count;

    type Lane = { colour: string, points: Point[] };
    const lanes: Lane[] = [];

    if (data.nodes.length > 1)
    {
        data.routes.filter(route => !(data.highlighted && !route.highlighted)).forEach(route =>
        {
            if (data.highlighted && !route.highlighted) { return; }
            
            const lane: Lane = { colour: route.colour, points: [] };

            data.nodes.forEach((current_node, node_index, nodes) =>
            {
                const previous_node = nodes[node_index - 1];
                const next_node = nodes[node_index + 1];

                // 2 or 3 nodes.
                const segment = [previous_node, current_node, next_node]
                    .filter(node => node instanceof MapNode);
                
                // Vector from first to last in the segment.
                let segment_vector = new Vector();

                for (let segment_index = 1; segment_index < segment.length; segment_index++)
                {
                    segment_vector = segment_vector
                        .addOriginVector(new Vector({ a: segment[segment_index - 1], b: segment[segment_index] }).unitVector(["x", "y"]));
                }

                let offset_size = lane_width;

                if (segment.length === 3)
                {
                    const direction_change = Math.abs(directionChange({ a: segment[0], b: segment[1], c: segment[2] }));
                    const inner_turn_angle = Math.PI - direction_change;
                    offset_size = Math.abs(lane_width / Math.sin(inner_turn_angle / 2));
                }

                // Perpendicular to the segment vector.
                const direction = (() =>
                {
                    const segment_direction = segment_vector.directionXY();

                    // A little extra rotation for portal segments to accommodate the arc.
                    if (portal)
                    {
                        const segment_length = segment_vector.length(["x", "y"]);
                        const rotation_amount = Math.atan((segment_length / (portal_arc_size_ratio)) / (segment_length / 2));

                        const sign_from_quadrant = (Math.abs(segment_direction) < (Math.PI / 2) ? -1 : 1);
                        const sign_from_end = (node_index === 0 ? 1 : -1);

                        return segment_direction + (rotation_amount * sign_from_quadrant * sign_from_end) + Math.PI / 2;
                    }
                    else
                    {
                        return segment_direction + Math.PI / 2;
                    }
                })();

                const magnitude = offset_size * (lanes.length - (lane_count - 1) / 2);

                // Offset from main node to lane node
                const offset_vector = new Vector({ b: polarToCartesian(magnitude, direction) });
                const lane_node = new Vector({ b: current_node }).addOriginVector(offset_vector);

                lane.points.push(lane_node.b);
            });

            lanes.push(lane);
        });
    }

    const portal_arc_height_vector = (() =>
    {
        if (!portal) { return new Vector(); }

        const portal_segment_vector = new Vector({ a: data.nodes[0], b: data.nodes[1] });
        const portal_segment_direction = portal_segment_vector.directionXY();

        const portal_arc_height_direction = (() =>
        {
            // Quadrant 1 or 4.
            if (Math.abs(portal_segment_direction) < (Math.PI / 2))
            {
                return portal_segment_direction - Math.PI / 2;
            }
            // Quadrant 2 or 3.
            {
                return portal_segment_direction + Math.PI / 2;
            }
        })();

        return new Vector({ b: polarToCartesian(portal_segment_vector.length(["x", "y"]) / portal_arc_size_ratio, portal_arc_height_direction) });
    })();
</script>






{#if portal}
    {@const segment_vector = new Vector({ a: data.nodes[0], b: data.nodes[1] })}
    {@const segment_length = segment_vector.length(["x", "y"])}
    {@const arc_radius = radiusFromArc(segment_length, segment_length / portal_arc_size_ratio)}

    <path
        d={svgQuadraticBezier(segment_vector, portal_arc_height_vector)}
        fill="none"
        stroke="white"
        stroke-width={width * 1.25}
        stroke-opacity={(data.dimmed ? 0.1 : 1) * portal_dimming_factor}
        stroke-dasharray={`${portal_dash_length} ${portal_dash_length / 2}`}
    />

    {#each lanes as lane}
        {@const lane_vector = new Vector({ a: lane.points[0], b: lane.points[1] })}
        {@const arc_offset_vector = new Vector({ a: segment_vector.a, b: lane_vector.a })}
        {@const radial_offset = arc_offset_vector.length(["x", "y"])}
        {@const radial_offset_direction = (portal_arc_height_vector.dotProductXY(arc_offset_vector) < 0 ? -1 : 1)}
        {@const dash_scaling = (arc_radius + (radial_offset * radial_offset_direction * 0.5)) / arc_radius}

        <path
            d={svgQuadraticBezier(lane_vector, portal_arc_height_vector)}
            fill="none"
            stroke={lane.colour}
            stroke-width={lane_width}
            stroke-opacity={(data.dimmed ? 0.1 : 1) * portal_dimming_factor}
            stroke-dasharray={`${portal_dash_length * dash_scaling} ${portal_dash_length * dash_scaling / 2}`}
        />
    {/each}
{:else}
    <polyline
        points={svgPolylinePoints(data.nodes)}
        fill="none"
        stroke="white"
        stroke-width={width * 1.25}
        stroke-linejoin="round"
        stroke-opacity={data.dimmed ? 0.1 : 1}
    />

    {#each lanes as lane}
        <polyline
            points={svgPolylinePoints(lane.points)}
            fill="none"
            stroke={lane.colour}
            stroke-width={lane_width}
            stroke-linejoin="round"
            stroke-opacity={data.dimmed ? 0.1 : 1}
        />
    {/each}
{/if}