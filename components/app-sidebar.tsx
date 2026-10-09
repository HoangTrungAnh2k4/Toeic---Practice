import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LuPackage, LuBox } from "react-icons/lu"
import Link from "next/link"

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0 dark">
      <SidebarHeader className="flex flex-row items-center px-4 border-b h-18">
        <div className="flex items-center gap-2 w-full font-semibold text-sidebar-foreground">
           <div className="bg-cyan-500 p-1 rounded-md shrink-0">
             <LuPackage className="size-7 text-white" />
           </div>
           <div className="flex flex-col">
             <span className="text-lg tracking-wide">AdminCN</span>
             <span className="font-normal text-muted-foreground text-sm tracking-wide">Dashboard Template</span>
           </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="bg-sidebar-accent hover:bg-sidebar-accent h-10 text-cyan-400 hover:text-cyan-400" render={<Link href="/dashboard" />}>
                <LuBox className="size-5!" />
                <span className="text-base">Orders</span>
              </SidebarMenuButton>
            </SidebarMenuItem>            
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-sidebar-foreground">
        <div className="flex items-center gap-2 p-2 w-full">
          <div className="flex justify-center items-center bg-sidebar-accent rounded-full w-8 h-8 font-medium text-xs">
            N
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
