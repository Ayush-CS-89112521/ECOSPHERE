"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import GlobeView from "./GlobeView";
import { transformApiResponse } from "../../lib/dashboard-data.js";

type StationStatus = "Severe" | "Very Poor" | "Poor" | "Moderate" | "Satisfactory" | "Good";

interface Station {
  id?: number | string;
  name: string;
  area?: string;
  pm25: number | null;
  pm10?: number | null;
  aqi: number | null;
  category?: string;
  status: StationStatus;
  dominantPollutant?: string;
}

interface DashboardData {
  city: string;
  grapStatus: string;
  grapStage: string;
  isLive: boolean;
  dataSource: string;
  lastUpdated: string;
  aqi: number | null;
  riskLevel: string;
  dominantPollutant: string;
  pm25: number | null;
  pm10: number | null;
  healthTip: string;
  outdoorNowText: string;
  safeToRunNow: boolean | null;
  restrictions: string[];
  safeWindow: {
    timeRange: string;
    description: string;
    startPercent: number;
    endPercent: number;
    estimatedAqi?: number;
  };
  stations: Station[];
}

const UNAVAILABLE_DATA: DashboardData = {
  city: "Delhi NCR", grapStatus: "GRAP unavailable", grapStage: "—",
  isLive: false, dataSource: "Unavailable", lastUpdated: "Unavailable",
  aqi: null, riskLevel: "Unknown", dominantPollutant: "—", pm25: null, pm10: null,
  healthTip: "Current air quality is unavailable.", outdoorNowText: "No current observations.",
  safeToRunNow: null, restrictions: [],
  safeWindow: { timeRange: "Unavailable", description: "No estimate available.", startPercent: 0, endPercent: 0 },
  stations: [],
};

