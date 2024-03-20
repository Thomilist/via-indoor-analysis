<script lang="ts">
    import { resetViewbox } from "$lib/map";


</script>



<style>
    @import "$lib/style/controls-pane.css";
</style>



<div class="controls pane">
    <h2>Controls</h2>

    <button on:click={resetViewbox}>Reset view</button>
</div>
