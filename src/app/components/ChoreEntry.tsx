import { useState, useRef, useEffect } from "react";
import { Plus, Clock, User, Calendar, ChevronDown } from "lucide-react";
import { format } from "date-fns";

interface ChoreEntryProps {
  onAddEntry: (entry: {
    person: string;
    task: string;
    timeMinutes: number;
    notes: string;
    date: string;
  }) => void;
  availableTasks: string[];
  onAddNewTask: (task: string) => void;
}

export function ChoreEntry({ onAddEntry, availableTasks, onAddNewTask }: ChoreEntryProps) {
  const [person, setPerson] = useState<string>("");
  const [task, setTask] = useState<string>("");
  const [timeMinutes, setTimeMinutes] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [filteredTasks, setFilteredTasks] = useState<string[]>(availableTasks);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (task === "") {
      setFilteredTasks(availableTasks);
    } else {
      const filtered = availableTasks.filter((t) =>
        t.toLowerCase().includes(task.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [task, availableTasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!person) {
      return;
    }

    // Validálás: vagy van házimunka+idő, vagy van megjegyzés
    const hasChore = task && timeMinutes;
    const hasNote = notes.trim().length > 0;

    if (!hasChore && !hasNote) {
      alert("Add meg a házimunkát és az időt, vagy írj megjegyzést!");
      return;
    }

    const finalTask = task || "Napi megjegyzés";
    const finalTime = timeMinutes ? parseInt(timeMinutes) : 0;

    if (task && !availableTasks.includes(task)) {
      onAddNewTask(task);
    }

    const [year, month, day] = selectedDate.split('-');
    const dateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    onAddEntry({
      person,
      task: finalTask,
      timeMinutes: finalTime,
      notes,
      date: dateTime.toISOString(),
    });

    setTask("");
    setTimeMinutes("");
    setNotes("");
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setIsDropdownOpen(false);
  };

  const handleTaskSelect = (selectedTask: string) => {
    setTask(selectedTask);
    setIsDropdownOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 space-y-3">
      <h2 className="text-base font-semibold text-gray-800">Házimunka hozzáadása</h2>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <User className="w-4 h-4" />
          Ki végezte?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPerson("Zsófi")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              person === "Zsófi"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Zsófi
          </button>
          <button
            type="button"
            onClick={() => setPerson("Zoli")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              person === "Zoli"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Zoli
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <Calendar className="w-4 h-4" />
          Dátum
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={format(new Date(), "yyyy-MM-dd")}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Házimunka <span className="text-gray-400 text-xs">(opcionális)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={task}
            onChange={(e) => {
              setTask(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Kezdj el gépelni vagy válassz..."
            className="w-full py-2 px-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTaskSelect(t)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  {t}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {task ? `"${task}" hozzáadása új feladatként` : "Nincs találat"}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <Clock className="w-4 h-4" />
          Időráfordítás (perc) <span className="text-gray-400 text-xs">(opcionális)</span>
        </label>
        <input
          type="number"
          value={timeMinutes}
          onChange={(e) => setTimeMinutes(e.target.value)}
          min="1"
          placeholder="30"
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Megjegyzés
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Pl. A konyhát is felmostam"
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={1}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Hozzáadás
      </button>
    </form>
  );
}
