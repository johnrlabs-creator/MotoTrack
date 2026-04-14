export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
  badgeVariant?: 'alert';
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}
