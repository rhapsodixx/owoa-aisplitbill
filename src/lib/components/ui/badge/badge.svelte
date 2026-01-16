<script lang="ts">
	import { type Variant, badgeVariants } from "./index.js";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		variant?: Variant;
	};

	let className: $$Props["class"] = undefined;
	export { className as class };
	export let variant: Variant = "default";
</script>

<div class={cn(badgeVariants({ variant }), className)} {...$$restProps}>
	<slot />
</div>
