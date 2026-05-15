import { useState } from "react";
import { startOfWeek, endOfWeek, isWithinInterval, format, subWeeks, addWeeks } from "date-fns";
import { hu } from "date-fns/locale/hu";
import { CheckCircle2, Circle, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface ChoreEntry {
  id: string;
  person: string;
  task: string;
  timeMinutes: number;
  notes: string;
  date: string;
}

interface WeeklyChecklistProps {
  entries: ChoreEntry[];
  recurringTasks: string[];
}

export function WeeklyChecklist({ entries, recurringTasks }: WeeklyChecklistProps) {
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const now = new Date();
  const weekStart = startOfWeek(selectedWeekStart, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });

  const isWeekCurrent = format(now, "yyyy-MM-dd") >= format(weekStart, "yyyy-MM-dd") &&
                        format(now, "yyyy-MM-dd") <= format(weekEnd, "yyyy-MM-dd");

  const getLastCompletion = (task: string) => {
    const taskEntries = entries
      .filter((e) => e.task === task)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return taskEntries.length > 0 ? taskEntries[0] : null;
  };

  const isCompletedThisWeek = (task: string) => {
    return entries.some(
      (entry) =>
        entry.task === task &&
        isWithinInterval(new Date(entry.date), { start: weekStart, end: weekEnd })
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Heti checklist
        </h2>
      </div>

      <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
        <button
          onClick={() => setSelectedWeekStart(subWeeks(selectedWeekStart, 1))}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="text-center">
          <div className="font-semibold text-gray-800">
            {format(weekStart, "MMM d", { locale: hu })} - {format(weekEnd, "MMM d, yyyy", { locale: hu })}
          </div>
          {isWeekCurrent && (
            <div className="text-xs text-blue-600 font-medium mt-1">Aktuális hét</div>
          )}
        </div>

        <button
          onClick={() => setSelectedWeekStart(addWeeks(selectedWeekStart, 1))}
          disabled={isWeekCurrent}
          className={`p-2 rounded-lg transition-colors ${
            isWeekCurrent ? "text-gray-300" : "hover:bg-gray-200 text-gray-700"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {recurringTasks.map((task) => {
          const completed = isCompletedThisWeek(task);
          const lastEntry = getLastCompletion(task);

          return (
            <div
              key={task}
              className={`border rounded-lg p-3 transition-colors ${
                completed
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      completed ? "text-green-900" : "text-gray-800"
                    }`}
                  >
                    {task}
                  </h3>
                  {lastEntry && (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-sm text-gray-600">
                        Utoljára: {format(new Date(lastEntry.date), "MMM d, HH:mm", { locale: hu })}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          lastEntry.person === "Zsófi"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {lastEntry.person}
                      </span>
                    </div>
                  )}
                  {!lastEntry && (
                    <p className="text-sm text-gray-500 mt-1">Még nem volt elvégezve</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
