<!--

via-indoor-analysis: Route choice analysis tool for indoor sprint 
orienteering at VIA University College Horsens.
Copyright (C) 2024 Thomas Emil Jensen

via-indoor-analysis is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

via-indoor-analysis is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with via-indoor-analysis. If not, see <https://www.gnu.org/licenses/>.

-->



<script lang="ts">
    import { calculation_view, edit_mode, lang } from "$lib/state";
    import CalculationManager from "./CalculationManager.svelte";
    import CourseEditor from "./CourseEditor.svelte";
    import CourseSelector from "./CourseSelector.svelte";
    import EditModeSelector from "./EditModeSelector.svelte";
    import LoadWidget from "./LoadWidget.svelte";
    import NodeHeightInput from "./NodeHeightInput.svelte";
    import NodeTypeSelector from "./NodeTypeSelector.svelte";
    import SaveWidget from "./SaveWidget.svelte";
</script>



<style>
    @import "$lib/style/control-mappings.css";
</style>



<EditModeSelector/>
<hr>


{#if $edit_mode === "Nodes"}
    <dl class="control-mappings">
        <dt><kbd>M1</kbd>:</dt>
        <dd>{({DA: "Tilføj punkt", EN: "Add node"}[$lang])}</dd>
        
        <dt><kbd>Shift</kbd> + <kbd>M1</kbd>:</dt>
        <dd>{({DA: "Slet punkt", EN: "Delete node"}[$lang])}</dd>
        
        <dt><kbd>M2</kbd>:</dt>
        <dd>{({DA: "Vælg punkt", EN: "Select node"}[$lang])}</dd>
        
        <dt><kbd>Ctrl</kbd> + <kbd>M2</kbd>:</dt>
        <dd>{({DA: "Vælg flere punkter", EN: "Select multiple nodes"}[$lang])}</dd>
    </dl>

    <hr>

    <NodeTypeSelector/>
    <NodeHeightInput/>

{:else if $edit_mode === "Connections"}
    <dl class="control-mappings">
        <dt><kbd>M1</kbd>:</dt>
        <dd>{({DA: "Forbind til valgte", EN: "Connect to selected"}[$lang])}</dd>
        
        <dt><kbd>Alt</kbd> + <kbd>M1</kbd>:</dt>
        <dd>{({DA: "Portal til valgte", EN: "Portal to selected"}[$lang])}</dd>
        
        <dt><kbd>Shift</kbd> + <kbd>M1</kbd>:</dt>
        <dd>{({DA: "Afkobl fra valgte", EN: "Disconnect from selected"}[$lang])}</dd>
        
        <dt><kbd>M2</kbd>:</dt>
        <dd>{({DA: "Vælg punkt", EN: "Select node"}[$lang])}</dd>
        
        <dt><kbd>Ctrl</kbd> + <kbd>M2</kbd>:</dt>
        <dd>{({DA: "Vælg flere punkter", EN: "Select multiple nodes"}[$lang])}</dd>
    </dl>

{:else if $edit_mode === "Courses"}
    <dl class="control-mappings">
        <dt><kbd>M1</kbd>:</dt>
        <dd>{({DA: "Tilføj post til bane (til sidst eller efter valgte)", EN: "Add control to course (at end or after selected)"}[$lang])}</dd>
        
        <dt><kbd>Shift</kbd> + <kbd>M1</kbd>:</dt>
        <dd>{({DA: "Fjern post fra bane", EN: "Remove control from course"}[$lang])}</dd>
        
        <dt><kbd>M2</kbd>:</dt>
        <dd>{({DA: "Vælg post", EN: "Select control"}[$lang])}</dd>
        
        <dt><kbd>Ctrl</kbd> + <kbd>M2</kbd>:</dt>
        <dd>{({DA: "Vælg flere poster", EN: "Select multiple controls"}[$lang])}</dd>
    </dl>

    <hr>
    <CourseSelector/>
    <hr>
    <CourseEditor/>

{:else if $edit_mode === "Calculations"}
    {#if $calculation_view === "Paths"}
        <dl class="control-mappings">
            <dt><kbd>M2</kbd>:</dt>
            <dd>{({DA: "Vælg punkt", EN: "Select node"}[$lang])}</dd>
            
            <dt><kbd>Ctrl</kbd> + <kbd>M2</kbd>:</dt>
            <dd>{({DA: "Vælg flere punkter", EN: "Select multiple nodes"}[$lang])}</dd>
        </dl>
    {:else if $calculation_view === "Legs"}
        <dl class="control-mappings">
            <dt><kbd>M2</kbd>:</dt>
            <dd>{({DA: "Vælg post", EN: "Select control"}[$lang])}</dd>
            
            <dt><kbd>Ctrl</kbd> + <kbd>M2</kbd>:</dt>
            <dd>{({DA: "Vælg flere poster", EN: "Select multiple controls"}[$lang])}</dd>
        </dl>
    {/if}

    <hr>
    <CalculationManager/>

{:else if $edit_mode === "Files"}
    <SaveWidget/>
    <hr>
    <LoadWidget/>
{/if}
