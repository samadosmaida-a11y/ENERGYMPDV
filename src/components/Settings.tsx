import { useState, useRef } from 'react';
import { useStore } from '../store';
import { Button, Input, Select } from './ui';
import { Save, Download, Upload, Trash2, CheckCircle, Globe, Palette } from 'lucide-react';
import type { Settings as SettingsType, Theme } from '../types';

const themes: { key: Theme; gradient: string }[] = [
  { key: 'emerald', gradient: 'linear-gradient(135deg, #4ade80, #16a34a)' },
  { key: 'blue', gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)' },
  { key: 'orange', gradient: 'linear-gradient(135deg, #fb923c, #ea580c)' },
  { key: 'rose', gradient: 'linear-gradient(135deg, #fb7185, #e11d48)' },
  { key: 'dark', gradient: 'linear-gradient(135deg, #334155, #0f172a)' },
];

export function Settings() {
  const { settings, saveSettings, exportData, importData, resetAllData, t } = useStore();
  const [form, setForm] = useState<SettingsType>({ ...settings });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    await saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.products && data.sales && data.clients && data.settings) {
          await importData(data);
          setForm(data.settings);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        } else {
          alert(t.common.error);
        }
      } catch {
        alert(t.common.error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = async () => {
    if (confirm(t.settings.confirmReset)) {
      await resetAllData();
    }
  };

  const themeLabels: Record<Theme, string> = {
    emerald: t.settings.themeEmerald,
    blue: t.settings.themeBlue,
    orange: t.settings.themeOrange,
    rose: t.settings.themeRose,
    dark: t.settings.themeDark,
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.settings.title}</h1>

      {/* General */}
      <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{t.settings.general}</h2>
        <Input label={t.settings.shopName} value={form.shop_name} onChange={(v) => setForm({ ...form, shop_name: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label={t.settings.currency} value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} />
          <Input label={t.settings.taxRate} value={String(form.tax_rate)} onChange={(v) => setForm({ ...form, tax_rate: parseFloat(v) || 0 })} type="number" />
        </div>
        <Select
          label={t.settings.language}
          value={form.language}
          onChange={(v) => setForm({ ...form, language: v as 'fr' | 'en' | 'ar' })}
          options={[
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'English' },
            { value: 'ar', label: 'العربية' },
          ]}
        />
        <Input label={t.settings.lowStockThreshold} value={String(form.low_stock_threshold)} onChange={(v) => setForm({ ...form, low_stock_threshold: parseInt(v, 10) || 5 })} type="number" />
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave}>
            <span className="flex items-center gap-2"><Save className="w-4 h-4" /> {t.settings.save}</span>
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm animate-fade-in" style={{ color: 'var(--c-600)' }}>
              <CheckCircle className="w-4 h-4" /> {t.settings.saved}
            </span>
          )}
        </div>
      </div>

      {/* Appearance / Theme */}
      <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Palette className="w-5 h-5" style={{ color: 'var(--c-600)' }} />
          {t.settings.appearance}
        </h2>
        <div>
          <label className="block text-sm font-medium mb-2.5" style={{ color: 'var(--text-secondary)' }}>{t.settings.theme}</label>
          <div className="grid grid-cols-5 gap-3">
            {themes.map(({ key, gradient }) => (
              <button
                key={key}
                onClick={() => setForm({ ...form, theme: key })}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-full aspect-square rounded-xl transition-all ${form.theme === key ? 'ring-2 ring-offset-2 scale-105' : 'hover:scale-105'}`}
                  style={{
                    background: gradient,
                    ...(form.theme === key ? { '--tw-ring-color': 'var(--c-500)', 'ringOffsetColor': 'var(--bg-card)' } as React.CSSProperties : {}),
                  }}
                />
                <span
                  className="text-xs font-medium transition-colors"
                  style={{ color: form.theme === key ? 'var(--c-600)' : 'var(--text-muted)' }}
                >
                  {themeLabels[key]}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave}>
            <span className="flex items-center gap-2"><Save className="w-4 h-4" /> {t.settings.save}</span>
          </Button>
        </div>
      </div>

      {/* Data */}
      <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{t.settings.data}</h2>

        <div className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Download className="w-4 h-4" style={{ color: 'var(--c-600)' }} /> {t.settings.exportData}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t.settings.exportDesc}</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportData}>{t.settings.exportData}</Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Upload className="w-4 h-4 text-blue-500" /> {t.settings.importData}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t.settings.importDesc}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>{t.settings.importData}</Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50/50">
          <div>
            <p className="text-sm font-medium text-red-700 flex items-center gap-2"><Trash2 className="w-4 h-4" /> {t.settings.resetData}</p>
            <p className="text-xs text-red-400 mt-1">{t.settings.resetDesc}</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleReset}>{t.settings.resetData}</Button>
        </div>
      </div>

      {/* Language indicator */}
      <div className="rounded-2xl border p-4 flex items-center gap-3 text-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <Globe className="w-4 h-4" />
        {form.language === 'fr' ? 'Application en français' : form.language === 'en' ? 'Application in English' : 'التطبيق باللغة العربية'}
      </div>
    </div>
  );
}
