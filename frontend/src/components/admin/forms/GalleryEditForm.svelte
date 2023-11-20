<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { EventHandler } from "svelte/elements";
  import type { GalleryText } from "~types/firestore";
  import type { EditFormProps } from "./EditFormProps";
  import ImageUploader from "./image-uploader";

  type $$Props = EditFormProps<GalleryText>;

  export let docData: $$Props["docData"];
  export let images: $$Props["images"];
  export let baseCaptions: $$Props["baseCaptions"];

  const dispatch = createEventDispatcher<{
    submit: Parameters<$$Props["on:submit"]>[0];
  }>();

  let disabled = false; // Debug value. Should be false
  let saving = false;

  const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = (e) => {
    e.preventDefault();

    const done = () => {
      saving = false;
    };

    saving = true;

    dispatch("submit", { done });

    const onSubmit = $$restProps["on:submit"];
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleCancel = () => {
    dispatch("submit");
  };
</script>

<form on:submit={handleSubmit} {...$$restProps}>
  <label for="gallery-name-input">Gallery Name</label>
  <input
    type="text"
    id="gallery-name-input"
    disabled={disabled || saving}
    bind:value={docData.galleryName}
  />
  <div>
    <span style="display: inline-block;">
      <label for="draft-checkbox">Draft: </label>
      <input
        type="checkbox"
        id="draft-checkbox"
        disabled={disabled || saving}
        bind:checked={docData.draft}
        style="width: auto;"
      />
    </span>
  </div>
  <ImageUploader
    bind:images
    captionsLoaded={Boolean(docData.images)}
    disabled={disabled || saving}
    bind:captions={docData.images}
    {baseCaptions}
    bucketPrefix="gallery"
    slug={docData.slug}
  />
  <button type="submit" disabled={disabled || saving}> Save </button>
  <button type="button" on:click={handleCancel}> Cancel </button>
</form>
