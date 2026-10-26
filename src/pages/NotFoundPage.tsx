import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-24">
      <div className="text-center px-4">
        <div className="text-[120px] md:text-[180px] font-bold text-accent-red/20 leading-none mb-4">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Страница не найдена
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          Возможно, страница была перемещена или удалена. Попробуйте вернуться на главную.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button to="/" variant="primary">На главную</Button>
          <Button to="/schedule" variant="outline">Расписание</Button>
        </div>
      </div>
    </div>
  );
}
