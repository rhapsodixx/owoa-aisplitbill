<script lang="ts">
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        Alert,
        AlertDescription,
        AlertTitle,
    } from "$lib/components/ui/alert";
    import { Lock, Eye, EyeOff, Loader2, Clock } from "lucide-svelte";

    export let passcodeInput: string;
    export let showPasscode: boolean;
    export let isVerifying: boolean;
    export let isLocked: boolean;
    export let lockoutRemainingSeconds: number;
    export let passcodeError: string | null;
    export let onVerify: () => void;
    export let onToggleShowPasscode: () => void;
    export let formatTime: (seconds: number) => string;
    export let onPasscodeKeydown: (event: KeyboardEvent) => void;
</script>

<Card class="mx-auto w-full max-w-sm">
    <CardHeader>
        <CardTitle class="text-lg">Enter Passcode</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
        <div class="space-y-2">
            <Label for="result-passcode">Passcode</Label>
            <div class="relative">
                <Input
                    id="result-passcode"
                    type={showPasscode ? "text" : "password"}
                    maxlength={8}
                    placeholder="Enter passcode"
                    bind:value={passcodeInput}
                    class="pr-10"
                    disabled={isVerifying || isLocked}
                    on:keydown={onPasscodeKeydown}
                />
                <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    on:click={onToggleShowPasscode}
                    disabled={isLocked}
                >
                    {#if showPasscode}
                        <EyeOff class="h-4 w-4" />
                    {:else}
                        <Eye class="h-4 w-4" />
                    {/if}
                </button>
            </div>
        </div>

        {#if isLocked}
            <Alert
                variant="destructive"
                class="border-red-500 bg-red-500/10 text-destructive dark:text-red-400"
            >
                <Clock class="h-4 w-4" />
                <AlertTitle>Too many failed attempts</AlertTitle>
                <AlertDescription>
                    Please wait {formatTime(lockoutRemainingSeconds)} before trying
                    again.
                </AlertDescription>
            </Alert>
        {:else if passcodeError}
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{passcodeError}</AlertDescription>
            </Alert>
        {/if}

        <Button
            class="w-full gap-2"
            on:click={onVerify}
            disabled={isVerifying || !passcodeInput.trim() || isLocked}
        >
            {#if isLocked}
                <Clock class="h-4 w-4 animate-pulse" />
                Locked ({formatTime(lockoutRemainingSeconds)})
            {:else if isVerifying}
                <Loader2 class="h-4 w-4 animate-spin" />
                Verifying...
            {:else}
                <Lock class="h-4 w-4" />
                Unlock Result
            {/if}
        </Button>
    </CardContent>
</Card>
