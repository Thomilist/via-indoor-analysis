<script lang="ts">
    import { Course } from "$lib/map-graph/course";
    import { courses, course_index, lang, mode, rerender } from "$lib/state";



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
