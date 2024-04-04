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
