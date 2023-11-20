<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let additionalActions: string[] = [];
  export let disabled = false;

  const dispatch = createEventDispatcher<{
    click: {
      name?: string;
      e: MouseEvent & {
        currentTarget: EventTarget & HTMLButtonElement;
      };
    };
  }>();

  let isOpen = false;

  function toggleDropdown() {
    isOpen = !isOpen;
  }
</script>

<div class="button-root">
  <div class="button-container">
    <div class="button-wrapper">
      <button
        class="main-button"
        on:click={(e) => {
          dispatch("click", { e });
        }}
        {disabled}
      >
        <slot />
      </button>

      <button class="dropdown-button" on:click={toggleDropdown} {disabled}>
        <span class="arrow" />
      </button>
    </div>

    {#if isOpen}
      <div class="dropdown">
        {#each additionalActions as text}
          <button
            on:click={(e) => {
              dispatch("click", { name: text, e });
              toggleDropdown();
            }}
            {disabled}
          >
            {text}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .button-root {
    margin-bottom: 0.5rem;
  }

  .button-container {
    position: relative;
    display: inline-block;
  }

  .button-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid #000;
    border-radius: 0.25rem;
  }

  .main-button,
  .dropdown-button {
    cursor: pointer;
    padding: 10px 20px;
    margin: 0;
    border: none;
    background: linear-gradient(#0000, rgb(0 0 0/15%)) top/100% 800%;
    transition: 0.25s;
    &:hover {
      background-position: bottom;
      // background-color: darken(buttonface, 10%);
    }
  }

  .arrow {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #000;
    display: inline-block;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #ffffff;
    z-index: 5;
  }
</style>
