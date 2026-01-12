<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Card } from "$lib/components/ui/card";
  import { createEventDispatcher } from "svelte";
  import { ImagePlus, X, CheckCircle2 } from "lucide-svelte";

  export let file: File | null = null;
  export let previewUrl: string | null = null;

  const dispatch = createEventDispatcher();

  // For bind:files
  let files: FileList | null = null;

  // React to files change from bind:files (Playwright compatible)
  $: if (files && files.length > 0) {
    const selectedFile = files[0];
    file = selectedFile;
    previewUrl = URL.createObjectURL(selectedFile);
    dispatch("change", { file });
  }

  function clearFile() {
    file = null;
    files = null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    dispatch("change", { file: null });
  }
</script>

<div class="w-full space-y-2">
  <Label for="receipt" class="text-sm font-medium">Receipt Image</Label>

  {#if previewUrl}
    <!-- Preview State -->
    <Card class="relative overflow-hidden">
      <div class="relative aspect-[4/3] w-full">
        <img
          src={previewUrl}
          alt="Receipt preview"
          class="h-full w-full object-contain bg-muted/30"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        ></div>

        <!-- Success Badge -->
        <div
          class="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-green-500/90 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
        >
          <CheckCircle2 class="h-3.5 w-3.5" />
          Receipt uploaded
        </div>

        <!-- Remove Button -->
        <Button
          variant="destructive"
          size="icon"
          class="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
          on:click={clearFile}
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Remove image</span>
        </Button>
      </div>
    </Card>
  {:else}
    <!-- Upload State -->
    <div
      class="group relative flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-all hover:border-primary/50 hover:bg-muted/50"
    >
      <input
        id="receipt"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        class="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        bind:files
      />

      <div
        class="flex flex-col items-center justify-center space-y-3 p-6 text-center"
      >
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20"
        >
          <ImagePlus class="h-7 w-7 text-primary" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium">
            <span class="text-primary">Click to upload</span>
            <span class="text-muted-foreground"> or drag and drop</span>
          </p>
          <p class="text-xs text-muted-foreground">
            JPG, PNG, or WEBP up to 10MB
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
