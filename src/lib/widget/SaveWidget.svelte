<script lang="ts">
    import { lang, writeStateToBlob } from "$lib/state";
    import FileSaver from "file-saver";

    function save()
    {
        FileSaver.saveAs(writeStateToBlob(), "via-indoor-analysis-setup.json");
    }
</script>



<p>{({
    DA: "Gem den nuværende opsætning til en fil.",
    EN: "Save the current setup to a file."
}[$lang])}</p>

<button on:click={save}>{({DA: "Gem og download opsætning", EN: "Save and download setup"}[$lang])}</button>
