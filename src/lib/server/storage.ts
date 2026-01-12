import { supabaseAdmin } from './supabase';

const RECEIPTS_BUCKET = 'receipts';

/**
 * Upload a receipt image to Supabase Storage.
 * 
 * @param imageBuffer - The image data as ArrayBuffer
 * @param imageType - MIME type of the image (e.g., 'image/jpeg')
 * @param uuid - UUID to use as the filename
 * @returns Public URL of the uploaded image
 */
export async function uploadReceiptImage(
    imageBuffer: ArrayBuffer,
    imageType: string,
    uuid: string
): Promise<string> {
    // Determine file extension from MIME type
    const extensionMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
    };

    const extension = extensionMap[imageType] || 'jpg';
    const filePath = `${uuid}.${extension}`;

    const { error } = await supabaseAdmin.storage
        .from(RECEIPTS_BUCKET)
        .upload(filePath, imageBuffer, {
            contentType: imageType,
            upsert: false // Immutable - don't allow overwrites
        });

    if (error) {
        throw new Error(`Failed to upload receipt image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
        .from(RECEIPTS_BUCKET)
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}
