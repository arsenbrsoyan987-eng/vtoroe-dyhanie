import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import SectionTitle from '../components/ui/SectionTitle';
import QuickBookingModal from '../components/ui/QuickBookingModal';
import { useDirections } from '../store/directionsStore';
import { useSetting, useSettingList } from '../store/settingsStore';
import { Briefcase, Users, Trophy, Target, Handshake, Star } from 'lucide-react';

/**
 * Корпоративный спорт — отдельная страница для B2B-аудитории.
 *
 * Тимбилдинг, корпоративные соревнования и спортивные дни для компаний.
 * Все направления школы (бег, трейл, вело, походы, функциональный тренинг)
 * упакованы в формат, удобный для HR и организаторов.
 */
const ITEMS = [
  {
    icon: Handshake,
    title: 'Тимбилдинг',
    desc: 'Спортивные квесты и эстафеты, которые сплачивают команду лучше любого семинара. Формат — от часу до полного дня.',
  },
  {
    icon: Trophy,
    title: 'Корпоративные соревнования',
    desc: 'Организуем турнир «под ключ»: бег, вело, триатлон или ОФП. Судейство, протоколы, призы и фотоотчёт включены.',
  },
  {
    icon: Target,
    title: 'Спортивный день для компании',
    desc: 'Лёгкий формат: сбор в парке, зарядка, несколько активностей на выбор. Подходит для компаний любого размера.',
  },
  {
    icon: Briefcase,
    title: 'Ежедневные корпоративные тренировки',
    desc: 'Тренер приезжает в офис или на спортивную площадку компании. Раз в неделю — и результаты видны уже через месяц.',
  },
  {
    icon: Users,
    title: 'Командные кэмпы',
    desc: 'Выезд на выходные: несколько дней бега, трейла и ОФП на природе. Идеально для тимбилдинга и корпоративов.',
  },
  {
    icon: Star,
    title: 'Здоровье и wellness-программы',
    desc: 'Утренние зарядки, стретч-сессии, прогулки в перерыве рабочего дня — забота о здоровье сотрудников без отрыва от работы.',
  },
];

const DIRECTIONS_ICONS: Record<string, string> = {
  running: '🏃',
  trail: '⛰️',
  cycling: '🚴',
  hiking: '🥾',
  functional: '💪',
  ski: '⛷️',
  triathlon: '🏊',
};

export default function CorporatePage() {
  const directions = useDirections();
  const phone = useSettingList('phones')[0] ?? '';
  const telegram = useSetting('telegram');
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="block text-accent-red font-semibold uppercase tracking-widest text-sm mb-2">
            Для бизнеса
          </span>
          <SectionTitle
            subtitle="Корпоративный спорт"
            title="Сделаем вашу команду сильнее"
            align="center"
            as="h1"
          />
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-300">
            Организуем спортивные мероприятия для компаний любого размера — от тимбилдинга
            до полноценных корпоративных соревнований. Все направления школы «Второе дыхание»:
            бег, трейл, вело, походы, ОФП.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button onClick={() => setBookingOpen(true)} variant="primary" size="lg">
              Обсудить формат
            </Button>
            <Button to="/schedule" variant="outline" size="lg">
              Посмотреть расписание
            </Button>
          </div>
        </div>

        {/* Форматы */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            Форматы сотрудничества
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-sm border border-white/10 bg-surface p-6 transition-all hover:border-accent-red/30 hover:-translate-y-1"
              >
                <item.icon className="h-8 w-8 text-accent-red mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Направления */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            Направления
          </h2>
          <p className="text-center text-gray-400 mb-10 max-w-xl mx-auto text-sm">
            Любое направление школы можно адаптировать под корпоративный формат.
            Вот что чаще всего выбираем:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {directions.map((d) => (
              <Link
                key={d.id}
                to={`/directions/${d.id}`}
                className="rounded-sm border border-white/10 bg-surface p-4 text-center transition-all hover:border-accent-red/30 hover:-translate-y-1"
              >
                <span className="text-3xl block mb-2">
                  {DIRECTIONS_ICONS[d.id] ?? d.icon ?? '•'}
                </span>
                <span className="text-sm font-medium text-white">{d.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Как работаем */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            Как это работает
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Оставьте заявку',
                desc: 'Позвоните или напишите — расскажите о компании, количестве участников и пожеланиях.',
              },
              {
                step: '2',
                title: 'Подберём формат',
                desc: 'Предложим варианты под ваш бюджет, дату и уровень подготовки команды.',
              },
              {
                step: '3',
                title: 'Проведём мероприятие',
                desc: 'Организуем всё «под ключ»: инвентарь, судейство, фотоотчёт и призы.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-red/15 text-xl font-bold text-accent-red mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-sm border border-white/10 bg-surface p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Готовы обсудить?</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Свяжитесь с нами любым удобным способом — подберём формат, рассчитаем стоимость
            и организуем спортивное мероприятие для вашей команды.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {phone && (
              <Button href={`tel:${phone.replace(/[^\d+]/g, '')}`} variant="primary" size="lg">
                {phone}
              </Button>
            )}
            {telegram && (
              <Button href={telegram} variant="blue" size="lg">
                Telegram
              </Button>
            )}
          </div>
        </div>
      </div>

      {bookingOpen && (
        <QuickBookingModal
          trainingName="Корпоративный спорт"
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  );
}
