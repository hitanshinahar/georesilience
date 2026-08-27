"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Camera, Bell, ShieldAlert } from 'lucide-react';
import { NavItem } from './nav-item';

export default function SentinelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background/95">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-16 relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-t border-border/50 z-50 flex items-center justify-around px-2">
        <NavItem href="/sentinel" icon={Home} label="Home" />
        <NavItem href="/sentinel/report" icon={Camera} label="Report" />
        <NavItem href="/sentinel/alerts" icon={Bell} label="Alerts" />
        <NavItem href="/sentinel/safety" icon={ShieldAlert} label="Safety" />
      </div>
    </div>
  );
}
