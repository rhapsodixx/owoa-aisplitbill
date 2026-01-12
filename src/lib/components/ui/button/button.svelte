<script lang="ts">
  import { type ButtonVariant, buttonVariants } from "./button-variants.js";
  import { cn } from "$lib/utils";

  export let variant: ButtonVariant["variant"] = "default";
  export let size: ButtonVariant["size"] = "default";
  let className: string | undefined = undefined;
  export { className as class };
  export let href: string | undefined = undefined;
  export let type: "button" | "submit" | "reset" = "button";
  export let disabled: boolean = false;
</script>

<svelte:element
  this={href ? "a" : "button"}
  {href}
  {type}
  {disabled}
  class={cn(buttonVariants({ variant, size, className }))}
  {...$$restProps}
  on:click
  on:submit
>
  <slot />
</svelte:element>
