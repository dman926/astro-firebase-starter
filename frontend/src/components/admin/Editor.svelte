<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import {
    type FirestoreTextTypeMap,
    type GalleryText,
    type ProductText,
  } from "~types/firestore";
  import { Editor } from "./useEditor";
  import ProductEditForm from "./forms/ProductEditForm.svelte";
  import GalleryEditForm from "./forms/GalleryEditForm.svelte";
  import type { EditFormProps } from "./forms/EditFormProps";
  import { deepCopy, deepEqual } from "@utils/objReference";
  import { findChangesByKey } from "@utils/utils";

  export let collection: "gallery" | "products";
  export let slug: string;

  let editor: Editor;

  onMount(() => {
    editor = new Editor();
    fetchData();
    fetchImages();

    return () => {
      editor.closeAllOpenConnections();
    };
  });

  const dispatch = createEventDispatcher<{ finish: undefined }>();

  let baseDocumentData: GalleryText | ProductText;
  let baseImages: EditFormProps<GalleryText | ProductText>["images"] =
    undefined;
  let docData: GalleryText | ProductText;
  let documentDataWatchId: string | null = null;
  let documentUpdatedAfterInitialLoad: boolean;

  $: baseCaptions = baseDocumentData?.images;

  const fetchData = async () => {
    if (documentDataWatchId) {
      editor.closeOpenConnection(documentDataWatchId);
    }
    docData = undefined;
    documentUpdatedAfterInitialLoad = false;
    editor
      .watchDocument<FirestoreTextTypeMap[typeof collection]>(
        collection,
        slug,
        (data) => {
          // Data is just a complex object of primitives. so shouldn't need to worry about deep equality
          baseDocumentData = data;
          if (!docData) {
            docData = deepCopy(data);
          } else {
            if (data.images.length !== docData.images.length) {
              // Update images on inserts/deletes
              const { added, removed } = findChangesByKey(
                docData.images,
                data.images,
                "imageName"
              );
              const removedNames = removed.map(({ imageName }) => imageName);

              const workingDocData = docData.images.filter(
                ({ imageName }) => !removedNames.includes(imageName)
              );
              workingDocData.push(...added);
              docData.images = workingDocData;
            }
            // Set a flag if data is updated after the first load, ignoring changes to `images`
            documentUpdatedAfterInitialLoad = Object.keys(data).some(
              (key: keyof typeof data) =>
                key !== "images" && !deepEqual(data[key], docData[key])
            );
          }
        }
      )
      .then((id) => {
        documentDataWatchId = id;
      });
  };

  const fetchImages = async () => {
    baseImages = undefined;
    editor.getImages(collection, slug).then((fetchedImages) => {
      baseImages = fetchedImages;
    });
  };

  const isGalleryCollection = (
    docData: GalleryText | ProductText
  ): docData is GalleryText => collection === "gallery";

  const isProductCollection = (
    docData: GalleryText | ProductText
  ): docData is ProductText => collection === "products";

  const handleEdit = ({ detail }: CustomEvent<{ done?: () => void }>) => {
    // Missing done indicates it should not be saved
    if (detail?.done) {
      editor
        .editDocument<Partial<typeof docData>>(collection, slug, docData)
        .then(() => {
          detail.done();
        });
    }
    dispatch("finish");
  };
</script>

{#if !baseDocumentData}
  <p>Loading document</p>
{:else if isGalleryCollection(docData)}
  <GalleryEditForm
    bind:docData
    bind:images={baseImages}
    {baseCaptions}
    on:submit={handleEdit}
  />
{:else if isProductCollection(docData)}
  <ProductEditForm
    bind:docData
    bind:images={baseImages}
    {baseCaptions}
    on:submit={handleEdit}
  />
{:else}
  <!-- This shouldn't happen -->
  <h3>Error:</h3>
  <p>The collection `{collection}` is not handled by the editor</p>
  <button type="button" on:click={() => dispatch("finish")}>Go Back</button>
{/if}

{#if documentUpdatedAfterInitialLoad}
  <p>
    New changes to the document were made. Would you like to discard your
    changes and reload the document?
  </p>
  <button
    type="button"
    on:click={() => {
      docData = baseDocumentData;
      documentUpdatedAfterInitialLoad = false;
    }}>Discard and Reload</button
  >
  <!-- TODO: Display changes between documents -->
{/if}
