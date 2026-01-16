<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { onDestroy } from "svelte";
  import { Lock, Calculator } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import {
    PasscodePrompt,
    PersonCard,
    PaymentInstructionCard,
    ReceiptCard,
    FloatingBottomBar,
    EditItemDialog,
  } from "$lib/components/result";
  import type { Person, BillItem } from "$lib/types";
  import { recalculateProportional } from "$lib/utils/recalculate";

  export let data;

  const {
    receiptImageUrl,
    resultId,
    isPrivate,
    paymentInstruction,
    feesTaxes,
  } = data;

  // Mutable state for result data (reactive)
  let people: Person[] = (
    data.result as { people: Person[]; grandTotal: number }
  ).people;
  let grandTotal: number = (
    data.result as { people: Person[]; grandTotal: number }
  ).grandTotal;

  // Store original tax and service fee totals for proportional recalculation
  const totalTax =
    feesTaxes?.totalTax ?? people.reduce((sum, p) => sum + (p.tax || 0), 0);
  const totalServiceFee =
    feesTaxes?.totalServiceFee ??
    people.reduce((sum, p) => sum + (p.serviceFee || 0), 0);

  // Access control state
  let isUnlocked = !isPrivate;
  let passcodeInput = "";
  let showPasscode = false;
  let passcodeError: string | null = null;
  let isVerifying = false;

  // Lockout state
  let isLocked = false;
  let lockoutRemainingSeconds = 0;
  let lockoutTimer: ReturnType<typeof setInterval>;

  // Edit dialog state
  let editDialogOpen = false;
  let editingPersonIndex = -1;
  let editingItemType: "food" | "drink" = "food";
  let editingItemIndex = -1;
  let editingItem: BillItem | null = null;
  let isSaving = false;

  let copied = false;

  function goBack() {
    window.location.href = "/";
  }

  async function shareResult() {
    const url = `${window.location.origin}/result/${resultId}`;

    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      toast.success("Link copied to clipboard!", {
        description: isPrivate
          ? "The recipient will need the passcode to view."
          : "Share this link with your friends.",
      });

      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy link", {
        description: "Please copy the URL manually.",
      });
    }
  }

  function startLockoutTimer(seconds: number) {
    isLocked = true;
    lockoutRemainingSeconds = seconds;
    passcodeError = null;

    if (lockoutTimer) clearInterval(lockoutTimer);

    lockoutTimer = setInterval(() => {
      lockoutRemainingSeconds--;
      if (lockoutRemainingSeconds <= 0) {
        clearInterval(lockoutTimer);
        isLocked = false;
        passcodeError = null;
      }
    }, 1000);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  onDestroy(() => {
    if (lockoutTimer) clearInterval(lockoutTimer);
  });

  async function verifyPasscode() {
    if (!passcodeInput.trim()) {
      passcodeError = "Please enter a passcode";
      return;
    }

    isVerifying = true;
    passcodeError = null;

    try {
      const response = await fetch("/api/verify-passcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: resultId,
          passcode: passcodeInput.trim(),
        }),
      });

      const result = await response.json();

      if (response.status === 429) {
        startLockoutTimer(result.retryAfter || 60);
        return;
      }

      if (response.ok && result.success) {
        isUnlocked = true;
        toast.success("Access granted!");
      } else {
        passcodeError = result.error || "Incorrect passcode";
      }
    } catch (err) {
      passcodeError = "Failed to verify passcode. Please try again.";
    } finally {
      isVerifying = false;
    }
  }

  function handlePasscodeKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !isLocked) {
      verifyPasscode();
    }
  }

  function toggleShowPasscode() {
    showPasscode = !showPasscode;
  }

  // Edit item handlers
  function handleEditItem(
    personIndex: number,
    itemType: "food" | "drink",
    itemIndex: number
  ) {
    editingPersonIndex = personIndex;
    editingItemType = itemType;
    editingItemIndex = itemIndex;

    const person = people[personIndex];
    const items = itemType === "food" ? person.foodItems : person.drinkItems;
    editingItem = { ...items[itemIndex] };
    editDialogOpen = true;
  }

  async function handleSaveItem(updatedItem: BillItem) {
    if (editingPersonIndex < 0 || editingItemIndex < 0) return;

    isSaving = true;

    try {
      // Update local state
      const updatedPeople = [...people];
      const person = { ...updatedPeople[editingPersonIndex] };

      if (editingItemType === "food") {
        const updatedItems = [...person.foodItems];
        updatedItems[editingItemIndex] = updatedItem;
        person.foodItems = updatedItems;
      } else {
        const updatedItems = [...person.drinkItems];
        updatedItems[editingItemIndex] = updatedItem;
        person.drinkItems = updatedItems;
      }

      updatedPeople[editingPersonIndex] = person;

      // Recalculate all totals
      const recalculated = recalculateProportional(
        updatedPeople,
        totalTax,
        totalServiceFee
      );

      // Update reactive state
      people = recalculated.people;
      grandTotal = recalculated.grandTotal;

      // Persist to backend
      const response = await fetch("/api/update-result", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: resultId,
          result_data: {
            people: recalculated.people,
            grandTotal: recalculated.grandTotal,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save changes");
      }

      toast.success("Changes saved!", {
        description: "The item has been updated.",
      });

      // Close dialog
      editDialogOpen = false;
      editingItem = null;
    } catch (err) {
      toast.error("Failed to save changes", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      isSaving = false;
    }
  }

  function handleCloseDialog() {
    editDialogOpen = false;
    editingItem = null;
    editingPersonIndex = -1;
    editingItemIndex = -1;
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
      {#if isPrivate && !isUnlocked}
        <Lock class="h-7 w-7 text-primary" />
      {:else}
        <Calculator class="h-7 w-7 text-primary" />
      {/if}
    </div>
    <div class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
        {#if isPrivate && !isUnlocked}
          Protected Result
        {:else}
          Split Results
        {/if}
      </h1>
      <p class="text-sm text-muted-foreground">
        {#if isPrivate && !isUnlocked}
          Enter the passcode to view this result.
        {:else}
          Here's the detailed breakdown for each person.
        {/if}
      </p>
    </div>
  </div>

  <!-- Passcode Prompt (for private results) -->
  {#if isPrivate && !isUnlocked}
    <PasscodePrompt
      bind:passcodeInput
      bind:showPasscode
      {isVerifying}
      {isLocked}
      {lockoutRemainingSeconds}
      {passcodeError}
      onVerify={verifyPasscode}
      onToggleShowPasscode={toggleShowPasscode}
      {formatTime}
      onPasscodeKeydown={handlePasscodeKeydown}
    />
  {:else}
    <!-- Person Cards -->
    <div class="space-y-4" in:fade={{ duration: 300 }}>
      {#each people as person, i}
        <div in:slide={{ delay: Math.min(i * 80, 400), duration: 250 }}>
          <PersonCard
            {person}
            index={i}
            onEditItem={(itemType, itemIndex) =>
              handleEditItem(i, itemType, itemIndex)}
          />
        </div>
      {/each}
    </div>

    <!-- Payment Instruction Card (conditional) -->
    {#if paymentInstruction}
      <div class="mt-6" in:fade={{ delay: 300, duration: 300 }}>
        <PaymentInstructionCard instruction={paymentInstruction} />
      </div>
    {/if}

    <!-- Original Receipt Card -->
    <div class="mt-6" in:fade={{ delay: 400, duration: 300 }}>
      <ReceiptCard imageUrl={receiptImageUrl} />
    </div>

    <!-- Floating Bottom Bar -->
    <FloatingBottomBar
      {grandTotal}
      {copied}
      onShare={shareResult}
      onBack={goBack}
    />
  {/if}
</div>

<!-- Edit Item Dialog -->
<EditItemDialog
  bind:open={editDialogOpen}
  item={editingItem}
  itemType={editingItemType}
  onsave={handleSaveItem}
  onclose={handleCloseDialog}
/>
