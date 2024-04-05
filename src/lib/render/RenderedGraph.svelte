<!--

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

-->



<script lang="ts">
    import { ControlMapNode, MapNode, WaypointMapNode } from "$lib/map-graph/node";
    import { pairAlreadyIncluded, pairsEqual, type Pair } from "$lib/utils/pairs";
    import { fetchRoutes } from "$lib/pathfinding/pick-routes";
    import { routeSegments } from "$lib/pathfinding/split-routes";
    import { calculation_view, course_index, courses, current_leg, edit_mode, map_graph, mode } from "$lib/state";
    import RenderedConnection from "./RenderedConnection.svelte";
    import RenderedControlNodeCenter from "./RenderedControlNodeCenter.svelte";
    import RenderedControlNumber from "./RenderedControlNumber.svelte";
    import RenderedLeg from "./RenderedLeg.svelte";
    import RenderedNode from "./RenderedNode.svelte";
    import RenderedNodeHighlight from "./RenderedNodeHighlight.svelte";
    import RenderedRouteJunction from "./RenderedRouteJunction.svelte";
    import RenderedRouteSegment from "./RenderedRouteSegment.svelte";
    import type { ConnectionRenderData, ControlNodeCenterRenderData, ControlNumberRenderData, CourseLegRenderData, NodeHighlightRenderData, NodeRenderData, RouteJunctionRenderData } from "./render-data";
    import { averageHeight, isPortalRouteSegment } from "$lib/utils/misc";


    // Nodes to render + their metadata.
    $: node_render_data = $map_graph.nodes
        // General visibility filtering.
        .filter(node =>
        {
            node.visible = false;
            
            switch($mode)
            {
                case "View":
                {
                    return node instanceof ControlMapNode && $current_leg.includes(node);
                }
                case "Edit":
                {
                    switch ($edit_mode)
                    {
                        case "Nodes":
                        {
                            return true;
                        }
                        case "Connections":
                        {
                            return true;
                        }
                        case "Courses":
                        {
                            return node instanceof ControlMapNode;
                        }
                        case "Calculations":
                        {
                            switch ($calculation_view)
                            {
                                case "Paths": return true;
                                case "Legs": return node instanceof ControlMapNode;
                            }
                        }
                        case "Files":
                        {
                            return true;
                        }
                    }
                }
            }
        })
        // Metadata and special cases.
        .map(node =>
        {
            node.visible = true;
            const data: NodeRenderData = { node: node, dimmed: false, rotation: 0 };
            
            switch ($mode)
            {
                case "View":
                {
                    // Rotate start towards first control.
                    if (node === $courses[$course_index].start())
                    {
                        data.rotation = $courses[$course_index].startRotation();
                    }

                    break;
                }
                case "Edit":
                {
                    switch ($edit_mode)
                    {
                        case "Nodes": break;
                        case "Connections": break;
                        case "Courses":
                        {
                            // Rotate start towards first control.
                            if (node === $courses[$course_index].start())
                            {
                                data.rotation = $courses[$course_index].startRotation();
                            }

                            // Fade out controls not used on the current course.
                            if (node instanceof ControlMapNode && !$courses[$course_index].hasControl(node))
                            {
                                data.dimmed = true;
                            }

                            break;
                        }
                        case "Calculations": break;
                    }
                }
            }

            return data;
        });


    // Nodes to highlight.
    $: node_highlight_render_data = node_render_data
        .filter(data =>
        {
            switch ($mode)
            {
                case "View": return false;
                case "Edit": return data.node.hovered || data.node.selected;
            }
        })
        .map(data =>
        {
            return ((): NodeHighlightRenderData => { return { node: data.node }; })();
        });


    // Points to render at control node centers.
    $: control_node_center_render_data = node_render_data
        .filter(data =>
        {
            if (!(data.node instanceof ControlMapNode)) { return false; }
            
            switch ($mode)
            {
                case "View": return false;
                case "Edit":
                {
                    switch ($edit_mode)
                    {
                        case "Nodes": return true;
                        case "Connections": return true;
                        case "Courses": return false;
                        case "Calculations": return true;
                    }
                }
            }
        })
        .map(data =>
        {
            return ((): ControlNodeCenterRenderData => { return { control: data.node as ControlMapNode } })();
        });


    // Connections to render + their metadata.
    $: connection_render_data = $map_graph.nodes
        // General visibility filtering.
        .filter(node =>
        {
            switch ($mode)
            {
                case "View": return false;
                case "Edit":
                {
                    switch ($edit_mode)
                    {
                        case "Nodes": return false;
                        case "Connections": return true;
                        case "Courses": return false;
                        case "Calculations":
                        {
                            switch ($calculation_view)
                            {
                                case "Paths": return true;
                                case "Legs": return false;
                            }
                        }
                    }
                }
            }
        })
        // Include only nodes with neighbours.
        .filter(node =>
        {
            return node.all_neighbours.size > 0;
        })
        // Arrange nodes in pairs for each connection.
        .map(node =>
        {
            return [...node.all_neighbours].map((neighbour): Pair<MapNode> =>
            {
                return { a: node, b: neighbour };
            });
        })
        .flat(1)
        // Eliminate mirrors.
        .filter((connection, index, connections) =>
        {
            return !pairAlreadyIncluded(connection, index, connections, "mirrored");
        })
        // Add metadata.
        .map(connection =>
        {
            let data: ConnectionRenderData = { ...connection, dimmed: false, highlighted: false, relation: "Normal" };
            
            if (connection.a.portal_neighbours.has(connection.b))
            {
                data.relation = "Portal";
            }
            
            switch ($mode)
            {
                case "View": break;
                case "Edit":
                {
                    switch ($edit_mode)
                    {
                        case "Nodes": break;
                        case "Connections":
                        {
                            if (connection.a.selected || connection.b.selected)
                            {
                                data.highlighted = true;
                            }
                        }
                        case "Courses": break;
                        case "Calculations":
                        {
                            let status: "Unused" | "Inactive" | "Active" = "Unused";
                            
                            for (const node of $map_graph.nodes)
                            {
                                if (node instanceof WaypointMapNode)
                                {
                                    for (const [waypoint, paths] of node.waypoint_neighbours)
                                    {
                                        const shortest_path = node.shortestPath(waypoint);

                                        if (shortest_path)
                                        {
                                            for (let index = 1; index < (shortest_path.nodes.length ?? 0); index++)
                                            {
                                                const segment =
                                                {
                                                    a: shortest_path.nodes[index - 1],
                                                    b: shortest_path.nodes[index]
                                                };

                                                if (pairsEqual(connection, segment, "any"))
                                                {
                                                    status = shortest_path.nodes[0].selected ? "Active" : "Inactive";
                                                    break;
                                                }
                                            }
                                        }

                                        if (status === "Active") { break; }
                                    }

                                    if (status === "Active") { break; }
                                }
                            }

                            switch (status)
                            {
                                case "Unused": data.dimmed = true; break;
                                case "Inactive": break;
                                case "Active": data.highlighted = true; break;
                            }

                            break;
                        }
                    }
                }
            }

            return data;
        });


    // Route segments to render + their metadata.
    $: route_segment_render_data = (() =>
        {
            switch ($mode)
            {
                case "View": return true;
                case "Edit":
                {
                    switch ($edit_mode)
                    {
                        case "Nodes": return false;
                        case "Connections": return false;
                        case "Courses": return false;
                        case "Calculations":
                        {
                            switch ($calculation_view)
                            {
                                case "Paths": return false;
                                case "Legs": return true;
                            }
                        }
                    }
                }
            }
        })()
        // Fetch segments if mode is appropriate.
        ? routeSegments(fetchRoutes())
            // Sort by height to draw higher segments on top,
            // with portal segments on top of normal segments.
            .sort((a, b) =>
            {
                const portal_a = isPortalRouteSegment(a);
                const portal_b = isPortalRouteSegment(b);

                if (!portal_a && portal_b) { return -1; }
                if (portal_a && !portal_b) { return 1; }
                
                return averageHeight(a.nodes) - averageHeight(b.nodes);
            })
        // No segments otherwise.
        : [];


    // Route junctions to render.
    $: route_junction_render_data = route_segment_render_data
        .reduce((data, segment) =>
        {
            const from = segment.nodes.at(0);
            const to = segment.nodes.at(-1);

            [from, to].forEach(node =>
            {
                if (node)
                {
                    const existing_data = data.find(item => item.node === node)
                    
                    if (!existing_data)
                    {
                        data.push({ node: node, highlighted: segment.highlighted, dimmed: segment.dimmed });
                    }
                    else
                    {
                        existing_data.highlighted ||= segment.highlighted;
                        existing_data.dimmed &&= segment.dimmed;
                    }
                }
            });

            return data;
        }, [] as RouteJunctionRenderData[]);


    // Course legs to render.
    $: course_leg_render_data = $courses[$course_index].segment("start", "finish")
        // General visibility filtering.
        .filter(control =>
        {
            switch ($mode)
            {
                case "View": return $current_leg.includes(control);
                case "Edit":
                {
                    switch ($edit_mode)
                    {
                        case "Nodes": return false;
                        case "Connections": return false;
                        case "Courses": return true;
                        case "Calculations": return false;
                    }
                }
            }
        })
        // Include all controls except last (n_legs = n_controls - 1).
        .filter((control, index, controls) =>
        {
            return (index + 1) < controls.length;
        })
        // Arrange controls in pairs for each leg.
        .map((control, index) =>
        {
            const leg = $mode === "View"
                ? $courses[$course_index].selectedLeg()
                : $courses[$course_index].segment(index, index + 1);
            return ((): CourseLegRenderData => { return { a: leg[0], b: leg[1] }; })();
        })
        // Eliminate mirrors and duplicates.
        .filter((leg, index, legs) =>
        {
            return !pairAlreadyIncluded(leg, index, legs, "any");
        });


    // Control numbers to render.
    $: control_number_render_data = [...$courses[$course_index].uniqueControls()]
        .filter(control =>
        {
            switch ($mode)
            {
                case "View": return $current_leg.includes(control);
                case "Edit":
                {
                    switch ($edit_mode)
                    {
                        case "Nodes": return false;
                        case "Connections": return false;
                        case "Courses": return true;
                        case "Calculations": return false;
                    }
                }
            }
        })
        .map(control => { return ((): ControlNumberRenderData => { return { control: control }; })() });
