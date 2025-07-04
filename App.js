
const { useState, useEffect } = React;

function App() {
  const habitsList = [
    "Sommeil >= 7h30", "Exposition à la lumière", "Respiration x3", "Repas réguliers",
    "Temps sans écran", "Marche / activité douce", "Compléments pris", "Douche chaude / bain", "Gratitude"
  ];

  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("cortisol_entries");
    return saved ? JSON.parse(saved) : [];
  });

  const [today, setToday] = useState({
    humeur: 3, energie: 3, anxiete: 3, fatigue: 3,
    habits: new Array(habitsList.length).fill(false), note: ""
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
      humeur: 3, energie: 3, anxiete: 3, fatigue: 3,
      habits: new Array(habitsList.length).fill(false), note: ""
    });
  };

  const xpTotal = entries.reduce((sum, e) => sum + e.xp, 0);
  const level = Math.floor(xpTotal / 50);
  const xpToNext = 50 - (xpTotal % 50);

  return React.createElement("div", { style: { padding: "1em", fontFamily: "sans-serif" } }, [
    React.createElement("h2", {}, "Suivi Cortisol - WebApp"),
    React.createElement("div", {}, "Niveau : " + level + " | XP total : " + xpTotal + " | XP restant : " + xpToNext),
    ["humeur", "energie", "anxiete", "fatigue"].map((k) =>
      React.createElement("div", { key: k },
        k + ": ",
        React.createElement("input", {
          type: "range", min: 1, max: 5, value: today[k],
          onChange: e => setToday({ ...today, [k]: parseInt(e.target.value) })
        }),
        " " + today[k]
      )
    ),
    React.createElement("h4", {}, "Habitudes"),
    ...habitsList.map((h, i) =>
      React.createElement("div", { key: h },
        React.createElement("input", {
          type: "checkbox",
          checked: today.habits[i],
          onChange: () => {
            const newHabits = [...today.habits];
            newHabits[i] = !newHabits[i];
            setToday({ ...today, habits: newHabits });
          }
        }),
        " " + h
      )
    ),
    React.createElement("textarea", {
      rows: 3, style: { width: "100%", marginTop: "0.5em" },
      placeholder: "Note libre...",
      value: today.note,
      onChange: e => setToday({ ...today, note: e.target.value })
    }),
    React.createElement("button", {
      onClick: handleSubmit,
      style: { marginTop: "0.5em", padding: "0.5em", backgroundColor: "#10b981", color: "white", border: "none" }
    }, "Enregistrer la journée"),
    React.createElement("h4", { style: { marginTop: "1em" } }, "Historique"),
    ...entries.map((e, i) =>
      React.createElement("div", { key: i, style: { fontSize: "0.9em", borderBottom: "1px solid #ccc", marginBottom: "0.3em" } },
        `${e.date} — Score: ${e.score}, XP: ${e.xp}, Récup: ${e.recovery}/100`
      )
    )
  ]);
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
