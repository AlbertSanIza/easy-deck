import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: RootComponent
})

function RootComponent() {
    return (
        <>
            <div>Hello "__root"!</div>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    )
}
