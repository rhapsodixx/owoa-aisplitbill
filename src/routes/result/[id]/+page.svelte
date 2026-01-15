<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import { onDestroy } from "svelte";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import {
        Utensils,
        Wine,
        Receipt,
        ArrowLeft,
        Calculator,
        Share2,
        Copy,
        Check,
        Image as ImageIcon,
        Lock,
        Eye,
        EyeOff,
        Loader2,
        CreditCard,
        Clock,
    } from "lucide-svelte";
    import { cn } from "$lib/utils";
    import { toast } from "svelte-sonner";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        Alert,
        AlertDescription,
        AlertTitle,
    } from "$lib/components/ui/alert";

    export let data;

    const { result, receiptImageUrl, resultId, isPrivate, paymentInstruction } =
        data;

    // Access control state
    let isUnlocked = !isPrivate; // Public results are unlocked by default
    let passcodeInput = "";
    let showPasscode = false;
    let passcodeError: string | null = null;
    let isVerifying = false;
    let copiedPaymentInstruction = false;

    // Lockout state
    let isLocked = false;
    let lockoutRemainingSeconds = 0;
    let lockoutTimer: ReturnType<typeof setInterval>;

    const avatarColors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-amber-500",
        "bg-green-500",
        "bg-emerald-500",
        "bg-teal-500",
        "bg-cyan-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-violet-500",
        "bg-purple-500",
        "bg-fuchsia-500",
        "bg-pink-500",
        "bg-rose-500",
    ];

    function getAvatarColor(index: number) {
        return avatarColors[index % avatarColors.length];
    }

    interface BillItem {
        name: string;
        price: number;
    }

    interface Person {
        name: string;
        foodItems: BillItem[];
        drinkItems: BillItem[];
        subtotal: number;
        tax: number;
        serviceFee: number;
        total: number;
    }

    // Type assertion for result data
    const people = (result as { people: Person[]; grandTotal: number }).people;
    const grandTotal = (result as { people: Person[]; grandTotal: number })
        .grandTotal;

    let copied = false;

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    }

    function goBack() {
        window.location.href = "/";
    }

    async function shareResult() {
        const url = `${window.location.origin}/result/${resultId}`;

        try {
            await navigator.clipboard.writeText(url);
            copied = true;
            toast.success("Link copied to clipboard!", {
                description: isPrivate
                    ? "The recipient will need the passcode to view."
                    : "Share this link with your friends.",
            });

            // Reset copied state after 2 seconds
            setTimeout(() => {
                copied = false;
            }, 2000);
        } catch (err) {
            toast.error("Failed to copy link", {
                description: "Please copy the URL manually.",
            });
        }
    }

    async function copyPaymentInstruction() {
        if (!paymentInstruction) return;

        try {
            await navigator.clipboard.writeText(paymentInstruction);
            copiedPaymentInstruction = true;
            toast.success("Payment instruction copied!", {
                description:
                    "You can now paste it to your banking app or message.",
                position: "bottom-center",
            });

            setTimeout(() => {
                copiedPaymentInstruction = false;
            }, 2000);
        } catch (err) {
            toast.error("Failed to copy payment instruction");
        }
    }

    function startLockoutTimer(seconds: number) {
        isLocked = true;
        lockoutRemainingSeconds = seconds;
        passcodeError = null; // Clear standard error in favor of lockout UI

        if (lockoutTimer) clearInterval(lockoutTimer);

        lockoutTimer = setInterval(() => {
            lockoutRemainingSeconds--;
            if (lockoutRemainingSeconds <= 0) {
                clearInterval(lockoutTimer);
                isLocked = false;
                passcodeError = null; // Reset error state on unlock
            }
        }, 1000);
    }

    function formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    onDestroy(() => {
        if (lockoutTimer) clearInterval(lockoutTimer);
    });

    async function verifyPasscode() {
        if (!passcodeInput.trim()) {
            passcodeError = "Please enter a passcode";
            return;
        }

        isVerifying = true;
        passcodeError = null;

        try {
            const response = await fetch("/api/verify-passcode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: resultId,
                    passcode: passcodeInput.trim(),
                }),
            });

            const result = await response.json();

            if (response.status === 429) {
                // Handle lockout
                startLockoutTimer(result.retryAfter || 60);
                return;
            }

            if (response.ok && result.success) {
                isUnlocked = true;
                toast.success("Access granted!");
            } else {
                passcodeError = result.error || "Incorrect passcode";
            }
        } catch (err) {
            passcodeError = "Failed to verify passcode. Please try again.";
        } finally {
            isVerifying = false;
        }
    }

    function handlePasscodeKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && !isLocked) {
            verifyPasscode();
        }
    }
