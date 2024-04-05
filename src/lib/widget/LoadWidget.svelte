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
    import { lang, loadStateFromFile } from "$lib/state";


    let ready: boolean = false;
    let file_input: HTMLInputElement;
    

    function update(event: Event)
    {
        if (event.target instanceof HTMLInputElement)
        {
            file_input = event.target;
            ready = file_input.files ? file_input.files.length > 0 : false;
        }
    }


    async function load()
    {
        if (file_input?.files && file_input.files.length > 0)
        {
            await loadStateFromFile(file_input.files[0]);
        }
    }
</script>



<p>{({
    DA: "Indlæs en ny opsætning fra en fil. Den nuværende opsætning vil blive overskrevet.",
    EN: "Load a new setup from a file. The current setup will be overwritten."
}[$lang])}</p>

<input on:change={(event) => update(event)} type="file" accept=".json,application/json"/>

<button on:click={load} disabled={!ready}>{({DA: "Anvend", EN: "Apply"}[$lang])}</button>
