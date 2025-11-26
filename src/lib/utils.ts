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

export const VITE_CLERK_PUBLISHABLE_KEY: string = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
export const VITE_CONVEX_URL: string = import.meta.env.VITE_CONVEX_URL

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
