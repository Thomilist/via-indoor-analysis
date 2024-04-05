<!--

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

-->



<script lang="ts">
    import { Course } from "$lib/map-graph/course";
    import { rerender } from "$lib/render/rerender";
    import { courses, course_index, lang, mode } from "$lib/state";


    function createNewCourse()
    {
        $courses.push(new Course());
        course_index.set($courses.length - 1);
        courses.update(c => c);
    }


    function deleteThisCourse()
    {
        const selected_course = $courses[$course_index];
        
        if (window.confirm(`${{DA: "Slet banen", EN: "Delete course"}[$lang]} \"${selected_course.name}\"?"`))
        {
            $courses.splice($course_index, 1);

            if ($course_index > 0)
            {
                $course_index--;
                courses.update(c => c);
            }
            else
            {
                if ($courses.length < 1)
                {
                    createNewCourse();
                }
            }
        }
    }
</script>



<style>
    @import "$lib/style/single-labeled-input.css";
    @import "$lib/style/course-selector.css";
</style>



<label class="single-labeled-input stacked">
    {({DA: "Vælg bane:", EN: "Select course:"}[$lang])}

    <select bind:value={$course_index} on:change={rerender}>
        {#each $courses as course, index (course.id)}
            <option value={index}>{`${course.name}`}</option>
        {/each}
    </select>
</label>


{#if $mode === "Edit"}
    <div class="course-create-delete">
        <button on:click={createNewCourse}>{({DA: "Opret ny bane", EN: "Create new course"}[$lang])}</button>
        <button on:click={deleteThisCourse}>{({DA: "Slet denne bane", EN: "Delete this course"}[$lang])}</button>
    </div>
{/if}
