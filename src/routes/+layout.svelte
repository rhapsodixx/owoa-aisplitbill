<script lang="ts">
  import "../app.css";
  import { Toaster } from "$lib/components/ui/sonner";
</script>

<Toaster richColors />

<div class="min-h-screen bg-background font-sans antialiased">
  <!-- Subtle gradient background for visual interest -->
  <div
    class="fixed inset-0 -z-10 bg-gradient-to-b from-background to-muted/20"
  ></div>

  <main class="container mx-auto max-w-md min-h-screen px-4 py-6 sm:px-6">
    <slot />
  </main>
</div>
