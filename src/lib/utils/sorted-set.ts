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



type SortFunction<T extends any> = (a: T, b: T) => number;


export class SortedSet<T extends any>
{
    elements: T[] = [];
    sort_function: SortFunction<T>;
    
    constructor(sort_function: SortFunction<T>)
    {
        this.sort_function = sort_function;
    }

    add(element: T)
    {
        if (!this.elements.includes(element))
        {
            this.elements.push(element);
            this.elements.sort(this.sort_function);
        }
    }

    delete(element: T)
    {
        const index = this.elements.indexOf(element);

        if (index !== -1)
        {
            this.elements.splice(index, 1);
        }
    }

    clear()
    {
        this.elements.splice(0, Infinity);
    }

    has(element: T)
    {
        return this.elements.includes(element);
    }

    pop()
    {
        return this.elements.pop();
    }

    shift()
    {
        return this.elements.shift();
    }
}
