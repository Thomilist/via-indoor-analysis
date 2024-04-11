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


export function portalRouteSegmentArcHeightVector(points: { a: Point, b: Point }, arc_size_ratio?: number)
{
    arc_size_ratio = arc_size_ratio ?? 6;
    
    const portal_segment_vector = new Vector(points);
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

    return new Vector({ b: polarToCartesian(portal_segment_vector.length(["x", "y"]) / arc_size_ratio, portal_arc_height_direction) });
}


export function midpoint(points: { a: Point, b: Point }): Point
{
    return {
        x: (points.a.x + points.b.x) / 2,
        y: (points.a.y + points.b.y) / 2,
        z: (points.a.z + points.b.z) / 2
    };
}


export function quadraticBezierControlPoint(points: { a: Point, b: Point })
{
    return new Vector({ b: midpoint(points) }).addOriginVector(portalRouteSegmentArcHeightVector(points)).b;
}


export function svgQuadraticBezier(points: { a: Point, b: Point }, offset: Vector)
{
    const control_point = quadraticBezierControlPoint(points);
    return `M${points.a.x} ${points.a.y} Q${control_point.x} ${control_point.y} ${points.b.x} ${points.b.y}`;
}
