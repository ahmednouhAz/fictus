import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  FolderClosed,
  Camera,
  MessageCircle,
  Settings,
  CircleUser,
} from "lucide-react";

export type NavItemChild = {
  label: string;
  href: string;
  soon?: boolean;
};

export type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  soon?: boolean;
  // When set, clicking this row opens a dropdown of sub-categories
  // instead of navigating directly — each generator category keeps its
  // own separate project list (see ProjectListPage).
  children?: NavItemChild[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", icon: LayoutGrid, href: "/dashboard" },
      {
        label: "Projects",
        icon: FolderClosed,
        href: "/projects",
        children: [
          { label: "Conversations", href: "/projects" },
          { label: "Chat List", href: "/projects/chat-list" },
          { label: "Notifications", href: "/projects/notifications", soon: true },
        ],
      },
    ],
  },
  {
    label: "Generators",
    items: [
      {
        label: "Instagram",
        icon: Camera,
        href: "/generators/instagram",
      },
      { label: "iMessage", icon: MessageCircle, href: "/", soon: true },
      { label: "WhatsApp", icon: MessageCircle, href: "/", soon: true },
      { label: "Messenger", icon: MessageCircle, href: "/", soon: true },
      { label: "Facebook", icon: MessageCircle, href: "/", soon: true },
      { label: "Discord", icon: MessageCircle, href: "/", soon: true },
      { label: "Twitter", icon: MessageCircle, href: "/", soon: true },
      { label: "Telegram", icon: MessageCircle, href: "/", soon: true },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", icon: Settings, href: "/", soon: true },
      { label: "Account", icon: CircleUser, href: "/account" },
    ],
  },
];
