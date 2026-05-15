import { useState } from "react";
import { format, subDays, addDays } from "date-fns";
import { hu } from "date-fns/locale/hu";
import { Trash2, Clock, User, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface ChoreEntry {
  id: string;
  person: string;
  task: string;
  timeMinutes: number;
  notes: string;
  date: string;
}

interface DailyEntriesProps {
  entries: ChoreEntry[];
  onDeleteEntry: (id: string) => void;
}

export function DailyEntries({ entries, onDeleteEntry }: DailyEntriesProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const dayEntries = entries.filter(
    (entry) => format(new Date(entry.date), "yyyy-MM-dd") === selectedDateStr
  );

  const isToday = format(new Date(), "yyyy-MM-dd") === selectedDateStr;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Napi házimunkák
        </h2>
      </div>

      <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
        <button
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="text-center">
          <div className="font-semibold text-gray-800">
            {format(selectedDate, "MMMM d, yyyy", { locale: hu })}
          </div>
          <div className="text-sm text-gray-600">
            {format(selectedDate, "EEEE", { locale: hu })}
          </div>
          {isToday && (
            <div className="text-xs text-blue-600 font-medium mt-1">Ma</div>
          )}
        </div>

        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          disabled={isToday}
          className={`p-2 rounded-lg transition-colors ${
            isToday ? "text-gray-300" : "hover:bg-gray-200 text-gray-700"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {dayEntries.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {isToday ? "Még nincs mai bejegyzés" : "Nincs bejegyzés ezen a napon"}
        </p>
      ) : (
        <div className="space-y-3">
          {dayEntries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                        entry.person === "Zsófi"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <User className="w-3 h-3" />
                      {entry.person}
                    </span>
                  </div>
                  {entry.task !== "Napi megjegyzés" && (
                    <h3 className="font-semibold text-gray-800">{entry.task}</h3>
                  )}
                  {entry.timeMinutes > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      {entry.timeMinutes} perc
                    </div>
                  )}
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
