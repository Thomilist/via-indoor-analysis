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
