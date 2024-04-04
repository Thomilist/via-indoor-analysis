<script lang="ts">
    import { name } from "$lib/names";
    import { rr } from "$lib/state";
    import ElevationPlot from "$lib/widget/ElevationPlot.svelte";


</script>



<style>
    @import "$lib/style/elevation-pane.css";
</style>



<div class="elevation pane" id={name.pane.elevation}>
    {#key $rr}
        <ElevationPlot/>
    {/key}
</div>
