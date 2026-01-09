import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Package,
  Target,
  BarChart3,
  CheckSquare,
  FileText,
  Calculator,
  Ticket,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

const navigation = [
  { title: 'Overview', url: '/', icon: LayoutDashboard },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Got Sole', url: '/got-sole', icon: Ticket },
  { title: 'Accounting', url: '/accounting', icon: Calculator },
  { title: 'Goals', url: '/goals', icon: Target },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare },
  { title: 'Content', url: '/content', icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground tracking-tight">WSA</span>
            <span className="text-xs text-sidebar-foreground/60">Internal Dashboard</span>
          </div>
        )}
        {collapsed && (
          <span className="font-bold text-sidebar-foreground text-center">W</span>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
