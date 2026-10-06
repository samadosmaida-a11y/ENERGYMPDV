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
        <h1 className="text-2xl font-bold text-slate-800">{t.clients.title}</h1>
        <Button onClick={openAdd}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> {t.clients.add}</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.clients.search}
          className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState icon={<Users className="w-12 h-12" />} title={t.clients.noClients} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const purchases = getClientPurchases(c.id);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{c.name}</h3>
                      <p className="text-xs text-emerald-600">{purchases} {t.clients.purchases}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm(t.clients.confirmDelete)) deleteClient(c.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  {c.phone && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="w-3.5 h-3.5" /> {c.phone}
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail className="w-3.5 h-3.5" /> {c.email}
                    </div>
                  )}
                  {c.address && <p className="text-slate-400 text-xs mt-2">{c.address}</p>}
                  {c.notes && <p className="text-slate-400 text-xs italic mt-2">"{c.notes}"</p>}
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
          <label className="block text-sm font-medium text-slate-600 mb-1.5">{t.clients.notes}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
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
