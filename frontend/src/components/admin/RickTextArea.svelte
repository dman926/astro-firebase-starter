<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  // This CVE check is most certainly not needed since this quill instance doesn't allow image uploads
  // Better to be safe than sorry
  import { CVE_2021_3163_check } from 'shared/cve';
  import { Quill } from 'quill';
  import 'quill/dist/quill.core.css';
  import 'quill/dist/quill.snow.css';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface $$Props extends Omit<HTMLTextareaAttributes, 'value'> {
    value: string;
  }

  export let id = 'quill-editor';
  export let value: string;
  export let disabled = false;

  let quill: Quill;

  let container: HTMLDivElement;

  let prevValue: string;
  // Account for external value change and CVE validation
  $: {
    if (CVE_2021_3163_check(value)) {
      if (value !== prevValue) {
        if (quill && quill.root.innerHTML !== value) {
          quill.root.innerHTML = value;
        }
        prevValue = value;
      }
    } else {
      alert(
        'The provided content contains a vulnerability (CVE-2021-3163) and has been refused. Please fix the content externally and try again.',
      );
    }
  }

  $: if (quill) {
    // Account for disable inputs
    if (disabled) {
      quill.disable();
    } else {
      quill.enable();
    }
  }

  onMount(() => {
    quill = new Quill(container, {
      theme: 'snow',
    });
    quill.on('text-change', () => {
      if (CVE_2021_3163_check(quill.root.innerHTML)) {
        value = quill.root.innerHTML;
      } else {
        quill.root.innerHTML = prevValue;
        alert(
          'The last change contains a vulnerability (CVE-2021-3163) and has been refused. The content has been reverted to the last known value.',
        );
      }
    });
    // Set initial value
    if (CVE_2021_3163_check(value)) {
      quill.root.innerHTML = value;
    }
  });
</script>

<div {id} bind:this={container} />
