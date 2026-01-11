<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { createEventDispatcher } from "svelte";
  import { ImagePlus, X } from "lucide-svelte";

  export let file: File | null = null;
  export let previewUrl: string | null = null;

  const dispatch = createEventDispatcher();

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const selectedFile = target.files?.[0];

    if (selectedFile) {
      file = selectedFile;
      previewUrl = URL.createObjectURL(selectedFile);
      dispatch("change", { file });
    }
  }

  function clearFile() {
    file = null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    dispatch("change", { file: null });
  }
</script>

<div class="grid w-full max-w-sm items-center gap-1.5">
  <Label for="receipt">Receipt Image</Label>
  {#if previewUrl}
    <div class="relative mt-2 overflow-hidden rounded-md border border-border">
      <img
        src={previewUrl}
        alt="Receipt preview"
        class="max-h-64 w-full object-cover"
      />
      <Button
        variant="destructive"
        size="icon"
        class="absolute top-2 right-2 h-8 w-8 rounded-full"
        on:click={clearFile}
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Remove image</span>
      </Button>
    </div>
  {:else}
    <div
      class="relative flex min-h-[150px] w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:bg-accent/50"
    >
      <Input
        id="receipt"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        on:change={handleFileChange}
      />
      <div
        class="flex flex-col items-center justify-center space-y-2 text-center text-sm text-muted-foreground"
      >
        <ImagePlus class="h-8 w-8" />
        <p>
          <span class="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs">JPG, PNG, WEBP</p>
      </div>
    </div>
  {/if}
</div>
