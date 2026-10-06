export type Row = Record<string, unknown>;
export type ColType = "numeric" | "date" | "categorical" | "text";
export interface Col { name: string; type: ColType; missing: number; unique: number }
export interface Stat { col: string; count: number; sum: number; avg: number; min: number; max: number; std: number }
export interface Dataset { name: string; size: number; rows: Row[]; cols: Col[]; duplicates: number; stats: Stat[] }

const isEmpty = (v: unknown) => v === null || v === undefined || String(v).trim() === "";
export const num = (v: unknown) => { if (typeof v === "number") return v; const n = Number(String(v).replace(/[,$%\s]/g, "")); return isNaN(n) ? NaN : n; };
const isDate = (v: unknown) => { const s = String(v); return /\d{4}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|^[A-Za-z]{3,9}[ -]\d{4}$/.test(s) && !isNaN(Date.parse(s)); };

export async function parseFile(file: File): Promise<Row[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") {
    const Papa = (await import("papaparse")).default;
    const text = await file.text();
    const r = Papa.parse<Row>(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
    return r.data;
  }
  if (ext === "json") {
    const d = JSON.parse(await file.text());
    const arr = Array.isArray(d) ? d : Object.values(d).find(Array.isArray);
    if (!Array.isArray(arr)) throw new Error("JSON must be an array of objects");
    return arr as Row[];
  }
  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(await file.arrayBuffer());
    return XLSX.utils.sheet_to_json<Row>(wb.Sheets[wb.SheetNames[0]], { defval: null });
  }
  throw new Error("Unsupported file type. Use CSV, XLS, XLSX or JSON.");
}

export function analyze(name: string, size: number, rows: Row[]): Dataset {
  if (!rows.length || typeof rows[0] !== "object") throw new Error("No rows found in file");
  const names = Array.from(new Set(rows.flatMap((r) => Object.keys(r)))).filter((n) => n && !n.startsWith("__"));
  const cols: Col[] = names.map((n) => {
    const vals = rows.map((r) => r[n]).filter((v) => !isEmpty(v));
    const unique = new Set(vals.map(String)).size;
    let type: ColType = "text";
    if (vals.length && vals.every((v) => !isNaN(num(v)))) type = "numeric";
    else if (vals.length && vals.every(isDate)) type = "date";
    else if (unique <= Math.max(20, vals.length * 0.5)) type = "categorical";
    return { name: n, type, missing: rows.length - vals.length, unique };
  });
  const seen = new Set<string>(); let duplicates = 0;
  rows.forEach((r) => { const k = JSON.stringify(names.map((n) => r[n])); if (seen.has(k)) duplicates++; else seen.add(k); });
  const stats = cols.filter((c) => c.type === "numeric").map((c) => statOf(rows, c.name));
  return { name, size, rows, cols, duplicates, stats };
}

export function statOf(rows: Row[], col: string): Stat {
  const v = rows.map((r) => num(r[col])).filter((x) => !isNaN(x));
  const sum = v.reduce((a, b) => a + b, 0), avg = v.length ? sum / v.length : 0;
  const std = Math.sqrt(v.reduce((a, b) => a + (b - avg) ** 2, 0) / (v.length || 1));
  return { col, count: v.length, sum, avg, min: v.length ? Math.min(...v) : 0, max: v.length ? Math.max(...v) : 0, std };
}

export const fmt = (n: number) => Math.abs(n) >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : Number(n.toFixed(2)).toString();

export function groupBy(rows: Row[], cat: string, val?: string, agg: "sum" | "avg" | "count" = "sum") {
  const m = new Map<string, number[]>();
  rows.forEach((r) => { const k = isEmpty(r[cat]) ? "(blank)" : String(r[cat]); const x = val ? num(r[val]) : 1; if (!m.has(k)) m.set(k, []); if (!isNaN(x)) m.get(k)!.push(x); });
  return [...m.entries()].map(([name, xs]) => ({ name, value: agg === "count" ? xs.length : agg === "avg" ? xs.reduce((a, b) => a + b, 0) / (xs.length || 1) : xs.reduce((a, b) => a + b, 0) }));
}

