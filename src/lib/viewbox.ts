import { get } from "svelte/store";
import type { MapMeta } from "./map";
import { name } from "./names";
import { course_index, courses, current_routes, via_map, viewbox } from "./state";
import type { Point } from "./utils/vector";
import { ControlMapNode } from "./map-graph/node";
import { browser } from "$app/environment";
import { Route } from "./map-graph/route";

export class ViewBox
{
    #initial_x: number = 0;
    #initial_y: number = 0;
    #initial_width: number;
    #initial_height: number;

    x: number = 0;
    y: number = 0;
    width: number;
    height: number;

    constructor(map: MapMeta)
    {
        this.#initial_width = map.width;
        this.#initial_height = map.height;
        this.width = this.#initial_width;
        this.height = this.#initial_height;
    }

    serialise()
    {
        return `${this.x} ${this.y} ${this.width} ${this.height}`
    }

    reset()
    {
        this.x = this.#initial_x;
        this.y = this.#initial_y;
        this.width = this.#initial_width;
        this.height = this.#initial_height;
    }

    fit(points?: Point[], margin?: number)
    {
        if (!points || points.length === 0)
        {
            this.reset();
            return;
        }

        const map_pane_rect = mapPaneRect();

        if (!map_pane_rect) { return; }

        if (!margin)
        {
            margin = (map_pane_rect.visible.width < map_pane_rect.visible.height ? map_pane_rect.visible.width : map_pane_rect.visible.height) / 6;
        }

        const point_bounds =
        {
            x: { min: points[0].x, max: points[0].x },
            y: { min: points[0].y, max: points[0].y }
        };

        points.forEach(point =>
        {
            if (point.x < point_bounds.x.min) { point_bounds.x.min = point.x; }
            if (point.y < point_bounds.y.min) { point_bounds.y.min = point.y; }
            if (point.x > point_bounds.x.max) { point_bounds.x.max = point.x; }
            if (point.y > point_bounds.y.max) { point_bounds.y.max = point.y; }
        });

        const bounds =
        {
            x: point_bounds.x.min - margin,
            y: point_bounds.y.min - margin,
            width: point_bounds.x.max - point_bounds.x.min + 2 * margin,
            height: point_bounds.y.max - point_bounds.y.min + 2 * margin
        };

        const map_pane_aspect_ratio = map_pane_rect.visible.width / map_pane_rect.visible.height;
        const bounds_aspect_ratio = bounds.width / bounds.height;

        // Bounding box too wide for map pane.
        if (bounds_aspect_ratio > map_pane_aspect_ratio)
        {
            this.width = bounds.width * map_pane_rect.full.width / map_pane_rect.visible.width;
            this.height = bounds.width / map_pane_aspect_ratio;
            this.x = bounds.x;
            this.y = bounds.y - (bounds.width / map_pane_aspect_ratio) / 2 + bounds.height / 2;
        }
        // Bounding box too tall for map pane.
        else if (bounds_aspect_ratio < map_pane_aspect_ratio)
        {
            this.width = bounds.height * map_pane_aspect_ratio;
            this.height = bounds.height * map_pane_rect.full.height / map_pane_rect.visible.height;
            this.x = bounds.x - (bounds.height * map_pane_aspect_ratio) / 2 + bounds.width / 2;
            this.y = bounds.y;
        }
        // Bounding box fits map pane perfectly.
        else
        {
            this.width = bounds.width * map_pane_rect.full.width / map_pane_rect.visible.width;
            this.height = bounds.height * map_pane_rect.full.height / map_pane_rect.visible.height;
            this.x = bounds.x;
            this.y = bounds.y;
        }
    }
}

export type PanDirection = "left" | "right" | "up" | "down";
export type ZoomDirection = "in" | "out";

export function paneRect(id: string)
{
    if (document)
    {
        return document.getElementById(id)?.getBoundingClientRect();
    }
}

export function mapPaneRect()
{
    const pane_container_rect = paneRect(name.pane.container);
    const map_pane_rect = paneRect(name.pane.map);
    if (!pane_container_rect || !map_pane_rect) { return; }

    const header_pane_rect = paneRect(name.pane.header);
    const controls_pane_rect = paneRect(name.pane.controls);
    const elevation_pane_rect = paneRect(name.pane.elevation);

    const visible_map_pane_rect =
    {
        width:
            pane_container_rect.width
            - (controls_pane_rect?.width ?? 0),
        height:
            pane_container_rect.height
            - (header_pane_rect?.height ?? 0)
            - (elevation_pane_rect?.height ?? 0)
    };

    if (!visible_map_pane_rect) { return; }

    return { full: map_pane_rect, visible: visible_map_pane_rect };
}

export function fitViewToCurrentLeg(control_padding: number)
{
    if (!browser) { return; }

    const nodes = get(current_routes).map(route => Route.flatten(route)).flat(1);
    nodes.push(...get(courses)[get(course_index)].selectedLeg());
    
    const points: Point[] = nodes.map(node =>
    {
        if (node instanceof ControlMapNode)
        {
            return [
                node,
                { x: node.x + control_padding, y: node.y, z: 0 },
                { x: node.x - control_padding, y: node.y, z: 0 },
                { x: node.x, y: node.y + control_padding, z: 0 },
                { x: node.x, y: node.y - control_padding, z: 0 }
            ];
        }

        return node;
    })
    .flat(1);

    get(viewbox).fit(points);
    viewbox.update(v => v);
}

export function fitViewToMap()
{
    if (!browser) { return; }

    const map_data = get(via_map);
    const points: Point[] =
    [
        { x: 0, y: 0, z: 0 },
        { x: map_data.width, y: 0, z: 0 },
        { x: 0, y: map_data.height, z: 0 },
        { x: map_data.width, y: map_data.height, z: 0 }
    ];

    get(viewbox).fit(points, 0);
    viewbox.update(v => v);
}
