import { Component, inject, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.css'],
  imports: [NgFor]
})
export class TemperatureChartComponent implements OnInit {
  temperatures: any[] = [];
  cities: string[] = [];
  cityTemperatures: number[] = [];

  router = inject(Router);
  
  constructor(private apiService: AuthService) {}

  ngOnInit(): void {
    this.fetchTemperatures();
  }

  // fetchTemperatures(): void {
  //   this.apiService.getAllCitiesTemperature().subscribe(
  //     (data: any[]) => {
  //       this.temperatures = data;
  //       this.cities = data.map(item => item.city);
  //       this.cityTemperatures = data.map(item => item.temperature);

  //       // After fetching, call the function to render the chart
  //       this.renderTemperatureChart();
  //     },
  //     (error) => {
  //       console.error('Error fetching temperature data:', error);
  //     }
  //   );
  // }

  fetchTemperatures(): void {
    this.apiService.getAllCitiesTemperature().subscribe(
      (data: any[]) => {

        const cityTemperatureMap = new Map<string, { city: string, temperature: number }>();
  
        data.forEach(item => {
          if (cityTemperatureMap.has(item.city)) {
            const existing = cityTemperatureMap.get(item.city)!;
            existing.temperature = (existing.temperature + item.temperature) / 2;  
          } else {
            cityTemperatureMap.set(item.city, { city: item.city, temperature: item.temperature });
          }
        });
  
        const uniqueCitiesData = Array.from(cityTemperatureMap.values());
  
        this.temperatures = uniqueCitiesData;
        this.cities = uniqueCitiesData.map(item => item.city);
        this.cityTemperatures = uniqueCitiesData.map(item => item.temperature);
  
        this.renderTemperatureChart();
  
        console.log(uniqueCitiesData, "Filtered temp data");
      },
      (error) => {
        console.error('Error fetching temperature data:', error);
      }
    );
  }
  

  renderTemperatureChart(): void {
    const ctx = document.getElementById('temperatureChart') as HTMLCanvasElement;

    // Create the temperature chart
    new Chart(ctx, {
      type: 'bar',  // Choose bar chart (you can also use line, pie, etc.)
      data: {
        labels: this.cities,  // City names
        datasets: [{
          label: 'Temperature (°C)',  // Label for the dataset
          data: this.cityTemperatures,  // Temperature values
          backgroundColor: 'rgba(75, 192, 192, 0.2)',  // Color for bars
          borderColor: 'rgba(75, 192, 192, 1)',  // Border color for bars
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true 
          }
        }
      }
    });
  }
}