</script>

<div class="flex min-h-[calc(100vh-4rem)] flex-col pb-32">
    <!-- Page Header -->
    <div
        class="flex flex-col items-center justify-center space-y-3 py-6 text-center"
    >
        <div
            class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
        >
            {#if isPrivate && !isUnlocked}
                <Lock class="h-7 w-7 text-primary" />
            {:else}
                <Calculator class="h-7 w-7 text-primary" />
            {/if}
        </div>
        <div class="space-y-1">
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
                {#if isPrivate && !isUnlocked}
                    Protected Result
                {:else}
                    Split Results
                {/if}
            </h1>
            <p class="text-sm text-muted-foreground">
                {#if isPrivate && !isUnlocked}
                    Enter the passcode to view this result.
                {:else}
                    Here's the detailed breakdown for each person.
                {/if}
            </p>
        </div>
    </div>

    <!-- Passcode Prompt (for private results) -->
    {#if isPrivate && !isUnlocked}
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
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            on:click={() => (showPasscode = !showPasscode)}
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
                            Please wait {formatTime(lockoutRemainingSeconds)} before
                            trying again.
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
                    on:click={verifyPasscode}
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
    {:else}
        <!-- Person Cards -->
        <div class="space-y-4" in:fade={{ duration: 300 }}>
            {#each people as person, i}
                <div in:slide={{ delay: i * 80, duration: 250 }}>
                    <Card
                        class="overflow-hidden transition-shadow hover:shadow-md"
                    >
                        <CardHeader class="pb-3">
                            <CardTitle
                                class="flex items-center justify-between"
                            >
                                <div class="flex items-center gap-3">
                                    <!-- Avatar -->
                                    <div
                                        class={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-full text-white font-bold shadow-sm",
                                            getAvatarColor(i),
                                        )}
                                    >
                                        {person.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span class="text-lg font-semibold"
                                        >{person.name}</span
                                    >
                                </div>
                                <span class="text-xl font-bold text-primary">
                                    {formatCurrency(person.total)}
                                </span>
                            </CardTitle>
                        </CardHeader>

                        <CardContent class="space-y-4 pt-0">
                            <Separator />

                            <!-- Items List -->
                            <div class="space-y-4">
                                <!-- Food Items -->
                                {#if person.foodItems?.length > 0}
                                    <div class="space-y-2">
                                        <div
                                            class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                        >
                                            <Utensils class="h-3.5 w-3.5" />
                                            <span>Food</span>
                                        </div>
                                        <div class="space-y-1.5 pl-5">
                                            {#each person.foodItems as item}
                                                <div
                                                    class="flex items-center justify-between text-sm"
                                                >
                                                    <span
                                                        class="text-foreground"
                                                        >{item.name}</span
                                                    >
                                                    <span
                                                        class="text-muted-foreground tabular-nums"
                                                    >
                                                        {formatCurrency(
                                                            item.price,
                                                        )}
                                                    </span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}

                                <!-- Drink Items -->
                                {#if person.drinkItems?.length > 0}
                                    <div class="space-y-2">
                                        <div
                                            class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                        >
                                            <Wine class="h-3.5 w-3.5" />
                                            <span>Drinks</span>
                                        </div>
                                        <div class="space-y-1.5 pl-5">
                                            {#each person.drinkItems as item}
                                                <div
                                                    class="flex items-center justify-between text-sm"
                                                >
                                                    <span
                                                        class="text-foreground"
                                                        >{item.name}</span
                                                    >
                                                    <span
                                                        class="text-muted-foreground tabular-nums"
                                                    >
                                                        {formatCurrency(
                                                            item.price,
                                                        )}
                                                    </span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
                            </div>

                            <!-- Summary Box -->
                            <div class="rounded-lg bg-muted/50 p-3 space-y-1.5">
                                <div
                                    class="flex justify-between text-xs text-muted-foreground"
                                >
                                    <span>Subtotal</span>
                                    <span class="tabular-nums"
                                        >{formatCurrency(person.subtotal)}</span
                                    >
                                </div>
                                <div
                                    class="flex justify-between text-xs text-muted-foreground"
                                >
                                    <span>Tax</span>
                                    <span class="tabular-nums"
                                        >{formatCurrency(person.tax)}</span
                                    >
                                </div>
                                <div
                                    class="flex justify-between text-xs text-muted-foreground"
                                >
                                    <span>Service Fee</span>
                                    <span class="tabular-nums"
                                        >{formatCurrency(
                                            person.serviceFee,
                                        )}</span
                                    >
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            {/each}
        </div>

        <!-- Payment Instruction Card (conditional) -->
        {#if paymentInstruction}
            <div class="mt-6" in:fade={{ delay: 300, duration: 300 }}>
                <Card>
                    <CardHeader class="pb-3">
                        <CardTitle class="flex items-center gap-2 text-base">
                            <CreditCard class="h-4 w-4" />
                            Payment Instruction
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="rounded-lg bg-muted/50 p-4 relative group">
                            <p
                                class="whitespace-pre-wrap text-sm leading-relaxed pr-8 font-mono"
                            >
                                {paymentInstruction}
                            </p>
                            <Button
                                size="icon"
                                variant="ghost"
                                class="absolute right-2 top-2 h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity"
                                on:click={copyPaymentInstruction}
                            >
                                {#if copiedPaymentInstruction}
                                    <Check class="h-4 w-4 text-green-500" />
                                {:else}
                                    <Copy class="h-4 w-4" />
                                {/if}
                                <span class="sr-only">Copy instruction</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        {/if}

        <!-- Original Receipt Card -->
        <div class="mt-6" in:fade={{ delay: 400, duration: 300 }}>
            <Card>
                <CardHeader class="pb-3">
                    <CardTitle class="flex items-center gap-2 text-base">
                        <ImageIcon class="h-4 w-4" />
                        Original Receipt
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="overflow-hidden rounded-lg border bg-muted/30">
                        <img
                            src={receiptImageUrl}
                            alt="Original receipt"
                            class="w-full h-auto object-contain max-h-[500px]"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Floating Bottom Bar -->
        <div class="fixed bottom-0 left-0 right-0 z-50 p-4">
            <div
                in:slide={{ duration: 300, delay: 400 }}
                class="mx-auto max-w-md"
            >
                <Card
                    class="border-border/50 bg-card/95 shadow-xl backdrop-blur-xl"
                >
                    <CardHeader class="p-4">
                        <div class="flex items-center justify-between">
                            <div class="space-y-0.5">
                                <p
                                    class="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                                >
                                    Grand Total
                                </p>
                                <p class="text-2xl font-bold tracking-tight">
                                    {formatCurrency(grandTotal)}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    class="gap-2"
                                    on:click={shareResult}
                                >
                                    {#if copied}
                                        <Check class="h-4 w-4" />
                                        Copied!
                                    {:else}
                                        <Share2 class="h-4 w-4" />
                                        Share
                                    {/if}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    class="h-10 w-10 rounded-full"
                                    on:click={goBack}
                                >
                                    <ArrowLeft class="h-4 w-4" />
                                    <span class="sr-only">Go back</span>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    {/if}
</div>
