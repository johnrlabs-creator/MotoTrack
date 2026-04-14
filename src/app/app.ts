import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RightSidebar } from './components/shared/right-sidebar/right-sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RightSidebar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected readonly title = signal('mototrack');
}
