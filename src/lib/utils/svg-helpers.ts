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



import { Vector, type Point } from "$lib/utils/vector";


// 60 degrees in equilateral triangle
const angle = Math.PI / 3;


export function polarToCartesian(distance: number, direction: number)
{
    return { x: Math.cos(direction) * distance, y: Math.sin(direction) * distance };
}


export function svgTrianglePoints(center: Point, side_length: number, rotation?: number)
{
    const height = Math.cos(angle / 2) * side_length;
    const radius = height * 2 / 3;

    const points = [0, 1, 2].map(index =>
    {
        return polarToCartesian(radius, 2 * angle * index + (rotation ?? 0));
    });

    const translated_points = points.map(point =>
    {
        return [center.x + point.x, center.y + point.y];
    });

    return translated_points.flat().join(" ");
}


export function svgPolylinePoints(points: Point[])
{
    return points
        .map(point => { return [point.x, point.y]; })
        .flat()
        .join(" ");
}


export function svgQuadraticBezier(points: { a: Point, b: Point }, offset: Vector)
{
    const midpoint: Point =
    {
        x: (points.a.x + points.b.x) / 2,
        y: (points.a.y + points.b.y) / 2,
        z: 0
    };

    const control_point = new Vector({ b: midpoint }).addOriginVector(offset);

    return `M${points.a.x} ${points.a.y} Q${control_point.b.x} ${control_point.b.y} ${points.b.x} ${points.b.y}`;
}
