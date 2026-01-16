<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Utensils, Wine, Pencil } from "lucide-svelte";
  import { cn, formatCurrency, getAvatarColor } from "$lib/utils";
  import type { Person, BillItem } from "$lib/types";

  export let person: Person;
  export let index: number;
  export let onEditItem:
    | ((itemType: "food" | "drink", itemIndex: number) => void)
    | undefined = undefined;
</script>

<Card class="overflow-hidden transition-shadow hover:shadow-md">
  <CardHeader class="pb-3">
    <CardTitle class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div
          class={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-white font-bold shadow-sm",
            getAvatarColor(index)
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
            {#each person.foodItems as item, itemIndex}
              <div class="flex items-center justify-between text-sm group">
                <div class="flex items-center gap-2">
                  <span class="text-foreground">{item.name}</span>
                  {#if item.quantity && item.quantity > 1}
                    <span class="text-muted-foreground">×{item.quantity}</span>
                  {/if}
                  {#if item.isEdited}
                    <Badge variant="secondary" class="text-xs py-0 h-5"
                      >Edited</Badge
                    >
                  {/if}
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-muted-foreground tabular-nums">
                    {formatCurrency(item.price)}
                  </span>
                  {#if onEditItem}
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onclick={() => onEditItem("food", itemIndex)}
                    >
                      <Pencil class="h-3 w-3" />
                    </Button>
                  {/if}
                </div>
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
            {#each person.drinkItems as item, itemIndex}
              <div class="flex items-center justify-between text-sm group">
                <div class="flex items-center gap-2">
                  <span class="text-foreground">{item.name}</span>
                  {#if item.quantity && item.quantity > 1}
                    <span class="text-muted-foreground">×{item.quantity}</span>
                  {/if}
                  {#if item.isEdited}
                    <Badge variant="secondary" class="text-xs py-0 h-5"
                      >Edited</Badge
                    >
                  {/if}
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-muted-foreground tabular-nums">
                    {formatCurrency(item.price)}
                  </span>
                  {#if onEditItem}
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onclick={() => onEditItem("drink", itemIndex)}
                    >
                      <Pencil class="h-3 w-3" />
                    </Button>
                  {/if}
                </div>
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
        <span class="tabular-nums">{formatCurrency(person.subtotal)}</span>
      </div>
      <div class="flex justify-between text-xs text-muted-foreground">
        <span>Tax</span>
        <span class="tabular-nums">{formatCurrency(person.tax)}</span>
      </div>
      <div class="flex justify-between text-xs text-muted-foreground">
        <span>Service Fee</span>
        <span class="tabular-nums">{formatCurrency(person.serviceFee)}</span>
      </div>
    </div>
  </CardContent>
</Card>