function StatusBadge({ status }: { status: StationStatus }) {
  const styles: Record<StationStatus, string> = {
    Severe: "border-carmine/50 bg-carmine/10 text-carmine-light",
    "Very Poor": "border-terracotta/50 bg-terracotta/10 text-terracotta-light",
    Poor: "border-ochre/50 bg-ochre/10 text-ochre-light",
    Moderate: "border-stone-500/50 bg-stone-500/10 text-stone-300",
    Satisfactory: "border-sage/50 bg-sage/10 text-sage",
    Good: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] font-medium ${
        styles[status] || styles.Moderate
      }`}
    >
      {status}
    </span>
  );
}

export default function Dashboard({ recordAqiCheck }: { recordAqiCheck?: () => Promise<void> } = {}) {
  const [data, setData] = useState<DashboardData>(UNAVAILABLE_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [checkError, setCheckError] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (recordCheck: boolean) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const timer = setTimeout(() => controller.abort(new Error("Telemetry request timed out")), 12000);
      let res: Response;
      try {
        res = await fetch("/api/delhi/air-quality", { signal: controller.signal });
        if (!res.ok) throw new Error(`Telemetry HTTP ${res.status}`);
        const json = await res.json();
        if (abortControllerRef.current !== controller) return;
        const transformed = transformApiResponse(json) as DashboardData;
        setData(transformed);
        setIsLiveConnected(transformed.isLive);
        setFetchError(null);
        if (recordCheck && transformed.aqi !== null && recordAqiCheck) {
          recordAqiCheck().then(
            () => setCheckError(false),
            () => setCheckError(true),
          );
        }
      } finally {
        clearTimeout(timer);
      }
      if (controller.signal.aborted) return;

    } catch {
      if (abortControllerRef.current !== controller) return;
      setData(UNAVAILABLE_DATA);
      setIsLiveConnected(false);
      setFetchError("Telemetry unavailable. No current measurements are displayed.");
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [recordAqiCheck]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 60000);
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0e110f] text-[#f5f2ea] px-4 py-10 sm:px-6 lg:px-12 font-sans selection:bg-[#d49a50] selection:text-[#0e110f]">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* ================= EDITORIAL DISPATCH HEADER ================= */}
        <header className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-ochre mb-2">
              <span>[DISPATCH // 28.6139&deg; N, 77.2090&deg; E]</span>
              <span className="text-white/20">&middot;</span>
              <span>INDICATIVE PM INDEX</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-parchment tracking-tight">
              Delhi NCR Atmospheric Ledger
            </h1>
            <p className="text-xs sm:text-sm text-parchment-muted font-sans font-light mt-1">
              Continuous field observations, statutory alerts, and diurnal particulate tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {/* GRAP Tag */}
            <div className="px-3.5 py-1.5 rounded-full border border-terracotta/40 bg-terracotta/10 text-terracotta-light text-[11px] uppercase tracking-wider">
              {data.grapStatus}
            </div>

            {/* Connection Tag */}
            <div
              className={`px-3.5 py-1.5 rounded-full border text-[11px] uppercase tracking-wider flex items-center gap-2 ${
                isLiveConnected
                  ? "border-sage/40 bg-sage/10 text-sage"
                  : "border-stone-500/40 bg-stone-500/10 text-stone-300"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLiveConnected ? "bg-sage animate-pulse" : "bg-stone-400"
                }`}
              />
              <span>{isLiveConnected ? "Ground Node Live" : data.dataSource}</span>
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              title="Refresh telemetry"
              className="px-3 py-1.5 rounded-full border border-white/20 hover:border-parchment text-parchment text-[11px] uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {loading ? "Sampling..." : "Refresh"}
            </button>
          </div>
        </header>

        {/* Source and Time Stamp Line */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-parchment-muted -mt-6">
          <span>Observation Timestamp: <strong className="text-parchment">{data.lastUpdated}</strong></span>
          <span>Sensor Network: <strong className="text-parchment">{data.dataSource}</strong></span>
        </div>

        {fetchError && (
          <div className="text-xs font-mono text-ochre border border-ochre/30 bg-ochre/10 px-4 py-2.5 rounded-xl flex items-center justify-between">
            <span>&Delta; {fetchError}</span>
            <button
              onClick={() => setFetchError(null)}
              className="text-parchment-muted hover:text-parchment ml-4 uppercase text-[10px]"
            >
              Dismiss
            </button>
          </div>
        )}
        {checkError && (
          <p role="status" className="text-xs text-ochre">
            Could not save your AQI check for Baseline Observer. Use Refresh to retry.
          </p>
        )}

        {/* ================= PRIMARY HERO OBSERVATION ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Reading Box (7 Cols) */}
          <div className="lg:col-span-7 bg-[#141815] border border-white/[0.08] p-8 rounded-2xl flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-ochre">
                    Capital Composite Index
                  </p>
                  <p className="text-xs text-parchment-muted mt-0.5">PM sub-index of mean station concentrations (indicative)</p>
                </div>
                <StatusBadge status={data.riskLevel as StationStatus} />
              </div>

              {/* Large Figure */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-7xl sm:text-8xl font-serif text-parchment font-normal tracking-tight">
                      {data.aqi ?? "—"}
                    </span>
                    <span className="text-sm font-mono text-parchment-muted">/ 500 (indicative)</span>
                  </div>
                  <p className="mt-2 text-xs font-mono text-terracotta-light">
                    &bull; {data.outdoorNowText}
                  </p>
                </div>

                {/* Sub-parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#191e1a] border border-white/[0.06] p-4 rounded-xl">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-parchment-muted">Dominant</p>
                    <p className="mt-1 text-lg font-serif font-medium text-parchment">{data.dominantPollutant}</p>
                  </div>
                  <div className="bg-[#191e1a] border border-white/[0.06] p-4 rounded-xl">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-parchment-muted">PM2.5 Conc.</p>
                    <p className="mt-1 text-lg font-serif font-medium text-ochre">
                      {data.pm25 ?? "—"} <span className="text-xs font-mono text-parchment-muted">&micro;g/m&sup3;</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Muted Severity Band */}
            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-mono text-parchment-muted mb-2">
                <span>CPCB Concentration Spectrum</span>
                <span className="text-parchment font-medium">{data.riskLevel} Classification</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.06]">
                <div className="w-[10%] bg-emerald-600/80" title="Good (0-50)" />
                <div className="w-[10%] bg-sage" title="Satisfactory (51-100)" />
                <div className="w-[20%] bg-ochre" title="Moderate (101-200)" />
                <div className="w-[20%] bg-terracotta" title="Poor (201-300)" />
                <div className="w-[20%] bg-carmine" title="Very Poor (301-400)" />
                <div className="w-[20%] bg-purple-900/80" title="Severe (401-500)" />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-mono text-stone-500">
                <span>0 Good</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
                <span>400</span>
                <span>500 Severe</span>
              </div>
            </div>
          </div>

          {/* 3D Earth Focus (5 Cols) */}
          <div className="lg:col-span-5 bg-[#141815] border border-white/[0.08] p-3 rounded-2xl flex flex-col justify-between shadow-lg overflow-hidden">
            <GlobeView className="h-full min-h-[360px] w-full" autoFocusDelayMs={1800} />
          </div>
        </section>

        {/* ================= DIURNAL SAFE WINDOW SECTION ================= */}
        <section className="bg-[#141815] border border-white/[0.08] p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.06] gap-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-ochre">
                Atmospheric Physics &middot; Boundary Layer Mixing
              </p>
              <h2 className="text-2xl font-serif text-parchment mt-0.5">
                The Diurnal Dispersion Window
              </h2>
            </div>
            <span className="text-xs font-mono text-sage px-3 py-1 rounded-full border border-sage/30 bg-sage/5">
              Heuristic Estimate
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-parchment-muted">
                Lowest Exposure Window
              </p>
              <p className="text-3xl font-serif text-ochre mt-1">
                {data.safeWindow.timeRange}
              </p>
              <p className="text-xs text-parchment-muted font-sans font-light mt-3 leading-editorial">
                {data.safeWindow.description}
              </p>
            </div>

            <div className="md:col-span-7">
              {/* Timeline Slider */}
              <div className="relative pt-6 pb-2">
                <div className="h-2 rounded-full bg-white/[0.06] relative">
                  <div
                    className="absolute top-0 h-2 rounded-full bg-ochre"
                    style={{
                      left: `${data.safeWindow.startPercent}%`,
                      width: `${Math.max(8, data.safeWindow.endPercent - data.safeWindow.startPercent)}%`,
                    }}
                  />
                </div>
                {/* Pins */}
                <div
                  className="absolute top-2 h-4 w-0.5 bg-ochre"
                  style={{ left: `${data.safeWindow.startPercent}%` }}
                />
                <div
                  className="absolute top-2 h-4 w-0.5 bg-ochre"
                  style={{ left: `${data.safeWindow.endPercent}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[11px] font-mono text-stone-500">
                <span>06:00 AM</span>
                <span>09:00 AM</span>
                <span>12:00 PM</span>
                <span>03:00 PM</span>
                <span>06:00 PM</span>
                <span>09:00 PM</span>
              </div>

              <div className="mt-4 flex items-center gap-6 text-[11px] font-mono text-parchment-muted">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/20" /> Heavy Morning Inversion (Avoid Exertion)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ochre" /> Peak Vertical Dispersion Window
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MONITORING STATIONS GRID ================= */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/[0.06] pb-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-ochre">
                Local Observations
              </p>
              <h2 className="text-2xl font-serif text-parchment">
                Ground Monitoring Stations
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-500">
              {data.stations.length} Stations in Snapshot
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.stations.map((st, idx) => (
              <div
                key={st.id || st.name}
                className="editorial-card p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                        Station // 0{idx + 1}
                      </span>
                      <h3 className="text-lg font-serif font-medium text-parchment mt-0.5 group-hover:text-ochre-light transition-colors">
                        {st.name}
                      </h3>
                      <p className="text-xs text-parchment-muted font-sans font-light">
                        {st.area || "Delhi NCR"}
                      </p>
                    </div>
                    <StatusBadge status={st.status} />
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-parchment-muted">
                        PM2.5 Conc.
                      </p>
                      <p className="text-2xl font-serif text-parchment mt-0.5">
                        {st.pm25 != null ? st.pm25 : "—"}
                        <span className="text-xs font-mono text-stone-500 ml-1">&micro;g/m&sup3;</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-parchment-muted">
                        Station AQI
                      </p>
                      <p className="text-2xl font-serif text-ochre mt-0.5">
                        {st.aqi != null ? st.aqi : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meter Line */}
                <div className="mt-5 pt-4 border-t border-white/[0.06]">
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        st.status === "Severe"
                          ? "bg-carmine"
                          : st.status === "Very Poor"
                          ? "bg-terracotta"
                          : st.status === "Poor"
                          ? "bg-ochre"
                          : "bg-sage"
                      }`}
                      style={{
                        width: `${Math.min(((st.pm25 || 100) / 300) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= STATUTORY ORDERS & CITIZEN ADVISORY ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Statutory Enforcement */}
          <div className="bg-[#141815] border border-white/[0.08] p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-terracotta mb-2">
              <span>Indicative Guidance</span>
              <span className="text-white/20">&middot;</span>
              <span>{data.grapStatus}</span>
            </div>
            <h3 className="text-xl font-serif text-parchment mb-5">
              Indicative GRAP Measures
            </h3>

            <ul className="space-y-4">
              {data.restrictions.map((r, i) => (
                <li key={i} className="flex items-start gap-3.5 text-xs text-parchment-muted font-sans font-light leading-editorial">
                  <span className="mt-0.5 w-5 h-5 rounded-full border border-terracotta/40 text-terracotta text-center font-mono text-[10px] leading-5 shrink-0">
                    {i + 1}
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Citizen Health Survival Guide */}
          <div className="bg-[#141815] border border-white/[0.08] p-8 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-sage mb-2">
                <span>Public Health Protocol</span>
                <span className="text-white/20">&middot;</span>
                <span>Medical Heuristic</span>
              </div>
              <h3 className="text-xl font-serif text-parchment mb-3">
                Citizen Exposure Mitigation
              </h3>

              <p className="text-xs sm:text-sm text-parchment-muted font-sans font-light leading-editorial mb-6">
                {data.healthTip}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#191e1a] border border-white/[0.06] p-4 rounded-xl">
                  <p className="text-xs font-serif font-medium text-parchment">Respiratory Defense</p>
                  <p className="text-[11px] text-parchment-muted font-sans font-light mt-1">
                    N95 / FFP2 respirators with airtight seal required during street transits.
                  </p>
                </div>
                <div className="bg-[#191e1a] border border-white/[0.06] p-4 rounded-xl">
                  <p className="text-xs font-serif font-medium text-parchment">Transit Advisory</p>
                  <p className="text-[11px] text-parchment-muted font-sans font-light mt-1">
                    Prioritize air-filtered subterranean Delhi Metro routes over open ring roads.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-stone-500">
              Indicative PM index and exposure estimates; consult current official CPCB and CAQM notices.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
