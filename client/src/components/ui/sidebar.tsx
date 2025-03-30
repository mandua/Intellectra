"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
  setOpen?: (open: boolean) => void;
}

export function SidebarNav({
  className,
  items,
  setOpen,
  ...props
}: SidebarNavProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  // Close sidebar on mobile when navigating
  const handleNavigation = (href: string) => {
    if (isMobile && setOpen) {
      setOpen(false);
    }
  };

  return (
    <nav className={cn("flex flex-col gap-1 px-2", className)} {...props}>
      {items.map((item) => {
        const isActive = item.href === location || 
                         (item.href !== "/" && location.startsWith(item.href));

        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-light/10 dark:bg-primary-dark/20 text-primary-DEFAULT dark:text-primary-light"
                : "text-text-light-primary dark:text-text-dark-primary hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            onClick={() => handleNavigation(item.href)}
          >
            {item.icon}
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  userInfo?: {
    name: string;
    avatar?: string;
  };
  navItems: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
  footerItems?: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

export function Sidebar({
  className,
  open = false,
  onOpenChange,
  userInfo,
  navItems,
  footerItems,
  ...props
}: SidebarProps) {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && onOpenChange) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    // Close sidebar when clicking outside on mobile
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMobile && open && onOpenChange) {
        const sidebarEl = document.getElementById("sidebar");
        const toggleButton = document.getElementById("sidebar-toggle");
        
        if (
          sidebarEl && 
          !sidebarEl.contains(e.target as Node) && 
          toggleButton && 
          !toggleButton.contains(e.target as Node)
        ) {
          onOpenChange(false);
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isMobile, open, onOpenChange]);

  if (!isMobile && !open) {
    return null;
  }

  return (
    <aside
      id="sidebar"
      className={cn(
        "fixed md:static inset-y-0 left-0 z-10 w-64 shadow-lg md:shadow-none h-full flex flex-col bg-white dark:bg-[#1e1e1e] transition-transform duration-300 ease-in-out",
        isMobile && !open && "-translate-x-full",
        className
      )}
      {...props}
    >
      {userInfo && (
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          {userInfo.avatar ? (
            <div className="w-8 h-8 rounded-full mr-2 overflow-hidden">
              <img src={userInfo.avatar} alt={userInfo.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="material-icons mr-2 text-primary-DEFAULT dark:text-primary-light">account_circle</span>
          )}
          <span className="font-medium">{userInfo.name}</span>
        </div>
      )}

      <nav className="flex-grow py-4 overflow-y-auto">
        <SidebarNav 
          items={navItems} 
          setOpen={onOpenChange} 
        />
      </nav>

      {footerItems && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {footerItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary transition-colors"
              onClick={() => isMobile && onOpenChange && onOpenChange(false)}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </a>
          ))}
        </div>
      )}
    </aside>
  );
}
