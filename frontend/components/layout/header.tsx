import { Bell, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="h-14 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 z-10 relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
          <MapPin className="w-4 h-4 mr-2 text-primary" />
          Gangtok, Sikkim
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          Live Monitoring Active
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search zones, incidents..." 
            className="w-full bg-muted/50 border-none pl-9 h-9 text-sm focus-visible:ring-1" 
          />
        </div>
        <div className="text-xs text-muted-foreground border-l border-border/50 pl-4">
          Last updated: Just now
        </div>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
        </Button>
      </div>
    </header>
  );
}
