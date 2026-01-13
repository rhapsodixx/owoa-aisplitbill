<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "./app-sidebar.svelte";

    let { children } = $props();
</script>

<Sidebar.SidebarProvider>
    <AppSidebar />
    <Sidebar.SidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <Sidebar.SidebarTrigger class="-ml-1" />
            <div class="h-4 w-px bg-border"></div>
            <h1 class="text-sm font-semibold">Admin Dashboard</h1>
        </header>
        <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
            {@render children()}
        </div>
    </Sidebar.SidebarInset>
</Sidebar.SidebarProvider>
