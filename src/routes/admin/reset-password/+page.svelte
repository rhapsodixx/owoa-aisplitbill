<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
</script>

<div class="flex items-center justify-center min-h-screen bg-background">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title>Reset Password</Card.Title>
            <Card.Description
                >Enter your email to receive a reset link.</Card.Description
            >
        </Card.Header>
        <Card.Content>
            <form class="grid gap-4">
                <div class="grid gap-2">
                    <Label for="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                    />
                </div>
                <Button class="w-full">Send Reset Link</Button>
            </form>
            <div class="mt-4 text-center text-sm">
                <a href="/admin/login" class="text-primary hover:underline"
                    >Back to Login</a
                >
            </div>
        </Card.Content>
    </Card.Root>
</div>
