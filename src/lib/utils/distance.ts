export type DistanceUnit = "m" | "mm" | "in";

export class Distance
{
    #value: number = 0;

    // <unit> in meters
    static #scale_m: number = 1;
    static #scale_mm: number = 0.001;
    static #scale_in: number = 0.0254;

    constructor(value?: Distance | number, unit?: DistanceUnit)
    {
        this.set(value, unit);
    }

    lessThan(other: Distance)
    {
        return this.#value < other.#value;
    }

    greaterThan(other: Distance)
    {
        return this.#value > other.#value;
    }

    set(value?: Distance | number, unit?: DistanceUnit)
    {
        if (value instanceof Distance)
        {
            this.#value = value.#value;
        }
        else
        {
            value = value ?? 0;
            unit = unit ?? "m";
            
            switch (unit)
            {
                case "m": this.#value = value; break;
                case "mm": this.#value = value * Distance.#scale_mm; break;
                case "in": this.#value = value * Distance.#scale_in; break;
            }
        }
    }

    add(value: Distance | number, unit?: DistanceUnit)
    {
        if (value instanceof Distance)
        {
            this.#value += value.#value;
        }
        else
        {
            unit = unit ?? "m";
            
            switch (unit)
            {
                case "m": this.#value += value; break;
                case "mm": this.#value += value * Distance.#scale_mm; break;
                case "in": this.#value += value * Distance.#scale_in; break;
            }
        }

        return this;
    }

    value(unit?: DistanceUnit)
    {
        switch (unit ? unit : "m")
        {
            case "m": return this.#value;
            case "mm": return this.#value / Distance.#scale_mm;
            case "in": return this.#value / Distance.#scale_in;
        }
    }
}
