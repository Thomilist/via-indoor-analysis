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
    import { edit_mode, lang, type EditMode } from "$lib/state";


    const options: { value: EditMode, DA: string, EN: string }[] =
    [
        { value: "Nodes", DA: "Punkter", EN: "Nodes"},
        { value: "Connections", DA: "Forbindelser", EN: "Connections"},
        { value: "Courses", DA: "Baner", EN: "Courses"},
        { value: "Calculations", DA: "Beregninger", EN: "Calculations"},
        { value: "Files", DA: "Filer", EN: "Files"}
    ];
</script>



<style>
    @import "$lib/style/radio-fieldset.css";
</style>



<fieldset class="radio-fieldset">
    {#each options as option}
        <label>
            <input type="radio" value={option.value} bind:group={$edit_mode}/>
            {option[$lang]}
        </label>
    {/each}
</fieldset>
