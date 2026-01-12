<script lang="ts">
  import { goto } from "$app/navigation";
  import ReceiptUpload from "$lib/components/ReceiptUpload.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "$lib/components/ui/alert";
  import { Separator } from "$lib/components/ui/separator";
  import { Receipt, Loader2, AlertCircle, Sparkles } from "lucide-svelte";

  let file: File | null = null;
  let peopleCount: number | null = null;
  let instructions: string = "";
  let isSubmitting = false;
  let errorMessage: string | null = null;

  $: isValid = file !== null && peopleCount !== null && peopleCount > 0;

  async function handleSubmit() {
    if (!isValid || !file) return;

    isSubmitting = true;
    errorMessage = null;

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("peopleCount", peopleCount!.toString());
      formData.append("instructions", instructions);

      const response = await fetch("/api/split-bill", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process receipt");
      }

      // Store result and navigate
      sessionStorage.setItem("splitBillResult", JSON.stringify(data));
      await goto("/result");
    } catch (error) {
      console.error(error);
      errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="flex min-h-[calc(100vh-4rem)] flex-col">
  <!-- Hero Header -->
  <div
    class="flex flex-col items-center justify-center space-y-4 py-8 text-center"
  >
    <div
      class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
    >
      <Receipt class="h-8 w-8 text-primary" />
    </div>
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        AI Split Bill
      </h1>
      <p class="max-w-[300px] text-muted-foreground">
        Upload a receipt, tell us who ate what, and let AI calculate the split.
      </p>
    </div>
  </div>

  <!-- Error Alert -->
  {#if errorMessage}
    <Alert variant="destructive" class="mb-6">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  {/if}

  <!-- Main Form Card -->
  <Card class="flex-1">
    <CardHeader class="space-y-1">
      <CardTitle class="text-xl">Bill Details</CardTitle>
      <CardDescription>
        Upload your receipt and provide splitting instructions.
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-6">
      <!-- Receipt Upload Section -->
      <div class="space-y-3">
        <ReceiptUpload bind:file />
        {#if !file}
          <p class="text-xs text-muted-foreground">
            Supports JPG, PNG, and WEBP formats
          </p>
        {/if}
      </div>

      <Separator />

      <!-- Number of People -->
      <div class="space-y-2">
        <Label for="people" class="text-sm font-medium">Number of People</Label>
        <Input
          id="people"
          type="number"
          min="1"
          placeholder="How many people are splitting?"
          bind:value={peopleCount}
          class="h-11"
        />
        <p class="text-xs text-muted-foreground">
          Enter the total number of people sharing the bill
        </p>
      </div>

      <Separator />

      <!-- Extra Instructions -->
      <div class="space-y-2">
        <Label for="instructions" class="text-sm font-medium">
          Splitting Instructions
          <span class="font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="instructions"
          placeholder="Describe who ate what..."
          class="min-h-[120px] resize-none"
          bind:value={instructions}
        />
        <div class="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p class="mb-1.5 font-medium">Examples:</p>
          <ul class="list-inside list-disc space-y-0.5">
            <li>Alice had the salad and iced tea</li>
            <li>Bob only had the burger</li>
            <li>Charlie and Dana shared the pizza</li>
          </ul>
        </div>
      </div>
    </CardContent>

    <CardFooter class="flex-col gap-3 pt-2">
      <Button
        size="lg"
        class="w-full gap-2 text-base font-semibold"
        disabled={!isValid || isSubmitting}
        on:click={handleSubmit}
      >
        {#if isSubmitting}
          <Loader2 class="h-5 w-5 animate-spin" />
          Processing Receipt...
        {:else}
          <Sparkles class="h-5 w-5" />
          Split Bill with AI
        {/if}
      </Button>

      {#if !isValid && !isSubmitting}
        <p class="text-center text-xs text-muted-foreground">
          {#if !file}
            Upload a receipt to continue
          {:else if !peopleCount || peopleCount <= 0}
            Enter the number of people
          {/if}
        </p>
      {/if}
    </CardFooter>
  </Card>
</div>