</script>



<g pointer-events="none">
    {#each connection_render_data as data (`RenderedConnection ${data.a.id} ${data.b.id}`)}
        <RenderedConnection {data}/>
    {/each}

    {#each control_node_center_render_data as data (`RenderedControlNodeCenter ${data.control.id}`)}
        <RenderedControlNodeCenter {data}/>
    {/each}

    {#each node_render_data as data (`RenderedNode ${data.node.id}`)}
        <RenderedNode {data}/>
    {/each}

    {#each course_leg_render_data as data (`RenderedLeg ${data.a.id} ${data.b.id}`)}
        <RenderedLeg {data}/>
    {/each}

    {#each route_segment_render_data as data (`RenderedRouteSegment ${data.nodes.map(n => n.id)}`)}
        <RenderedRouteSegment {data}/>
    {/each}

    {#each route_junction_render_data as data (`RenderedRouteJunction ${data.node.id}`)}
        <RenderedRouteJunction {data}/>
    {/each}

    {#each control_number_render_data as data (`RenderedControlNumber ${data.control.id}`)}
        <RenderedControlNumber {data}/>
    {/each}

    {#each node_highlight_render_data as data (`RenderedNodeHighlight ${data.node.id}`)}
        <RenderedNodeHighlight {data}/>
    {/each}
</g>
