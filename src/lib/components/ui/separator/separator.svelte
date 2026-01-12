<script lang="ts">
    import { cn } from "$lib/utils";
    import type { HTMLAttributes } from "svelte/elements";

    type $$Props = HTMLAttributes<HTMLDivElement> & {
        orientation?: "horizontal" | "vertical";
        decorative?: boolean;
    };

    let className: $$Props["class"] = undefined;
    export { className as class };
    export let orientation: $$Props["orientation"] = "horizontal";
    export let decorative: $$Props["decorative"] = true;
</script>

<div
    role={decorative ? "none" : "separator"}
    aria-orientation={decorative ? undefined : orientation}
    class={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
    )}
    {...$$restProps}
></div>
