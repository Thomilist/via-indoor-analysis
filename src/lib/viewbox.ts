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



import { get } from "svelte/store";
import type { MapMeta } from "./map";
import { name } from "./names";
import { course_index, courses, current_routes, via_map, viewbox } from "./state";
import type { Point } from "./utils/vector";
import { ControlMapNode } from "./map-graph/node";
import { browser } from "$app/environment";
import { Route } from "./map-graph/route";
import { tweened, type Tweened } from "svelte/motion";
import { quadInOut } from "svelte/easing";


export class ViewBox
{
    #initial_x: number = 0;
    #initial_y: number = 0;
    #initial_width: number;
    #initial_height: number;

    static tweening = { duration: 400, easing: quadInOut };

    x: Tweened<number> = tweened(0, ViewBox.tweening);
    y: Tweened<number> = tweened(0, ViewBox.tweening);
    width: Tweened<number>;
    height: Tweened<number>;

    constructor(map: MapMeta)
    {
        this.#initial_width = map.width;
        this.#initial_height = map.height;
        this.width = tweened(this.#initial_width, ViewBox.tweening);
        this.height = tweened(this.#initial_height, ViewBox.tweening);
    }

    getX() { return get(this.x); }
    getY() { return get(this.y); }
    getWidth() { return get(this.width); }
    getHeight() { return get(this.height); }

    serialise()
    {
        return `${this.getX()} ${this.getY()} ${this.getWidth()} ${this.getHeight()}`;
    }

    reset()
    {
        this.x.set(this.#initial_x);
        this.y.set(this.#initial_y);
        this.width.set(this.#initial_width);
        this.height.set(this.#initial_height);
    }

    fit(points?: Point[], margin?: number)
    {
        if (!points || points.length === 0)
        {
            this.reset();
            return;
        }

        const map_pane_rect = paneRect(name.pane.map);

        if (!map_pane_rect) { return; }

        if (!margin)
        {
            margin = (map_pane_rect.width < map_pane_rect.height ? map_pane_rect.width : map_pane_rect.height) / 6;
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

        const map_pane_aspect_ratio = map_pane_rect.width / map_pane_rect.height;
        const bounds_aspect_ratio = bounds.width / bounds.height;

        // Bounding box too wide for map pane.
        if (bounds_aspect_ratio > map_pane_aspect_ratio)
        {
            this.width.set(bounds.width * map_pane_rect.width / map_pane_rect.width);
            this.height.set(bounds.width / map_pane_aspect_ratio);
            this.x.set(bounds.x);
            this.y.set(bounds.y - (bounds.width / map_pane_aspect_ratio) / 2 + bounds.height / 2);
        }
        // Bounding box too tall for map pane.
        else if (bounds_aspect_ratio < map_pane_aspect_ratio)
        {
            this.width.set(bounds.height * map_pane_aspect_ratio);
            this.height.set(bounds.height * map_pane_rect.height / map_pane_rect.height);
            this.x.set(bounds.x - (bounds.height * map_pane_aspect_ratio) / 2 + bounds.width / 2);
            this.y.set(bounds.y);
        }
        // Bounding box fits map pane perfectly.
        else
        {
            this.width.set(bounds.width * map_pane_rect.width / map_pane_rect.width);
            this.height.set(bounds.height * map_pane_rect.height / map_pane_rect.height);
            this.x.set(bounds.x);
            this.y.set(bounds.y);
        }
    }

    pan1D(direction: PanDirection, amount?: number)
    {
        amount = amount ?? 10;
        
        switch (direction)
        {
            case "left": this.x.update(x => x - get(this.width) / amount); break;
            case "right": this.x.update(x => x + get(this.width) / amount); break;
            case "up": this.y.update(y => y - get(this.height) / amount); break;
            case "down": this.y.update(y => y + get(this.height) / amount); break;
        }
    }

    pan2D(offset: Pick<Point, "x" | "y">)
    {
        this.x.update(x => x - offset.x);
        this.y.update(y => y - offset.y);
    }

    zoom(direction: ZoomDirection, scaling?: number)
    {
        scaling = scaling ?? 1.2;

        const map_pane_rect = paneRect(name.pane.map);
        if (!map_pane_rect) { return; }

        const scale = direction === "out" ? scaling : 1 / scaling;

        const width = get(this.width);
        const height = get(this.height);

        this.x.update(x => x + (width - width * scale) * (map_pane_rect.width / 2) / map_pane_rect.width);
        this.y.update(y => y + (height - height * scale) * (map_pane_rect.height / 2) / map_pane_rect.height);
        this.width.update(w => w * scale);
        this.height.update(h => h * scale);
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
