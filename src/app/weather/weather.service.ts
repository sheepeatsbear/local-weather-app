import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { ICurrentWeather } from '../interfaces';

interface ICurrentWeatherData {
  weather: [
    {
      description: string;
      icon: string;
    }
  ];
  main: {
    temp: number;
  };
  sys: {
    country: string;
  };
  dt: number;
  name: string;
}

export interface IWeatherService {
  getCurrentWeather(city: string, country: string): Observable<ICurrentWeather>;
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService implements IWeatherService {
  constructor(private httpClient: HttpClient) {}
  getCurrentWeather(
    search: string | number,
    country?: string
  ): Observable<ICurrentWeather> {
    let uriParams = new HttpParams();
    if (typeof search === 'string') {
      uriParams = uriParams.set('q', country ? `${search},${country}` : search);
    } else {
      uriParams = uriParams.set('zip', 'search');
    }

    return this.getCurrentWeatherHelper(uriParams);
  }

  getCurrentWeatherHelper(uriParams: HttpParams): Observable<ICurrentWeather> {
    uriParams = uriParams.set('appid', environment.apiId);
    return this.httpClient
      .get<ICurrentWeatherData>(
        `${environment.baseUrl}` + 'api.openweathermap.org/data/2.5/weather',
        {
          params: uriParams,
        }
      )
      .pipe(map((data) => this.transformToICurrentWeather(data)));
  }

  getCurrentWeatherByCoords(coords: {
    latitude: number;
    longitude: number;
  }): Observable<ICurrentWeather> {
    const uriParams = new HttpParams()
      .set('lat', coords.latitude.toString())
      .set('lon', coords.longitude.toString());
    return this.getCurrentWeatherHelper(uriParams);
  }

  private transformToICurrentWeather(data: ICurrentWeatherData): ICurrentWeather {
    console.log(data);

    return {
      city: data.name,
      country: data.sys.country,
      date: data.dt * 1000,
      image: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
      temperature: this.convertKelvinToCelsius(data.main.temp),
      description: data.weather[0].description,
    };
  }
  private convertKelvinToCelsius(kelvin: number): number {
    return kelvin - 273.15;
  }
}
