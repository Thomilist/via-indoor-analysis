<script lang="ts">
    import { name } from "$lib/names";
    import { mode } from "$lib/state";
    import EditControls from "$lib/widget/EditControls.svelte";
    import ViewControls from "$lib/widget/ViewControls.svelte";
    import ViewportControls from "$lib/widget/ViewportControls.svelte";

</script>



<style>
    @import "$lib/style/controls-pane.css";
</style>



<div class="controls pane" id={name.pane.controls}>
    <div class="subpane">
        {#if $mode === "Edit"}
            <EditControls/>
        {:else if $mode === "View"}
            <ViewControls/>
        {/if}
        
        <hr>
    </div>

    <div class="subpane">
        <ViewportControls/>
    </div>
</div>
