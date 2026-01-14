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
  import {
    Receipt,
    Loader2,
    AlertCircle,
    Sparkles,
    Lock,
    Globe,
    Eye,
    EyeOff,
  } from "lucide-svelte";

  let file: File | null = null;
  let peopleCount: number | null = null;
  let instructions: string = "";
  let isSubmitting = false;
  let errorMessage: string | null = null;
  let visibility: "public" | "private" = "public";
  let passcode: string = "";
  let showPasscode = false;
  let passcodeError: string | null = null;
  let paymentInstruction: string = "";
  let paymentInstructionError: string | null = null;

  const PAYMENT_INSTRUCTION_MAX_LENGTH = 300;

  $: isPasscodeValid =
    visibility === "public" ||
    (passcode.trim().length > 0 && passcode.trim().length <= 8);
  $: isValid =
    file !== null && peopleCount !== null && peopleCount > 0 && isPasscodeValid;

  async function handleSubmit() {
    if (!isValid || !file) return;

    isSubmitting = true;
    errorMessage = null;

    try {
      // Validate passcode
      if (visibility === "private") {
        const trimmed = passcode.trim();
        if (!trimmed) {
          passcodeError = "Passcode is required for private results";
          return;
        }
        if (trimmed.length > 8) {
          passcodeError = "Passcode must be 8 characters or less";
          return;
        }
        passcodeError = null;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("peopleCount", peopleCount!.toString());
      formData.append("instructions", instructions);
      formData.append("visibility", visibility);
      if (visibility === "private") {
        formData.append("passcode", passcode.trim());
      }

      // Add payment instruction if provided (validate length)
      const trimmedPaymentInstruction = paymentInstruction.trim();
      if (trimmedPaymentInstruction.length > PAYMENT_INSTRUCTION_MAX_LENGTH) {
        paymentInstructionError = `Payment instruction must be ${PAYMENT_INSTRUCTION_MAX_LENGTH} characters or less`;
        return;
      }
      paymentInstructionError = null;
      if (trimmedPaymentInstruction) {
        formData.append("paymentInstruction", trimmedPaymentInstruction);
      }

      const response = await fetch("/api/split-bill", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process receipt");
      }

      // Redirect to UUID-based result page
      await goto(`/result/${data.id}`);
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
            <li>Budi had the bubur ayam and iced tea</li>
            <li>Joko only had the lotek</li>
            <li>Charlie and Dana shared the ramen</li>
          </ul>
        </div>
      </div>

      <Separator />

      <!-- Result Visibility -->
      <div class="space-y-3">
        <Label class="text-sm font-medium">Result Visibility</Label>
        <div class="flex gap-2">
          <Button
            variant={visibility === "public" ? "default" : "outline"}
            class="flex-1 gap-2"
            on:click={() => {
              visibility = "public";
              passcodeError = null;
            }}
          >
            <Globe class="h-4 w-4" />
            Public
          </Button>
          <Button
            variant={visibility === "private" ? "default" : "outline"}
            class="flex-1 gap-2"
            on:click={() => (visibility = "private")}
          >
            <Lock class="h-4 w-4" />
            Private
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">
          {#if visibility === "public"}
            Anyone with the link can view the split result.
          {:else}
            A passcode will be required to view the split result.
          {/if}
        </p>

        <!-- Conditional Passcode Field -->
        {#if visibility === "private"}
          <div class="space-y-2 pt-2">
            <Label for="passcode" class="text-sm font-medium">Passcode</Label>
            <div class="relative">
              <Input
                id="passcode"
                type={showPasscode ? "text" : "password"}
                maxlength={8}
                placeholder="Enter passcode"
                bind:value={passcode}
                class="h-11 pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                on:click={() => (showPasscode = !showPasscode)}
              >
                {#if showPasscode}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </button>
            </div>
            <p class="text-xs text-muted-foreground">Up to 8 characters</p>
            {#if passcodeError}
              <p class="text-xs text-destructive">{passcodeError}</p>
            {/if}
          </div>
        {/if}
      </div>

      <Separator />

      <!-- Payment Instruction (Optional) -->
      <div class="space-y-2">
        <Label for="payment-note" class="text-sm font-medium">
          Payment Instruction
          <span class="font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="payment-note"
          placeholder="e.g., Payment to BCA bank account 861209892"
          class="min-h-[80px] resize-none"
          maxlength={PAYMENT_INSTRUCTION_MAX_LENGTH}
          bind:value={paymentInstruction}
        />
        <div
          class="flex items-center justify-between text-xs text-muted-foreground"
        >
          <span>Optional — shown on the result page if filled</span>
          <span
            class={paymentInstruction.length >
            PAYMENT_INSTRUCTION_MAX_LENGTH - 50
              ? "text-amber-600"
              : ""}
          >
            {paymentInstruction.length}/{PAYMENT_INSTRUCTION_MAX_LENGTH}
          </span>
        </div>
        {#if paymentInstructionError}
          <p class="text-xs text-destructive">{paymentInstructionError}</p>
        {/if}
      </div>
    </CardContent>

    <CardFooter class="flex-col gap-3 pt-2">
      <Button
        id="submit-aianalyze"
        size="lg"
        variant="default"
        class="w-full gap-2 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
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
        <Alert class="mt-2 border-primary/20 bg-primary/5 text-primary">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            {#if !file}
              Upload a receipt to continue
            {:else if !peopleCount || peopleCount <= 0}
              Enter the number of people
            {/if}
          </AlertDescription>
        </Alert>
      {/if}
    </CardFooter>
  </Card>

  <!-- App Version Display -->
  <div class="mt-4 pb-4 text-center text-xs text-muted-foreground">
    Version: {__APP_VERSION__}
  </div>
</div>
