import { useState } from "react";
import { startOfWeek, endOfWeek, isWithinInterval, format, startOfDay, endOfDay, subWeeks, addWeeks, subDays, addDays } from "date-fns";
import { hu } from "date-fns/locale/hu";
import { BarChart3, TrendingUp, ChevronLeft, ChevronRight, History, Clock } from "lucide-react";

interface ChoreEntry {
  id: string;
  person: string;
  task: string;
  timeMinutes: number;
  notes: string;
  date: string;
}

interface SummaryProps {
  entries: ChoreEntry[];
}

export function Summary({ entries }: SummaryProps) {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const now = new Date();
  const weekStart = startOfWeek(selectedWeekStart, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });
  const todayStart = startOfDay(selectedDay);
  const todayEnd = endOfDay(selectedDay);

  const isDayToday = format(now, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd");
  const isWeekCurrent = format(now, "yyyy-MM-dd") >= format(weekStart, "yyyy-MM-dd") &&
                        format(now, "yyyy-MM-dd") <= format(weekEnd, "yyyy-MM-dd");

  const calculateTime = (person: string, startDate: Date, endDate: Date) => {
    return entries
      .filter(
        (entry) =>
          entry.person === person &&
          isWithinInterval(new Date(entry.date), { start: startDate, end: endDate })
      )
      .reduce((sum, entry) => sum + entry.timeMinutes, 0);
  };

  const zsofiToday = calculateTime("Zsófi", todayStart, todayEnd);
  const zoliToday = calculateTime("Zoli", todayStart, todayEnd);
  const zsofiWeek = calculateTime("Zsófi", weekStart, weekEnd);
  const zoliWeek = calculateTime("Zoli", weekStart, weekEnd);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} perc`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ó ${mins}p`;
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const PersonBar = ({
    person,
    minutes,
    color,
    maxMinutes,
  }: {
    person: string;
    minutes: number;
    color: string;
    maxMinutes: number;
  }) => {
    const percentage = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">{person}</span>
          <span className="text-sm font-semibold text-gray-800">
            {formatTime(minutes)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Összesítés
      </h2>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Napi munka
          </h3>
        </div>

        <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-lg p-2">
          <button
            onClick={() => setSelectedDay(subDays(selectedDay, 1))}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-800">
              {format(selectedDay, "MMM d, yyyy", { locale: hu })}
            </div>
            {isDayToday && (
              <div className="text-xs text-blue-600">Ma</div>
            )}
          </div>

          <button
            onClick={() => setSelectedDay(addDays(selectedDay, 1))}
            disabled={isDayToday}
            className={`p-1 rounded transition-colors ${
              isDayToday ? "text-gray-300" : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <PersonBar
            person="Zsófi"
            minutes={zsofiToday}
            color="bg-pink-500"
            maxMinutes={Math.max(zsofiToday, zoliToday)}
          />
          <PersonBar
            person="Zoli"
            minutes={zoliToday}
            color="bg-blue-500"
            maxMinutes={Math.max(zsofiToday, zoliToday)}
          />
        </div>
        <div className="mt-3 text-sm text-gray-600 text-center">
          Összesen: {formatTime(zsofiToday + zoliToday)}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Heti munka
          </h3>
        </div>

        <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-lg p-2">
          <button
            onClick={() => setSelectedWeekStart(subWeeks(selectedWeekStart, 1))}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-800">
              {format(weekStart, "MMM d", { locale: hu })} - {format(weekEnd, "MMM d", { locale: hu })}
            </div>
            {isWeekCurrent && (
              <div className="text-xs text-blue-600">Aktuális hét</div>
            )}
          </div>

          <button
            onClick={() => setSelectedWeekStart(addWeeks(selectedWeekStart, 1))}
            disabled={isWeekCurrent}
            className={`p-1 rounded transition-colors ${
              isWeekCurrent ? "text-gray-300" : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <PersonBar
            person="Zsófi"
            minutes={zsofiWeek}
            color="bg-pink-500"
            maxMinutes={Math.max(zsofiWeek, zoliWeek)}
          />
          <PersonBar
            person="Zoli"
            minutes={zoliWeek}
            color="bg-blue-500"
            maxMinutes={Math.max(zsofiWeek, zoliWeek)}
          />
        </div>
        <div className="mt-3 text-sm text-gray-600 text-center">
          Összesen: {formatTime(zsofiWeek + zoliWeek)}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <History className="w-4 h-4" />
          Előzmények
        </h3>

        {sortedEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">Még nincs bejegyzés</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.person === "Zsófi"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {entry.person}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(entry.date), "yyyy. MMM d, HH:mm", { locale: hu })}
                      </span>
                    </div>
                    {entry.task !== "Napi megjegyzés" && (
                      <h4 className="font-medium text-gray-800 text-sm">{entry.task}</h4>
                    )}
                    {entry.notes && (
                      <p className="text-xs text-gray-600 mt-1 italic">{entry.notes}</p>
                    )}
                  </div>
                  {entry.timeMinutes > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{entry.timeMinutes}p</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
