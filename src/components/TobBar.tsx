import { UserButton } from '@clerk/clerk-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function TopBar({ className, children }: { className?: string; children?: ReactNode }) {
    return (
        <div className="border-b px-6 py-2">
            <div className="mx-auto flex max-w-7xl items-center">
                <div className={cn('flex flex-1 items-center', className)}>{children}</div>
                <div className="size-7 rounded-full bg-gray-200">
                    <UserButton />
                </div>
            </div>
        </div>
    )
}
