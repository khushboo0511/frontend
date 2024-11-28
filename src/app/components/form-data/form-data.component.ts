import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Chart, CategoryScale, BarElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';

@Component({
  imports: [NgFor, NgIf, ReactiveFormsModule],
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

  username: string = '';
  userId: any;

  isTemperatureDisabled: boolean = true;

  temperatures: any[] = [];
  cityTemperatures: number[] = [];
  chart: Chart | null = null;

  constructor(private apiService: AuthService,
    private fb: FormBuilder
  ) {
    Chart.register(
      CategoryScale,
      BarElement,
      LinearScale,
      Title,
      Tooltip,
      Legend
    );
  }

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

    const loggedInUser = this.apiService.getLoggedInUser();
    console.log("logged in user")

    if (loggedInUser) {
      this.username = loggedInUser.username.split('@')[0];
      this.userId = loggedInUser.id
      console.log(this.userId)
    }
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


  // fetchFormData(): void {
  //   this.apiService.getAllFormData().subscribe(
  //     (data: any) => {
  //       this.formData = data;
  //       console.log('Form data retrieved:', this.formData);
  //     },
  //     (error) => {
  //       console.error('Error fetching form data:', error);
  //     }
  //   );
  // }

  fetchFormData(): void {
    const loggedInUser = this.apiService.getLoggedInUser();
  
    if (loggedInUser && loggedInUser.id) {
      const userId = loggedInUser.id;
  
      this.apiService.getAllFormData().subscribe(
        (data: any[]) => {
          this.formData = data.filter(item => item.userId === userId);
          console.log('Filtered form data for logged-in user:', this.formData);
        },
        (error) => {
          console.error('Error fetching form data:', error);
        }
      );
    } else {
      console.error('User is not logged in');
      this.formData = []; 
    }
  }
  

  submitForm(): void {
    this.formSubmitAttempt = true;

    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value;

      const loggedInUser = this.apiService.getLoggedInUser();
      if (loggedInUser && loggedInUser) {
        formData.userId = loggedInUser.id; 
      } else {
        console.error('User is not logged in');
        return;
      }

      this.apiService.submitForm(formData).subscribe(
        (response) => {
          console.log('Form submitted successfully', response);
          this.registrationForm.reset();
          this.formSubmitAttempt = false;
        },
        (error) => {
          console.error('Error submitting form', error);
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }

  // fetchTemperatures(): void {
  //   this.apiService.getAllCitiesTemperature().subscribe(
  //     (data: any[]) => {
  //       this.temperatures = data;
  //       this.cities = data.map(item => item.city);
  //       this.cityTemperatures = data.map(item => item.temperature);
  //       this.renderTemperatureChart();
  //       console.log(data, "temp data")
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
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.cities,
        datasets: [{
          label: 'Temperature (°C)',
          data: this.cityTemperatures,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
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
