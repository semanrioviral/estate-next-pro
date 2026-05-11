export default function cloudinaryLoader({ src, width, quality }: {
    src: string;
    width: number;
    quality?: number;
}) {
    if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
        const transforms = `c_limit,w_${width}`;
        if (src.includes('f_auto,q_auto')) {
            return src.replace('/f_auto,q_auto/', `/f_auto,q_auto,${transforms}/`);
        }
        return src.replace('/upload/', `/upload/f_auto,q_auto,${transforms}/`);
    }
    if (src.startsWith('http')) {
      const url = new URL(src);
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', String(quality || 75));
      return url.toString();
    }
    return `${src}?w=${width}&q=${quality || 75}`;
}
