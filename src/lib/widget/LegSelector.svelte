<script lang="ts">
    import { FinishControlMapNode, StartControlMapNode } from "$lib/map-graph/node";
    import { iof_print } from "$lib/render/iof";
    import PanDirectionSymbol from "$lib/render/symbol/PanDirectionSymbol.svelte";
    import { course_index, courses, current_leg, lang, map_graph, rerender } from "$lib/state";
    import { fitViewToCurrentLeg } from "$lib/viewbox";
    import { onMount, tick } from "svelte";

    let leg_label =
    {
        a: "",
        b: ""
    };

    async function updateLegSelection()
    {
        $map_graph.nodes.forEach(node => node.selected = false);

        const leg_index = $courses[$course_index].selected_leg;
        $current_leg = $courses[$course_index].segment(leg_index, leg_index + 1);
        $current_leg.forEach(node => node.selected = true);

        leg_label.a = ($current_leg.at(0) instanceof StartControlMapNode)
            ? {DA: "Start", EN: "Start"}[$lang]
            : `${leg_index}`;

        leg_label.b = ($current_leg.at(-1) instanceof FinishControlMapNode)
            ? {DA: "Mål", EN: "Finish"}[$lang]
            : `${leg_index + 1}`;
        
        rerender();
        await tick();
        fitViewToCurrentLeg(2 * iof_print.control_radius);
    }

    async function next()
    {
        $courses[$course_index].selectNextLeg();
        await updateLegSelection();
    }

    async function previous()
    {
        $courses[$course_index].selectPreviousLeg();
        await updateLegSelection();
    }

    onMount(async () =>
    {
        await tick();
        await updateLegSelection();
    });

    $: $course_index, updateLegSelection();
</script>



<style>
    @import "$lib/style/leg-selector.css";
</style>



<div id="leg-selector">
    <label id="leg-select-previous">
        <button class="leg-select-button" on:click={previous}></button>
        <PanDirectionSymbol direction="left" size={28}/>
    </label>
    
    <output>{`${leg_label.a} - ${leg_label.b}`}</output>
    
    <label id="leg-select-next">
        <button class="leg-select-button" on:click={next}></button>
        <PanDirectionSymbol direction="right" size={28}/>
    </label>
</div>
