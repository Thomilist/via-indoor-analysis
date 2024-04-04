<script lang="ts">
    import { course_index, courses, lang } from "$lib/state";
</script>



<style>
    @import "$lib/style/course-information.css";
</style>



<div class="course-information">
    <div class="label">{({DA: "Poster:", EN: "Controls:"}[$lang])}</div>
    <div class="value">{$courses[$course_index].controlCount()}</div>
    <div class="unit"></div>

    <div class="label">{({DA: "Længde:", EN: "Distance:"}[$lang])}</div>
    <div class="value">{Math.round($courses[$course_index].distance.value())}</div>
    <div class="unit">m</div>

    <div class="label">{({DA: "Stigning:", EN: "Climbing:"}[$lang])}</div>
    <div class="value">{$courses[$course_index].elevation_gain}</div>
    <div class="unit">{({DA: "etager", EN: "floors"}[$lang])}</div>
</div>
