
const { useState, useEffect } = React;

function App() {
  const habitsList = [
    ["Sommeil >= 7h30", "Tu dois dormir au moins 7h30, idéalement de 22h à 6h30."],
    ["Exposition à la lumière", "Expose-toi à la lumière naturelle (ou forte) 5 à 10 min dès le matin."],
    ["Respiration x3", "Fais 3 sessions de cohérence cardiaque (5 min chacune)."],
    ["Repas réguliers", "Ne saute pas de repas, prends un petit déjeuner protéiné."],
    ["Temps sans écran", "30 minutes minimum sans écran (lecture, détente, nature...)."],
    ["Marche / activité douce", "Marche au moins 20 minutes ou fais une séance légère de mouvement."],
    ["Compléments pris", "Prends magnésium, ashwagandha ou autre si prévus."],
    ["Douche chaude / bain", "Prends un bain/douche chaude pour te détendre avant le coucher."],
    ["Gratitude", "Note 3 choses positives ou gratifiantes dans ta journée."]
  ];

  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("cortisol_entries");
    return saved ? JSON.parse(saved) : [];
  });

  const [today, setToday] = useState({
    humeur: 3, energie: 3, anxiete: 3, fatigue: 3,
    habits: new Array(habitsList.length).fill(false), note: ""
  });

  const todayDate = new Date().toISOString().split("T")[0];
  const alreadyLogged = entries.some(e => e.date === todayDate);

  useEffect(() => {
    localStorage.setItem("cortisol_entries", JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = () => {
    if (alreadyLogged) return;
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
    const newEntry = { ...today, score, xp, recovery, date: todayDate };
    setEntries([...entries, newEntry]);
    setToday({
      humeur: 3, energie: 3, anxiete: 3, fatigue: 3,
      habits: new Array(habitsList.length).fill(false), note: ""
    });
  };

  const xpTotal = entries.reduce((sum, e) => sum + e.xp, 0);
  const level = Math.floor(xpTotal / 50);
  const xpToNext = 50 - (xpTotal % 50);

  return React.createElement("div", { style: { padding: "1em", fontFamily: "sans-serif", maxWidth: "600px", margin: "auto" } }, [
    React.createElement("h2", { style: { textAlign: "center", color: "#10b981" } }, "🌿 Suivi Cortisol - WebApp"),
    React.createElement("div", { style: { marginBottom: "1em", fontWeight: "bold" } },
      `Niveau : ${level} | XP : ${xpTotal} (encore ${xpToNext} XP)`
    ),
    ["humeur", "energie", "anxiete", "fatigue"].map((k) =>
      React.createElement("div", { key: k, style: { margin: "0.5em 0" } }, [
        `${k} : `,
        React.createElement("input", {
          type: "range", min: 1, max: 5, value: today[k],
          onChange: e => setToday({ ...today, [k]: parseInt(e.target.value) })
        }),
        ` ${today[k]}`
      ])
    ),
    React.createElement("h4", {}, "Habitudes"),
    ...habitsList.map(([label, desc], i) =>
      React.createElement("div", { key: label, style: { marginBottom: "0.5em" } }, [
        React.createElement("input", {
          type: "checkbox",
          checked: today.habits[i],
          onChange: () => {
            const newHabits = [...today.habits];
            newHabits[i] = !newHabits[i];
            setToday({ ...today, habits: newHabits });
          }
        }),
        ` ${label}`,
        React.createElement("div", { style: { fontSize: "0.8em", color: "#666", marginLeft: "1.5em" } }, desc)
      ])
    ),
    React.createElement("textarea", {
      rows: 3, style: { width: "100%", marginTop: "1em" },
      placeholder: "Note libre...",
      value: today.note,
      onChange: e => setToday({ ...today, note: e.target.value })
    }),
    React.createElement("button", {
      onClick: handleSubmit,
      disabled: alreadyLogged,
      style: {
        marginTop: "1em", padding: "0.7em 1.5em", backgroundColor: alreadyLogged ? "gray" : "#10b981",
        color: "white", border: "none", borderRadius: "5px", cursor: alreadyLogged ? "not-allowed" : "pointer"
      }
    }, alreadyLogged ? "Déjà enregistré aujourd’hui" : "✅ Enregistrer la journée"),

    React.createElement("h4", { style: { marginTop: "2em" } }, "Historique"),
    ...entries.slice().reverse().map((e, i) =>
      React.createElement("div", { key: i, style: { fontSize: "0.9em", borderBottom: "1px solid #ccc", marginBottom: "0.3em" } },
        `${e.date} — Score: ${e.score}, XP: ${e.xp}, Récup: ${e.recovery}/100`
      )
    )
  ]);
}

ReactDOM.render(React.createElement(App), document.getElementById("root"));
