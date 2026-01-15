<script lang="ts">
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Image as ImageIcon } from "lucide-svelte";

    export let imageUrl: string;
</script>

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
                src={imageUrl}
                alt="Original receipt"
                class="w-full h-auto object-contain max-h-[500px]"
            />
        </div>
    </CardContent>
</Card>
