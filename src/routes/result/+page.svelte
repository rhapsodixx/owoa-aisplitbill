<script lang="ts">
  import { onMount } from "svelte";
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
    Alert,
    AlertDescription,
    AlertTitle,
  } from "$lib/components/ui/alert";
  import {
    Utensils,
    Wine,
    Receipt,
    ArrowLeft,
    Calculator,
    AlertCircle,
  } from "lucide-svelte";
  import { cn } from "$lib/utils";

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

  interface SplitResult {
    people: Person[];
    grandTotal: number;
  }

  let result: SplitResult | null = null;
  let loaded = false;
  let error: string | null = null;

  onMount(() => {
    const stored = sessionStorage.getItem("splitBillResult");
    if (stored) {
      try {
        result = JSON.parse(stored);
        loaded = true;
      } catch (e) {
        console.error("Failed to parse result", e);
        error = "Failed to load split results. Please try again.";
      }
    }
  });

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  function clearAndBack() {
    sessionStorage.removeItem("splitBillResult");
    window.location.href = "/";
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

  <!-- Error State -->
  {#if error}
    <Alert variant="destructive" class="mb-6">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  {/if}

  {#if result}
    <!-- Person Cards -->
    <div class="space-y-4" in:fade={{ duration: 300 }}>
      {#each result.people as person, i}
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
                        <div class="flex items-center justify-between text-sm">
                          <span class="text-foreground">{item.name}</span>
                          <span class="text-muted-foreground tabular-nums">
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
                        <div class="flex items-center justify-between text-sm">
                          <span class="text-foreground">{item.name}</span>
                          <span class="text-muted-foreground tabular-nums">
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
        </div>
      {/each}
    </div>

    <!-- Floating Bottom Bar -->
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
                  {formatCurrency(result.grandTotal)}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                class="h-10 w-10 rounded-full"
                on:click={clearAndBack}
              >
                <ArrowLeft class="h-4 w-4" />
                <span class="sr-only">Go back</span>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  {:else if !error}
    <!-- Empty State -->
    <div
      class="flex flex-1 flex-col items-center justify-center space-y-6 py-16 text-center"
    >
      <div
        class="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted"
      >
        <Receipt class="h-10 w-10 text-muted-foreground/50" />
      </div>
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">No Receipt Found</h3>
        <p class="max-w-[250px] text-sm text-muted-foreground">
          Upload a receipt first to see the split breakdown.
        </p>
      </div>
      <Button variant="default" on:click={clearAndBack} class="gap-2">
        <ArrowLeft class="h-4 w-4" />
        Go to Upload
      </Button>
    </div>
  {/if}
</div>
