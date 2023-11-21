<script lang="ts">
  import Siema from 'siema';
  import { onMount } from 'svelte';
  import type { Image } from '~types/image';
  import Img from './Img.svelte';

  export let images: Image[];

  let perPage = 3;
  let dots = true;
  let controls = true;
  let currentIndex = 0;

  let siema: HTMLDivElement;
  let controller: Siema;

  $: currentPerPage = controller ? controller.perPage : perPage;
  $: totalDots = siema ? Math.ceil(images.length / currentPerPage) : 0;

  onMount(() => {
    controller = new Siema({
      selector: siema,
      perPage: perPage,
      duration: 150,
      easing: 'ease-in-out',
      loop: true,
      onChange: handleChange,
    });

    return () => {
      controller.destroy();
    };
  });

  const isDotActive = (currentIndex: number, dotIndex: number) => {
    if (currentIndex < 0) currentIndex = images.length + currentIndex;
    return (
      currentIndex >= dotIndex * currentPerPage &&
      currentIndex < dotIndex * currentPerPage + currentPerPage
    );
  };

  const left = () => controller.prev();

  const right = () => controller.next();

  const go = (index: number) => controller.goTo(index);

  const handleChange = () => {
    currentIndex = controller.currentSlide;
  };
</script>

<div class="carousel">
  <div class="slides" bind:this={siema}>
    {#each images as image (image.imagePath)}
      <Img {image} imageName={image.name} />
    {/each}
  </div>
  {#if controls}
    <button class="left" on:click={left} aria-label="left" />
    <button class="right" on:click={right} aria-label="right" />
  {/if}
  {#if dots}
    <ul>
      {#each { length: totalDots } as _, i}
        <li
          class:active={isDotActive(currentIndex, i)}
          on:click={() => go(i * currentPerPage)}
          on:keydown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              go(i * currentPerPage);
            }
          }}
          role="tab"
          aria-selected={isDotActive(currentIndex, i)}
          tabindex="0"
        />
      {/each}
    </ul>
  {/if}
</div>

<style lang="scss">
  .carousel {
    position: relative;
    width: 100%;
    justify-content: center;
    align-items: center;
    button {
      position: absolute;
      width: 30px;
      height: 30px;
      top: 50%;
      z-index: 50;
      margin-top: -20px;
      border: none;
      background-color: white;
      border-radius: 50%;
      &:focus {
        outline: none;
      }
      &.left {
        left: 2vw;
      }
      &.right {
        right: 2vw;
      }
      &.left::before,
      &.right::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
      }

      &.left::before {
        border-width: 10px 20px 10px 0;
        border-color: transparent black transparent transparent;
        left: 50%;
        transform: translate(-55%, -50%);
      }

      &.right::before {
        border-width: 10px 0 10px 20px;
        border-color: transparent transparent transparent black;
        right: 50%;
        transform: translate(55%, -50%);
      }
    }
    ul {
      list-style-type: none;
      position: absolute;
      display: flex;
      justify-content: center;
      width: 100%;
      margin-top: -30px;
      padding: 0;
      li {
        margin: 6px;
        border-radius: 100%;
        background-color: rgba(255, 255, 255, 0.5);
        height: 8px;
        width: 8px;
        &:hover {
          background-color: rgba(255, 255, 255, 0.85);
        }
        &.active {
          background-color: rgba(255, 255, 255, 1);
        }
      }
    }
  }
</style>
