import SectionTitle from '../components/ui/SectionTitle';
import { telHref } from '../data/club';
import { useSetting, useSettingList } from '../store/settingsStore';

export default function PrivacyPage() {
  const fullName = useSetting('fullName');
  const city = useSetting('city');
  const email = useSetting('email');
  const phones = useSettingList('phones');

  return (
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Документы" title="Политика конфиденциальности" align="left" as="h1" />

        <div className="space-y-6 text-sm leading-relaxed text-gray-300">
          <section>
            <h2 className="mb-2 text-base font-semibold text-white">1. Общие положения</h2>
            <p>
              Настоящая политика описывает, как {fullName} обрабатывает
              персональные данные пользователей сайта. Используя сайт
              и создавая аккаунт, вы соглашаетесь с условиями этой политики.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">2. Какие данные мы собираем</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>имя и фамилия;</li>
              <li>адрес электронной почты (используется как логин);</li>
              <li>номер телефона — если вы его указали;</li>
              <li>история записи на тренировки и посещений;</li>
              <li>результаты тренировок, которые вы добавили самостоятельно.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">3. Зачем нужны данные</h2>
            <p>
              Данные используются только для работы личного кабинета: записи на
              тренировки, ведения листа ожидания, отметки посещаемости и связи с
              вами по вопросам занятий. Мы не передаём их третьим лицам и не
              используем для рекламы.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">4. Пароли</h2>
            <p>
              Пароли не хранятся в открытом виде. В базе сохраняется только
              необратимый хеш (PBKDF2, SHA-256, 120 000 итераций, уникальная соль
              для каждого пароля). Восстановить исходный пароль невозможно — в
              случае утраты администратор школы выдаёт временный пароль.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">5. Удаление данных</h2>
            <p>
              Вы можете запросить удаление аккаунта у администратора школы. Вместе
              с аккаунтом удаляются связанные записи на тренировки, уведомления и
              личные результаты.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">6. Контакты</h2>
            <p>
              {fullName}, {city}. По вопросам обработки персональных
              данных пишите на{' '}
              <a href={`mailto:${email}`} className="text-accent-blue hover:underline">
                {email}
              </a>{' '}
              или звоните:{' '}
              <a href={telHref(phones[0] ?? '')} className="text-accent-blue hover:underline">
                {phones[0]}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
