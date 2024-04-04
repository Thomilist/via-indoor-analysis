<script lang="ts">
    import { add_node_height, lang } from "$lib/state";


</script>



<style>
    @import "$lib/style/single-labeled-input.css";
</style>



<label class="single-labeled-input inline">
    {({DA: "Højde:", EN: "Højde"}[$lang])}

    <input type="number" min=1 max=5.5 step=0.5 bind:value={$add_node_height}/>
</label>
