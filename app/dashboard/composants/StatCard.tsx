interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = "bg-gray-100",
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-gray-500 sm:text-sm">
            {title}
          </p>

          <h3 className="mt-2 truncate text-2xl font-bold text-gray-900 sm:mt-4 sm:text-3xl">
            {value}
          </h3>
        </div>

        {icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-full ${color}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}