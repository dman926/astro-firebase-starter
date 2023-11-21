<script lang="ts">
  import type { Image, ImageName, ImageURI } from '~types/image';
  import Modal from '../Modal.svelte';

  export let image: Image;
  export let imageName: ImageName | string;

  $: alt = (() => {
    if (!imageName) {
      return '';
    }
    return typeof imageName === 'string' ? imageName : imageName.mainImageName;
  })();

  let isExpanded = false;
  let expandedImageClicked = false;

  function toggleExpand() {
    isExpanded = !isExpanded;
  }

  function closeExpand(event: MouseEvent | KeyboardEvent) {
    if (
      isExpanded &&
      event instanceof KeyboardEvent &&
      (event.key === 'Enter' || event.key === ' ') // Close only on Enter/Space key press when expanded
    ) {
      toggleExpand();
    } else if (expandedImageClicked) {
      toggleExpand();
      expandedImageClicked = false;
    }
  }

  function isImageURI(uri: string | ImageURI): uri is ImageURI {
    return typeof uri !== 'string';
  }

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
  };
</script>

<div class="image-container">
  <div
    class="collapsed-image"
    role="button"
    tabindex="0"
    on:click={() => {
      isExpanded = true;
      expandedImageClicked = false;
    }}
    on:keydown={closeExpand}
    aria-pressed={isExpanded}
  >
    {#if isImageURI(image.thumbnailURI)}
      <picture>
        <source srcset={image.thumbnailURI.webp} type="image/webp" />
        <img src={image.thumbnailURI.jpeg} {alt} on:error={handleImgError} />
      </picture>
    {:else}
      <img src={image.thumbnailURI} {alt} on:error={handleImgError} />
    {/if}
  </div>

  <Modal bind:showModal={isExpanded}>
    <!-- TODO: maybe place delete button and caption editing in here -->
    {#if isImageURI(image.mainURI)}
      <picture>
        <source srcset={image.mainURI.webp} type="image/webp" />
        <img
          class="big-picture"
          src={image.mainURI.jpeg}
          {alt}
          on:error={handleImgError}
        />
      </picture>
    {:else}
      <img
        class="big-picture"
        src={image.mainURI}
        {alt}
        on:error={handleImgError}
      />
    {/if}
    {#if image.caption}
      <hr />
      <p class="caption">{image.caption}</p>
    {/if}
    <style>
      img.big-picture {
        max-width: 95vw;
        max-height: 80vh;
      }
    </style>
  </Modal>
</div>

<style lang="scss">
  .image-container {
    position: relative;

    .collapsed-image {
      cursor: pointer;
      padding: 0.25rem;
      user-select: none;
      z-index: 1;
    }
  }
  p.caption {
    font-size: 0.8rem;
    margin: 0;
    padding: 0.5rem;
  }
</style>
