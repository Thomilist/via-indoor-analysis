<script lang="ts">
    import { courses, course_index, lang } from "$lib/state";
</script>



<style>
    @import "$lib/style/single-labeled-input.css";
</style>



<label class="single-labeled-input stacked">
    {({DA: "Banens navn:", EN: "Course name:"}[$lang])}

    <input type="text" bind:value={$courses[$course_index].name}/>
</label>
