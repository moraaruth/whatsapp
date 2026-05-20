import { useState, useEffect } from 'react';
import Link from 'next/link';
import Shell from '../components/layout/Shell';
import Avatar from '../components/ui/Avatar';
import StatusPill from '../components/ui/StatusPill';
import { leadService } from '../services/leadService';
import { timeAgo, cn } from '../lib/utils';
import { Search, Plus, Users, Phone, ArrowUpRight, ChevronDown, MessageSquare } from 'lucide-react';

const FILTERS = ['ALL', 'NEW', 'CONTACTED', 'INTERESTED', 'CLOSED', 'LOST'];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => { fetch(); }, [filter]);

  const fetch = async () => {
    setLoading(true);
    try {
      const p = filter !== 'ALL' ? { status: filter } : {};
      const r = await leadService.getAllLeads(p);
      setLeads(r.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try { await leadService.updateLeadStatus(id, { status }); fetch(); }
    catch (e) { console.error(e); }
  };

  const filtered = leads.filter(l =>
    !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phoneNumber?.includes(search)
  );

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-ink-1 tracking-tight">Leads</h1>
            <p className="text-xs text-ink-4 mt-0.5">{leads.length} leads total</p>
          </div>
          <button className="btn-primary">
            <Plus size={14} strokeWidth={2.5} />
            Add Lead
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
            <input
              type="text"
              placeholder="Search name or phone..."
              className="input pl-9 py-2.5 text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 border',
                  filter === f
                    ? 'bg-green-dim border-green-border text-green'
                    : 'bg-surface-1 border-line text-ink-3 hover:text-ink-2 hover:border-line-2'
                )}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-3 w-28 rounded" />
                    <div className="skeleton h-2.5 w-20 rounded" />
                  </div>
                </div>
                <div className="skeleton h-2 w-full rounded" />
                <div className="skeleton h-8 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-surface-3 border border-line rounded-2xl flex items-center justify-center mb-4">
              <Users size={22} className="text-ink-4" />
            </div>
            <p className="text-sm font-bold text-ink-2 mb-1">
              {search ? `No results for "${search}"` : 'No leads yet'}
            </p>
            <p className="text-xs text-ink-4 max-w-xs">
              {search ? 'Try a different search term' : 'WhatsApp messages will automatically create leads here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(lead => (
              <LeadCard key={lead._id} lead={lead} onStatus={updateStatus} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

function LeadCard({ lead, onStatus }) {
  const [menu, setMenu] = useState(false);

  return (
    <div className="card-hover p-5 group">
      {/* Top */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={lead.name} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink-1 truncate group-hover:text-green transition-colors">
              {lead.name}
            </p>
            <p className="text-xs text-ink-4 flex items-center gap-1 mt-0.5">
              <Phone size={10} />
              {lead.phoneNumber}
            </p>
          </div>
        </div>
        <Link href={`/leads/${lead._id}`}>
          <button className="w-7 h-7 bg-surface-3 hover:bg-green-dim hover:text-green border border-line hover:border-green-border rounded-lg flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100">
            <ArrowUpRight size={13} />
          </button>
        </Link>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <button onClick={() => setMenu(!menu)} className="flex items-center gap-1">
            <StatusPill status={lead.status} />
            <ChevronDown size={11} className="text-ink-4" />
          </button>
          {menu && (
            <div className="absolute top-full left-0 mt-1.5 bg-surface-2 border border-line-2 rounded-xl shadow-float z-20 py-1.5 min-w-[140px]">
              {['NEW','CONTACTED','INTERESTED','CLOSED','LOST'].map(s => (
                <button key={s} onClick={() => { onStatus(lead._id, s); setMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-ink-3 hover:text-ink-1 hover:bg-surface-3 transition-colors">
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-2xs text-ink-4">{timeAgo(lead.createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-line">
        <Link href={`/leads/${lead._id}`} className="flex-1">
          <button className="btn-outline w-full py-2 text-xs justify-center">
            <MessageSquare size={12} />
            Open Chat
          </button>
        </Link>
        <a href={`https://wa.me/${lead.phoneNumber}`} target="_blank" rel="noopener noreferrer"
          className="w-9 h-9 bg-wa/8 hover:bg-wa/15 border border-wa/15 hover:border-wa/30 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-wa">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
