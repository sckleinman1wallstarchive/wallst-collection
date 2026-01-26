import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Package,
  Target,
  BarChart3,
  Calculator,
  Ticket,
  Users,
  LogOut,
  Store,
  Eraser,
  ShieldCheck,
  Share2,
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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const navigation = [
  { title: 'Overview', url: '/', icon: LayoutDashboard },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Image Tools', url: '/image-tools', icon: Eraser },
  { title: 'Cross-Posting', url: '/cross-posting', icon: Share2 },
  { title: 'Authenticate', url: '/authenticate', icon: ShieldCheck },
  { title: 'Storefront', url: '/storefront', icon: Store },
  { title: 'Pop Ups', url: '/pop-ups', icon: Ticket },
  { title: 'Contacts', url: '/contacts', icon: Users },
  { title: 'Accounting', url: '/accounting', icon: Calculator },
  { title: 'Goals', url: '/goals', icon: Target },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      navigate('/');
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground tracking-tight">WSC</span>
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
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
