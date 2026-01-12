<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import {
        Utensils,
        Wine,
        Receipt,
        ArrowLeft,
        Calculator,
        Share2,
        Copy,
        Check,
        Image as ImageIcon,
    } from "lucide-svelte";
    import { cn } from "$lib/utils";
    import { toast } from "svelte-sonner";

    export let data;

    const { result, receiptImageUrl, resultId } = data;

    const avatarColors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-amber-500",
        "bg-green-500",
        "bg-emerald-500",
        "bg-teal-500",
        "bg-cyan-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-violet-500",
        "bg-purple-500",
        "bg-fuchsia-500",
        "bg-pink-500",
        "bg-rose-500",
    ];

    function getAvatarColor(index: number) {
        return avatarColors[index % avatarColors.length];
    }

    interface BillItem {
        name: string;
        price: number;
    }

    interface Person {
        name: string;
        foodItems: BillItem[];
        drinkItems: BillItem[];
        subtotal: number;
        tax: number;
        serviceFee: number;
        total: number;
    }

    // Type assertion for result data
    const people = (result as { people: Person[]; grandTotal: number }).people;
    const grandTotal = (result as { people: Person[]; grandTotal: number })
        .grandTotal;

    let copied = false;

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    }

    function goBack() {
        window.location.href = "/";
    }

    async function shareResult() {
        const url = `${window.location.origin}/result/${resultId}`;

        try {
            await navigator.clipboard.writeText(url);
            copied = true;
            toast.success("Link copied to clipboard!", {
                description: "Share this link with your friends.",
            });

            // Reset copied state after 2 seconds
            setTimeout(() => {
                copied = false;
            }, 2000);
        } catch (err) {
            toast.error("Failed to copy link", {
                description: "Please copy the URL manually.",
            });
        }
    }
</script>

<div class="flex min-h-[calc(100vh-4rem)] flex-col pb-32">
    <!-- Page Header -->
    <div
        class="flex flex-col items-center justify-center space-y-3 py-6 text-center"
    >
        <div
            class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
        >
            <Calculator class="h-7 w-7 text-primary" />
        </div>
        <div class="space-y-1">
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
                Split Results
            </h1>
            <p class="text-sm text-muted-foreground">
                Here's the detailed breakdown for each person.
            </p>
        </div>
    </div>

    <!-- Person Cards -->
    <div class="space-y-4" in:fade={{ duration: 300 }}>
        {#each people as person, i}
            <div in:slide={{ delay: i * 80, duration: 250 }}>
                <Card class="overflow-hidden transition-shadow hover:shadow-md">
                    <CardHeader class="pb-3">
                        <CardTitle class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <!-- Avatar -->
                                <div
                                    class={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full text-white font-bold shadow-sm",
                                        getAvatarColor(i),
                                    )}
                                >
                                    {person.name.charAt(0).toUpperCase()}
                                </div>
                                <span class="text-lg font-semibold"
                                    >{person.name}</span
                                >
                            </div>
                            <span class="text-xl font-bold text-primary">
                                {formatCurrency(person.total)}
                            </span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent class="space-y-4 pt-0">
                        <Separator />

                        <!-- Items List -->
                        <div class="space-y-4">
                            <!-- Food Items -->
                            {#if person.foodItems?.length > 0}
                                <div class="space-y-2">
                                    <div
                                        class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        <Utensils class="h-3.5 w-3.5" />
                                        <span>Food</span>
                                    </div>
                                    <div class="space-y-1.5 pl-5">
                                        {#each person.foodItems as item}
                                            <div
                                                class="flex items-center justify-between text-sm"
                                            >
                                                <span class="text-foreground"
                                                    >{item.name}</span
                                                >
                                                <span
                                                    class="text-muted-foreground tabular-nums"
                                                >
                                                    {formatCurrency(item.price)}
                                                </span>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}

                            <!-- Drink Items -->
                            {#if person.drinkItems?.length > 0}
                                <div class="space-y-2">
                                    <div
                                        class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        <Wine class="h-3.5 w-3.5" />
                                        <span>Drinks</span>
                                    </div>
                                    <div class="space-y-1.5 pl-5">
                                        {#each person.drinkItems as item}
                                            <div
                                                class="flex items-center justify-between text-sm"
                                            >
                                                <span class="text-foreground"
                                                    >{item.name}</span
                                                >
                                                <span
                                                    class="text-muted-foreground tabular-nums"
                                                >
                                                    {formatCurrency(item.price)}
                                                </span>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>

                        <!-- Summary Box -->
                        <div class="rounded-lg bg-muted/50 p-3 space-y-1.5">
                            <div
                                class="flex justify-between text-xs text-muted-foreground"
                            >
                                <span>Subtotal</span>
                                <span class="tabular-nums"
                                    >{formatCurrency(person.subtotal)}</span
                                >
                            </div>
                            <div
                                class="flex justify-between text-xs text-muted-foreground"
                            >
                                <span>Tax</span>
                                <span class="tabular-nums"
                                    >{formatCurrency(person.tax)}</span
                                >
                            </div>
                            <div
                                class="flex justify-between text-xs text-muted-foreground"
                            >
                                <span>Service Fee</span>
                                <span class="tabular-nums"
                                    >{formatCurrency(person.serviceFee)}</span
                                >
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        {/each}
    </div>

    <!-- Original Receipt Card -->
    <div class="mt-6" in:fade={{ delay: 400, duration: 300 }}>
        <Card>
            <CardHeader class="pb-3">
                <CardTitle class="flex items-center gap-2 text-base">
                    <ImageIcon class="h-4 w-4" />
                    Original Receipt
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div class="overflow-hidden rounded-lg border bg-muted/30">
                    <img
                        src={receiptImageUrl}
                        alt="Original receipt"
                        class="w-full h-auto object-contain max-h-[500px]"
                    />
                </div>
            </CardContent>
        </Card>
    </div>

    <!-- Floating Bottom Bar -->
    <div class="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div in:slide={{ duration: 300, delay: 400 }} class="mx-auto max-w-md">
            <Card
                class="border-border/50 bg-card/95 shadow-xl backdrop-blur-xl"
            >
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
                                on:click={shareResult}
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
                                on:click={goBack}
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
</div>
