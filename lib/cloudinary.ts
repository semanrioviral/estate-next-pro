/**
 * Cloudinary transformation utility
 * Usage: getCloudinaryUrl('v12345/property.jpg', { width: 800 })
 */
export function getCloudinaryUrl(publicId: string, options: { width?: number; height?: number; crop?: string } = {}) {
    const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    const transformations = [
        'f_auto',
        'q_auto',
        options.width ? `w_${options.width}` : null,
        options.height ? `h_${options.height}` : null,
        options.crop ? `c_${options.crop}` : null,
    ].filter(Boolean).join(',');

    return `${baseUrl}/${transformations}/${publicId}`;
}
