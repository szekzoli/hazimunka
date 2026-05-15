import { useState, useEffect } from "react";
import { ChoreEntry } from "./components/ChoreEntry";
import { DailyEntries } from "./components/DailyEntries";
import { WeeklyChecklist } from "./components/WeeklyChecklist";
import { Summary } from "./components/Summary";
import { Home, CheckSquare, BarChart3, ListPlus, RefreshCw } from "lucide-react";
import { Toaster, toast } from "sonner";
import { supabase } from "../lib/supabase";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("chore-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "chore_entries" }, () => {
        loadEntries();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "available_tasks" }, () => {
        loadTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from("chore_entries")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading entries:", error);
      return;
    }
    if (data) {
      setEntries(
        data.map((e) => ({
          id: e.id,
          person: e.person,
          task: e.task,
          timeMinutes: e.time_minutes,
          notes: e.notes ?? "",
          date: e.date,
        }))
      );
    }
  };

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from("available_tasks")
      .select("name")
      .order("name");

    if (error) {
      console.error("Error loading tasks:", error);
      return;
    }
    if (data && data.length > 0) {
      setAvailableTasks(data.map((t) => t.name));
    }
  };

  const loadData = async () => {
    setLoading(true);

    const { data: tasksData } = await supabase
      .from("available_tasks")
      .select("name")
      .order("name");

    if (!tasksData || tasksData.length === 0) {
      await supabase
        .from("available_tasks")
        .upsert(INITIAL_TASKS.map((name) => ({ name })), { onConflict: "name" });
      setAvailableTasks([...INITIAL_TASKS].sort());
    } else {
      setAvailableTasks(tasksData.map((t) => t.name));
    }

    await loadEntries();
    setLoading(false);
  };

  const handleAddEntry = async (entry: Omit<ChoreEntryData, "id">) => {
    const { error } = await supabase.from("chore_entries").insert({
      person: entry.person,
      task: entry.task,
      time_minutes: entry.timeMinutes,
      notes: entry.notes,
      date: entry.date,
    });

    if (error) {
      toast.error("Hiba a mentés közben!");
    } else {
      toast.success("Sikeres hozzáadás!", { duration: 2000 });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase.from("chore_entries").delete().eq("id", id);
    if (error) {
      toast.error("Hiba a törlés közben!");
    }
  };

  const handleAddNewTask = async (task: string) => {
    if (!availableTasks.includes(task)) {
      await supabase
        .from("available_tasks")
        .upsert({ name: task }, { onConflict: "name" });
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-gray-500">Adatok betöltése...</p>
          </div>
        ) : (
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
        )}
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
