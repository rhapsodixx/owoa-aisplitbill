<script lang="ts">
    import { enhance } from "$app/forms";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Alert from "$lib/components/ui/alert";
    import { Loader2, AlertCircle } from "lucide-svelte";

    export let form;

    let loading = false;
</script>

<div class="flex items-center justify-center min-h-screen bg-background">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Admin Login</Card.Title>
            <Card.Description>
                Enter your credentials to access the admin dashboard.
            </Card.Description>
        </Card.Header>
        <Card.Content class="grid gap-4">
            {#if form?.error}
                <Alert.Root variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <Alert.Title>Error</Alert.Title>
                    <Alert.Description>{form.error}</Alert.Description>
                </Alert.Root>
            {/if}

            <form
                method="POST"
                action="?/login"
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        loading = false;
                        await update();
                    };
                }}
                class="grid gap-4"
            >
                <div class="grid gap-2">
                    <Label for="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@example.com"
                        required
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                    />
                </div>
                <Card.Footer class="px-0 pt-2 flex flex-col gap-2">
                    <Button class="w-full" type="submit" disabled={loading}>
                        {#if loading}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        {:else}
                            Sign in
                        {/if}
                    </Button>
                    <div class="text-center text-sm text-muted-foreground">
                        <a
                            href="/admin/reset-password"
                            class="hover:underline underline-offset-4"
                        >
                            Forgot your password?
                        </a>
                    </div>
                </Card.Footer>
            </form>
        </Card.Content>
    </Card.Root>
</div>
