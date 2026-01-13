<script lang="ts">
    import { enhance } from "$app/forms";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Alert from "$lib/components/ui/alert";
    import * as Table from "$lib/components/ui/table";
    import {
        Loader2,
        AlertCircle,
        CheckCircle2,
        UserPlus,
    } from "lucide-svelte";

    let { data, form } = $props();

    let loading = $state(false);
</script>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold tracking-tight">User Management</h2>
    </div>

    <!-- Invite Form -->
    <Card.Root>
        <Card.Header>
            <Card.Title class="flex items-center gap-2">
                <UserPlus class="h-5 w-5" />
                Invite New Admin
            </Card.Title>
            <Card.Description>
                Send an invitation email to a new admin user.
            </Card.Description>
        </Card.Header>
        <Card.Content>
            {#if form?.success}
                <Alert.Root class="mb-4">
                    <CheckCircle2 class="h-4 w-4" />
                    <Alert.Title>Success</Alert.Title>
                    <Alert.Description>{form.message}</Alert.Description>
                </Alert.Root>
            {/if}
            {#if form?.error}
                <Alert.Root variant="destructive" class="mb-4">
                    <AlertCircle class="h-4 w-4" />
                    <Alert.Title>Error</Alert.Title>
                    <Alert.Description>{form.error}</Alert.Description>
                </Alert.Root>
            {/if}

            <form
                method="POST"
                action="?/invite"
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        loading = false;
                        await update();
                    };
                }}
                class="flex gap-4"
            >
                <div class="flex-1">
                    <Label for="email" class="sr-only">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@example.com"
                        required
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {#if loading}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    {:else}
                        Send Invite
                    {/if}
                </Button>
            </form>
        </Card.Content>
    </Card.Root>

    <!-- Admin Users Table -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Admin Users</Card.Title>
            <Card.Description>
                List of all admin users with access to this dashboard.
            </Card.Description>
        </Card.Header>
        <Card.Content>
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Email</Table.Head>
                        <Table.Head>Created</Table.Head>
                        <Table.Head>Status</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each data.users as user (user.id)}
                        <Table.Row>
                            <Table.Cell class="font-medium"
                                >{user.email}</Table.Cell
                            >
                            <Table.Cell>
                                {new Date(user.created_at).toLocaleDateString()}
                            </Table.Cell>
                            <Table.Cell>
                                <span
                                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                  {user.email_confirmed_at
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'}"
                                >
                                    {user.email_confirmed_at
                                        ? "Active"
                                        : "Pending"}
                                </span>
                            </Table.Cell>
                        </Table.Row>
                    {:else}
                        <Table.Row>
                            <Table.Cell
                                colspan={3}
                                class="text-center text-muted-foreground"
                            >
                                No admin users found.
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </Card.Content>
    </Card.Root>
</div>
