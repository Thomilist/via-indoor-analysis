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
