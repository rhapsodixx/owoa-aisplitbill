<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Receipt, ArrowRight } from "lucide-svelte";
</script>

<div
  class="flex flex-1 flex-col items-center justify-center space-y-6 py-16 text-center min-h-[calc(100vh-4rem)]"
>
  <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
    <Receipt class="h-10 w-10 text-muted-foreground/50" />
  </div>
  <div class="space-y-2">
    <h1 class="text-2xl font-bold tracking-tight">No Receipt Found</h1>
    <p class="max-w-[250px] text-sm text-muted-foreground">
      Upload a receipt first to see the split breakdown.
    </p>
  </div>
  <Button variant="default" href="/" class="gap-2">
    Go to Upload
    <ArrowRight class="h-4 w-4" />
  </Button>
</div>
