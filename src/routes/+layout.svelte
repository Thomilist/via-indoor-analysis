<script lang="ts">
    import saved_state from "$lib/saved-state.json";
    import { loadStateFromObject } from "$lib/state";
    import { onMount } from "svelte";

    onMount(() =>
    {
        loadStateFromObject(saved_state, true);
    });
</script>

<style>
    @import "$lib/style/base.css";
</style>

<slot/>
