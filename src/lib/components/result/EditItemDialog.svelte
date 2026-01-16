<script lang="ts">
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
  } from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { BillItem } from "$lib/types";

  // Props
  export let open = false;
  export let item: BillItem | null = null;
  export let itemType: "food" | "drink" = "food";
  export let onsave: (updatedItem: BillItem) => void = () => {};
  export let onclose: () => void = () => {};

  // Form state
  let editName = "";
  let editPrice = 0;
  let editQuantity = 1;

  // Validation errors
  let nameError: string | null = null;
  let priceError: string | null = null;
  let quantityError: string | null = null;

  // Sync form state when item changes
  $: if (item) {
    editName = item.name;
    editPrice = item.price;
    editQuantity = item.quantity ?? 1;
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

    if (typeof editPrice !== "number" || isNaN(editPrice) || editPrice < 0) {
      priceError = "Price must be a non-negative number";
      valid = false;
    }

    if (
      typeof editQuantity !== "number" ||
      isNaN(editQuantity) ||
      editQuantity < 1
    ) {
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
      price: editPrice,
      quantity: editQuantity,
      isEdited: true,
    };

    onsave(updatedItem);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onclose();
    }
  }
</script>

<Dialog bind:open onOpenChange={handleOpenChange}>
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
    </div>

    <DialogFooter>
      <DialogClose asChild let:builder>
        <Button builders={[builder]} variant="outline">Cancel</Button>
      </DialogClose>
      <Button onclick={handleSave}>Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
