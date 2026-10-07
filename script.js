// Parts data. "requires" and "conflicts" hold part ids.
const PARTS = [
  { id: "intake",   group: "Engine",     name: "Cold air intake",     price: 8000,   hp: 5,  handling: 0 },
  { id: "exhaust",  group: "Engine",     name: "Performance exhaust", price: 15000,  hp: 8,  handling: 0 },
  { id: "ecu",      group: "Engine",     name: "ECU remap",           price: 20000,  hp: 15, handling: 0 },
  { id: "injector", group: "Engine",     name: "Fuel injectors",      price: 25000,  hp: 10, handling: 0 },
  { id: "turbo",    group: "Engine",     name: "Turbo kit",           price: 90000,  hp: 50, handling: 0, requires: ["ecu", "injector"], conflicts: ["super"] },
  { id: "super",    group: "Engine",     name: "Supercharger",        price: 85000,  hp: 40, handling: 0, requires: ["ecu"], conflicts: ["turbo"] },
  { id: "springs",  group: "Suspension", name: "Lowering springs",    price: 12000,  hp: 0,  handling: 4, conflicts: ["coilover"] },
  { id: "coilover", group: "Suspension", name: "Coilovers",           price: 45000,  hp: 0,  handling: 9, conflicts: ["springs"] },
  { id: "brakes",   group: "Brakes",     name: "Big brake kit",       price: 40000,  hp: 0,  handling: 5 },
  { id: "wheels",   group: "Wheels",     name: "Lightweight alloys",  price: 30000,  hp: 0,  handling: 3 },
];

const $ = id => document.getElementById(id);
const byId = Object.fromEntries(PARTS.map(p => [p.id, p]));
const rs = n => "Rs " + Math.round(n).toLocaleString("en-IN");
const selected = new Set();

// Build the list of parts grouped by category.
const groups = [...new Set(PARTS.map(p => p.group))];
for (const g of groups) {
  const wrap = document.createElement("div");
  wrap.className = "group";
  wrap.innerHTML = `<h2>${g}</h2>`;
  for (const p of PARTS.filter(x => x.group === g)) {
    const row = document.createElement("label");
    row.className = "part";
    const need = p.requires ? "Needs: " + p.requires.map(i => byId[i].name).join(", ") : "";
    row.innerHTML = `<input type="checkbox" value="${p.id}">
      <span class="name">${p.name}<small>${[p.hp ? "+" + p.hp + " hp" : "", p.handling ? "+" + p.handling + " handling" : "", need].filter(Boolean).join(" | ")}</small></span>
      <span class="price">${rs(p.price)}</span>`;
    row.querySelector("input").addEventListener("change", e => {
      e.target.checked ? selected.add(p.id) : selected.delete(p.id);
      update();
    });
    wrap.appendChild(row);
  }
  $("parts").appendChild(wrap);
}

function update() {
  const chosen = [...selected].map(i => byId[i]);
  const cost = chosen.reduce((s, p) => s + p.price, 0);
  const hp = +$("basehp").value + chosen.reduce((s, p) => s + p.hp, 0);
  const budget = +$("budget").value;
  const handling = chosen.reduce((s, p) => s + p.handling, 0);

  $("cost").textContent = rs(cost);
  $("left").textContent = rs(budget - cost);
  $("power").textContent = hp + " hp";
  $("handling").textContent = "+" + handling;

  const pct = budget > 0 ? Math.min(100, cost / budget * 100) : 100;
  $("fill").style.width = pct + "%";
  $("fill").style.background = cost > budget ? "var(--accent)" : "var(--ok)";

  // Validation: budget, missing requirements, conflicts.
  const msgs = [];
  if (cost > budget) msgs.push(["bad", `Over budget by ${rs(cost - budget)}.`]);
  for (const p of chosen) {
    for (const r of p.requires || [])
      if (!selected.has(r)) msgs.push(["bad", `${p.name} needs ${byId[r].name}.`]);
    for (const c of p.conflicts || [])
      if (selected.has(c) && p.id < c) msgs.push(["bad", `${p.name} cannot be combined with ${byId[c].name}.`]);
  }
  $("msgs").innerHTML = "";
  for (const [cls, text] of msgs) {
    const li = document.createElement("li");
    li.className = cls;
    li.textContent = text;
    $("msgs").appendChild(li);
  }
}

$("basehp").addEventListener("input", update);
$("budget").addEventListener("input", update);
update();
