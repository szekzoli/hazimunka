import { useState, useEffect } from "react";
import { ChoreEntry } from "./components/ChoreEntry";
import { DailyEntries } from "./components/DailyEntries";
import { WeeklyChecklist } from "./components/WeeklyChecklist";
import { Summary } from "./components/Summary";
import { Home, CheckSquare, BarChart3, ListPlus } from "lucide-react";
import { Toaster, toast } from "sonner";

interface ChoreEntryData {
  id: string;
  person: string;
  task: string;
  timeMinutes: number;
  notes: string;
  date: string;
}

const INITIAL_TASKS = [
  "WC takarítás",
  "Porszívózás",
  "Felmosás",
  "Tűzhely takarítás",
  "Fürdőszoba csap és tükör",
  "Mosás és teregetés",
  "Ruha hajtogatás",
  "Kutyaszar felszedés",
  "Macskaalom takarítás",
  "Fűnyírás (előkert, kert)",
  "Mosogatógép kipakolás, bepakolás",
  "Pult tisztítás",
  "Szelektív szemét kivitel",
  "Zöldhulladék gyűjtés, kivitel",
  "Egyéb kerti munka",
  "Online bevásárlás",
  "Bolti bevásárlás",
];

const RECURRING_TASKS = [
  "WC takarítás",
  "Porszívózás",
  "Felmosás",
  "Tűzhely takarítás",
  "Fürdőszoba csap és tükör",
  "Mosás és teregetés",
  "Ruha hajtogatás",
  "Kutyaszar felszedés",
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"add" | "daily" | "checklist" | "summary">("add");
  const [entries, setEntries] = useState<ChoreEntryData[]>([]);
  const [availableTasks, setAvailableTasks] = useState<string[]>(INITIAL_TASKS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("choreEntries");
      if (saved) {
        setEntries(JSON.parse(saved));
      }

      const savedTasks = localStorage.getItem("availableTasks");
      if (savedTasks) {
        setAvailableTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("choreEntries", JSON.stringify(entries));
      console.log("Saved entries:", entries.length);
    } catch (error) {
      console.error("Error saving entries to localStorage:", error);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem("availableTasks", JSON.stringify(availableTasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }, [availableTasks]);

  const handleAddEntry = (entry: Omit<ChoreEntryData, "id">) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setEntries([...entries, newEntry]);
    toast.success("Sikeres hozzáadás!", {
      duration: 2000,
    });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleAddNewTask = (task: string) => {
    if (!availableTasks.includes(task)) {
      setAvailableTasks([...availableTasks, task].sort());
    }
  };

  const tabs = [
    { id: "add" as const, label: "Hozzáadás", icon: ListPlus },
    { id: "daily" as const, label: "Napi", icon: Home },
    { id: "checklist" as const, label: "Checklist", icon: CheckSquare },
    { id: "summary" as const, label: "Összesítés", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-16">
      <Toaster position="top-center" richColors />
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Házimunka Követő</h1>
        </div>

        <div className="space-y-4">
          {activeTab === "add" && (
            <ChoreEntry
              onAddEntry={handleAddEntry}
              availableTasks={availableTasks}
              onAddNewTask={handleAddNewTask}
            />
          )}
          {activeTab === "daily" && (
            <DailyEntries entries={entries} onDeleteEntry={handleDeleteEntry} />
          )}
          {activeTab === "checklist" && (
            <WeeklyChecklist entries={entries} recurringTasks={RECURRING_TASKS} />
          )}
          {activeTab === "summary" && <Summary entries={entries} />}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-2 py-2">
          <div className="flex justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
