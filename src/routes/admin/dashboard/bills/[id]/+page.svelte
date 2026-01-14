<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import * as ScrollArea from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import { toast } from "svelte-sonner";
    import {
        ArrowLeft,
        Copy,
        ExternalLink,
        Receipt,
        Users,
        DollarSign,
        Image,
    } from "lucide-svelte";

    let { data } = $props();
    let bill = $derived(data.bill);

    function formatCurrency(amount: number | undefined): string {
        if (amount === undefined || amount === null) return "N/A";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: bill.result_data?.currency || "USD",
        }).format(amount);
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    async function copyPublicLink() {
        const url = `${window.location.origin}/result/${bill.id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Public link copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    }

    // Calculate totals from fees_taxes
    function getTotalFees(): number {
        if (!bill.fees_taxes) return 0;
        return Object.values(bill.fees_taxes)
            .filter((v): v is number => typeof v === "number")
            .reduce((sum, val) => sum + val, 0);
    }
</script>

<div class="space-y-6">
    <!-- Header: Responsive stacking -->
    <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
        <div class="flex items-center gap-2">
            <Button variant="ghost" size="sm" href="/admin/dashboard/bills">
                <ArrowLeft class="h-4 w-4 sm:mr-2" />
                <span class="hidden sm:inline">Back to Bills</span>
            </Button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onclick={copyPublicLink}
                class="flex-1 sm:flex-none"
            >
                <Copy class="h-4 w-4 sm:mr-2" />
                <span class="hidden sm:inline">Copy Link</span>
            </Button>
            <Button
                variant="outline"
                size="sm"
                href="/result/{bill.id}"
                target="_blank"
                class="flex-1 sm:flex-none"
            >
                <ExternalLink class="h-4 w-4 sm:mr-2" />
                <span class="hidden sm:inline">View Public</span>
            </Button>
        </div>
    </div>

    <!-- Bill Info: Stack on mobile, grid on larger -->
    <div class="grid gap-6 lg:grid-cols-2">
        <!-- Summary Card -->
        <Card.Root>
            <Card.Header>
                <Card.Title class="flex items-center gap-2">
                    <Receipt class="h-5 w-5" />
                    Bill Summary
                </Card.Title>
            </Card.Header>
            <Card.Content class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <p class="text-sm text-muted-foreground">ID</p>
                        <p class="font-mono text-xs sm:text-sm break-all">
                            {bill.id}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-muted-foreground">Created</p>
                        <p class="text-sm">{formatDate(bill.created_at)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-muted-foreground">
                            Total Amount
                        </p>
                        <p class="text-lg font-semibold">
                            {formatCurrency(bill.result_data?.total_amount)}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-muted-foreground">People</p>
                        <p
                            class="text-lg font-semibold flex items-center gap-1"
                        >
                            <Users class="h-4 w-4" />
                            {bill.result_data?.num_people ||
                                bill.person_breakdown?.length ||
                                "N/A"}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-muted-foreground">Visibility</p>
                        <span
                            class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
              {bill.visibility === 'public'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'}"
                        >
                            {bill.visibility === "public"
                                ? "Public"
                                : "Private"}
                        </span>
                    </div>
                    <div>
                        <p class="text-sm text-muted-foreground">
                            Total Fees/Taxes
                        </p>
                        <p class="text-lg font-semibold">
                            {formatCurrency(getTotalFees())}
                        </p>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Receipt Image Card -->
        <Card.Root>
            <Card.Header>
                <Card.Title class="flex items-center gap-2">
                    <Image class="h-5 w-5" />
                    Receipt Image
                </Card.Title>
            </Card.Header>
            <Card.Content>
                {#if bill.receipt_image_url}
                    <div
                        class="relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-lg border bg-muted"
                    >
                        <img
                            src={bill.receipt_image_url}
                            alt="Receipt"
                            class="absolute inset-0 h-full w-full object-contain"
                        />
                    </div>
                {:else}
                    <div
                        class="flex items-center justify-center aspect-[3/4] w-full max-w-sm mx-auto rounded-lg border bg-muted"
                    >
                        <p class="text-muted-foreground">No receipt image</p>
                    </div>
                {/if}
            </Card.Content>
        </Card.Root>
    </div>

    <!-- Person Breakdown -->
    <Card.Root>
        <Card.Header>
            <Card.Title class="flex items-center gap-2">
                <DollarSign class="h-5 w-5" />
                Person Breakdown
            </Card.Title>
        </Card.Header>
        <Card.Content class="p-0 sm:p-6">
            <ScrollArea.Root class="w-full">
                <div class="min-w-[500px]">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Person</Table.Head>
                                <Table.Head class="hidden sm:table-cell"
                                    >Items</Table.Head
                                >
                                <Table.Head class="text-right"
                                    >Subtotal</Table.Head
                                >
                                <Table.Head
                                    class="text-right hidden md:table-cell"
                                    >Fees</Table.Head
                                >
                                <Table.Head class="text-right">Total</Table.Head
                                >
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each bill.person_breakdown || [] as person, i (i)}
                                <Table.Row>
                                    <Table.Cell class="font-medium"
                                        >{person.name ||
                                            `Person ${i + 1}`}</Table.Cell
                                    >
                                    <Table.Cell
                                        class="text-sm text-muted-foreground hidden sm:table-cell"
                                    >
                                        <div class="flex flex-col gap-1">
                                            <span class="font-medium">
                                                {(person.foodItems?.length ||
                                                    0) +
                                                    (person.drinkItems
                                                        ?.length || 0)} items
                                            </span>
                                            {#if (person.foodItems?.length || 0) + (person.drinkItems?.length || 0) > 0}
                                                <div
                                                    class="text-xs text-muted-foreground space-y-0.5 mt-1"
                                                >
                                                    {#each person.foodItems || [] as item}
                                                        <div
                                                            class="flex justify-between gap-2"
                                                        >
                                                            <span
                                                                >{item.name}</span
                                                            >
                                                            <span
                                                                class="tabular-nums"
                                                                >{formatCurrency(
                                                                    item.price,
                                                                )}</span
                                                            >
                                                        </div>
                                                    {/each}
                                                    {#each person.drinkItems || [] as item}
                                                        <div
                                                            class="flex justify-between gap-2"
                                                        >
                                                            <span
                                                                >{item.name}</span
                                                            >
                                                            <span
                                                                class="tabular-nums"
                                                                >{formatCurrency(
                                                                    item.price,
                                                                )}</span
                                                            >
                                                        </div>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell class="text-right"
                                        >{formatCurrency(
                                            person.subtotal,
                                        )}</Table.Cell
                                    >
                                    <Table.Cell
                                        class="text-right hidden md:table-cell"
                                        >{formatCurrency(
                                            (person.tax || 0) +
                                                (person.serviceFee || 0),
                                        )}</Table.Cell
                                    >
                                    <Table.Cell class="text-right font-semibold"
                                        >{formatCurrency(
                                            person.total,
                                        )}</Table.Cell
                                    >
                                </Table.Row>
                            {:else}
                                <Table.Row>
                                    <Table.Cell
                                        colspan={5}
                                        class="text-center text-muted-foreground py-8"
                                    >
                                        No breakdown available.
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
                <ScrollArea.Scrollbar orientation="horizontal" />
            </ScrollArea.Root>
        </Card.Content>
    </Card.Root>

    <!-- Fees & Taxes Breakdown -->
    {#if bill.fees_taxes && Object.keys(bill.fees_taxes).length > 0}
        <Card.Root>
            <Card.Header>
                <Card.Title>Fees & Taxes</Card.Title>
            </Card.Header>
            <Card.Content>
                <div class="space-y-2">
                    {#each Object.entries(bill.fees_taxes) as [key, value] (key)}
                        {#if typeof value === "number"}
                            <div class="flex justify-between">
                                <span class="text-muted-foreground capitalize"
                                    >{key.replace(/_/g, " ")}</span
                                >
                                <span class="font-medium"
                                    >{formatCurrency(value)}</span
                                >
                            </div>
                        {/if}
                    {/each}
                    <Separator />
                    <div class="flex justify-between font-semibold">
                        <span>Total Fees & Taxes</span>
                        <span>{formatCurrency(getTotalFees())}</span>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    {/if}
</div>
