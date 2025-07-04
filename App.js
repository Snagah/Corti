
// PWA-enabled Cortisol Tracker App
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const habitsList = [
  "Sommeil >= 7h30",
  "Exposition à la lumière",
  "Respiration x3",
  "Repas réguliers",
  "Temps sans écran",
  "Marche / activité douce",
  "Compléments pris",
  "Douche chaude / bain",
  "Gratitude",
];

export default function CortisolTracker() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("cortisol_entries");
    return saved ? JSON.parse(saved) : [];
  });

  const [today, setToday] = useState({
    humeur: 3,
    energie: 3,
    anxiete: 3,
    fatigue: 3,
    habits: new Array(habitsList.length).fill(false),
    note: "",
  });

  useEffect(() => {
    localStorage.setItem("cortisol_entries", JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = () => {
    const habitsScore = today.habits.filter(Boolean).length;
    const score =
      habitsScore +
      (today.humeur >= 4 ? 1 : 0) +
      (today.energie >= 4 ? 1 : 0) +
      (today.anxiete <= 2 ? 1 : 0) +
      (today.fatigue <= 2 ? 1 : 0);
    const xp = score >= 16 ? 10 : score >= 11 ? 7 : score >= 6 ? 4 : 1;
    const recovery =
      (today.humeur + today.energie + (6 - today.anxiete) + (6 - today.fatigue)) * 5;
    const newEntry = { ...today, score, xp, recovery, date: new Date().toISOString().split("T")[0] };
    setEntries([...entries, newEntry]);
    setToday({
      humeur: 3,
      energie: 3,
      anxiete: 3,
      fatigue: 3,
      habits: new Array(habitsList.length).fill(false),
      note: "",
    });
  };

  const xpTotal = entries.reduce((sum, e) => sum + e.xp, 0);
  const level = Math.floor(xpTotal / 50);
  const xpToNext = 50 - (xpTotal % 50);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Suivi Cortisol - App Mobile</h1>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="font-semibold">État du jour</div>
          {["humeur", "energie", "anxiete", "fatigue"].map((k) => (
            <div key={k}>
              {k} :
              <input
                type="range"
                min={1}
                max={5}
                value={today[k]}
                onChange={(e) => setToday({ ...today, [k]: parseInt(e.target.value) })}
              />
              <span className="ml-2">{today[k]}</span>
            </div>
          ))}

          <div className="font-semibold">Habitudes</div>
          {habitsList.map((h, i) => (
            <div key={h}>
              <input
                type="checkbox"
                checked={today.habits[i]}
                onChange={() => {
                  const newHabits = [...today.habits];
                  newHabits[i] = !newHabits[i];
                  setToday({ ...today, habits: newHabits });
                }}
              />{" "}
              {h}
            </div>
          ))}

          <textarea
            className="w-full border p-2 mt-2"
            placeholder="Note libre..."
            value={today.note}
            onChange={(e) => setToday({ ...today, note: e.target.value })}
          />

          <button onClick={handleSubmit} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
            Enregistrer la journée
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">Progression</h2>
          <div>Niveau : {level}</div>
          <div>XP total : {xpTotal} (encore {xpToNext} XP pour le niveau suivant)</div>
          <Progress value={(xpTotal % 50) * 2} max={100} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold">Historique</h2>
          {entries.map((e, i) => (
            <div key={i} className="border-b py-1 text-sm">
              {e.date} : Score {e.score}, XP {e.xp}, Récupération {e.recovery}/100
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
