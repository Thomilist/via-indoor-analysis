export type Pair<T extends any> =
{
    a: T,
    b: T
};

export function pairsEqual<T extends any>(first: Pair<T>, second: Pair<T>, orientation: "direct" | "mirrored" | "any")
{
    if (orientation === "any" || orientation === "direct")
    {
        if (first.a === second.a && first.b === second.b)
        {
            return true;
        }
    }

    if (orientation === "any" || orientation === "mirrored")
    {
        if (first.a === second.b && first.b === second.a)
        {
            return true;
        }
    }
    
    return false;
}

export function pairAlreadyIncluded<T extends any>(pair: Pair<T>, index: number, pairs: Pair<T>[], orientation: "direct" | "mirrored" | "any")
{
    return (pairs.slice(0, index).find(prior_pair =>
    {
        return pairsEqual(pair, prior_pair, orientation);
    }));
}

export function sequenceHasPair<T extends any>(sequence: T[], pair: Pair<T>, orientation: "direct" | "mirrored" | "any")
{
    if (sequence.length > 1)
    {
        for (let index = 1; index < sequence.length; index++)
        {
            const other = { a: sequence[index - 1], b: sequence[index] };

            if (pairsEqual(pair, other, orientation))
            {
                return true;
            }
        }
    }

    return false;
}

export function arrayPairEqualContent<T extends any>(first: T[], second: T[])
{
    if (first.length !== second.length)
    {
        return false;
    }

    for (let index = 0; index < first.length; index++)
    {
        if (first[index] !== second[index])
        {
            return false;
        }
    }

    return true;
}