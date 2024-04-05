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



import { lang } from "$lib/state";
import { get } from "svelte/store";
import { ControlMapNode, type FinishControlMapNode, type StartControlMapNode } from "./node";
import type { Pair } from "$lib/utils/pairs";
import { isArrayOfNumbers } from "$lib/utils/misc";
import { Distance } from "$lib/utils/distance";


export type CourseIndex = "start" | number | "finish";


export class Course
{
    static next_id: number = 0;

    id: number;
    name: string;

    #start: StartControlMapNode | null;
    #controls: ControlMapNode[];
    #finish: FinishControlMapNode | null;
    #course: ControlMapNode[] = [];

    distance: Distance = new Distance();
    elevation_gain: number = 0;

    selected_leg: number = 0;

    constructor(name?: string, nodes?: { start?: StartControlMapNode, controls?: ControlMapNode[], finish?: FinishControlMapNode })
    {
        this.id = Course.next_id++;
        this.name = name ?? {DA: "Ny bane", EN: "New course"}[get(lang)];

        this.#start = nodes?.start ?? null;
        this.#controls = nodes?.controls ?? [];
        this.#finish = nodes?.finish ?? null;
        this.#updateCourse();
    }

    toJSON(): CourseJSON
    {
        return {
            type: "Course",
            id: this.id,
            name: this.name,
            start: this.#start?.id ?? -1,
            controls: this.#controls.map(control => control.id),
            finish: this.#finish?.id ?? -1
        };
    }

    #updateCourse()
    {
        // Remove duplicate nodes
        this.#controls = this.#controls
            .filter((node, index, nodes) => { return (index > 0 ? node !== nodes[index - 1] : true); });
        
        // Remove non-control nodes
        this.#course = [this.#start, ...this.#controls, this.#finish]
            .filter(node => node instanceof ControlMapNode) as ControlMapNode[];
        
        this.selected_leg = 0;
    }

    #boundedIndex(index: CourseIndex): number
    {
        switch (index)
        {
            case "start": { return 0; }
            case "finish": { return this.#course.length - 1; }
            default:
            {
                if (index < 0) { return 0; }
                else if (index >= this.#course.length) { return this.#course.length - 1; }
                else { return index; }
            }
        }
    }

    setStart(start: StartControlMapNode | null)
    {
        this.#start = start;
        this.#updateCourse();
    }

    setFinish(finish: FinishControlMapNode | null)
    {
        this.#finish = finish;
        this.#updateCourse();
    }

    // Add a control after every selected control in the course,
    // or at the end if none are selected.
    addControl(new_control: ControlMapNode)
    {
        // Don't add selected control to course, as that would yield
        // a course with the same control twice in a row.
        if (new_control.selected) { return; }
        
        // Insert after every selected control.
        let inserted_after_selection: boolean = false;

        if (this.#start?.selected)
        {
            this.#controls.unshift(new_control);
            inserted_after_selection = true;
        }

        for (let index = 0; index < this.#controls.length; index++)
        {
            if (this.#controls[index].selected)
            {
                this.#controls.splice(index + 1, 0, new_control);
                inserted_after_selection = true;
            }
        }

        // Append to end if no controls are selected.
        if (!inserted_after_selection)
        {
            this.#controls.push(new_control);
        }

        this.#updateCourse();
    }

    removeControl(control: ControlMapNode)
    {
        const index = this.#controls.lastIndexOf(control);
        
        if (index > -1)
        {
            this.#controls.splice(index, 1);
        }

        this.#updateCourse();
        return (index !== -1);
    }

    hasControl(control: ControlMapNode)
    {
        return this.#course.includes(control);
    }

    hasLeg(leg: Pair<ControlMapNode>)
    {
        return this.#course.some((control, index, controls) =>
        {
            return (leg.a === control && leg.b === controls.at(index + 1));
        })
    }

    uniqueControls(): Set<ControlMapNode>
    {
        return new Set<ControlMapNode>(this.#controls);
    }

    controlCount()
    {
        return this.#controls.length;
    }

    start(): StartControlMapNode | null
    {
        return this.#start;
    }

    startRotation()
    {
        if (this.#start && this.#course.length > 1)
        {
            return this.#start.directionToPosition(this.#course[1]);
        }
        else
        {
            return 0;
        }
    }

    finish(): FinishControlMapNode | null
    {
        return this.#finish;
    }

    segment(begin: CourseIndex, end: CourseIndex): ControlMapNode[]
    {
        if (!(this.#course.length > 0)) { return []; }
        
        const bounded_begin = this.#boundedIndex(begin);
        const bounded_end = this.#boundedIndex(end);

        if (bounded_begin === bounded_end)
        {
            const single_control = this.#course.at(bounded_begin);
            
            if (single_control instanceof ControlMapNode)
            {
                return [single_control]
            }
        }
        else if (bounded_begin < bounded_end)
        {
            return this.#course.slice(bounded_begin, bounded_end + 1);
        }
        else if (bounded_begin > bounded_end)
        {
            return this.#course.slice(bounded_end, bounded_begin + 1).reverse();
        }
        
        return [];
    }

    selectedLeg()
    {
        return this.segment(this.selected_leg, this.selected_leg + 1);
    }

    selectNextLeg()
    {
        if (this.#course.length < 3) { return; }

        // Why +3? Index to length; move to next; check for overshoot.
        if ((this.selected_leg + 3) > this.#course.length)
        {
            this.selected_leg = 0;
        }
        else
        {
            this.selected_leg++;
        }
    }

    selectPreviousLeg()
    {
        if (this.#course.length < 3) { return; }

        if (this.selected_leg === 0)
        {
            this.selected_leg = this.#course.length - 2;
        }
        else
        {
            this.selected_leg--;
        }
    }
}


export type CourseJSON =
{
    type: "Course",
    id: number,
    name: string,
    start: number,
    controls: number[],
    finish: number
};


export function isCourseJSON(obj: any): obj is CourseJSON
{
    return true
        && "type" in obj
        && obj.type === "Course"

        && "id" in obj
        && typeof obj.id === "number"

        && "name" in obj
        && typeof obj.name === "string"

        && "start" in obj
        && typeof obj.start === "number"

        && "controls" in obj
        && isArrayOfNumbers(obj.controls)

        && "finish" in obj
        && typeof obj.finish === "number";
}
