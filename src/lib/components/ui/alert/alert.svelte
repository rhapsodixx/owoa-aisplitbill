<script lang="ts">
    import { cn } from "$lib/utils";
    import type { HTMLAttributes } from "svelte/elements";
    import { cva, type VariantProps } from "class-variance-authority";

    const alertVariants = cva(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        {
            variants: {
                variant: {
                    default: "bg-background text-foreground",
                    destructive:
                        "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
                },
            },
            defaultVariants: {
                variant: "default",
            },
        },
    );

    type $$Props = HTMLAttributes<HTMLDivElement> &
        VariantProps<typeof alertVariants>;

    let className: $$Props["class"] = undefined;
    export { className as class };
    export let variant: $$Props["variant"] = "default";
</script>

<div
    class={cn(alertVariants({ variant }), className)}
    role="alert"
    {...$$restProps}
>
    <slot />
</div>
