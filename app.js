// Cortisol Tracker WebApp - Enhanced UI with Motivation & Progress Bar
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

  const motivationMessages = [
    "Rappelle-toi : réduire ton cortisol, c’est retrouver ton énergie.",
    "Chaque bonne habitude t’approche d’un mental plus clair.",
    "Respirer, marcher, dormir : c’est ton chemin vers le calme.",
    "Tu avances, même doucement. Et c’est ce qui compte.",
    "Un jour à la fois. Ton corps te remercie."
  ];

  const encouragements = [
    "💪 Tu peux le faire !",
    "🌞 Une bonne journée commence par une bonne routine.",
    "🧘 Respire profondément, tu es sur la bonne voie.",
    "🔥 Tu gagnes en clarté mentale à chaque pas.",
    "🌈 Tu es en train de te transformer. Continue !"
  ];

  const getRandomMessage = (list) => list[Math.floor(Math.random() * list.length)];

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

  const resetAll = () => {
    if (confirm("Réinitialiser tout l'historique ?")) {
      localStorage.removeItem("cortisol_entries");
      setEntries([]);
    }
  };

  const resetToday = () => {
    if (confirm("Effacer l'entrée du jour ?")) {
      setEntries(entries.filter(e => e.date !== todayDate));
    }
  };

  const xpTotal = entries.reduce((sum, e) => sum + e.xp, 0);
  const level = Math.floor(xpTotal / 50);
  const xpToNext = 50 - (xpTotal % 50);
  const progressPercent = Math.floor((xpTotal % 50) * 2);

  let phase = "🌱 Phase 1 : Stabiliser";
  if (entries.length >= 20 && entries.length < 40) phase = "🌿 Phase 2 : Rééquilibrer";
  else if (entries.length >= 40) phase = "🌳 Phase 3 : Reconstruire";

  const containerStyle = {
    padding: "1em",
    fontFamily: "sans-serif",
    maxWidth: "700px",
    margin: "auto",
    background: "linear-gradient(135deg, #b2f5ea, #c3dafe, #e6fffa, #bee3f8)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  };

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: "1em",
    borderRadius: "12px",
    marginBottom: "1em",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  };

  return React.createElement("div", { style: containerStyle }, [
    React.createElement("h2", { style: { textAlign: "center", color: "#10b981" } }, "🌿 Suivi Cortisol"),
    React.createElement("div", { style: { textAlign: "center", fontWeight: "bold", marginBottom: "0.5em" } }, phase),
    React.createElement("div", { style: { textAlign: "center", fontStyle: "italic", color: "#2d3748", marginBottom: "1em" } }, getRandomMessage(motivationMessages)),
    React.createElement("div", { style: cardStyle },
      React.createElement("div", {}, `Niveau : ${level} | XP : ${xpTotal} (encore ${xpToNext} XP)`),
      React.createElement("div", {
        style: {
          height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden", marginTop: "0.5em"
        }
      },
        React.createElement("div", {
          style: {
            width: `${progressPercent}%`,
            height: "100%",
            background: "linear-gradient(to right, #38b2ac, #4299e1)",
            transition: "width 0.5s"
          }
        })
      )
    ),
    React.createElement("div", { style: cardStyle },
      ["humeur", "energie", "anxiete", "fatigue"].map((k) =>
        React.createElement("div", { key: k, style: { margin: "0.5em 0" } }, [
          `${k} : `,
          React.createElement("input", {
            type: "range", min: 1, max: 5, value: today[k],
            onChange: e => setToday({ ...today, [k]: parseInt(e.target.value) })
          }),
          ` ${today[k]}`
        ])
      )
    ),
    React.createElement("div", { style: cardStyle }, [
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
      )
    ]),
    React.createElement("textarea", {
      rows: 3, style: { width: "100%", marginBottom: "1em" },
      placeholder: "Note libre...",
      value: today.note,
      onChange: e => setToday({ ...today, note: e.target.value })
    }),
    React.createElement("button", {
      onClick: handleSubmit,
      disabled: alreadyLogged,
      style: {
        margin: "0.5em 0", padding: "0.7em 1.5em", backgroundColor: alreadyLogged ? "gray" : "#10b981",
        color: "white", border: "none", borderRadius: "5px", cursor: alreadyLogged ? "not-allowed" : "pointer"
      }
    }, alreadyLogged ? "Déjà enregistré aujourd’hui" : "✅ Enregistrer la journée"),
    React.createElement("div", {}, [
      React.createElement("button", {
        onClick: resetToday,
        style: { marginRight: "1em", padding: "0.5em", backgroundColor: "#f6ad55", border: "none", borderRadius: "5px" }
      }, "↩️ Effacer aujourd’hui"),
      React.createElement("button", {
        onClick: resetAll,
        style: { padding: "0.5em", backgroundColor: "#f56565", color: "white", border: "none", borderRadius: "5px" }
      }, "🗑️ Réinitialiser tout")
    ]),
    React.createElement("div", { style: cardStyle },
      React.createElement("h4", {}, "Historique"),
      ...entries.slice().reverse().map((e, i) =>
        React.createElement("div", { key: i, style: { fontSize: "0.9em", borderBottom: "1px solid #ccc", marginBottom: "0.3em" } },
          `${e.date} — Score: ${e.score}, XP: ${e.xp}, Récup: ${e.recovery}/100`
        )
      )
    ),
    React.createElement("div", { style: { textAlign: "center", marginTop: "1em", fontWeight: "bold", color: "#2b6cb0" } }, getRandomMessage(encouragements))
  ]);
}

ReactDOM.render(React.createElement(App), document.getElementById("root"));
