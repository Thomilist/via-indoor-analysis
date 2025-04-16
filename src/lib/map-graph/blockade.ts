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



import type { BlockadeMapNode, MapNode } from "./node";

export class Blockade
{
    a: BlockadeMapNode;
    b: BlockadeMapNode;

    constructor(a: BlockadeMapNode, b: BlockadeMapNode)
    {
        this.a = a;
        this.b = b;
    }

    obstructsConnection(connection: {a: MapNode, b: MapNode}): boolean
    {
        return this.#doLineSegmentsIntersect(this.a.x, this.a.y, this.b.x, this.b.y, connection.a.x, connection.a.y, connection.b.x, connection.b.y);
    }

    #doLineSegmentsIntersect(a1X: number, a1Y: number, a2X: number, a2Y: number, b1X: number, b1Y: number, b2X: number, b2Y: number): boolean
    {
        const dxA = a2X - a1X;
        const dyA = a2Y - a1Y;
        const dxB = b2X - b1X;
        const dyB = b2Y - b1Y;
        const p0 = dyB * (b2X - a1X) - dxB * (b2Y - a1Y);
        const p1 = dyB * (b2X - a2X) - dxB * (b2Y - a2Y);
        const p2 = dyA * (a2X - b1X) - dxA * (a2Y - b1Y);
        const p3 = dyA * (a2X - b2X) - dxA * (a2Y - b2Y);
        return (p0 * p1 < 0) && (p2 * p3 < 0);
    }
}