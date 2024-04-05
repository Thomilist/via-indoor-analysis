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
    import { type MapNodeName } from "$lib/map-graph/node";
    import { add_node_type, lang } from "$lib/state";


    const options: { value: MapNodeName, DA: string, EN: string }[] =
    [
        { value: "Normal", DA: "Guide", EN: "Guide"},
        { value: "Waypoint", DA: "Pejlemærke", EN: "Waypoint"},
        { value: "Control", DA: "Post", EN: "Control"},
        { value: "Start", DA: "Start", EN: "Start"},
        { value: "Finish", DA: "Mål", EN: "Finish"}
    ];
</script>



<style>
    @import "$lib/style/radio-fieldset.css";
</style>



<fieldset class="radio-fieldset">
    <legend>{({DA: "Tilføj punkt", EN: "Add node"}[$lang])}</legend>
    
    {#each options as option}
        <label>
            <input type="radio" value={option.value} bind:group={$add_node_type}/>
            {option[$lang]}
        </label>
    {/each}
</fieldset>
