/**
 * Client-side recalculation utility for split bill edits.
 * 
 * LLM GUARD RAIL: This module performs NO AI calls.
 * All calculations are deterministic and happen client-side.
 */

import type { Person, BillItem, FeeConfig } from '$lib/types';

/**
 * Calculate the sum of all item prices for a person
 */
function calculateItemsTotal(items: BillItem[]): number {
    return items.reduce((sum, item) => {
        const quantity = item.quantity ?? 1;
        return sum + (item.price * quantity);
    }, 0);
}

/**
 * Recalculate all totals for a single person
 */
export function recalculatePerson(
    person: Person,
    feeConfig: FeeConfig
): Person {
    const foodTotal = calculateItemsTotal(person.foodItems);
    const drinkTotal = calculateItemsTotal(person.drinkItems);
    const subtotal = foodTotal + drinkTotal;
    
    const tax = subtotal * (feeConfig.taxPercentage / 100);
    const serviceFee = subtotal * (feeConfig.servicePercentage / 100);
    const total = subtotal + tax + serviceFee;
    
    return {
        ...person,
        subtotal,
        tax,
        serviceFee,
        total
    };
}

/**
 * Recalculate all people's totals using proportional fee allocation.
 * 
 * @param people - Array of people with their items
 * @param totalTax - Total tax amount from receipt (to be distributed proportionally)
 * @param totalServiceFee - Total service fee from receipt (to be distributed proportionally)
 * @returns Updated people array with recalculated totals
 */
export function recalculateProportional(
    people: Person[],
    totalTax: number,
    totalServiceFee: number
): { people: Person[]; grandTotal: number } {
    // Calculate each person's subtotal
    const peopleWithSubtotals = people.map(person => {
        const foodTotal = calculateItemsTotal(person.foodItems);
        const drinkTotal = calculateItemsTotal(person.drinkItems);
        return {
            ...person,
            subtotal: foodTotal + drinkTotal
        };
    });
    
    // Calculate grand subtotal
    const grandSubtotal = peopleWithSubtotals.reduce((sum, p) => sum + p.subtotal, 0);
    
    // Distribute tax and service fee proportionally
    const updatedPeople = peopleWithSubtotals.map(person => {
        const proportion = grandSubtotal > 0 ? person.subtotal / grandSubtotal : 0;
        const allocatedTax = totalTax * proportion;
        const allocatedServiceFee = totalServiceFee * proportion;
        const total = person.subtotal + allocatedTax + allocatedServiceFee;
        
        return {
            ...person,
            tax: allocatedTax,
            serviceFee: allocatedServiceFee,
            total
        };
    });
    
    // Calculate grand total
    const grandTotal = updatedPeople.reduce((sum, p) => sum + p.total, 0);
    
    return { people: updatedPeople, grandTotal };
}

/**
 * Mark an item as edited
 */
export function markItemAsEdited<T extends BillItem>(item: T): T {
    return { ...item, isEdited: true };
}

/**
 * Check if any items in a person's bill have been edited
 */
export function hasEditedItems(person: Person): boolean {
    const allItems = [...person.foodItems, ...person.drinkItems];
    return allItems.some(item => item.isEdited === true);
}
