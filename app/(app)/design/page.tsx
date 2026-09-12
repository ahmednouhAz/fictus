import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkle, ChevronDown, Info } from "lucide-react";

export default function DesignFoundationPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-12">
        <header className="mb-10">
          <p className="text-[13px] text-foreground-subtle">Milestone 1</p>
          <h1 className="mt-1 text-xl font-medium text-foreground">
            Design Foundation
          </h1>
          <p className="mt-1.5 text-[13px] text-foreground-muted">
            Tokens and primitives for the Social UI Simulation Studio, kept
            here as a living style-guide reference for regression checks.
          </p>
        </header>

        <section className="mb-10">
          <SectionLabel>Typography</SectionLabel>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-medium text-foreground">
              Edit the thing you see.
            </h2>
            <p className="text-sm text-foreground-muted">
              Body text at a restrained size, used for descriptions and
              secondary content throughout the application.
            </p>
            <p className="text-[13px] text-foreground-subtle">
              Subtle text for metadata, timestamps, and captions.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <SectionLabel>Buttons</SectionLabel>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button>Create project</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button size="icon" variant="secondary" aria-label="Sparkle">
              <Sparkle className="h-4 w-4" />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <section className="mb-10">
          <SectionLabel>Inputs</SectionLabel>
          <div className="flex max-w-sm flex-col gap-2.5">
            <Input placeholder="Project name" />
            <Input placeholder="Disabled" disabled />
          </div>
        </section>

        <section className="mb-10">
          <SectionLabel>Overlays</SectionLabel>
          <div className="flex flex-wrap items-center gap-2.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="icon" aria-label="Info">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>A restrained tooltip</TooltipContent>
            </Tooltip>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary">Open popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <p className="text-[13px] text-foreground-muted">
                  Popovers use the same surface and border tokens as panels.
                </p>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  Platform
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Generators</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Instagram</DropdownMenuItem>
                <DropdownMenuItem disabled>iMessage — Soon</DropdownMenuItem>
                <DropdownMenuItem disabled>WhatsApp — Soon</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        <section>
          <SectionLabel>Panels</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Panel>
              <PanelHeader>
                <PanelTitle>Recent</PanelTitle>
              </PanelHeader>
              <PanelContent>
                <PanelDescription>
                  Static reference only — the real Recent Projects list lives
                  on the Dashboard.
                </PanelDescription>
              </PanelContent>
            </Panel>
            <Panel>
              <PanelHeader>
                <PanelTitle>Recipients</PanelTitle>
              </PanelHeader>
              <PanelContent>
                <PanelDescription>
                  Reusable identities arrive in Milestone 6.
                </PanelDescription>
              </PanelContent>
            </Panel>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-foreground-subtle">
      {children}
    </p>
  );
}
