import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { Upload, Shield, Sparkles, Database } from "lucide-react";
import { analyze, ask, demo, fmt, groupBy, insights, monthly, parseFile, pick, corr, type Answer, type Dataset } from "@/lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DataSense AI Analyst — Natural Language Data Analysis" },
      { name: "description", content: "Upload any CSV, Excel or JSON file and ask questions in plain English. Schema-agnostic, private, in-browser analytics." },
      { property: "og:title", content: "DataSense AI Analyst" },
      { property: "og:description", content: "Schema-Agnostic Natural Language Data Analyst." },
    ],
  }),
  component: App,
});

const TABS = ["Overview", "Dataset", "Ask AI", "Insights", "Visualizations", "Data Quality", "Reports"] as const;
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const card = "rounded-lg border bg-card p-4";
const btn = "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90";
const btn2 = "inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent";

function App() {
  const [ds, setDs] = useState<Dataset | null>(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = async (f: File) => {
    setErr("");
    if (f.size > 20 * 1024 * 1024) return setErr("File too large (max 20MB).");
    try { setDs(analyze(f.name, f.size, await parseFile(f))); setTab("Overview"); } catch (e) { setErr((e as Error).message); }
  };

  return (
    <div className="min-h-screen bg-background">
      <input ref={input} type="file" accept=".csv,.xls,.xlsx,.json" hidden onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
      {!ds ? (
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
          <Database className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">DataSense AI Analyst</h1>
          <p className="text-lg text-muted-foreground">Schema-Agnostic Natural Language Data Analyst</p>
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]); }}
            className={`w-full rounded-xl border-2 border-dashed p-10 ${drag ? "border-primary bg-accent" : ""}`}>
            <p className="mb-4 text-sm text-muted-foreground">Drag & drop a CSV, XLS/XLSX or JSON file here</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className={btn} onClick={() => input.current?.click()}><Upload className="h-4 w-4" />Upload Dataset</button>
              <button className={btn2} onClick={() => { setDs(analyze("sample_sales.json", 9800, demo())); setTab("Overview"); }}><Sparkles className="h-4 w-4" />Try Demo Data</button>
            </div>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Privacy />
        </main>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-4">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-xl font-bold">DataSense AI Analyst</h1>
              <p className="text-xs text-muted-foreground">{ds.name} · {(ds.size / 1024).toFixed(1)} KB · {ds.rows.length} rows · {ds.cols.length} columns</p></div>
            <div className="flex gap-2"><button className={btn2} onClick={() => input.current?.click()}><Upload className="h-4 w-4" />New file</button>
              <button className={btn2} onClick={() => setDs(null)}>Home</button></div>
          </header>
          {err && <p className="mb-2 text-sm text-destructive">{err}</p>}
          <nav className="mb-4 flex gap-1 overflow-x-auto border-b">
            {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-3 py-2 text-sm ${tab === t ? "border-b-2 border-primary font-semibold text-primary" : "text-muted-foreground"}`}>{t}</button>)}
          </nav>
          {tab === "Overview" && <Overview d={ds} />}
          {tab === "Dataset" && <DatasetTab d={ds} />}
          {tab === "Ask AI" && <AskTab d={ds} />}
          {tab === "Insights" && <List items={insights(ds)} />}
          {tab === "Visualizations" && <Viz d={ds} />}
          {tab === "Data Quality" && <Quality d={ds} />}
          {tab === "Reports" && <Report d={ds} />}
          <div className="mt-6"><Privacy /></div>
        </div>
      )}
    </div>
  );
}

const Privacy = () => <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Shield className="h-4 w-4" />Privacy: your file is processed entirely in your browser and never uploaded to any server.</p>;
const List = ({ items }: { items: string[] }) => <ul className="space-y-2">{items.map((i, k) => <li key={k} className={card + " text-sm"}>{i}</li>)}</ul>;

function Overview({ d }: { d: Dataset }) {
  const miss = d.cols.reduce((s, c) => s + c.missing, 0);
  return (<div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[["Rows", d.rows.length], ["Columns", d.cols.length], ["Missing values", miss], ["Duplicate rows", d.duplicates]].map(([k, v]) =>
        <div key={k} className={card}><p className="text-xs text-muted-foreground">{k}</p><p className="text-2xl font-bold">{v}</p></div>)}
    </div>
    <StatsTable d={d} />
    <div><h3 className="mb-2 font-semibold">Key insights</h3><List items={insights(d).slice(0, 3)} /></div>
  </div>);
}

function StatsTable({ d }: { d: Dataset }) {
  if (!d.stats.length) return <p className="text-sm text-muted-foreground">No numeric columns.</p>;
  return (<div className={card + " overflow-x-auto"}><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground">{["Column", "Count", "Sum", "Average", "Min", "Max"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
    <tbody>{d.stats.map((s) => <tr key={s.col} className="border-t"><td className="p-2 font-medium">{s.col}</td><td className="p-2">{s.count}</td><td className="p-2">{fmt(s.sum)}</td><td className="p-2">{fmt(s.avg)}</td><td className="p-2">{fmt(s.min)}</td><td className="p-2">{fmt(s.max)}</td></tr>)}</tbody></table></div>);
}

function DatasetTab({ d }: { d: Dataset }) {
  return (<div className="space-y-4">
    <div className={card + " overflow-x-auto"}><h3 className="mb-2 font-semibold">Detected schema</h3><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="p-2">Column</th><th className="p-2">Type</th><th className="p-2">Unique</th><th className="p-2">Missing</th></tr></thead>
      <tbody>{d.cols.map((c) => <tr key={c.name} className="border-t"><td className="p-2 font-medium">{c.name}</td><td className="p-2"><span className="rounded bg-secondary px-2 py-0.5 text-xs">{c.type}</span></td><td className="p-2">{c.unique}</td><td className="p-2">{c.missing}</td></tr>)}</tbody></table></div>
    <div className={card + " overflow-x-auto"}><h3 className="mb-2 font-semibold">Preview (first 20 rows)</h3><table className="w-full text-sm"><thead><tr>{d.cols.map((c) => <th key={c.name} className="whitespace-nowrap p-2 text-left text-muted-foreground">{c.name}</th>)}</tr></thead>
      <tbody>{d.rows.slice(0, 20).map((r, i) => <tr key={i} className="border-t">{d.cols.map((c) => <td key={c.name} className="whitespace-nowrap p-2">{r[c.name] == null ? <span className="text-destructive">—</span> : String(r[c.name])}</td>)}</tr>)}</tbody></table></div>
  </div>);
}

function MiniChart({ type, data }: { type: "bar" | "line" | "pie"; data: { name: string; value: number }[] }) {
  return (<ResponsiveContainer width="100%" height={260}>
    {type === "pie" ? <PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>{data.map((_, i) => <Cell key={i} fill={COLORS[i % 5]} />)}</Pie><Tooltip /></PieChart>
      : type === "line" ? <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Line dataKey="value" stroke="var(--chart-2)" strokeWidth={2} /></LineChart>
      : <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="value" fill="var(--chart-1)" /></BarChart>}
  </ResponsiveContainer>);
}

function AskTab({ d }: { d: Dataset }) {
  const [q, setQ] = useState(""); const [hist, setHist] = useState<{ q: string; a: Answer }[]>([]);
  const { main, cats } = pick(d);
  const sugg = ["What is the highest value?", `What is the average ${main ?? "value"}?`, `Which ${cats[0] ?? "item"} performed best?`, `Show ${main ?? "value"} by ${cats[1] ?? cats[0] ?? "category"}`, "Show monthly trend"];
  const run = (text: string) => { if (!text.trim()) return; let a: Answer; try { a = ask(d, text); } catch { a = { text: "Sorry, I couldn't answer that.", how: "An error occurred while computing." }; } setHist((h) => [{ q: text, a }, ...h]); setQ(""); };
  return (<div className="space-y-4">
    <form onSubmit={(e) => { e.preventDefault(); run(q); }} className="flex gap-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a question about your data…" className="flex-1 rounded-md border bg-background px-3 py-2 text-sm" />
      <button className={btn}><Sparkles className="h-4 w-4" />Ask</button>
    </form>
    <div className="flex flex-wrap gap-2">{sugg.map((s) => <button key={s} onClick={() => run(s)} className="rounded-full border px-3 py-1 text-xs hover:bg-accent">{s}</button>)}</div>
    {hist.map((h, i) => <div key={i} className={card}><p className="text-sm text-muted-foreground">Q: {h.q}</p><p className="mt-1 font-medium">{h.a.text}</p>
      <p className="mt-1 text-xs text-muted-foreground">How: {h.a.how}</p>{h.a.chart && <div className="mt-3"><MiniChart {...h.a.chart} /></div>}</div>)}
  </div>);
}

function Viz({ d }: { d: Dataset }) {
  const { nums, cats, dates, main } = pick(d);
  const [x, setX] = useState(nums[0]); const [y, setY] = useState(nums[1] ?? nums[0]);
  const bar = main && cats[0] ? groupBy(d.rows, cats[0], main) : null;
  const pie = cats[1] ?? cats[0] ? groupBy(d.rows, (cats[1] ?? cats[0])!, main, main ? "sum" : "count") : null;
  const line = dates[0] ? monthly(d.rows, dates[0], main) : null;
  const sc = useMemo(() => x && y ? d.rows.map((r) => ({ x: Number(r[x]), y: Number(r[y]) })).filter((p) => !isNaN(p.x) && !isNaN(p.y)) : [], [d, x, y]);
  const Sel = ({ v, set }: { v?: string; set: (s: string) => void }) => <select value={v} onChange={(e) => set(e.target.value)} className="rounded border bg-background px-2 py-1 text-xs">{nums.map((n) => <option key={n}>{n}</option>)}</select>;
  return (<div className="grid gap-4 md:grid-cols-2">
    {bar && <div className={card}><h3 className="mb-2 text-sm font-semibold">Bar: {main} by {cats[0]}</h3><MiniChart type="bar" data={bar} /></div>}
    {line && <div className={card}><h3 className="mb-2 text-sm font-semibold">Line: monthly {main ?? "count"}</h3><MiniChart type="line" data={line} /></div>}
    {pie && <div className={card}><h3 className="mb-2 text-sm font-semibold">Pie: share by {cats[1] ?? cats[0]}</h3><MiniChart type="pie" data={pie.slice(0, 8)} /></div>}
    {nums.length >= 1 && <div className={card}><h3 className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">Scatter: <Sel v={x} set={setX} /> vs <Sel v={y} set={setY} /> <span className="text-xs font-normal text-muted-foreground">r = {x && y ? corr(d.rows, x, y).toFixed(2) : "-"}</span></h3>
      <ResponsiveContainer width="100%" height={260}><ScatterChart><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="x" name={x} fontSize={11} /><YAxis dataKey="y" name={y} fontSize={11} /><Tooltip /><Scatter data={sc} fill="var(--chart-3)" /></ScatterChart></ResponsiveContainer></div>}
    {!bar && !line && !pie && !nums.length && <p className="text-sm text-muted-foreground">No chartable columns detected.</p>}
  </div>);
}

function Quality({ d }: { d: Dataset }) {
  const total = d.rows.length * d.cols.length, miss = d.cols.reduce((s, c) => s + c.missing, 0);
  const score = Math.max(0, 100 - (miss / (total || 1)) * 100 - (d.duplicates / d.rows.length) * 100);
  return (<div className="space-y-4">
    <div className="grid grid-cols-3 gap-3">{[["Quality score", score.toFixed(1) + "%"], ["Missing cells", miss], ["Duplicate rows", d.duplicates]].map(([k, v]) => <div key={k} className={card}><p className="text-xs text-muted-foreground">{k}</p><p className="text-2xl font-bold">{v}</p></div>)}</div>
    <div className={card}><h3 className="mb-2 font-semibold">Missing values per column</h3><MiniChart type="bar" data={d.cols.map((c) => ({ name: c.name, value: c.missing }))} /></div>
  </div>);
}

function Report({ d }: { d: Dataset }) {
  const text = [`DataSense AI Analyst — Report`, `Dataset: ${d.name} (${d.rows.length} rows, ${d.cols.length} columns)`, `Columns: ${d.cols.map((c) => `${c.name} [${c.type}]`).join(", ")}`,
    `Missing values: ${d.cols.reduce((s, c) => s + c.missing, 0)} · Duplicate rows: ${d.duplicates}`, ``, `Numeric summary:`,
    ...d.stats.map((s) => `- ${s.col}: count ${s.count}, sum ${fmt(s.sum)}, avg ${fmt(s.avg)}, min ${fmt(s.min)}, max ${fmt(s.max)}`), ``, `Insights:`, ...insights(d).map((i) => `- ${i}`)].join("\n");
  const download = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" })); a.download = "datasense-report.txt"; a.click(); };
  return (<div className="space-y-3"><div className="flex gap-2"><button className={btn} onClick={download}>Download report</button><button className={btn2} onClick={() => window.print()}>Print</button></div>
    <pre className={card + " whitespace-pre-wrap text-sm"}>{text}</pre></div>);
}
