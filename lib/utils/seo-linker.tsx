import React, { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Keywords and their corresponding target URLs for internal linking.
 * Order matters: more specific keywords should come first.
 */
const KEYWORD_MAP: { [key: string]: string } = {
    "Casa Honor": "/tag/casa-honor",
    "Caja Honor": "/tag/casa-honor",
    "Los Patios": "/inmobiliaria-en-los-patios",
    "Cúcuta": "/inmobiliaria-en-cucuta",
    "Villa del Rosario": "/inmobiliaria-en-villa-del-rosario",
    "venta": "/venta",
    "arriendo": "/arriendo",
    "propietarios": "/vender-casa-en-los-patios",
    "invertir": "/blog/ciudad/cucuta",
    "apartamentos": "/tag/apartamentos",
    "casas": "/tag/casas",
    "crédito hipotecario": "/blog/ciudad/cucuta", // Temporary until specific credit page exists
    "comprar casa": "/venta",
};

/**
 * IntelligentLinker transforms plain text or markdown-style text into
 * JSX with internal links based on global keywords.
 */
export function IntelligentLinker({ content }: { content: string }) {
    if (!content) return null;

    // Normalize newlines and split by one or more newlines
    // We filter empty blocks to avoid empty paragraphs
    const lines = content.split(/\r?\n/);
    const blocks: { type: 'h2' | 'p', text: string }[] = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('## ')) {
            blocks.push({ type: 'h2', text: trimmed.replace('## ', '') });
        } else {
            // If the last block was a paragraph, we might want to append? 
            // But usually in markdown, single newline = same paragraph.
            // However, for this implementation, let's treat each non-empty line as a block for now, 
            // or merge consecutive paragraphs if preferred.
            if (blocks.length > 0 && blocks[blocks.length - 1].type === 'p') {
                blocks[blocks.length - 1].text += ' ' + trimmed;
            } else {
                blocks.push({ type: 'p', text: trimmed });
            }
        }
    });

    return (
        <div className="article-body-container">
            {blocks.map((block, i) => {
                if (block.type === 'h2') {
                    const id = block.text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-');
                    return (
                        <h2 key={i} id={id} className="text-2xl font-black text-zinc-900 mt-16 mb-8 scroll-mt-32 uppercase tracking-tight">
                            {renderTextWithLinks(block.text)}
                        </h2>
                    );
                }

                return (
                    <p key={i} className="mb-8 text-lg font-normal text-zinc-600 leading-[1.8] text-justify whitespace-normal break-words">
                        {renderTextWithLinks(block.text)}
                    </p>
                );
            })}
        </div>
    );
}

function renderTextWithLinks(text: string): ReactNode {
    // Process keywords sorted by length descending to match longest first
    const sortedKeywords = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length);

    let parts: (string | ReactNode)[] = [text];
    let keyCounter = 0;

    sortedKeywords.forEach(keyword => {
        const newParts: (string | ReactNode)[] = [];

        parts.forEach(part => {
            if (typeof part !== 'string') {
                newParts.push(part);
                return;
            }

            // Find keyword with word boundaries
            const regex = new RegExp(`(\\b${keyword}\\b)`, 'gi');
            const innerParts = part.split(regex);

            innerParts.forEach((inner) => {
                if (inner.toLowerCase() === keyword.toLowerCase()) {
                    newParts.push(
                        <Link
                            key={`${keyword}-${keyCounter++}`}
                            href={KEYWORD_MAP[keyword]}
                            className="text-[#fb2c36] font-bold border-b border-[#fb2c36]/30 hover:bg-[#fb2c36]/5 transition-all"
                        >
                            {inner}
                        </Link>
                    );
                } else if (inner !== '') {
                    newParts.push(inner);
                }
            });
        });

        parts = newParts;
    });

    return <>{parts}</>;
}

/**
 * Extracts H2 headings from the content for a Table of Contents.
 * Assumes headings are written as "## Heading Title" (Markdown) or similar.
 */
export function extractHeadings(content: string): { id: string; text: string }[] {
    if (!content) return [];

    const lines = content.split('\n');
    const headings: { id: string; text: string }[] = [];

    lines.forEach(line => {
        const match = line.match(/^##\s+(.+)/);
        if (match) {
            const text = match[1];
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
            headings.push({ id, text });
        }
    });

    return headings;
}
