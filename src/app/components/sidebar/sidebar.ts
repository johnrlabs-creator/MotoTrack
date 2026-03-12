import { Component, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavSection } from '../../core/models/sidebar.interface';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  mobileOpen = signal(false);

  isMobile = signal(false);

  sidebarClasses = computed(() => {
    const base = `fixed top-0 left-0 bottom-0 z-30
                  w-[220px] flex flex-col
                  bg-[#161b25] border-r border-[#2a3347]
                  transition-transform duration-300 ease-in-out`;

    if (this.isMobile()) {
      return `${base} ${this.mobileOpen() ? 'translate-x-0' : '-translate-x-full'}`;
    }
    return `${base} translate-x-0`;
  });

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 1024);
  }

  constructor() {
    this.isMobile.set(window.innerWidth < 1024);
  }

  open() {
    this.mobileOpen.set(true);
  }

  readonly navSections: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: '📊' },
        { label: 'Vehicles', route: '/vehicles', icon: '🚗' },
      ],
    },
    {
      label: 'Maintenance',
      items: [
        { label: 'Service Log', route: '/service', icon: '🔧' },
        { label: 'Upcoming', route: '/upcoming', icon: '📅', badge: 2 },
        { label: 'Parts & Costs', route: '/parts', icon: '🛞' },
      ],
    },
    {
      label: 'Reports',
      items: [
        { label: 'Analytics', route: '/analytics', icon: '📈' },
        { label: 'Export', route: '/export', icon: '📤' },
      ],
    },
    {
      label: 'Account',
      items: [{ label: 'Settings', route: '/settings', icon: '⚙️' }],
    },
  ];
}