export function monthly(rows: Row[], dateCol: string, val?: string) {
  const m = new Map<string, number>();
  rows.forEach((r) => { const d = new Date(String(r[dateCol])); if (isNaN(+d)) return; const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; const x = val ? num(r[val]) : 1; m.set(k, (m.get(k) || 0) + (isNaN(x) ? 0 : x)); });
  return [...m.entries()].sort().map(([name, value]) => ({ name, value }));
}

export function corr(rows: Row[], a: string, b: string) {
  const p = rows.map((r) => [num(r[a]), num(r[b])]).filter(([x, y]) => !isNaN(x) && !isNaN(y));
  const n = p.length; if (n < 3) return 0;
  const mx = p.reduce((s, [x]) => s + x, 0) / n, my = p.reduce((s, [, y]) => s + y, 0) / n;
  let sxy = 0, sx = 0, sy = 0; p.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sx += (x - mx) ** 2; sy += (y - my) ** 2; });
  return sx && sy ? sxy / Math.sqrt(sx * sy) : 0;
}

export const pick = (d: Dataset) => {
  const nums = d.cols.filter((c) => c.type === "numeric").map((c) => c.name);
  const cats = d.cols.filter((c) => c.type === "categorical").map((c) => c.name);
  const dates = d.cols.filter((c) => c.type === "date").map((c) => c.name);
  const main = ["sales", "revenue", "amount", "total", "profit", "price"].map((k) => nums.find((n) => n.toLowerCase().includes(k))).find(Boolean) || nums[0];
  return { nums, cats, dates, main };
};

export function insights(d: Dataset): string[] {
  const out: string[] = []; const { nums, cats, dates, main } = pick(d);
  if (main && dates[0]) {
    const t = monthly(d.rows, dates[0], main);
    if (t.length >= 2) { const f = t[0].value, l = t[t.length - 1].value; const ch = f ? ((l - f) / f) * 100 : 0;
      out.push(`Trend: ${main} ${ch >= 0 ? "increased" : "decreased"} ${Math.abs(ch).toFixed(1)}% from ${t[0].name} to ${t[t.length - 1].name}.`);
      const peak = t.reduce((a, b) => (b.value > a.value ? b : a)); out.push(`Peak period for ${main}: ${peak.name} (${fmt(peak.value)}).`); }
  }
  if (main && cats[0]) { const g = groupBy(d.rows, cats[0], main).sort((a, b) => b.value - a.value); const tot = g.reduce((s, x) => s + x.value, 0);
    out.push(`Top ${cats[0]}: "${g[0].name}" contributes ${fmt(g[0].value)} (${((g[0].value / (tot || 1)) * 100).toFixed(1)}% of total ${main}).`); }
  d.stats.forEach((s) => { const an = d.rows.filter((r) => Math.abs(num(r[s.col]) - s.avg) > 2 * s.std).length;
    if (an && s.std) out.push(`Anomaly: ${an} value(s) in ${s.col} lie more than 2 standard deviations from the mean (${fmt(s.avg)}).`); });
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) { const r = corr(d.rows, nums[i], nums[j]);
    if (Math.abs(r) >= 0.5) out.push(`Correlation: ${nums[i]} and ${nums[j]} have a ${r > 0 ? "positive" : "negative"} correlation (r = ${r.toFixed(2)}).`); }
  if (!out.length) out.push("No strong trends, anomalies or correlations were detected.");
  return out;
}

export interface Answer { text: string; how: string; chart?: { type: "bar" | "line" | "pie"; data: { name: string; value: number }[] } }

