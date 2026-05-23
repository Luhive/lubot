import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface LubotShellProps {
    children: React.ReactNode
}

export function LubotShell({ children }: LubotShellProps) {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <div className="flex flex-1 flex-col min-h-screen">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
