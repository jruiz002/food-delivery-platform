import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <h1>Bienvenido a Food Delivery Platform</h1>
      <p>Esta es la página principal</p>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
    }

    h1 {
      color: #333;
      margin-bottom: 20px;
    }
  `]
})
export class HomeComponent {}
