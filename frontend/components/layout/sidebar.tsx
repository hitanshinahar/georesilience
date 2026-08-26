"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Map as MapIcon, 
  AlertTriangle, 
  Camera, 
  Network, 
  BarChart2, 
  Settings, 
  User,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Command Center', href: '/', icon: Activity },
  { name: 'Risk Map', href: '/risk-map', icon: MapIcon },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Field Reports', href: '/field-reports', icon: Camera },
  { name: 'Infrastructure', href: '/infrastructure', icon: Network },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-full">
      <div className="h-14 flex items-center px-4 border-b border-border/50">
        <ShieldAlert className="w-6 h-6 text-orange-500 mr-2" />
        <span className="font-bold tracking-tight">GeoResilience</span>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className={cn('mr-3 h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border/50 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground px-2 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          System Online
        </div>
        <Link href="/settings" className="flex items-center px-2 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground">
          <Settings className="mr-3 h-4 w-4" />
          Settings
        </Link>
        <Link href="/profile" className="flex items-center px-2 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground">
          <User className="mr-3 h-4 w-4" />
          Profile
        </Link>
      </div>
    </div>
  );
}
