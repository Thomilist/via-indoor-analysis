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
import { Tween } from "svelte/motion";
import { quadInOut } from "svelte/easing";
import { quadraticBezierControlPoint } from "./utils/svg-helpers";


export class ViewBox
{
    readonly #initial_x: number = 0;
    readonly #initial_y: number = 0;
    readonly #initial_width: number;
    readonly #initial_height: number;

    static tween_smooth = { duration: 400, easing: quadInOut };
    static tween_fast = { duration: 0 };

    x: Tween<number> = new Tween(0, ViewBox.tween_smooth);
    y: Tween<number> = new Tween(0, ViewBox.tween_smooth);
    width: Tween<number>;
    height: Tween<number>;

    constructor(map: MapMeta)
    {
        this.#initial_width = map.width;
        this.#initial_height = map.height;
        this.width = new Tween(this.#initial_width, ViewBox.tween_smooth);
        this.height = new Tween(this.#initial_height, ViewBox.tween_smooth);
    }

    getX() { return this.x.current; }
    getY() { return this.y.current; }
    getWidth() { return this.width.current; }
    getHeight() { return this.height.current; }

    get serialised()
    {
        return `${this.getX()} ${this.getY()} ${this.getWidth()} ${this.getHeight()}`;
    }

    reset()
    {
        this.x.target = this.#initial_x;
        this.y.target = this.#initial_y;
        this.width.target = this.#initial_width;
        this.height.target = this.#initial_height;
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
            this.width.target = bounds.width * map_pane_rect.width / map_pane_rect.width;
            this.height.target = bounds.width / map_pane_aspect_ratio;
            this.x.target = bounds.x;
            this.y.target = bounds.y - (bounds.width / map_pane_aspect_ratio) / 2 + bounds.height / 2;
        }
        // Bounding box too tall for map pane.
        else if (bounds_aspect_ratio < map_pane_aspect_ratio)
        {
            this.width.target = bounds.height * map_pane_aspect_ratio;
            this.height.target = bounds.height * map_pane_rect.height / map_pane_rect.height;
            this.x.target = bounds.x - (bounds.height * map_pane_aspect_ratio) / 2 + bounds.width / 2;
            this.y.target = bounds.y;
        }
        // Bounding box fits map pane perfectly.
        else
        {
            this.width.target = bounds.width * map_pane_rect.width / map_pane_rect.width;
            this.height.target = bounds.height * map_pane_rect.height / map_pane_rect.height;
            this.x.target = bounds.x;
            this.y.target = bounds.y;
        }
    }

    pan1D(direction: PanDirection, amount?: number)
    {
        amount = amount ?? 10;
        
        switch (direction)
        {
            case "left": this.x.target = this.x.current - this.width.current / amount; break;
            case "right": this.x.target = this.x.current + this.width.current / amount; break;
            case "up": this.y.target = this.y.current - this.height.current / amount; break;
            case "down": this.y.target = this.y.current + this.height.current / amount; break;
        }
    }

    pan2D(offset: Pick<Point, "x" | "y">, tweening?: any)
    {
        tweening = tweening ?? ViewBox.tween_fast;

        this.x.set(this.x.current - offset.x, tweening);
        this.y.set(this.y.current - offset.y, tweening);
    }

    zoom(direction: ZoomDirection, scaling?: number)
    {
        scaling = scaling ?? 1.2;

        const map_pane_rect = paneRect(name.pane.map);
        if (!map_pane_rect) { return; }

        const scale = direction === "out" ? scaling : 1 / scaling;

        const width = this.width.target;
        const height = this.height.target;

        this.x.target += (width - width * scale) * (map_pane_rect.width / 2) / map_pane_rect.width;
        this.y.target += (height - height * scale) * (map_pane_rect.height / 2) / map_pane_rect.height;
        this.width.target *= scale;
        this.height.target *= scale;
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
        const points_to_add: Point[] = [node];
        
        if (node instanceof ControlMapNode)
        {
            points_to_add.push
            (
                { x: node.x + control_padding, y: node.y, z: 0 },
                { x: node.x - control_padding, y: node.y, z: 0 },
                { x: node.x, y: node.y + control_padding, z: 0 },
                { x: node.x, y: node.y - control_padding, z: 0 }
            );
        }

        node.portal_neighbours.forEach(neighbour =>
        {
            points_to_add.push(quadraticBezierControlPoint({ a: node, b: neighbour }));
        });

        return points_to_add;
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
