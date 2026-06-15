import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Lang } from '../i18n/translations';
import { generateTrendData } from '../data';

interface TrendWorkspaceProps {
  lang: Lang;
}

export function TrendWorkspace({ lang }: TrendWorkspaceProps) {
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const trendData = useMemo(() => generateTrendData(), []);
  const toggleSeries = (key: string) =>
    setHiddenSeries(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const forecasts = [
    { label: 'Cybercrime (next 30d)', trend: 'up', value: '+22%', color: '#EF4444' },
    { label: 'Financial Fraud (next 30d)', trend: 'up', value: '+17%', color: '#F59E0B' },
    { label: 'Robbery (next 30d)', trend: 'down', value: '-8%', color: '#22C55E' },
  ];

  const recommendations = [
    'Increase cybercrime cell capacity by 40% — current trend unsustainable without additional personnel',
    'Deploy financial fraud task force to Whitefield and Koramangala clusters based on pattern analysis',
    'Reallocate patrol resources from robbery-declining zones to emerging cyber/financial fraud hotspots',
  ];

  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: '#060A12', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em' }}>
        TREND WORKSPACE · Cybercrime · Forecast Analysis
      </div>

      {/* Main chart */}
      <div style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '10px', height: 220 }}>
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
              wrapperStyle={{ fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
            />
            <Line type="monotone" dataKey="cybercrime" name="Cybercrime" stroke="#EF4444" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('cybercrime')} />
            <Line type="monotone" dataKey="financialFraud" name="Financial Fraud" stroke="#F59E0B" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('financialFraud')} />
            <Line type="monotone" dataKey="drugTrafficking" name="Drug Trafficking" stroke="#60A5FA" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('drugTrafficking')} />
            <Line type="monotone" dataKey="robbery" name="Robbery" stroke="#22C55E" strokeWidth={3.5} dot={false} hide={hiddenSeries.includes('robbery')} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast cards */}
      <div style={{ display: 'flex', gap: 8 }}>
        {forecasts.map((f, i) => (
          <div key={i} style={{ flex: 1, background: '#0D1828', border: '1px solid #162035', borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 4 }}>NEXT 30 DAYS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              {f.trend === 'up' ? <TrendingUp size={14} color={f.color} /> : <TrendingDown size={14} color={f.color} />}
              <span style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: f.color }}>{f.value}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{f.label}</div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <AlertTriangle size={13} color="#F59E0B" />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em' }}>RECOMMENDATIONS</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recommendations.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'monospace', color: '#60A5FA', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
