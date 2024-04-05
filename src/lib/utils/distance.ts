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
