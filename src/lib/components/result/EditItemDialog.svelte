<script lang="ts">
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import type { BillItem, Person } from "$lib/types";

  // Props
  export let open = false;
  export let item: BillItem | null = null;
  export let itemType: "food" | "drink" = "food";
  export let currentPersonName: string = "";
  export let allPeople: Person[] = [];
  export let onsave: (
    updatedItem: BillItem,
    newPersonName?: string
  ) => void = () => {};
  export let onclose: () => void = () => {};

  // Form state
  let editName = "";
  let editPrice = 0;
  let editQuantity = 1;
  let selectedPerson = "";

  // Validation errors
  let nameError: string | null = null;
  let priceError: string | null = null;
  let quantityError: string | null = null;

  // Compute available people for reassignment (all except current)
  $: availablePeople = allPeople.filter((p) => p.name !== currentPersonName);

  // Compute display label for selected person
  $: selectedLabel =
    selectedPerson === currentPersonName
      ? `${selectedPerson} (current)`
      : selectedPerson || "Keep current assignment";

  // Sync form state when item changes
  $: if (item) {
    editName = item.name;
    editPrice = item.price;
    editQuantity = item.quantity ?? 1;
    selectedPerson = currentPersonName; // Default to current assignment
    nameError = null;
    priceError = null;
    quantityError = null;
  }

  function validate(): boolean {
    let valid = true;
    nameError = null;
    priceError = null;
    quantityError = null;

    if (!editName.trim()) {
      nameError = "Item name cannot be empty";
      valid = false;
    }

    if (isNaN(+editPrice) || +editPrice < 0) {
      priceError = "Price must be a non-negative number";
      valid = false;
    }

    if (isNaN(+editQuantity) || +editQuantity < 1) {
      quantityError = "Quantity must be at least 1";
      valid = false;
    }

    return valid;
  }

  function handleSave() {
    if (!validate() || !item) return;

    const updatedItem: BillItem = {
      ...item,
      name: editName.trim(),
      price: +editPrice,
      quantity: +editQuantity,
      isEdited: true,
    };

    // Determine if reassignment is happening
    const isReassigned = selectedPerson && selectedPerson !== currentPersonName;
    onsave(updatedItem, isReassigned ? selectedPerson : undefined);
  }

  function handleCancel() {
    open = false;
    onclose();
  }
</script>

<Dialog bind:open>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>
        Edit {itemType === "food" ? "Food" : "Drink"} Item
      </DialogTitle>
    </DialogHeader>

    <div class="grid gap-4 py-4">
      <!-- Name Field -->
      <div class="grid gap-2">
        <Label for="edit-name">Name</Label>
        <Input
          id="edit-name"
          bind:value={editName}
          placeholder="Item name"
          class={nameError ? "border-destructive" : ""}
        />
        {#if nameError}
          <p class="text-sm text-destructive">{nameError}</p>
        {/if}
      </div>

      <!-- Price Field -->
      <div class="grid gap-2">
        <Label for="edit-price">Price</Label>
        <Input
          id="edit-price"
          type="number"
          bind:value={editPrice}
          min="0"
          step="100"
          class={priceError ? "border-destructive" : ""}
        />
        {#if priceError}
          <p class="text-sm text-destructive">{priceError}</p>
        {/if}
      </div>

      <!-- Quantity Field -->
      <div class="grid gap-2">
        <Label for="edit-quantity">Quantity</Label>
        <Input
          id="edit-quantity"
          type="number"
          bind:value={editQuantity}
          min="1"
          step="1"
          class={quantityError ? "border-destructive" : ""}
        />
        {#if quantityError}
          <p class="text-sm text-destructive">{quantityError}</p>
        {/if}
      </div>

      <!-- Assignment Selector (only show if there are other people) -->
      {#if availablePeople.length > 0}
        <div class="grid gap-2">
          <Label for="edit-assignment">Reassign to</Label>
          <Select.Root type="single" bind:value={selectedPerson}>
            <Select.Trigger id="edit-assignment" class="w-full">
              <span>{selectedLabel}</span>
            </Select.Trigger>
            <Select.Content>
              <!-- Current person (default, shown but indicates current) -->
              <Select.Item
                value={currentPersonName}
                label={`${currentPersonName} (current)`}
              >
                {currentPersonName} (current)
              </Select.Item>
              <!-- Other people available for reassignment -->
              {#each availablePeople as person}
                <Select.Item value={person.name} label={person.name}>
                  {person.name}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          <p class="text-xs text-muted-foreground">
            Select a different person to reassign this item
          </p>
        </div>
      {/if}
    </div>

    <DialogFooter>
      <Button variant="outline" on:click={handleCancel}>Cancel</Button>
      <Button on:click={handleSave}>Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
