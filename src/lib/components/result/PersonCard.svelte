<script lang="ts">
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { Utensils, Wine } from "lucide-svelte";
    import { cn, formatCurrency, getAvatarColor } from "$lib/utils";

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

    export let person: Person;
    export let index: number;
</script>

<Card class="overflow-hidden transition-shadow hover:shadow-md">
    <CardHeader class="pb-3">
        <CardTitle class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <!-- Avatar -->
                <div
                    class={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-white font-bold shadow-sm",
                        getAvatarColor(index),
                    )}
                >
                    {person.name.charAt(0).toUpperCase()}
                </div>
                <span class="text-lg font-semibold">{person.name}</span>
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
                                <span class="text-foreground">{item.name}</span>
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
                                <span class="text-foreground">{item.name}</span>
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
            <div class="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span class="tabular-nums"
                    >{formatCurrency(person.subtotal)}</span
                >
            </div>
            <div class="flex justify-between text-xs text-muted-foreground">
                <span>Tax</span>
                <span class="tabular-nums">{formatCurrency(person.tax)}</span>
            </div>
            <div class="flex justify-between text-xs text-muted-foreground">
                <span>Service Fee</span>
                <span class="tabular-nums"
                    >{formatCurrency(person.serviceFee)}</span
                >
            </div>
        </div>
    </CardContent>
</Card>
