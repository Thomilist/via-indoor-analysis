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
