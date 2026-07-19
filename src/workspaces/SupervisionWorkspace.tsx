import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lang, t } from '../i18n/translations';
import { generateTrendData } from '../data';

function scaledFontSize(baseSize: number, lang: string): number {
  return lang === 'kn' ? baseSize + 3 : baseSize;
}

interface MapAction { lat: number; lng: number; zoom: number; label?: string; }

interface SupervisionWorkspaceProps {
  lang: Lang;
  mapAction?: MapAction | null;
}

const HOTSPOTS = [
  { name: 'Whitefield', lat: 12.9698, lng: 77.7499, radius: 1800, risk: 'high' as const, incidents: 47, trend: '+34%' },
  { name: 'Shivajinagar', lat: 12.9847, lng: 77.6012, radius: 1400, risk: 'high' as const, incidents: 31, trend: '+18%' },
  { name: 'Electronic City', lat: 12.8458, lng: 77.6603, radius: 1600, risk: 'high' as const, incidents: 28, trend: '+11%' },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408, radius: 1200, risk: 'medium' as const, incidents: 19, trend: '+7%' },
  { name: 'Yeshwanthpur', lat: 13.0234, lng: 77.5508, radius: 1100, risk: 'medium' as const, incidents: 15, trend: '+4%' },
];

const SUSPECT_PINS = [
  { name: 'R. Mehta', lat: 12.9698, lng: 77.7499, status: 'AT LARGE', risk: 'high' as const },
  { name: 'P. Reddy', lat: 12.9784, lng: 77.6408, status: 'AT LARGE', risk: 'medium' as const },
];

interface LeafletMapProps {
  mapAction?: MapAction | null;
  mapStyle: 'street' | 'satellite';
}

function LeafletMap({ mapAction, mapStyle }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;
      leafletRef.current = L.default;

      const map = L.default.map(mapRef.current, {
        center: [12.9716, 77.5946],
        zoom: 11,
        zoomControl: false,
      });
      mapInstanceRef.current = map;

      const streetTile = L.default.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20 }
      );
      streetTile.addTo(map);
      tileLayerRef.current = streetTile;

      L.default.control.zoom({ position: 'topright' }).addTo(map);

      HOTSPOTS.forEach((h) => {
        const color = h.risk === 'high' ? '#F04E4E' : '#F5A623';
        const circle = L.default.circle([h.lat, h.lng], {
          color, fillColor: color,
          fillOpacity: h.risk === 'high' ? 0.18 : 0.12,
          weight: h.risk === 'high' ? 2 : 1.5,
          opacity: 0.7, radius: h.radius,
        }).addTo(map);
        circle.bindPopup(`
          <div style="font-family:monospace;min-width:150px;background:#131920;color:#E8EDF2;">
            <div style="font-size:13px;font-weight:700;color:${h.risk === 'high' ? '#FCA5A5' : '#FCD34D'};margin-bottom:6px;">${h.name}</div>
            <div style="font-size:12px;color:#94A3B8;margin-bottom:2px;">Incidents: <strong style="color:#E8EDF2;">${h.incidents}</strong></div>
            <div style="font-size:12px;color:#94A3B8;margin-bottom:6px;">Trend: <strong style="color:${h.risk === 'high' ? '#FCA5A5' : '#FCD34D'};">${h.trend}</strong></div>
            <span style="background:${h.risk === 'high' ? 'rgba(240,78,78,0.2)' : 'rgba(245,166,35,0.2)'};border-radius:3px;padding:2px 6px;font-size:10px;font-weight:700;color:${h.risk === 'high' ? '#FCA5A5' : '#FCD34D'};">${h.risk.toUpperCase()} RISK</span>
          </div>
        `, { className: 'kira-popup' });
      });

      SUSPECT_PINS.forEach((p) => {
        const color = p.risk === 'high' ? '#F04E4E' : '#F5A623';
        const icon = L.default.divIcon({
          className: '',
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 10px ${color},0 0 20px ${color}44;"></div>`,
          iconSize: [12, 12], iconAnchor: [6, 6],
        });
        const marker = L.default.marker([p.lat, p.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:monospace;background:#131920;color:#E8EDF2;">
            <div style="font-size:12px;font-weight:700;color:#FCA5A5;">${p.name}</div>
            <div style="font-size:11px;color:#94A3B8;">${p.status}</div>
          </div>
        `, { className: 'kira-popup' });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        leafletRef.current = null;
      }
    };
  }, []);

  // Fly to location + pulse circle when map_action fires
  useEffect(() => {
    if (!mapAction || !mapInstanceRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    map.flyTo([mapAction.lat, mapAction.lng], mapAction.zoom, { duration: 1.5 });

    const pulse = L.circle([mapAction.lat, mapAction.lng], {
      color: '#4D9EF5', fillColor: '#4D9EF5',
      fillOpacity: 0.25, weight: 2, opacity: 0.85, radius: 400,
    }).addTo(map);

    let label: any = null;
    if (mapAction.label) {
      label = L.marker([mapAction.lat, mapAction.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:rgba(16,26,44,0.92);color:#4D9EF5;font-family:monospace;font-size:11px;font-weight:700;padding:3px 8px;border-radius:3px;border:1px solid #4D9EF5;white-space:nowrap;pointer-events:none;">${mapAction.label}</div>`,
          iconAnchor: [0, 28],
        }),
      }).addTo(map);
    }

    const tid = setTimeout(() => {
      try { map.removeLayer(pulse); } catch {}
      if (label) try { map.removeLayer(label); } catch {}
    }, 3000);

    return () => {
      clearTimeout(tid);
      try { map.removeLayer(pulse); } catch {}
      if (label) try { map.removeLayer(label); } catch {}
    };
  }, [mapAction]);

  // Swap tile layer when mapStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    map.removeLayer(tileLayerRef.current);

    const isSat = mapStyle === 'satellite';
    const url = isSat
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const opts = isSat
      ? { attribution: '&copy; Esri', maxZoom: 18 }
      : { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20 };

    const newTile = L.tileLayer(url, opts);
    newTile.addTo(map);
    tileLayerRef.current = newTile;
  }, [mapStyle]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#080C14' }} />
  );
}

