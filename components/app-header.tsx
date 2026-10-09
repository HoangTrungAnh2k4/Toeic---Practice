import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { LuHistory, LuLanguages } from "react-icons/lu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppHeader() {
  return (
    <header className="flex justify-between items-center gap-2 bg-background px-4 border-b h-14 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mt-1 mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-5">
        <button className="text-muted-foreground hover:text-foreground">
          <LuHistory className="size-5 cursor-pointer" />
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <LuLanguages className="size-5 cursor-pointer" />
        </button>
        <Avatar className="size-8 cursor-pointer">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
