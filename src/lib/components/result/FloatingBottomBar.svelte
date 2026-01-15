<script lang="ts">
    import { slide } from "svelte/transition";
    import { Card, CardHeader } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { ArrowLeft, Share2, Check } from "lucide-svelte";
    import { formatCurrency } from "$lib/utils";

    export let grandTotal: number;
    export let copied: boolean;
    export let onShare: () => void;
    export let onBack: () => void;
</script>

<div class="fixed bottom-0 left-0 right-0 z-50 p-4">
    <div in:slide={{ duration: 300, delay: 400 }} class="mx-auto max-w-md">
        <Card class="border-border/50 bg-card/95 shadow-xl backdrop-blur-xl">
            <CardHeader class="p-4">
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                        <p
                            class="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                            Grand Total
                        </p>
                        <p class="text-2xl font-bold tracking-tight">
                            {formatCurrency(grandTotal)}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            class="gap-2"
                            on:click={onShare}
                        >
                            {#if copied}
                                <Check class="h-4 w-4" />
                                Copied!
                            {:else}
                                <Share2 class="h-4 w-4" />
                                Share
                            {/if}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            class="h-10 w-10 rounded-full"
                            on:click={onBack}
                        >
                            <ArrowLeft class="h-4 w-4" />
                            <span class="sr-only">Go back</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>
    </div>
</div>
