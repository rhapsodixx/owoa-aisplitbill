/**
 * Shared type definitions for Split Bill feature
 */

export interface BillItem {
    id?: string;
    name: string;
    price: number;
    quantity?: number;
    isEdited?: boolean;
}

export interface Person {
    name: string;
    foodItems: BillItem[];
    drinkItems: BillItem[];
    subtotal: number;
    tax: number;
    serviceFee: number;
    total: number;
}

export interface ResultData {
    people: Person[];
    grandTotal: number;
}

export interface FeeConfig {
    taxPercentage: number;
    servicePercentage: number;
}

export interface SplitBillResult {
    id: string;
    result_data: ResultData;
    original_result_data: ResultData;
    currency: string;
    receipt_image_url: string;
    created_at: string;
    visibility: 'public' | 'private';
    payment_instruction: string | null;
}
