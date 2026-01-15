import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format a number as currency.
 * @param amount - The amount to format. Returns "N/A" if undefined/null.
 * @param currency - Currency code (default: "USD")
 */
export function formatCurrency(
	amount: number | undefined | null,
	currency: string = "USD"
): string {
	if (amount === undefined || amount === null) return "N/A";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(amount);
}

/**
 * Avatar color palette for consistent person identification.
 * Order must not change as it affects existing result displays.
 */
export const avatarColors = [
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
] as const;

/**
 * Get avatar color by index (cycles through palette).
 */
export function getAvatarColor(index: number): string {
	return avatarColors[index % avatarColors.length];
}
