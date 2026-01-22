import { Store, Users, Info, ArrowLeft, Palette, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export type StorefrontView = 'shop-all' | 'closet-selection' | 'parker-closet' | 'spencer-closet' | 'shop-by-brand' | 'collection-grails' | 'about-us';

interface StorefrontSidebarProps {
  currentView: StorefrontView;
  onNavigate: (view: StorefrontView) => void;
}

const navigation = [
  { title: 'Shop All', view: 'shop-all' as const, icon: Store },
  { title: 'Shop by Brand', view: 'shop-by-brand' as const, icon: Palette },
  { title: 'Collection Grails', view: 'collection-grails' as const, icon: Crown },
  { title: 'Personal Collection', view: 'closet-selection' as const, icon: Users },
  { title: 'About Us', view: 'about-us' as const, icon: Info },
];

export function StorefrontSidebar({ currentView, onNavigate }: StorefrontSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const isViewActive = (view: StorefrontView) => {
    if (view === 'closet-selection') {
      return currentView === 'closet-selection' || 
             currentView === 'parker-closet' || 
             currentView === 'spencer-closet';
    }
    return currentView === view;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground tracking-tight">WSC</span>
            <span className="text-xs text-sidebar-foreground/60">Wall St Collection</span>
          </div>
        )}
        {collapsed && (
          <span className="font-bold text-sidebar-foreground text-center">W</span>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Shop</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isViewActive(item.view)}
                    tooltip={item.title}
                    onClick={() => onNavigate(item.view)}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
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
          onClick={handleBackToDashboard}
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          {!collapsed && <span>Back to Dashboard</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
