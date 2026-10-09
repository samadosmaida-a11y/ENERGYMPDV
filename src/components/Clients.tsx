import { useState } from 'react';
import { useStore } from '../store';
import { Modal, Button, Input, EmptyState } from './ui';
import { Plus, Search, Pencil, Trash2, Users, Phone, Mail } from 'lucide-react';
import type { Client } from '../types';

function genId() {
  return crypto.randomUUID();
}

export function Clients() {
  const { clients, sales, addClient, updateClient, deleteClient, t } = useStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const getClientPurchases = (clientId: string) => sales.filter((s) => s.client_id === clientId).length;

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.clients.title}</h1>
        <Button onClick={openAdd}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> {t.clients.add}</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.clients.search}
          className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <EmptyState icon={<Users className="w-12 h-12" />} title={t.clients.noClients} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const purchases = getClientPurchases(c.id);
            return (
              <div key={c.id} className="rounded-2xl border p-5 hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'linear-gradient(to bottom right, var(--c-400), var(--c-500))', color: '#fff' }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--c-600)' }}>{purchases} {t.clients.purchases}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm(t.clients.confirmDelete)) deleteClient(c.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  {c.phone && (
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Phone className="w-3.5 h-3.5" /> {c.phone}
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Mail className="w-3.5 h-3.5" /> {c.email}
                    </div>
                  )}
                  {c.address && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{c.address}</p>}
                  {c.notes && <p className="text-xs italic mt-2" style={{ color: 'var(--text-muted)' }}>"{c.notes}"</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <ClientModal
          client={editing}
          onClose={() => setModalOpen(false)}
          onSave={async (c) => {
            if (editing) await updateClient(c);
            else await addClient(c);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ClientModal({ client, onClose, onSave }: {
  client: Client | null;
  onClose: () => void;
  onSave: (c: Client) => void;
}) {
  const { t } = useStore();
  const [name, setName] = useState(client?.name || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [email, setEmail] = useState(client?.email || '');
  const [address, setAddress] = useState(client?.address || '');
  const [notes, setNotes] = useState(client?.notes || '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: client?.id || genId(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      notes: notes.trim(),
      created_at: client?.created_at || new Date().toISOString(),
    });
  };

  return (
    <Modal open onClose={onClose} title={client ? t.clients.edit : t.clients.add}>
      <div className="space-y-4">
        <Input label={t.clients.name} value={name} onChange={setName} placeholder="Client name" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label={t.clients.phone} value={phone} onChange={setPhone} placeholder="..." />
          <Input label={t.clients.email} value={email} onChange={setEmail} type="email" placeholder="..." />
        </div>
        <Input label={t.clients.address} value={address} onChange={setAddress} placeholder="..." />
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t.clients.notes}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none resize-none"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>{t.clients.cancel}</Button>
          <Button onClick={handleSave}>{t.clients.save}</Button>
        </div>
      </div>
    </Modal>
  );
}
