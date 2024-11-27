import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Chart } from 'chart.js';

@Component({
  imports: [ NgFor, NgIf, ReactiveFormsModule],
  selector: 'app-form-data',
  templateUrl: './form-data.component.html',
  styleUrls: ['./form-data.component.css']
})
export class FormDataComponent implements OnInit {
  
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  formData: any[] = [];
  registrationForm!: FormGroup;
  formSubmitAttempt: boolean = false;

  isTemperatureDisabled: boolean = true;

  temperatures: any[] = [];
  cityTemperatures: number[] = [];

  constructor(private apiService: AuthService,
    private fb: FormBuilder 
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      country: [''],
      state: [''],
      city: [''],
      temperature: [''],
      month: [''],
    });

    this.fetchFormData();
    this.fetchCountries();
    this.fetchTemperatures();
  }
  
  fetchCountries(): void {
    this.apiService.getCountries().subscribe(
      (data: any[]) => {
        this.countries = [...new Set(data.map(item => item.country))];
      },
      (error) => {
        console.error('Error fetching countries:', error);
      }
    );
  }  

  onCountryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const country = selectElement.value;
    this.registrationForm.patchValue({ state: '', city: '', temperature: '' });
  
    this.apiService.getStates(country).subscribe(
      (states) => {
        console.log(states, "states")
        this.states = states.map((state: any) => state.state);
                this.cities = []; 
      },
      (error) => console.error('Error fetching states:', error)
    );
  }
  

  onStateChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const state = selectElement.value; 
  
    this.registrationForm.patchValue({ city: '', temperature: '' });
  
    this.apiService.getCities(state).subscribe(
      (cities) => {
        console.log(cities, "cities")
        this.cities = cities.map((city: any) => city.city);  
      },
      (error) => console.error('Error fetching cities:', error)
    );
  }
  

  onCityChange(event: Event): void {
    const city = (event.target as HTMLSelectElement).value;
    this.isTemperatureDisabled = !city;

    if (city) {
      this.apiService.getTemperature(city).subscribe(
        (temperatureData) => {
          this.registrationForm.patchValue({ temperature: temperatureData.temperature });
        },
        (error) => {
          console.error('Error fetching temperature:', error);
        }
      );
    }
  }


  // Fetch form data from API
  fetchFormData(): void {
    this.apiService.getAllFormData().subscribe(
      (data: any) => {
        this.formData = data;
        console.log('Form data retrieved:', this.formData);
      },
      (error) => {
        console.error('Error fetching form data:', error);
      }
    );
  }

  submitForm(): void {
    this.formSubmitAttempt = true;  // Set to true on submit attempt

    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value;
      this.apiService.submitForm(formData).subscribe(
        (response) => {
          console.log('Form submitted successfully', response);
          this.registrationForm.reset();
          this.formSubmitAttempt = false; // Reset after successful submit
        },
        (error) => {
          console.error('Error submitting form', error);
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }

  fetchTemperatures(): void {
    this.apiService.getAllCitiesTemperature().subscribe(
      (data: any[]) => {
        this.temperatures = data;
        this.cities = data.map(item => item.city);
        this.cityTemperatures = data.map(item => item.temperature);

        // After fetching, call the function to render the chart
        this.renderTemperatureChart();
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
