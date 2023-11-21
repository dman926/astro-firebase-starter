<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { EventHandler } from "svelte/elements";

  export let signInError: string | undefined = undefined;

  const dispatch = createEventDispatcher<{
    submit: { email: string; password: string };
  }>();

  let signingIn = false;
  let passwordVisible = false;

  const handleFormSubmit: EventHandler<SubmitEvent, HTMLFormElement> = (e) => {
    e.preventDefault();
    signingIn = true;
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    dispatch("submit", { email, password });
    setTimeout(() => {
      signingIn = false;
    }, 5 * 1000);
  };
</script>

<form on:submit={handleFormSubmit}>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" disabled={signingIn} />
  <label for="password">Password</label>
  <input
    id="password"
    name="password"
    type={passwordVisible ? "text" : "password"}
    disabled={signingIn}
  />
  <button
    type="button"
    disabled={signingIn}
    on:click={() => {
      passwordVisible = !passwordVisible;
    }}
  >
    {passwordVisible ? "Hide" : "Show"} Password
  </button>
  <button type="submit" disabled={signingIn}> Sign In </button>
  {#if signInError}
    <p>{signInError}</p>
  {/if}
</form>
