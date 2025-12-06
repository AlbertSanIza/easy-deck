import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'
import { handleGoogleAuthCallback } from '@/lib/google-auth'

export const Route = createFileRoute('/auth/google/callback')({
    component: GoogleAuthCallback
})

function GoogleAuthCallback() {
    const navigate = useNavigate()
    const storeToken = useMutation(api.googleSlides.storeToken)
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function processAuth() {
            try {
                const result = handleGoogleAuthCallback()
                if (result) {
                    await storeToken({
                        accessToken: result.accessToken,
                        expiresAt: result.expiresIn
                    })
                    setStatus('success')
                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        navigate({ to: '/dashboard' })
                    }, 1500)
                } else {
                    setError('No access token received')
                    setStatus('error')
                }
            } catch (err: any) {
                setError(err.message || 'Authentication failed')
                setStatus('error')
            }
        }

        processAuth()
    }, [storeToken, navigate])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                {status === 'processing' && (
                    <>
                        <p className="text-lg">Processing authentication...</p>
                        <p className="mt-2 text-sm text-muted-foreground">Please wait</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <p className="text-lg text-green-600">Successfully connected to Google!</p>
                        <p className="mt-2 text-sm text-muted-foreground">Redirecting to dashboard...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <p className="text-lg text-destructive">Authentication failed</p>
                        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                        <button onClick={() => navigate({ to: '/dashboard' })} className="mt-4 text-primary hover:underline">
                            Return to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
