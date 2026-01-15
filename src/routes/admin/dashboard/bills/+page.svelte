<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import * as ScrollArea from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import { toast } from "svelte-sonner";
    import { formatCurrency } from "$lib/utils";
    import {
        Copy,
        Eye,
        ChevronLeft,
        ChevronRight,
        Receipt,
    } from "lucide-svelte";

    let { data } = $props();

    // formatCurrency imported from $lib/utils

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    async function copyLink(id: string) {
        const url = `${window.location.origin}/result/${id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    }
</script>

<div class="space-y-6">
    <!-- Header: Stack on mobile, row on larger -->
    <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
        <h2 class="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt class="h-6 w-6" />
            Split Bills
        </h2>
        <span class="text-sm text-muted-foreground">
            {data.total} total bills
        </span>
    </div>

    <Card.Root>
        <Card.Content class="p-0">
            <!-- Scrollable table wrapper for mobile -->
            <ScrollArea.Root class="w-full">
                <div class="min-w-[600px]">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>UUID</Table.Head>
                                <Table.Head>Total</Table.Head>
                                <Table.Head class="hidden sm:table-cell"
                                    >People</Table.Head
                                >
                                <Table.Head class="hidden md:table-cell"
                                    >Visibility</Table.Head
                                >
                                <Table.Head class="hidden lg:table-cell"
                                    >Created</Table.Head
                                >
                                <Table.Head class="text-right"
                                    >Actions</Table.Head
                                >
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each data.bills as bill (bill.id)}
                                <Table.Row>
                                    <Table.Cell class="font-mono text-xs">
                                        {bill.id.slice(0, 8)}...
                                    </Table.Cell>
                                    <Table.Cell>
                                        {formatCurrency(
                                            bill.result_data?.total_amount,
                                        )}
                                    </Table.Cell>
                                    <Table.Cell class="hidden sm:table-cell">
                                        {bill.result_data?.num_people || "N/A"}
                                    </Table.Cell>
                                    <Table.Cell class="hidden md:table-cell">
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
                                    </Table.Cell>
                                    <Table.Cell
                                        class="hidden lg:table-cell text-sm text-muted-foreground"
                                    >
                                        {formatDate(bill.created_at)}
                                    </Table.Cell>
                                    <Table.Cell class="text-right">
                                        <div
                                            class="flex items-center justify-end gap-1"
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                href="/admin/dashboard/bills/{bill.id}"
                                            >
                                                <Eye class="h-4 w-4" />
                                                <span class="sr-only">View</span
                                                >
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onclick={() =>
                                                    copyLink(bill.id)}
                                            >
                                                <Copy class="h-4 w-4" />
                                                <span class="sr-only"
                                                    >Copy Link</span
                                                >
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {:else}
                                <Table.Row>
                                    <Table.Cell
                                        colspan={6}
                                        class="text-center text-muted-foreground py-8"
                                    >
                                        No split bills found.
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
                <ScrollArea.Scrollbar orientation="horizontal" />
            </ScrollArea.Root>
        </Card.Content>

        <!-- Pagination: Responsive layout -->
        {#if data.totalPages > 1}
            <Card.Footer
                class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t px-4 py-3 sm:px-6 sm:py-4"
            >
                <span
                    class="text-sm text-muted-foreground text-center sm:text-left"
                >
                    Page {data.page} of {data.totalPages}
                </span>
                <div class="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={data.page <= 1}
                        href="?page={data.page - 1}"
                    >
                        <ChevronLeft class="h-4 w-4" />
                        <span class="hidden sm:inline">Previous</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={data.page >= data.totalPages}
                        href="?page={data.page + 1}"
                    >
                        <span class="hidden sm:inline">Next</span>
                        <ChevronRight class="h-4 w-4" />
                    </Button>
                </div>
            </Card.Footer>
        {/if}
    </Card.Root>
</div>
