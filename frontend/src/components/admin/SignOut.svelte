<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  const dispatch = createEventDispatcher<{
    signout: void;
  }>();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    dispatch('signout');
  };
</script>

<button on:click={handleClick}>Sign Out</button>
