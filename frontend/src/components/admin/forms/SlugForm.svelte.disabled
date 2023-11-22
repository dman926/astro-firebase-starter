<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { EventHandler } from "svelte/elements";
  import { baseGalleryDoc, baseProductDoc } from "~types/firestore";

  export let collection: string;
  let slug: string;

  const dispatch = createEventDispatcher<{ finish: string }>();

  const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = (e) => {
    e.preventDefault();
    let data = {};
    if (collection === "gallery") {
      data = baseGalleryDoc(slug);
    } else if (collection === "products") {
      data = baseProductDoc(slug);
    }
    import("../collectionFiles").then(({ simpleEditor }) => {
      simpleEditor
        .setDocument(collection, slug, data)
        .then(() => dispatch("finish", slug));
    });
  };
</script>

<form on:submit={handleSubmit}>
  <label for="slug">
    The slug is an ID for the {collection}
    <br />
    It should be all lower case and use hyphens (<code>-</code>) for spaces
    <br />
    This cannot be changed later
  </label>
  <input
    type="text"
    id="slug"
    placeholder={`New ${collection} slug`}
    bind:value={slug}
  />
  <div>
    <button type="submit">Create</button>
    <br />
    <br />
    <button
      type="button"
      on:click={() => {
        dispatch("finish");
      }}
    >
      Cancel
    </button>
  </div>
</form>

<style lang="scss">
  form {
    line-height: "1.5em";
    input {
      min-height: "2em";
    }
    div {
      margin-top: "1em";
    }
  }
</style>
