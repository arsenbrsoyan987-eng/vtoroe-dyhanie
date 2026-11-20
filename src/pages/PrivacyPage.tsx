import Breadcrumbs from '../components/ui/Breadcrumbs';
import { telHref } from '../data/club';
import { useSetting, useSettingList } from '../store/settingsStore';

/** Разделы политики: заголовок + текст, чтобы не дублировать разметку шесть раз */
const SECTIONS = ['Общие положения', 'Какие данные мы собираем', 'Зачем нужны данные', 'Пароли', 'Удаление данных', 'Контакты'];

export default function PrivacyPage() {
  const fullName = useSetting('fullName');
  const city = useSetting('city');
  const email = useSetting('email');
  const phones = useSettingList('phones');

  return (
    <>
      <Breadcrumbs items={[{ label: 'Политика конфиденциальности' }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-16">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            Документы
          </span>
          <h1 className="display max-w-3xl text-[2.25rem] sm:text-5xl lg:text-6xl">
            Политика конфиденциальности
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
            Как школа обрабатывает данные пользователей сайта и личного кабинета.
          </p>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
          {/* Оглавление — якоря по разделам */}
          <nav aria-label="Содержание" className="lg:sticky lg:top-28 lg:self-start">
            <ol className="space-y-2 text-sm">
              {SECTIONS.map((title, i) => (
                <li key={title}>
                  <a
                    href={`#s${i + 1}`}
                    className="flex gap-2 text-graphite transition-colors hover:text-brand"
                  >
                    <span className="font-bold text-line">{i + 1}</span>
                    {title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-2xl space-y-8 text-sm leading-relaxed text-ink/85">
            <section id="s1" className="scroll-mt-28">
              <h2 className="display mb-3 text-xl text-ink">1. Общие положения</h2>
              <p>
                Настоящая политика описывает, как {fullName} обрабатывает
                персональные данные пользователей сайта. Используя сайт
                и создавая аккаунт, вы соглашаетесь с условиями этой политики.
              </p>
            </section>

            <section id="s2" className="scroll-mt-28">
              <h2 className="display mb-3 text-xl text-ink">2. Какие данные мы собираем</h2>
              <ul className="space-y-1.5">
                {[
                  'имя и фамилия;',
                  'адрес электронной почты (используется как логин);',
                  'номер телефона — если вы его указали;',
                  'история записи на тренировки и посещений;',
                  'результаты тренировок, которые вы добавили самостоятельно.',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section id="s3" className="scroll-mt-28">
              <h2 className="display mb-3 text-xl text-ink">3. Зачем нужны данные</h2>
              <p>
                Данные используются только для работы личного кабинета: записи на
                тренировки, ведения листа ожидания, отметки посещаемости и связи с
                вами по вопросам занятий. Мы не передаём их третьим лицам и не
                используем для рекламы.
              </p>
            </section>

            <section id="s4" className="scroll-mt-28">
              <h2 className="display mb-3 text-xl text-ink">4. Пароли</h2>
              <p>
                Пароли не хранятся в открытом виде. В базе сохраняется только
                необратимый хеш (PBKDF2, SHA-256, 120 000 итераций, уникальная соль
                для каждого пароля). Восстановить исходный пароль невозможно — в
                случае утраты администратор школы выдаёт временный пароль.
              </p>
            </section>

            <section id="s5" className="scroll-mt-28">
              <h2 className="display mb-3 text-xl text-ink">5. Удаление данных</h2>
              <p>
                Вы можете запросить удаление аккаунта у администратора школы. Вместе
                с аккаунтом удаляются связанные записи на тренировки, уведомления и
                личные результаты.
              </p>
            </section>

            <section id="s6" className="scroll-mt-28">
              <h2 className="display mb-3 text-xl text-ink">6. Контакты</h2>
              <p>
                {fullName}, {city}. По вопросам обработки персональных
                данных пишите на{' '}
                <a href={`mailto:${email}`} className="font-semibold text-brand hover:underline">
                  {email}
                </a>{' '}
                или звоните:{' '}
                <a href={telHref(phones[0] ?? '')} className="font-semibold text-brand hover:underline">
                  {phones[0]}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}