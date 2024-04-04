<script lang="ts">
    import { lang, type Language } from "$lib/state";

    const languages: Language[] = ["DA", "EN"];
</script>



<select bind:value={$lang}>
    {#each languages as language}
        <option value={language}>{language}</option>
    {/each}
</select>
