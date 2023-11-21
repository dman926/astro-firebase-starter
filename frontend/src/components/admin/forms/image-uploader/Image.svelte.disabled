<script lang="ts">
  import Img from "@components/images/Img.svelte";
  import type { EditableImage } from "../../useEditor";

  export let caption: string = undefined;
  export let captionLoaded = false;
  export let image: EditableImage["image"];
  export let deleteImage: EditableImage["deleteImage"];

  $: imageName =
    typeof image.name === "string" ? image.name : image.name.mainImageName;

  const cooldown = 5;
  let errorTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  const handleImgError = () => {
    if (errorTimeout) {
      clearTimeout(errorTimeout);
      errorTimeout = undefined;
    }

    errorTimeout = setTimeout(() => {
      image = image;
    }, cooldown * 1000);
  }
</script>

<button type="button" on:click={() => deleteImage()}> Delete Image </button>
{#if typeof image.mainURI === "string"}
  <img src={image.mainURI} alt={imageName} on:error={handleImgError} />
{:else}
  <Img {image} {imageName} />
{/if}
{#if typeof caption !== "undefined"}
  <input
    type="text"
    placeholder="Caption"
    bind:value={caption}
    disabled={!captionLoaded}
  />
{/if}
