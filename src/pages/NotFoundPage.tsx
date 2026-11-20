import Button from '../components/ui/Button';
import Breadcrumbs from '../components/ui/Breadcrumbs';

export default function NotFoundPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Страница не найдена' }]} />

      <section className="bg-paper pb-20 pt-6 lg:pb-28">
        <div className="container-x">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="eyebrow mb-5">
                <span className="h-[2px] w-8 bg-brand" />
                Ошибка 404
              </span>
              <h1 className="display text-[2.5rem] text-ink sm:text-5xl lg:text-6xl">
                Такой страницы нет
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-graphite">
                Возможно, страница переехала или была удалена. Начните с главной
                или посмотрите расписание — там всегда есть ближайшие тренировки.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button to="/" variant="primary">На главную</Button>
                <Button to="/schedule" variant="outline">Расписание</Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <span
                aria-hidden="true"
                className="display select-none text-[9rem] leading-none text-mist sm:text-[12rem] lg:text-[15rem]"
              >
                404
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}