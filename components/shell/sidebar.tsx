"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/useUIStore";
import { navSections, type NavItem } from "@/components/shell/sidebar-nav-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { GlassRing } from "@/components/ui/glass-ring";

const EXPANDED_WIDTH = 232;
const COLLAPSED_WIDTH = 64;

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.2, 0, 0, 1] }}
      className="relative flex h-full shrink-0 flex-col bg-black/15 backdrop-blur-xl"
    >
      <GlassRing />
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG wordmark, no optimization needed */}
          <img src="/icons/fictus-mark.svg" alt="" className="h-5 w-auto" />
        </div>
        {!collapsed && (
          // eslint-disable-next-line @next/next/no-img-element -- local SVG wordmark, no optimization needed
          <img src="/icons/fictus.svg" alt="fictus" className="h-3.5 w-auto shrink-0" />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wide text-foreground-subtle">
                {section.label}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavRow key={item.label} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2.5">
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] text-foreground-muted transition-colors hover:glass-surface hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  const router = useRouter();

  const rowClassName = cn(
    // text-left overrides the browser's default centered text-align on
    // <button> (the "Projects" dropdown trigger renders as one) — <a>
    // links don't need it, but it's harmless to set on every row.
    "group flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] transition-colors",
    item.soon
      ? "cursor-default text-foreground-subtle"
      : "text-foreground-muted hover:glass-surface hover:text-foreground",
    collapsed && "justify-center px-0",
  );

  const inner = (
    <>
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.soon && (
        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] leading-none text-foreground-subtle">
          Soon
        </span>
      )}
      {!collapsed && item.children && (
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-foreground-subtle transition-transform group-data-[state=open]:rotate-90" />
      )}
    </>
  );

  // A "Projects" row like this opens a dropdown of generator categories
  // instead of navigating directly — each category (Conversations, Chat
  // List, ...) keeps its own separate project list.
  if (item.children) {
    const trigger = (
      <button type="button" className={rowClassName}>
        {inner}
      </button>
    );
    return (
      <DropdownMenu>
        {collapsed ? (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        )}
        <DropdownMenuContent side={collapsed ? "right" : "bottom"} align="start">
          {item.children.map((child) => (
            <DropdownMenuItem
              key={child.label}
              disabled={child.soon}
              onSelect={() => {
                if (!child.soon) router.push(child.href);
              }}
            >
              <span className="flex-1 truncate">{child.label}</span>
              {child.soon && (
                <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] leading-none text-foreground-subtle">
                  Soon
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const content = (
    <Link
      href={item.soon ? "#" : item.href}
      aria-disabled={item.soon}
      onClick={(e) => {
        if (item.soon) e.preventDefault();
      }}
      className={rowClassName}
    >
      {inner}
    </Link>
  );

  if (!collapsed) return content;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right">
        {item.label}
        {item.soon ? " — Coming soon" : ""}
      </TooltipContent>
    </Tooltip>
  );
}