interface LiveAlert {
  severity: string;
  border: string;
  title: string;
  body: string;
  time: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://kiraconsole.development.catalystappsail.in';

export function SupervisionWorkspace({ lang, mapAction }: SupervisionWorkspaceProps) {
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const trendData = useMemo(() => generateTrendData(), []);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);

  const fetchAlerts = useCallback(() => {
    fetch(`${API_BASE}/api/alerts`)
      .then(r => r.json())
      .then(data => { if (data.alerts) setLiveAlerts(data.alerts); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const toggleSeries = (key: string) =>
    setHiddenSeries(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const kpis = [
    { value: '2,847', label: t('totalCases', lang), sub: t('thisWeek', lang), valueColor: '#E8EDF2', subColor: '#2ECC71' },
    { value: '341', label: t('activeInvestigations', lang), sub: t('escalatedToday', lang), valueColor: '#F04E4E', subColor: '#F5A623' },
    { value: '89', label: t('highRiskSuspects', lang), sub: t('atLargeCount', lang), valueColor: '#F5A623', subColor: '#F04E4E' },
    { value: '156', label: t('repeatOffenders', lang), sub: t('releasedMonth', lang), valueColor: '#8B6FD4', subColor: '#64748B' },
  ];

  const alerts = liveAlerts.length > 0
    ? liveAlerts.map(a => ({ border: a.border, text: `${a.title} — ${a.body}`, time: a.time }))
    : [
      { border: '#F04E4E', text: t('alert1Title', lang), time: '10:42 AM' },
      { border: '#F5A623', text: t('alert2Title', lang), time: '09:17 AM' },
      { border: '#4D9EF5', text: t('alert3Title', lang), time: '07:55 AM' },
    ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      padding: '8px 12px',
      gap: 8,
      background: '#080C14',
    }}>
      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{
            flex: 1,
            background: '#131920',
            border: '1px solid #1E2D3D',
            borderRadius: 8,
            padding: '16px 18px',
            minWidth: 0,
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 34, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: kpi.valueColor, lineHeight: 1.1 }}>
              {kpi.value}
            </div>
            <div style={{
              fontSize: scaledFontSize(11, lang), color: '#94A3B8',
              letterSpacing: lang === 'kn' ? '0' : '0.12em', marginTop: 4,
              fontFamily: lang === 'kn' ? "'Noto Sans Kannada', 'Inter', sans-serif" : undefined,
              lineHeight: lang === 'kn' ? 1.6 : 1.4,
            }}>
              {kpi.label}
            </div>
            <div style={{
              fontSize: scaledFontSize(12, lang), color: kpi.subColor, marginTop: 3,
              fontFamily: lang === 'kn' ? "'Noto Sans Kannada', 'Inter', sans-serif" : undefined,
            }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Crime Heatmap — Leaflet */}
      <div style={{
        flex: 1,
        minHeight: 240,
        background: '#131920',
        border: '1px solid #1E2D3D',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header bar */}
        <div style={{
          padding: '7px 12px',
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#94A3B8',
          letterSpacing: '0.06em',
          borderBottom: '1px solid #1E2D3D',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(19,25,32,0.98)',
          zIndex: 1001,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#F04E4E', display: 'inline-block' }} />
            <span>{t('crimeHotspotsTitle', lang)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {[
              { color: '#F04E4E', label: 'HIGH' },
              { color: '#F5A623', label: 'MEDIUM' },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}88` }} />
                <span style={{ fontSize: 10, color: '#64748B' }}>{label}</span>
              </span>
            ))}
            <button
              onClick={() => setMapStyle(s => s === 'street' ? 'satellite' : 'street')}
              style={{
                background: mapStyle === 'satellite' ? 'rgba(77,158,245,0.15)' : 'transparent',
                border: `1px solid ${mapStyle === 'satellite' ? '#4D9EF5' : '#243447'}`,
                borderRadius: 3, padding: '2px 7px', cursor: 'pointer',
                color: mapStyle === 'satellite' ? '#4D9EF5' : '#64748B',
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.08em', fontWeight: 600,
              }}
            >
              {mapStyle === 'satellite' ? 'SATELLITE' : 'STREET'}
            </button>
          </div>
        </div>

        {/* Map fills remaining space */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <LeafletMap mapAction={mapAction} mapStyle={mapStyle} />
        </div>
      </div>

      {/* Bottom row: Trends + Alerts */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, height: 200 }}>
        {/* Crime Trends */}
        <div style={{
          flex: 6,
          background: '#131920',
          border: '1px solid #1E2D3D',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#94A3B8',
            letterSpacing: '0.06em',
            borderBottom: '1px solid #1E2D3D',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>{t('crimeTrendsTitle', lang)}</span>
            <span style={{ fontSize: 9, color: '#4A5C70' }}>Click legend to toggle</span>
          </div>
          <div style={{ flex: 1, padding: '4px 4px 4px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D3D" vertical={false} />
                <XAxis dataKey="day" stroke="#8B9EB5" fontSize={10} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis stroke="#8B9EB5" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ background: '#131920', border: '1px solid #243447', borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Legend
                  onClick={(e: unknown) => toggleSeries((e as { dataKey: string }).dataKey)}
                  wrapperStyle={{ fontSize: 12, cursor: 'pointer' }}
                  formatter={(value: string) => {
                    const labels: Record<string, string> = {
                      cybercrime: t('cybercrime', lang),
                      financialFraud: t('financialFraud', lang),
                      drugTrafficking: t('drugTrafficking', lang),
                      robbery: t('robbery', lang),
                    };
                    return <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>{labels[value] ?? value}</span>;
                  }}
                />
                <Line type="monotone" dataKey="cybercrime" stroke="#F04E4E" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('cybercrime')} />
                <Line type="monotone" dataKey="financialFraud" stroke="#F5A623" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('financialFraud')} />
                <Line type="monotone" dataKey="drugTrafficking" stroke="#4D9EF5" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('drugTrafficking')} />
                <Line type="monotone" dataKey="robbery" stroke="#2ECC71" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('robbery')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Proactive Alerts */}
        <div style={{
          flex: 4,
          background: '#131920',
          border: '1px solid rgba(240,78,78,0.2)',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid rgba(240,78,78,0.15)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#F04E4E', display: 'inline-block' }} />
            <span style={{
              fontSize: scaledFontSize(11, lang),
              fontFamily: lang === 'kn' ? "'Noto Sans Kannada', 'Inter', sans-serif" : "'JetBrains Mono', monospace",
              color: '#F04E4E', fontWeight: 600,
              letterSpacing: lang === 'kn' ? '0' : '0.06em',
            }}>
              {t('proactiveAlerts', lang)}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }} className="left-panel-scroll">
            {alerts.map((a, i) => (
              <div key={i} style={{
                borderLeft: `3px solid ${a.border}`,
                marginLeft: 8, marginRight: 8,
                marginBottom: i < alerts.length - 1 ? 20 : 0,
                paddingLeft: 8, paddingRight: 6,
                paddingTop: 4, paddingBottom: 4,
              }}>
                <div style={{
                  fontSize: scaledFontSize(13, lang), fontWeight: 700, color: '#94A3B8',
                  lineHeight: lang === 'kn' ? 1.8 : 1.4,
                  fontFamily: lang === 'kn' ? "'Noto Sans Kannada', 'Inter', sans-serif" : undefined,
                }}>{a.text}</div>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', marginTop: 3 }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
