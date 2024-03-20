<script>
    import Controls from "$lib/pane/Controls.svelte";
    import Header from "$lib/pane/Header.svelte";
    import Map from "$lib/pane/Map.svelte";

</script>



<style>
    @import "$lib/style/pane-container";
</style>



<div class="pane-container">
    <Header/>
    <Map/>
    <Controls/>
</div>
