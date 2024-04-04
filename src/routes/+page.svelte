<script>
    import { name } from "$lib/names";
    import Controls from "$lib/pane/Controls.svelte";
    import Elevation from "$lib/pane/Elevation.svelte";
    import Header from "$lib/pane/Header.svelte";
    import Map from "$lib/pane/Map.svelte";
    import { lang } from "$lib/state";
</script>



<style>
    @import "$lib/style/pane-container";
</style>



<div class="pane-container" id={name.pane.container}>
    <Header text={{DA: "VIA Indendørssprint: Vejvalgsanalyse", EN: "VIA Indoor Sprint: Route Choice Analysis"}[$lang]}/>
    <Map/>
    <Controls/>
    <!-- <Elevation/> -->
</div>
