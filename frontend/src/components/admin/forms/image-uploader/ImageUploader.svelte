<script lang="ts">
  import type { ChangeEventHandler } from "svelte/elements";
  import type { GalleryText, ImageText, ProductText } from "~types/firestore";
  import type { ImageName } from "~types/image";
  import type { EditableImage, UploadTask } from "../../useEditor";
  import { editor } from "../../useEditor";
  import type { EditFormProps } from "../EditFormProps";
  import Image from "./Image.svelte";
  import { createEventDispatcher } from "svelte";
  import { derived, writable } from "svelte/store";

  export let images: EditFormProps<GalleryText | ProductText>["images"] =
    undefined;
  export let captionsLoaded = false;
  export let captions: ImageText[] = [];
  export let baseCaptions: ImageText[] = [];
  export let bucketPrefix: "gallery" | "products";
  export let slug: string;
  export let disabled = false;

  const dispatch = createEventDispatcher<{ upload: void }>();

  let uploading = false;
  const uploadTasks = writable<UploadTask[]>([]);

  let fileUploader: HTMLInputElement;

  const getKey = ({ image: { name } }: EditableImage) =>
    typeof name === "string" ? name : `${name.mainImageName}.${name.format}`;

  const filteredUploadTasks = derived(
    uploadTasks,
    (tasks) =>
      tasks.filter(
        ({ name }) =>
          !images?.images.some(({ image: { name: imageName } }) =>
            typeof imageName === "string"
              ? name === imageName
              : name.substring(0, name.lastIndexOf(".")) ===
                imageName.mainImageName
          )
      ),
    []
  );

  let prevBaseCaptions = baseCaptions;

  const extractMainName = (name: string) =>
    name.substring(0, name.lastIndexOf("."));

  let imageLoadTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  $: if (baseCaptions.length !== prevBaseCaptions.length) {
    if (images) {
      // Remove deleted images
      const baseCaptionImageNames = baseCaptions.map(
        ({ imageName }) => imageName
      );
      images.images = images.images.filter(({ image: { name } }) =>
        baseCaptionImageNames.includes(
          typeof name === "string" ? name : name.mainImageName
        )
      );
      images = images;
    }

    const addedImages = baseCaptions.filter(({ imageName }) =>
      !prevBaseCaptions.find(
        ({ imageName: prevImageName }) => prevImageName === imageName
      )
    );
    if (addedImages.length) {
      if (imageLoadTimeout) {
        clearTimeout(imageLoadTimeout);
        imageLoadTimeout = undefined;
      }
      imageLoadTimeout = setTimeout(() => {
        prevBaseCaptions = baseCaptions;
        uploadTasks.update((currUploadTasks) => {
          addedImages.forEach((addedImage) => {
            const foundAt = currUploadTasks.findIndex(
              ({ name }) => extractMainName(name) === addedImage.imageName
            );
            if (foundAt !== -1) {
              const { name } = currUploadTasks.splice(foundAt, 1)[0];
              editor
                .getImage(
                  bucketPrefix,
                  slug,
                  name.substring(0, name.lastIndexOf("."))
                )
                .then((image) => {
                  if (image && images) {
                    images.images.push(image);
                    images = images;
                  }
                });
            }
          });
          return currUploadTasks;
        });
      }, 2.5 * 1000);
    }
  }

  const handleUpload: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    const files = currentTarget.files;
    if (!files) {
      return;
    }
    uploading = true;
    const images: File[] = Array.from(files);
    // Clear the file input
    fileUploader.value = "";
    const uploadTaskMap: Record<string, [number, UploadTask]> = {};
    const progressCallback = (task: UploadTask) => {
      const { name } = task;
      uploadTasks.update((currUploadTasks) => {
        if (Object.hasOwn(uploadTaskMap, name)) {
          currUploadTasks[uploadTaskMap[name][0]] = task;
          uploadTaskMap[name][1] = task;
        } else {
          uploadTaskMap[name] = [currUploadTasks.push(task) - 1, task];
        }
        return currUploadTasks;
      });
    };
    editor
      .uploadImages(bucketPrefix, slug, images, progressCallback)
      .then((_uploadTaskRes) => {
        // TODO: handle errors
        uploading = false;
        dispatch("upload");
      });
  };

  const getCaptionIndex = (name: ImageName | string) =>
    captions.findIndex(({ imageName }) => {
      const lastDotIndex = imageName.lastIndexOf(".");
      if (lastDotIndex === -1) {
        return (
          imageName === (typeof name === "string" ? name : name.mainImageName)
        );
      }
      const mainImageName = imageName.substring(0, lastDotIndex);
      return (
        mainImageName === (typeof name === "string" ? name : name.mainImageName)
      );
    });
</script>

<input
  bind:this={fileUploader}
  type="file"
  multiple
  {disabled}
  on:change={handleUpload}
  accept="image/*"
/>
{#if uploading}
  <p>Uploading...</p>
{/if}
<div class="imageWrapper">
  {#if images && images.images.length}
    {#each images.images as image}
      {@const { image: innerImage, deleteImage } = image}
      {@const captionIndex = getCaptionIndex(innerImage.name)}
      <div>
        {#key getKey(image)}
          {#if captionIndex !== -1}
            <Image
              image={innerImage}
              {deleteImage}
              captionLoaded={captionsLoaded}
              bind:caption={captions[captionIndex].caption}
            />
          {:else}
            <Image
              image={innerImage}
              {deleteImage}
              captionLoaded={captionsLoaded}
            />
          {/if}
        {/key}
      </div>
    {/each}
  {:else if images === undefined}
    <p>Loading uploaded images...</p>
  {:else}
    <p>No images uploaded yet</p>
  {/if}
</div>
{#each $filteredUploadTasks as { name, state, uploadPercentage }}
  {#key `${name}-${state}-${uploadPercentage.toFixed(2)}%`}
    <p>
      {name} - {state} - {uploadPercentage.toFixed(2)}%
      {#if !["running", "paused"].includes(state)}
        <span> - Complete | Please wait for load</span>
      {/if}
    </p>
  {/key}
{/each}
{#if images && images.failedImages.length}
  {#each images.failedImages as { name, urlError }}
    {#key name}
      <div>
        <p>
          Failed to upload {name}
          <br />
          {urlError}
        </p>
      </div>
    {/key}
  {/each}
{/if}

<style lang="scss">
  .imageWrapper {
    :global(img) {
      width: 100%;
    }
  }
</style>
