import { useState, useMemo, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lang, t } from '../i18n/translations';
import { generateTrendData } from '../data';

interface SupervisionWorkspaceProps {
  lang: Lang;
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

function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.default.map(mapRef.current, {
        center: [12.9716, 77.5946],
        zoom: 11,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // CartoDB Dark Matter tiles
      L.default.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }
      ).addTo(map);

      // Zoom control (top-right)
      L.default.control.zoom({ position: 'topright' }).addTo(map);

      // Hotspot circles
      HOTSPOTS.forEach((h) => {
        const color = h.risk === 'high' ? '#EF4444' : '#F59E0B';
        const circle = L.default.circle([h.lat, h.lng], {
          color,
          fillColor: color,
          fillOpacity: h.risk === 'high' ? 0.18 : 0.12,
          weight: h.risk === 'high' ? 2 : 1.5,
          opacity: 0.7,
          radius: h.radius,
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family:monospace;min-width:150px;background:#0D1828;color:#E2E8F0;">
            <div style="font-size:13px;font-weight:700;color:${h.risk === 'high' ? '#FCA5A5' : '#FCD34D'};margin-bottom:6px;">${h.name}</div>
            <div style="font-size:12px;color:#94A3B8;margin-bottom:2px;">Incidents: <strong style="color:#E2E8F0;">${h.incidents}</strong></div>
            <div style="font-size:12px;color:#94A3B8;margin-bottom:6px;">Trend: <strong style="color:${h.risk === 'high' ? '#FCA5A5' : '#FCD34D'};">${h.trend}</strong></div>
            <span style="background:${h.risk === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'};border-radius:3px;padding:2px 6px;font-size:10px;font-weight:700;color:${h.risk === 'high' ? '#FCA5A5' : '#FCD34D'};">${h.risk.toUpperCase()} RISK</span>
          </div>
        `, {
          className: 'kira-popup',
        });
      });

      // Suspect pins
      SUSPECT_PINS.forEach((p) => {
        const color = p.risk === 'high' ? '#EF4444' : '#F59E0B';
        const icon = L.default.divIcon({
          className: '',
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 10px ${color},0 0 20px ${color}44;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.default.marker([p.lat, p.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:monospace;background:#0D1828;color:#E2E8F0;">
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
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', background: '#060A12' }}
    />
  );
}

export function SupervisionWorkspace({ lang }: SupervisionWorkspaceProps) {
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const trendData = useMemo(() => generateTrendData(), []);

  const toggleSeries = (key: string) =>
    setHiddenSeries(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const kpis = [
    { value: '2,847', label: t('totalCases', lang), sub: t('thisWeek', lang), valueColor: '#E2E8F0', subColor: '#22C55E' },
    { value: '341', label: t('activeInvestigations', lang), sub: t('escalatedToday', lang), valueColor: '#EF4444', subColor: '#F59E0B' },
    { value: '89', label: t('highRiskSuspects', lang), sub: t('atLargeCount', lang), valueColor: '#F59E0B', subColor: '#EF4444' },
    { value: '156', label: t('repeatOffenders', lang), sub: t('releasedMonth', lang), valueColor: '#8B5CF6', subColor: '#64748B' },
  ];

  const alerts = [
    { border: '#EF4444', text: t('alert1Title', lang), time: '10:42 AM' },
    { border: '#F59E0B', text: t('alert2Title', lang), time: '09:17 AM' },
    { border: '#60A5FA', text: t('alert3Title', lang), time: '07:55 AM' },
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      padding: '8px 12px',
      gap: 8,
      background: '#060A12',
    }}>
      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{
            flex: 1,
            background: '#0D1828',
            border: '1px solid #162035',
            borderRadius: 8,
            padding: '16px 18px',
            minWidth: 0,
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 34, fontWeight: 700, color: kpi.valueColor, lineHeight: 1.1 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '0.1em', marginTop: 4 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 12, color: kpi.subColor, marginTop: 3 }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Crime Heatmap — Leaflet */}
      <div style={{
        flex: 1,
        minHeight: 240,
        background: '#0D1828',
        border: '1px solid #162035',
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
          fontFamily: 'monospace',
          color: '#94A3B8',
          letterSpacing: '0.06em',
          borderBottom: '1px solid #162035',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(13,24,40,0.98)',
          zIndex: 1001,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span>{t('crimeHotspotsTitle', lang)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {[
              { color: '#EF4444', label: 'HIGH' },
              { color: '#F59E0B', label: 'MEDIUM' },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}88` }} />
                <span style={{ fontSize: 10, color: '#64748B' }}>{label}</span>
              </span>
            ))}
            <span style={{ fontSize: 10, color: '#1E2D45' }}>OpenStreetMap · CARTO</span>
          </div>
        </div>

        {/* Map fills remaining space */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <LeafletMap />
        </div>
      </div>

      {/* Bottom row: Trends + Alerts */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, height: 200 }}>
        {/* Crime Trends */}
        <div style={{
          flex: 6,
          background: '#0D1828',
          border: '1px solid #162035',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: 11,
            fontFamily: 'monospace',
            color: '#94A3B8',
            letterSpacing: '0.06em',
            borderBottom: '1px solid #162035',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>{t('crimeTrendsTitle', lang)}</span>
            <span style={{ fontSize: 9, color: '#334155' }}>Click legend to toggle</span>
          </div>
          <div style={{ flex: 1, padding: '4px 4px 4px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162035" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ background: '#0D1828', border: '1px solid #1E2D45', borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Legend
                  onClick={(e: { dataKey: string }) => toggleSeries(e.dataKey)}
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
                <Line type="monotone" dataKey="cybercrime" stroke="#EF4444" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('cybercrime')} />
                <Line type="monotone" dataKey="financialFraud" stroke="#F59E0B" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('financialFraud')} />
                <Line type="monotone" dataKey="drugTrafficking" stroke="#60A5FA" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('drugTrafficking')} />
                <Line type="monotone" dataKey="robbery" stroke="#22C55E" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('robbery')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Proactive Alerts */}
        <div style={{
          flex: 4,
          background: '#0D1828',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid rgba(239,68,68,0.15)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#EF4444', letterSpacing: '0.06em' }}>
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
                <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', lineHeight: 1.4 }}>{a.text}</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B', marginTop: 3 }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
