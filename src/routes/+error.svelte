<script lang="ts">
  import { page } from "$app/stores";
</script>

<div class="space-y-4 text-center">
  <h1 class="text-4xl font-bold text-destructive">Oops!</h1>
  <p class="text-muted-foreground">
    {$page.status}: {$page.error?.message || "Something went wrong."}
  </p>
  <a href="/" class="text-primary hover:underline">Go back home</a>
</div>
