import {
  Activity,
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  Eye,
  FileText,
  Flame,
  Search,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'StockSage', icon: TrendingUp },
      { label: 'Holdings', icon: Briefcase },
      { label: 'Watchlists', icon: Eye },
      { label: 'Tradebook', icon: BookOpen },
      { label: 'Portfolio Roast', icon: Flame },
    ],
  },
  {
    label: 'Discover',
    items: [
      { label: 'Markets', icon: Activity },
      { label: 'Screener', icon: Search },
      { label: 'Strategies', icon: Zap },
      { label: 'Research', icon: Brain },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Paper Trading', icon: FileText },
      { label: 'FIRE Calculator', icon: Target, active: true },
      { label: 'Calculators', icon: Calculator },
      { label: 'Risk Report', icon: FileText },
      { label: 'Tax Report', icon: FileText },
    ],
  },
];
