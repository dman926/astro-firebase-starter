<script lang="ts">
  import SignIn from "./SignIn.svelte";
  import SignOut from "./SignOut.svelte";
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { dateTimeFormatter, toTitleCase } from "@utils/utils";
  import SlugForm from "./forms/SlugForm.svelte";
  import type { EditorProps } from "./useEditor";
  import { authState } from "./authState";
  import { onMount } from "svelte";
  import type { CollectionFiles } from "./collectionFiles";
  import type { Readable } from "svelte/store";
  import DropdownButton from "./DropdownButton.svelte";

  // Dynamic imports for Editor and useEditor
  let Editor: typeof import("./Editor.svelte").default;
  let {
    signOut,
    editDoc,
    canEdit,
    mustRefresh,
    deploy,
  }: Partial<typeof import("./useEditor")> = {};
  let collectionFiles: Readable<CollectionFiles> | undefined = undefined;

  onMount(() => {
    // TODO: Possibly nicer to use derived stores instead, but it seems like its overcomplex
    const unsub = authState.subscribe(async ({ isAdmin }) => {
      if (isAdmin) {
        const promises = [
          import("./collectionFiles").then(
            ({ collectionFiles: importedCollectionFiles }) => {
              collectionFiles = importedCollectionFiles;
            }
          ),
        ];

        if (!Editor) {
          promises.push(
            import("./Editor.svelte").then((editor) => {
              Editor = editor.default;
            })
          );
        }
        if (!signOut) {
          promises.push(
            import("./useEditor").then((useEditor) => {
              signOut = useEditor.signOut;
              editDoc = useEditor.editDoc;
              canEdit = useEditor.canEdit;
              mustRefresh = useEditor.mustRefresh;
              deploy = useEditor.deploy;
            })
          );
        }
        await Promise.allSettled(promises);
      } else {
        collectionFiles = undefined;
      }
    });

    return () => {
      unsub();
    };
  });

  let creating: string | false = false;
  let editing: Partial<Omit<EditorProps, "on:finish">> = {};
  let collection: EditorProps["collection"], slug: EditorProps["slug"];
  $: {
    ({ collection, slug } = editing);
  }

  let signInError: string | undefined = undefined;
  const handleSignIn = async ({
    detail: { email, password },
  }: CustomEvent<{
    email: string;
    password: string;
  }>) => {
    const FirebaseAuth = await import("#firebase").then(({ Firebase }) =>
      Firebase.getInstance()?.auth()
    );
    if (FirebaseAuth) {
      signInWithEmailAndPassword(FirebaseAuth, email, password).catch((err) => {
        signInError = err.message;
        setTimeout(() => {
          signInError = undefined;
        }, 5 * 1000);
      });
    }
  };

  const finish = () => {
    creating = false;
    editing = {};
  };

  const handleClick =
    (collection: EditorProps["collection"], slug: EditorProps["slug"]) =>
    ({
      detail,
    }: CustomEvent<{
      name?: string;
      e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };
    }>) => {
      if (detail.name === "Delete") {
        const confirmed = window.confirm(
          `Are you sure you want to delete ${slug} from ${toTitleCase(
            collection
          )}?`
        );
        if (confirmed) {
          return import("./collectionFiles").then(({ simpleEditor }) =>
            simpleEditor.deleteDocument(collection, slug)
          );
        }
      } else if (detail.name === undefined) {
        editing = {
          collection,
          slug,
        };
      }
    };
</script>

{#if $authState.isAuthed === undefined}
  <!-- Waiting for initial auth check -->
  <div style="display: none;" />
{:else if !$authState.isAuthed}
  <SignIn {signInError} on:submit={handleSignIn} />
{:else}
  {#if $authState.isAdmin === undefined}
    <p>Checking if you are an admin</p>
  {:else if !$authState.isAdmin}
    <p>Not an admin</p>
  {:else if creating}
    <SlugForm collection={creating} on:finish={finish} />
  {:else if collection && slug}
    {#if Editor}
      <svelte:component this={Editor} {collection} {slug} on:finish={finish} />
    {:else}
      <p>Loading editor...</p>
    {/if}
  {:else}
    <p>ADMIN PAGE</p>
    <p>
      Be aware that refreshing or closing the tab will not preserve any unsaved
      changes
    </p>
    {#if collectionFiles && $collectionFiles.galleryFiles}
      <div class="editor-section">
        <p>Gallery Count: {$collectionFiles.galleryFiles.length}</p>
        <button
          class="collection-create-button"
          on:click={() => {
            creating = "gallery";
          }}
          disabled={!$canEdit}
        >
          Create new gallery
        </button>
        {#each $collectionFiles.galleryFiles as file (file)}
          <DropdownButton
            additionalActions={["Delete"]}
            on:click={handleClick("gallery", file)}
            disabled={!$canEdit}
          >
            Edit {file}
          </DropdownButton>
        {/each}
      </div>
    {/if}
    {#if collectionFiles && $collectionFiles.productFiles}
      <div class="editor-section">
        <p>Product Count: {$collectionFiles.productFiles.length}</p>
        <button
          class="collection-create-button"
          on:click={() => {
            creating = "products";
          }}
          disabled={!$canEdit}
        >
          Create new product
        </button>
        {#each $collectionFiles.productFiles as file (file)}
          <DropdownButton
            additionalActions={["Delete"]}
            on:click={handleClick("products", file)}
            disabled={!$canEdit}
          >
            Edit {file}
          </DropdownButton>
        {/each}
      </div>
    {/if}
    <p>
      Deploying your changes will prevent any editing until the deploy is
      complete.
    </p>
    <p>
      It will take some time to wait for all images to finish processing and for
      the website to redeploy
    </p>
    <button on:click={deploy} disabled={canEdit && !$canEdit}> Deploy </button>
    {#if canEdit && !$canEdit}
      <p>
        <b>There is a deploy in progress</b>
      </p>
      {#if mustRefresh && !$mustRefresh}
        <p>
          <b>Editting will be enabled when the deploy is complete</b>
        </p>
      {/if}
      {#if editDoc && $editDoc?.archivedAt}
        <p>
          <b>
            Deploy started on{" "}
            {dateTimeFormatter.format($editDoc.archivedAt)}
          </b>
        </p>
      {/if}
    {/if}
    {#if mustRefresh && $mustRefresh}
      <p>
        <b>
          The website has been deployed. The website will refresh in 5 seconds
          to apply changes.
        </b>
      </p>
    {/if}
  {/if}
  {#if signOut}
    <SignOut on:signout={signOut} />
  {/if}
{/if}

<style lang="scss">
  .editor-section {
    margin: 0.5em 0;
    border: 1px solid black;
    border-collapse: collapse;
    padding: 0.25em;
  }

  button.collection-create-button {
    margin-bottom: 1em;
  }
</style>
