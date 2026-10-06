import { useState, useRef } from 'react';
import { useStore } from '../store';
import { Button, Input, Select } from './ui';
import { Save, Download, Upload, Trash2, CheckCircle, Globe } from 'lucide-react';
import type { Settings as SettingsType } from '../types';

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

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">{t.settings.title}</h1>

      {/* General */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-800">{t.settings.general}</h2>
        <Input label={t.settings.shopName} value={form.shop_name} onChange={(v) => setForm({ ...form, shop_name: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label={t.settings.currency} value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} />
          <Input label={t.settings.taxRate} value={String(form.tax_rate)} onChange={(v) => setForm({ ...form, tax_rate: parseFloat(v) || 0 })} type="number" />
        </div>
        <Select
          label={t.settings.language}
          value={form.language}
          onChange={(v) => setForm({ ...form, language: v as 'fr' | 'en' })}
          options={[
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'English' },
          ]}
        />
        <Input label={t.settings.lowStockThreshold} value={String(form.low_stock_threshold)} onChange={(v) => setForm({ ...form, low_stock_threshold: parseInt(v, 10) || 5 })} type="number" />
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave}>
            <span className="flex items-center gap-2"><Save className="w-4 h-4" /> {t.settings.save}</span>
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 animate-fade-in">
              <CheckCircle className="w-4 h-4" /> {t.settings.saved}
            </span>
          )}
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-800">{t.settings.data}</h2>

        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-700 flex items-center gap-2"><Download className="w-4 h-4 text-emerald-600" /> {t.settings.exportData}</p>
            <p className="text-xs text-slate-400 mt-1">{t.settings.exportDesc}</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportData}>{t.settings.exportData}</Button>
        </div>

        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-700 flex items-center gap-2"><Upload className="w-4 h-4 text-blue-600" /> {t.settings.importData}</p>
            <p className="text-xs text-slate-400 mt-1">{t.settings.importDesc}</p>
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 text-sm text-slate-500">
        <Globe className="w-4 h-4" />
        {form.language === 'fr' ? 'Application en français' : 'Application in English'}
      </div>
    </div>
  );
}
