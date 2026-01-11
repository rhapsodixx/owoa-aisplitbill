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
  import {
    Utensils,
    Wine,
    Receipt,
    User,
    ArrowLeft,
    Share2,
  } from "lucide-svelte";

  let result: any = null;
  let loaded = false;

  onMount(() => {
    const stored = sessionStorage.getItem("splitBillResult");
    if (stored) {
      try {
        result = JSON.parse(stored);
        loaded = true;
      } catch (e) {
        console.error("Failed to parse result", e);
      }
    } else {
      // Emulate loading delay if coming directly (should redirect really)
      // loaded = true;
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

<div class="relative min-h-screen pb-24">
  <!-- Ambient Background Blobs -->
  <div
    class="fixed top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none"
  ></div>
  <div
    class="fixed bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"
  ></div>

  <div class="relative space-y-6 pt-4">
    <div class="text-center space-y-2">
      <h1 class="text-4xl font-extrabold tracking-tight">
        <span
          class="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
        >
          Split Results
        </span>
      </h1>
      <p class="text-muted-foreground">Here is the detailed breakdown.</p>
    </div>

    {#if result}
      <div class="space-y-4" in:fade={{ duration: 300 }}>
        {#each result.people as person, i}
          <div in:slide={{ delay: i * 100, duration: 300 }}>
            <Card
              class="border-white/10 bg-card/40 backdrop-blur-md shadow-xl overflow-hidden transition-all hover:bg-card/60"
            >
              <CardHeader class="pb-2">
                <CardTitle class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
                    >
                      <span class="font-bold"
                        >{person.name.charAt(0).toUpperCase()}</span
                      >
                    </div>
                    <span class="text-lg">{person.name}</span>
                  </div>
                  <span class="text-xl font-bold text-primary drop-shadow-sm"
                    >{formatCurrency(person.total)}</span
                  >
                </CardTitle>
              </CardHeader>
              <CardContent class="grid gap-3 p-6 pt-2 text-sm">
                <!-- Divider -->
                <div class="h-px w-full bg-white/5"></div>

                <!-- Items List -->
                <div class="space-y-3">
                  {#if person.foodItems?.length > 0}
                    <div class="space-y-1">
                      <div
                        class="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider"
                      >
                        <Utensils class="h-3 w-3" /> <span>Food</span>
                      </div>
                      {#each person.foodItems as item}
                        <div
                          class="flex justify-between items-center text-muted-foreground pl-5"
                        >
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      {/each}
                    </div>
                  {/if}

                  {#if person.drinkItems?.length > 0}
                    <div class="space-y-1">
                      <div
                        class="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider"
                      >
                        <Wine class="h-3 w-3" /> <span>Drinks</span>
                      </div>
                      {#each person.drinkItems as item}
                        <div
                          class="flex justify-between items-center text-muted-foreground pl-5"
                        >
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>

                <!-- Tax & Fees -->
                <div class="mt-2 space-y-1 rounded-lg bg-black/20 p-3">
                  <div
                    class="flex justify-between text-xs text-muted-foreground"
                  >
                    <span>Subtotal</span>
                    <span>{formatCurrency(person.subtotal)}</span>
                  </div>
                  <div
                    class="flex justify-between text-xs text-muted-foreground"
                  >
                    <span>Tax</span>
                    <span>{formatCurrency(person.tax)}</span>
                  </div>
                  <div
                    class="flex justify-between text-xs text-muted-foreground"
                  >
                    <span>Service Fee</span>
                    <span>{formatCurrency(person.serviceFee)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        {/each}
      </div>

      <!-- Floating Bottom Bar for Grand Total -->
      <div class="fixed bottom-6 left-4 right-4 z-50">
        <div in:slide={{ duration: 300, delay: 500 }} class="mx-auto max-w-md">
          <Card
            class="border-t border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl ring-1 ring-white/10"
          >
            <CardHeader class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Grand Total
                  </p>
                  <h3 class="text-2xl font-bold text-white tracking-tight">
                    {formatCurrency(result.grandTotal)}
                  </h3>
                </div>
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    class="rounded-full"
                    on:click={clearAndBack}
                  >
                    <ArrowLeft class="h-4 w-4" />
                  </Button>
                  <!-- Future: Share Button -->
                  <!-- <Button variant="default" size="icon" class="rounded-full bg-blue-600 hover:bg-blue-500">
                                        <Share2 class="h-4 w-4" />
                                    </Button> -->
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      <!-- Spacing for floating bar -->
      <div class="h-24"></div>
    {:else}
      <!-- Empty State -->
      <div
        class="flex flex-col items-center justify-center space-y-4 py-20 text-center text-muted-foreground"
      >
        <Receipt class="h-16 w-16 opacity-20" />
        <div class="space-y-1">
          <h3 class="text-lg font-medium text-foreground">No Receipt Found</h3>
          <p class="text-sm">Upload a receipt to see the breakdown.</p>
        </div>
        <Button variant="secondary" on:click={clearAndBack}>Go to Upload</Button
        >
      </div>
    {/if}
  </div>
</div>
