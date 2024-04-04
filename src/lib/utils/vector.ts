export type Axis = "x" | "y" | "z";

export type Point =
{
    x: number,
    y: number,
    z: number
};

export function isPoint(obj: any): obj is Point
{
    return true
        && "x" in obj
        && typeof obj.x === "number"
        
        && "y" in obj
        && typeof obj.y === "number"
        
        && "z" in obj
        && typeof obj.z === "number";
}

export class Vector
{
    a: Point = { x: 0, y: 0, z: 0 };
    b: Point = { x: 0, y: 0, z: 0 };

    constructor(points?: { a?: Partial<Point>, b?: Partial<Point> })
    {
        this.set(points);
    }

    set(points?: { a?: Partial<Point>, b?: Partial<Point> })
    {
        if (points?.a?.x !== undefined) { this.a.x = points.a.x; }
        if (points?.a?.y !== undefined) { this.a.y = points.a.y; }
        if (points?.a?.z !== undefined) { this.a.z = points.a.z; }
        
        if (points?.b?.x !== undefined) { this.b.x = points.b.x; }
        if (points?.b?.y !== undefined) { this.b.y = points.b.y; }
        if (points?.b?.z !== undefined) { this.b.z = points.b.z; }
    }

    length(axes: Axis[])
    {
        return Math.sqrt(
            (axes.includes("x") ? (this.b.x - this.a.x) ** 2 : 0) +
            (axes.includes("y") ? (this.b.y - this.a.y) ** 2 : 0) +
            (axes.includes("z") ? (this.b.z - this.a.z) ** 2 : 0)
        );
    }

    unitVector(axes: Axis[])
    {
        const scalar = this.length(axes);
        
        return new Vector
        ({
            b:
            {
                x: axes.includes("x") ? (this.b.x - this.a.x) / scalar : 0,
                y: axes.includes("y") ? (this.b.y - this.a.y) / scalar : 0,
                z: axes.includes("z") ? (this.b.z - this.a.z) / scalar : 0,
            }
        });
    }

    originVector()
    {
        return new Vector
        ({
            b:
            {
                x: this.b.x - this.a.x,
                y: this.b.y - this.a.y,
                z: this.b.z - this.a.z
            }
        })
    }

    addOriginVector(other: Vector)
    {
        return new Vector
        ({
            a: this.a,
            b:
            {
                x: this.b.x + other.b.x - other.a.x,
                y: this.b.y + other.b.y - other.a.y,
                z: this.b.z + other.b.z - other.a.z
            }
        });
    }

    translateWithOriginVector(other: Vector)
    {
        return new Vector
        ({
            a:
            {
                x: this.a.x + other.b.x - other.a.x,
                y: this.a.y + other.b.y - other.a.y,
                z: this.a.z + other.b.z - other.a.z
            },
            b:
            {
                x: this.b.x + other.b.x - other.a.x,
                y: this.b.y + other.b.y - other.a.y,
                z: this.b.z + other.b.z - other.a.z
            }
        });
    }

    scale(scalar: number)
    {
        return new Vector
        ({
            a:
            {
                x: this.a.x * scalar,
                y: this.a.y * scalar,
                z: this.a.z * scalar
            },
            b:
            {
                x: this.b.x * scalar,
                y: this.b.y * scalar,
                z: this.b.z * scalar
            }
        });
    }

    dotProductXY(other: Vector)
    {
        return this.length(["x", "y"]) * other.length(["x", "y"]) * Math.cos(this.directionXY() - other.directionXY());
    }

    rotateXY(angle: number)
    {
        const origin_vector = this.originVector();
        
        return new Vector
        ({
            b:
            {
                x: Math.cos(angle * origin_vector.b.x) - Math.sin(angle * origin_vector.b.y),
                y: Math.sin(angle * origin_vector.b.x) + Math.cos(angle * origin_vector.b.y),
                z: origin_vector.b.z
            }
        })
        .translateWithOriginVector(new Vector({ b: this.a }));
    }

    directionXY()
    {
        return Math.atan2
        (
            this.b.y - this.a.y,
            this.b.x - this.a.x
        );
    }
}
