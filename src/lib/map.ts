import { Distance } from "./utils/distance";

export class MapMeta
{
    source: string;
    width: number;
    height: number;
    resolution: number;
    scale: number;
    print_scale: number;

    constructor(params: { source: string, width: number, height: number, resolution: number, scale: number, print_scale?: number })
    {
        this.source = params.source;
        this.width = params.width;
        this.height = params.height;
        this.resolution = params.resolution;
        this.scale = params.scale;
        this.print_scale = params.print_scale ? params.print_scale : params.scale;
    }

    attributes()
    {
        return { href: this.source, x: 0, y: 0, width: this.width, height: this.height };
    }

    containsCoords(coords: { x: number, y: number })
    {
        return true
            && coords.x >= 0
            && coords.y >= 0
            && coords.x <= this.width
            && coords.y <= this.height;
    }

    distanceToMapPixels(distance: Distance, scaling: "measure" | "print")
    {
        return (distance.value("in") * this.resolution) / (scaling === "print" ? this.print_scale : this.scale);
    }

    mapPixelsToDistance(pixels: number, scaling: "measure" | "print")
    {
        return new Distance(pixels * (scaling === "print" ? this.print_scale : this.scale) / this.resolution, "in");
    }
}
