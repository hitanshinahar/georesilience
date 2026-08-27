"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export function NavItem({ href, icon: Icon, label }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
        isActive ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("w-6 h-6", isActive && "fill-orange-500/20")} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
