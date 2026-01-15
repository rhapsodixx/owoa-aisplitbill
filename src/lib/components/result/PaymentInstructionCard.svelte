<script lang="ts">
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { CreditCard, Copy, Check } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    export let instruction: string;

    let copied = false;

    async function copyInstruction() {
        try {
            await navigator.clipboard.writeText(instruction);
            copied = true;
            toast.success("Payment instruction copied!", {
                description:
                    "You can now paste it to your banking app or message.",
                position: "bottom-center",
            });

            setTimeout(() => {
                copied = false;
            }, 2000);
        } catch (err) {
            toast.error("Failed to copy payment instruction");
        }
    }
</script>

<Card>
    <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-base">
            <CreditCard class="h-4 w-4" />
            Payment Instruction
        </CardTitle>
    </CardHeader>
    <CardContent>
        <div class="rounded-lg bg-muted/50 p-4 relative group">
            <p
                class="whitespace-pre-wrap text-sm leading-relaxed pr-8 font-mono"
            >
                {instruction}
            </p>
            <Button
                size="icon"
                variant="ghost"
                class="absolute right-2 top-2 h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity"
                on:click={copyInstruction}
            >
                {#if copied}
                    <Check class="h-4 w-4 text-green-500" />
                {:else}
                    <Copy class="h-4 w-4" />
                {/if}
                <span class="sr-only">Copy instruction</span>
            </Button>
        </div>
    </CardContent>
</Card>
