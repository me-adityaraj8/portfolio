export type Phase = 'dawn' | 'day' | 'dusk' | 'night';
export type Weather = 'clear' | 'cloud' | 'fog' | 'rain' | 'storm';

/** Time of day where I am, which sets the light on the map. */
export function phaseOf(hour: number): Phase {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

/** WMO weather codes, as Open-Meteo reports them, folded into what the map can show. */
export function weatherKind(code: number): Weather {
  if (code >= 95) return 'storm';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code === 0) return 'clear';
  return 'cloud';
}

/**
 * Brightness of a cell `dx, dy` cells from a ripple's source, `age` seconds in.
 * The front is a BFS diamond: every cell at the same Manhattan distance lights together.
 */
export function ripple(dx: number, dy: number, age: number, o: { speed: number; life: number; width: number }) {
  if (age < 0 || age >= o.life) return 0;
  const behind = age * o.speed - (Math.abs(dx) + Math.abs(dy));
  if (behind < 0 || behind >= o.width) return 0;
  return (1 - behind / o.width) * (1 - age / o.life);
}

/** "Reveal map" clears the fog as one BFS wave from where you're standing. */
export function waveDelay(x0: number, y0: number, x: number, y: number, msPerCell: number) {
  return (Math.abs(x - x0) + Math.abs(y - y0)) * msPerCell;
}

export type WeatherIcon = 'sun' | 'moon' | 'cloud-sun' | 'cloud-moon' | 'cloud' | 'fog' | 'rain' | 'storm';

/** A WMO code from Open-Meteo, as a short label and the icon the footer animates. */
export function describeWeather(code: number, isDay: boolean): { label: string; icon: WeatherIcon } {
  if (code >= 95) return { label: 'Thunderstorm', icon: 'storm' };
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: 'rain' };
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: 'rain' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: 'rain' };
  if (code === 45 || code === 48) return { label: 'Fog', icon: 'fog' };
  if (code === 3) return { label: 'Overcast', icon: 'cloud' };
  if (code === 1 || code === 2) return { label: code === 1 ? 'Mostly clear' : 'Partly cloudy', icon: isDay ? 'cloud-sun' : 'cloud-moon' };
  if (code === 0) return isDay ? { label: 'Clear sky', icon: 'sun' } : { label: 'Clear night', icon: 'moon' };
  return { label: 'Cloudy', icon: 'cloud' };
}
