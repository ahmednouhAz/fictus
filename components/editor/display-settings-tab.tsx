"use client";

import { ToggleButton } from "@/components/editor/toggle-button";
import { TimePicker } from "@/components/editor/time-picker";
import { SignalBars, WifiGlyph } from "@/components/preview/status-bar-icons";
import { useProjectStore } from "@/stores/useProjectStore";
import { cn } from "@/lib/utils";
import type { Project } from "@/schemas/project";

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

// Shared 0-4 segmented picker for cellular/wifi signal strength.
function BarLevelPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (bars: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border text-[12px] transition-colors",
            value === level
              ? "border-accent/50 text-accent"
              : "border-border text-foreground-subtle hover:glass-surface",
          )}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

export function DisplaySettingsTab({ project }: { project: Project }) {
  const setStatusBar = useProjectStore((s) => s.setStatusBar);
  const setTheme = useProjectStore((s) => s.setTheme);

  const theme = project.theme ?? "dark";
  const visible = project.statusBarVisible ?? true;
  const hour = project.statusBarHour ?? 9;
  const minute = project.statusBarMinute ?? 41;
  const meridiem = project.statusBarMeridiem ?? "AM";
  const showMeridiem = project.statusBarShowMeridiem ?? false;
  const battery = project.statusBarBattery ?? 100;
  const simCount = project.statusBarSimCount ?? 1;
  const sim1Bars = project.statusBarSim1Bars ?? 4;
  const sim2Bars = project.statusBarSim2Bars ?? 4;
  const wifiEnabled = project.statusBarWifiEnabled ?? true;
  const wifiBars = project.statusBarWifiBars ?? 3;

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-foreground-subtle">Theme</label>
        <div className="flex items-center gap-1.5">
          <ToggleButton
            label="Dark"
            active={theme === "dark"}
            onClick={() => setTheme(project.id, "dark")}
          />
          <ToggleButton
            label="Light"
            active={theme === "light"}
            onClick={() => setTheme(project.id, "light")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-foreground-subtle">Status bar</label>
        <ToggleButton
          label={visible ? "Visible" : "Hidden"}
          active={visible}
          onClick={() => setStatusBar(project.id, { visible: !visible })}
        />
      </div>

      {visible && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">Time</label>
            <TimePicker
              hour={hour}
              minute={minute}
              meridiem={meridiem}
              showMeridiem={showMeridiem}
              onChangeHour={(h) => setStatusBar(project.id, { hour: h })}
              onChangeMinute={(m) => setStatusBar(project.id, { minute: m })}
              onChangeMeridiem={(mer) => setStatusBar(project.id, { meridiem: mer })}
              onChangeShowMeridiem={(show) => setStatusBar(project.id, { showMeridiem: show })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">Battery</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={battery}
                min={0}
                max={100}
                onChange={(e) =>
                  setStatusBar(project.id, { battery: clamp(Number(e.target.value), 0, 100) })
                }
                className="h-8 w-16 rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-2 text-center text-[13px] text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[12px] text-foreground-subtle">%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">SIM cards</label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <ToggleButton
                  label="1"
                  active={simCount === 1}
                  onClick={() => setStatusBar(project.id, { simCount: 1 })}
                />
                <ToggleButton
                  label="2"
                  active={simCount === 2}
                  onClick={() => setStatusBar(project.id, { simCount: 2 })}
                />
              </div>

              <div className="flex items-center gap-1.5 pl-3">
                <span className="text-[11px] text-foreground-subtle">SIM 1</span>
                <BarLevelPicker
                  value={sim1Bars}
                  onChange={(bars) => setStatusBar(project.id, { sim1Bars: bars })}
                />
                <SignalBars bars={sim1Bars} className="h-[14px] w-[22px] text-foreground-muted" />
              </div>

              {simCount === 2 && (
                <div className="flex items-center gap-1.5 pl-3">
                  <span className="text-[11px] text-foreground-subtle">SIM 2</span>
                  <BarLevelPicker
                    value={sim2Bars}
                    onChange={(bars) => setStatusBar(project.id, { sim2Bars: bars })}
                  />
                  <SignalBars bars={sim2Bars} className="h-[14px] w-[22px] text-foreground-muted" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-foreground-subtle">Wi-Fi</label>
            <div className="flex flex-wrap items-center gap-3">
              <ToggleButton
                label={wifiEnabled ? "On" : "Off"}
                active={wifiEnabled}
                onClick={() => setStatusBar(project.id, { wifiEnabled: !wifiEnabled })}
              />
              {wifiEnabled && (
                <div className="flex items-center gap-1.5">
                  <BarLevelPicker
                    value={wifiBars}
                    onChange={(bars) => setStatusBar(project.id, { wifiBars: bars })}
                  />
                  <WifiGlyph bars={wifiBars} className="h-[14px] w-[20px] text-foreground-muted" />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
