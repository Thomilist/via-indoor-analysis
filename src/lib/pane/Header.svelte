<script lang="ts">
    import { name } from "$lib/names";
    import LanguageSelector from "$lib/widget/LanguageSelector.svelte";
    import ModeSelector from "$lib/widget/ModeSelector.svelte";

    export let text: string;
</script>



<svelte:head>
    <title>{text}</title>
</svelte:head>

<style>
    @import "$lib/style/header-pane.css";
</style>





<div class="header pane" id={name.pane.header}>
    <h1>{text}</h1>

    <div class="header-items">
        <ModeSelector/>
        <LanguageSelector/>
    </div>
</div>
