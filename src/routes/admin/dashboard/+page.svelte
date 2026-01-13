<script lang="ts">
    let { data } = $props();
</script>

<div class="space-y-6">
    <div class="space-y-2">
        <h1 class="text-2xl font-bold tracking-tight">
            Welcome to Admin Dashboard
        </h1>
        <p class="text-muted-foreground">
            Logged in as: <span class="font-medium"
                >{data.user?.email || "Unknown"}</span
            >
        </p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
        <a
            href="/admin/dashboard/users"
            class="block p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
        >
            <h3 class="font-semibold">User Management</h3>
            <p class="text-sm text-muted-foreground">
                Invite and manage admin users
            </p>
        </a>
        <a
            href="/admin/dashboard/bills"
            class="block p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
        >
            <h3 class="font-semibold">Split Bills</h3>
            <p class="text-sm text-muted-foreground">
                View all split bill records
            </p>
        </a>
    </div>
</div>
