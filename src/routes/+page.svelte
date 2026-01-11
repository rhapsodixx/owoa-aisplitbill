<script lang="ts">
  import { goto } from "$app/navigation";
  import ReceiptUpload from "$lib/components/ReceiptUpload.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";

  let file: File | null = null;
  let peopleCount: number | null = null;
  let instructions: string = "";
  let isSubmitting = false;

  $: isValid = file !== null && peopleCount !== null && peopleCount > 0;

  async function handleSubmit() {
    if (!isValid) return;

    isSubmitting = true;
    try {
      // Todo: Integrate API in Phase 3
      // For now, simulate upload and redirect
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // console.log({ file, peopleCount, instructions });
      goto("/result");
    } catch (error) {
      console.error(error);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="text-center space-y-2">
    <h1
      class="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
    >
      AI Split Bill
    </h1>
    <p class="text-muted-foreground">Upload a receipt, tell us who ate what.</p>
  </div>

  <Card class="border-border/50 shadow-lg backdrop-blur-sm">
    <CardHeader>
      <CardTitle>Bill Details</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Receipt Upload -->
      <ReceiptUpload bind:file />

      <!-- Number of People -->
      <div class="space-y-2">
        <Label for="people">Number of People</Label>
        <Input
          id="people"
          type="number"
          min="1"
          placeholder="e.g. 4"
          bind:value={peopleCount}
        />
      </div>

      <!-- Extra Instructions -->
      <div class="space-y-2">
        <Label for="instructions">Extra Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          placeholder="e.g. Alice had the salad, Bob only had a drink..."
          class="min-h-[100px]"
          bind:value={instructions}
        />
      </div>

      <!-- Submit -->
      <Button
        size="lg"
        class="w-full font-semibold shadow-md transition-all hover:shadow-lg"
        disabled={!isValid || isSubmitting}
        on:click={handleSubmit}
      >
        {#if isSubmitting}
          Processing...
        {:else}
          Split Bill with AI
        {/if}
      </Button>
    </CardContent>
  </Card>
</div>