export function ask(d: Dataset, q: string): Answer {
  const s = q.toLowerCase(); const { nums, cats, dates, main } = pick(d);
  const find = (list: string[]) => list.find((c) => s.includes(c.toLowerCase()) || s.includes(c.toLowerCase().replace(/_/g, " ")));
  const val = find(nums) || main; const cat = find(cats) || find(d.cols.filter((c) => c.type === "text").map((c) => c.name));
  if (!val && !/count|how many|rows/.test(s)) return { text: "This dataset has no numeric columns to calculate on.", how: "No numeric columns detected." };
  if (/how many|count|number of rows/.test(s) && !cat) return { text: `The dataset has ${d.rows.length} rows and ${d.cols.length} columns.`, how: "Counted all records." };
  if (/trend|month|over time|time/.test(s) && dates[0]) { const t = monthly(d.rows, dates[0], val);
    return { text: `Monthly ${val} ranges from ${fmt(Math.min(...t.map((x) => x.value)))} to ${fmt(Math.max(...t.map((x) => x.value)))} across ${t.length} months.`, how: `Grouped rows by month of "${dates[0]}" and summed "${val}".`, chart: { type: "line", data: t } }; }
  const g = cat || cats[0];
  if (/ by |per |each|breakdown|distribution|share/.test(s) && g) { const agg = /average|avg|mean/.test(s) ? "avg" : "sum"; const data = groupBy(d.rows, g, val, agg).sort((a, b) => b.value - a.value);
    return { text: `${agg === "avg" ? "Average" : "Total"} ${val} by ${g}: ` + data.slice(0, 5).map((x) => `${x.name} = ${fmt(x.value)}`).join(", ") + (data.length > 5 ? "…" : "."), how: `Grouped rows by "${g}" and computed the ${agg} of "${val}".`, chart: { type: /share|pie|distribution/.test(s) ? "pie" : "bar", data: data.slice(0, 12) } }; }
  if (/best|top|most|highest|performed|worst|lowest|least/.test(s) && (cat || (/which|who/.test(s) && g))) { const data = groupBy(d.rows, g!, val).sort((a, b) => b.value - a.value); const low = /worst|lowest|least/.test(s); const w = low ? data[data.length - 1] : data[0];
    return { text: `"${w.name}" ${low ? "performed worst" : "performed best"} with total ${val} of ${fmt(w.value)}.`, how: `Summed "${val}" for each "${g}" and picked the ${low ? "lowest" : "highest"}.`, chart: { type: "bar", data: data.slice(0, 10) } }; }
  const st = statOf(d.rows, val!);
  if (/highest|max|largest|biggest|top/.test(s)) return { text: `The highest ${val} is ${fmt(st.max)}.`, how: `Scanned ${st.count} values of "${val}" and took the maximum.` };
  if (/lowest|min|smallest|least/.test(s)) return { text: `The lowest ${val} is ${fmt(st.min)}.`, how: `Scanned ${st.count} values of "${val}" and took the minimum.` };
  if (/average|avg|mean/.test(s)) return { text: `The average ${val} is ${fmt(st.avg)}.`, how: `Sum (${fmt(st.sum)}) ÷ count (${st.count}).` };
  if (/total|sum/.test(s)) return { text: `The total ${val} is ${fmt(st.sum)}.`, how: `Added all ${st.count} values of "${val}".` };
  return { text: `Summary of ${val}: total ${fmt(st.sum)}, average ${fmt(st.avg)}, min ${fmt(st.min)}, max ${fmt(st.max)}.`, how: `Question not matched exactly, so a summary of "${val}" was computed. Try words like average, highest, by, trend, best.` };
}

export function demo(): Row[] {
  const regions = ["North", "South", "East", "West"], products = ["Laptop", "Phone", "Tablet", "Monitor", "Headphones"];
  const rows: Row[] = []; let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 120; i++) { const m = (i % 12) + 1; const p = products[i % 5]; const units = Math.round(5 + rnd() * 40 + m * 2);
    const price = { Laptop: 900, Phone: 600, Tablet: 400, Monitor: 250, Headphones: 80 }[p]!;
    rows.push({ Date: `2025-${String(m).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}`, Region: regions[Math.floor(rnd() * 4)], Product: p, Units: units, Price: price, Sales: i === 50 ? 150000 : units * price, Rating: i % 17 === 0 ? null : +(3 + rnd() * 2).toFixed(1) }); }
  rows.push({ ...rows[3] });
  return rows;
}
