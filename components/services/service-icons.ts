import {
  Network,
  Globe,
  Cpu,
  Router,
  Server,
  Terminal,
  Wrench,
  ShieldCheck,
  Wifi,
  Cable,
  Video,
  Code,
  Building2,
  Activity,
  Headphones,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Shared icon map used across service cards, hero, homepage, and previews. */
export const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  Network,
  Globe,
  Cpu,
  Router,
  Server,
  Terminal,
  Wrench,
  ShieldCheck,
  Wifi,
  Cable,
  Video,
  Code,
  Building2,
  Activity,
  Headphones,
  Zap,
};

export function svcIcon(name?: string): LucideIcon {
  return SERVICE_ICON_MAP[name || ''] || Network;
}
