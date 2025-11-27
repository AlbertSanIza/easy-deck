import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key')
}
if (!import.meta.env.VITE_CONVEX_URL) {
    throw new Error('Missing Convex URL')
}
if (!import.meta.env.VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL) {
    throw new Error('Missing Clerk Sign In Force Redirect URL')
}
if (!import.meta.env.VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL) {
    throw new Error('Missing Clerk Sign Up Force Redirect URL')
}

export const VITE_CLERK_PUBLISHABLE_KEY: string = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
export const VITE_CONVEX_URL: string = import.meta.env.VITE_CONVEX_URL
export const VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL: string = import.meta.env.VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL
export const VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL: string = import.meta.env.VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Extract presentation ID from various Google Slides URL formats:
 * - https://docs.google.com/presentation/d/PRESENTATION_ID/edit
 * - https://docs.google.com/presentation/d/PRESENTATION_ID
 * - https://docs.google.com/presentation/d/PRESENTATION_ID/view
 * - PRESENTATION_ID (already an ID)
 */
export function extractGoogleSlidesID(input: string): string | null {
    if (!input || typeof input !== 'string') {
        return null
    }
    const trimmed = input.trim()
    if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return trimmed
    }
    const urlPatterns = [/\/presentation\/d\/([a-zA-Z0-9_-]+)/, /presentation\/d\/([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/]
    for (const pattern of urlPatterns) {
        const match = trimmed.match(pattern)
        if (match && match[1]) {
            return match[1]
        }
    }
    return null
}
