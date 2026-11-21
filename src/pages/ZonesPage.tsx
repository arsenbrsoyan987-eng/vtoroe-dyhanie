import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { countNoun } from '../lib/plural';
import { zones, lineColorMap, type Zone } from '../data/zones';

/** Маркер — цветная точка линии метро вместо стандартной иконки Leaflet */
function makeIcon(color: string) {
  return L.divIcon({
    className: 'zone-marker',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const metroLines = [
  { id: 'all', label: 'Все' },
  { id: 'red', label: 'Красная' },
  { id: 'purple', label: 'Фиолетовая' },
  { id: 'gray', label: 'Серая' },
  { id: 'orange', label: 'Оранжевая' },
  { id: 'yellow', label: 'Жёлтая' },
  { id: 'blue', label: 'Синяя' },
  { id: 'mc', label: 'МЦД' },
  { id: 'none', label: 'Без метро' },
];

/**
 * Локации для тренировок: карта + карточки площадок.
 *
 * Leaflet и OSM-тайлы выбраны потому, что бесплатны, работают без API-ключа
 * и не блокируются в РФ — в отличие от Google Maps.
 */
export default function ZonesPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const filtered = zones.filter((z) => {
    const matchLine = filter === 'all' || z.lineColor === filter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      z.title.toLowerCase().includes(q) ||
      z.metro.toLowerCase().includes(q) ||
      z.address.toLowerCase().includes(q);
    return matchLine && matchSearch;
  });

  // Карта создаётся один раз; при перерисовке фильтров маркеры не трогаем —
  // подсвечиваем карточки, а карта остаётся общей для всех локаций
  useEffect(() => {
    if (!mapEl.current) return;

    const map = L.map(mapEl.current).setView([55.73, 37.45], 10);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    for (const z of zones) {
      L.marker([z.lat, z.lng], { icon: makeIcon(lineColorMap[z.lineColor] ?? '#999') })
        .addTo(map)
        .bindPopup(`<b>${z.title}</b><br>${z.metro}`)
        .on('click', () => setSelectedZone(z));
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const selectZone = useCallback((z: Zone) => {
    setSelectedZone(z);
    mapRef.current?.flyTo([z.lat, z.lng], 13, { duration: 0.8 });
  }, []);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Локации' }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-16">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            {countNoun(zones.length, 'локация', 'локации', 'локаций')}
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Где тренируемся
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Выберите удобную площадку по метро, МЦД или на карте. Точную точку
            встречи с тренером присылаем в карточке после записи.
          </p>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x">
          <div
            ref={mapEl}
            className="h-[420px] w-full overflow-hidden rounded-2xl border border-line"
          />
        </div>
      </section>

      <section className="bg-mist py-14 lg:py-20">
        <div className="container-x">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="display text-3xl text-ink sm:text-4xl">
              Площадки школы
            </h2>
            <input
              type="search"
              placeholder="Поиск: название, метро, адрес…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-line bg-paper px-5 py-2.5 text-sm text-ink placeholder:text-graphite/60 focus:border-brand focus:outline-none md:w-80"
            />
          </div>

          <div className="mb-10 flex flex-wrap gap-2">
            {metroLines.map((line) => (
              <button
                key={line.id}
                onClick={() => setFilter(line.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  filter === line.id
                    ? 'bg-ink text-white'
                    : 'bg-paper text-graphite hover:bg-line hover:text-ink'
                }`}
              >
                {line.label}
              </button>
            ))}
          </div>

          <p className="mb-6 text-sm text-graphite">
            {countNoun(filtered.length, 'локация', 'локации', 'локаций')}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper px-6 py-16 text-center">
              <p className="text-sm text-graphite">
                Ничего не нашлось — попробуйте другой запрос или сбросьте фильтр.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((zone) => (
                <article
                  key={zone.id}
                  onClick={() => selectZone(zone)}
                  className={`card-lift card-lift-hover group cursor-pointer overflow-hidden rounded-2xl bg-paper ${
                    selectedZone?.id === zone.id ? 'ring-2 ring-brand' : ''
                  }`}
                >
                  <div className="aspect-[16/10] overflow-hidden bg-mist">
                    <img
                      src={zone.photo}
                      alt={zone.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: lineColorMap[zone.lineColor] }}
                      />
                      <span className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                        {zone.metro} · {zone.metroLine}
                      </span>
                    </div>

                    <h3 className="display text-lg leading-tight text-ink">
                      {zone.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-graphite">
                      {zone.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {zone.activities.map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-mist px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-graphite"
                        >
                          {a}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-line pt-4">
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                        Место встречи с тренером
                      </p>
                      <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed text-ink">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {zone.meetingPoint}
                      </p>
                    </div>

                    <a
                      href={`https://yandex.ru/maps/?pt=${zone.lng},${zone.lat}&z=16&l=map`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand transition-colors hover:text-brand-dark"
                    >
                      Открыть маршрут
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x text-center">
          <h2 className="display text-3xl text-ink sm:text-4xl">
            Не нашли удобную площадку?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-graphite">
            Напишите нам — подберём группу рядом с домом или откроем новую
            локацию, если наберётся команда.
          </p>
          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-brand-dark active:scale-95"
          >
            Записаться на тренировку
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}