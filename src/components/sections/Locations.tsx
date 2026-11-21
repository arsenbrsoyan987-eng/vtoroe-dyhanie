import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { zones, lineColorMap } from '../../data/zones';
import { countNoun } from '../../lib/plural';
import { useSetting } from '../../store/settingsStore';

/** Маркер — точка цвета линии метро вместо стандартной иконки Leaflet */
function makeIcon(color: string) {
  return L.divIcon({
    className: 'zone-marker',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

/**
 * Блок «Где тренируемся» на главной.
 *
 * Карта небольшая и без интерактива по клику на карточку: полный список
 * с фильтрами живёт на /zones, здесь задача — показать, что площадок много
 * и они по всему городу.
 */
export default function Locations() {
  const city = useSetting('city');
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const preview = zones.slice(0, 4);

  useEffect(() => {
    if (!mapEl.current) return;

    const map = L.map(mapEl.current, {
      scrollWheelZoom: false,
      attributionControl: false,
    }).setView([55.73, 37.5], 9);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    for (const z of zones) {
      L.marker([z.lat, z.lng], { icon: makeIcon(lineColorMap[z.lineColor] ?? '#999') })
        .addTo(map)
        .bindPopup(`<b>${z.title}</b><br>${z.metro}`);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section className="border-y border-line bg-paper py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow mb-4">Локации</span>
            <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
              Тренируемся по всему городу
            </h2>
            <p className="mt-4 max-w-xl text-base text-graphite">
              {countNoun(zones.length, 'площадка', 'площадки', 'площадок')} в {city}
              {' '}и Подмосковье: парки, стадионы и лыжероллерные трассы с раздевалками.
              Точку встречи с тренером присылаем после записи.
            </p>
          </div>
          <Link
            to="/zones"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink"
          >
            Все локации и карта
            <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          {/* Карта */}
          <div
            ref={mapEl}
            className="h-[320px] w-full overflow-hidden rounded-2xl border border-line sm:h-[420px]"
            aria-label="Карта площадок школы"
          />

          {/* Карточки-превью */}
          <ul className="grid gap-4 sm:grid-cols-2">
            {preview.map((zone) => (
              <li key={zone.id}>
                <Link
                  to="/zones"
                  className="card-lift card-lift-hover group block h-full overflow-hidden rounded-2xl"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-mist">
                    <img
                      src={zone.photo}
                      alt={zone.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: lineColorMap[zone.lineColor] }}
                      />
                      <span className="truncate text-[0.6rem] font-bold uppercase tracking-[0.1em] text-graphite">
                        {zone.metro}
                      </span>
                    </div>
                    <h3 className="display text-base leading-tight text-ink">
                      {zone.title}
                    </h3>
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-graphite">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                      <span className="line-clamp-2">{zone.address}</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}