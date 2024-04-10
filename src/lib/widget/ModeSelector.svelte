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
    import { lang, mode, type Mode } from "$lib/state";


    const options: { value: Mode, DA: string, EN: string }[] =
    [
        { value: "View", DA: "Vis", EN: "View"},
        { value: "Edit", DA: "Rediger", EN: "Edit"}
    ];
</script>



<select class="mode-selector" bind:value={$mode}>
    {#each options as option}
        <option value={option.value}>{option[$lang]}</option>
    {/each}
</select>
