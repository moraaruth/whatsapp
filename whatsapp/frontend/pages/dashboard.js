import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Shell from '../components/layout/Shell';
import Av from '../components/ui/Av';
import SPill from '../components/ui/SPill';
import { leadService } from '../services/leadService';
import { ago, fmtTime, fmtKES, cn, getS } from '../lib/utils';
import {
  Search, Bell, TrendingUp, Send, ChevronRight,
  Clock, Zap, MessageSquare, Phone, MoreHorizontal,
  CheckCheck, Plus, Filter, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

const QUICK = [
  'Thank you for reaching out!',
  'Can we schedule a call?',
  'I\'ll send you the details shortly.',
  'Is this still available?',
];

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const bottom = useRef(null);
  const router = useRouter();

  const [user, setUser] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    Promise.all([leadService.getAllLeads(), leadService.getDashboardStats()])
      .then(([l, s]) => {
        setLeads(l.data || []);
        setStats(s.data);
        if (l.data?.length > 0) selectLead(l.data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const selectLead = async (lead) => {
    setActive(lead);
    try {
      const r = await leadService.getMessagesForLead(lead._id);
      setMsgs(r.data || []);
    } catch (e) { setMsgs([]); }
  };

  const send = async (t) => {
    const msg = t || text.trim();
    if (!msg || !active) return;
    setSending(true);
    try {
      await leadService.sendMessage(active._id, { messageText: msg });
      setText('');
      const r = await leadService.getMessagesForLead(active._id);
      setMsgs(r.data || []);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const changeStatus = async (status) => {
    if (!active) return;
    try {
      await leadService.updateLeadStatus(active._id, { status });
      setActive({ ...active, status });
      setLeads(leads.map(l => l._id === active._id ? { ...l, status } : l));
    } catch (e) { console.error(e); }
  };

  const filtered = leads.filter(l =>
    filter === 'ALL' || l.status === filter
  );

  const topbar = (
    <>
      {/* Search */}
      <div className="relative w-56">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lo" />
        <input
          type="text"
          placeholder="Search leads..."
          className="w-full bg-panel-2 border border-edge text-hi placeholder-lo rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-edge-2 transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Live stats */}
      <div className="hidden sm:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-dot" />
          <span className="text-mid">{stats?.totalLeads || 0} leads</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-urgent" />
          <span className="text-mid">{stats?.interestedLeads || 0} hot</span>
        </div>
        <div className="flex items-center gap-1.5 text-signal font-semibold">
          <Zap size={11} />
          <span>{fmtKES(stats?.totalRevenue || 0)}</span>
        </div>
      </div>

      <button className="relative op-btn-ghost p-1.5">
        <Bell size={15} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-urgent rounded-full" />
      </button>
    </>
  );

  return (
    <Shell topbar={topbar}>
      <div className="flex flex-1 overflow-hidden">

        {/* Lead list panel */}
        <div className="w-72 bg-panel border-r border-edge flex flex-col flex-shrink-0">
          {/* Panel header */}
          <div className="px-3 py-3 border-b border-edge flex items-center justify-between">
            <span className="text-xs font-semibold text-hi">Conversations</span>
            <div className="flex items-center gap-1">
              <button className="op-btn-ghost p-1.5"><Filter size={13} /></button>
              <button className="op-btn-ghost p-1.5"><Plus size={13} /></button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 px-2 py-2 border-b border-edge overflow-x-auto">
            {['ALL','NEW','INTERESTED','CLOSED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-2xs font-semibold whitespace-nowrap transition-all',
                  filter === f
                    ? 'bg-signal-dim text-signal'
                    : 'text-lo hover:text-mid'
                )}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Lead rows */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-3 border-b border-edge">
                  <div className="skel w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skel h-2.5 w-24 rounded" />
                    <div className="skel h-2 w-32 rounded" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <MessageSquare size={20} className="text-lo mb-2" />
                <p className="text-xs text-lo">No conversations</p>
              </div>
            ) : (
              filtered.map(lead => {
                const isActive = active?._id === lead._id;
                const s = getS(lead.status);
                return (
                  <button
                    key={lead._id}
                    onClick={() => selectLead(lead)}
                    className={cn(
                      'w-full flex items-start gap-2.5 px-3 py-3 border-b border-edge text-left transition-all duration-100',
                      isActive ? 'bg-panel-3' : 'hover:bg-panel-2'
                    )}
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <Av name={lead.name} size="sm" />
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-panel"
                        style={{ background: s.dot }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-hi truncate">{lead.name}</span>
                        <span className="text-2xs text-lo flex-shrink-0 ml-1">{ago(lead.updatedAt || lead.createdAt)}</span>
                      </div>
                      <p className="text-xs text-mid truncate">{lead.phoneNumber}</p>
                      {lead.status === 'INTERESTED' && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-1 h-1 rounded-full bg-urgent" />
                          <span className="text-2xs text-urgent font-medium">Hot lead</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-panel-2 border border-edge rounded-xl flex items-center justify-center mb-3">
                <MessageSquare size={20} className="text-lo" />
              </div>
              <p className="text-sm font-semibold text-mid mb-1">Select a conversation</p>
              <p className="text-xs text-lo">Choose a lead from the left to start</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="h-11 bg-panel border-b border-edge flex items-center px-4 gap-3 flex-shrink-0">
                <Av name={active.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-hi">{active.name}</span>
                    <SPill status={active.status} />
                  </div>
                  <p className="text-xs text-lo">{active.phoneNumber}</p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Status changer */}
                  <select
                    value={active.status}
                    onChange={e => changeStatus(e.target.value)}
                    className="bg-panel-2 border border-edge text-mid text-xs rounded-lg px-2 py-1.5 outline-none hover:border-edge-2 transition-all cursor-pointer"
                  >
                    {['NEW','CONTACTED','INTERESTED','CLOSED','LOST'].map(s => (
                      <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                  <a
                    href={`https://wa.me/${active.phoneNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="op-btn-ghost p-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-signal">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                  <Link href={`/leads/${active._id}`}>
                    <button className="op-btn-ghost p-1.5" title="Full view">
                      <ArrowUpRight size={15} />
                    </button>
                  </Link>
                  <button className="op-btn-ghost p-1.5"><MoreHorizontal size={15} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                {msgs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-xs text-lo">No messages yet. WhatsApp messages appear here automatically.</p>
                  </div>
                ) : (
                  msgs.map((m, i) => {
                    const mine = m.sender === 'business';
                    return (
                      <div key={m._id || i} className={cn('flex animate-msg-in', mine ? 'justify-end' : 'justify-start')}>
                        {!mine && <Av name={active.name} size="xs" className="mr-2 mt-1 flex-shrink-0" />}
                        <div className={cn('max-w-[65%] flex flex-col gap-0.5', mine ? 'items-end' : 'items-start')}>
                          <div className={cn(
                            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                            mine
                              ? 'bg-signal text-canvas font-medium rounded-tr-sm'
                              : 'bg-panel-3 border border-edge text-hi rounded-tl-sm'
                          )}>
                            {m.messageText}
                          </div>
                          <div className={cn('flex items-center gap-1', mine && 'flex-row-reverse')}>
                            <span className="text-2xs text-lo">{fmtTime(m.timestamp)}</span>
                            {mine && <CheckCheck size={11} className="text-signal/50" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottom} />
              </div>

              {/* Quick replies */}
              <div className="px-4 py-2 border-t border-edge flex gap-2 overflow-x-auto flex-shrink-0">
                {QUICK.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="px-3 py-1.5 bg-panel-2 hover:bg-signal-dim hover:text-signal border border-edge hover:border-signal-ring rounded-full text-xs text-mid whitespace-nowrap transition-all flex-shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-edge flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder={`Reply to ${active.name}...`}
                    className="op-input flex-1 py-2.5 text-sm"
                  />
                  <button
                    onClick={() => send()}
                    disabled={!text.trim() || sending}
                    className="w-9 h-9 bg-signal hover:bg-signal/90 disabled:opacity-30 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                  >
                    {sending
                      ? <div className="w-3.5 h-3.5 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
                      : <Send size={14} className="text-canvas" strokeWidth={2.5} />
                    }
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right intel panel */}
        {active && (
          <div className="w-64 bg-panel border-l border-edge flex flex-col flex-shrink-0 overflow-y-auto">
            <div className="px-4 py-3 border-b border-edge">
              <p className="text-2xs font-bold text-lo uppercase tracking-widest">Lead Intel</p>
            </div>

            <div className="p-4 space-y-5">
              {/* Identity */}
              <div className="flex flex-col items-center text-center py-2">
                <Av name={active.name} size="lg" className="mb-2" />
                <p className="text-sm font-bold text-hi">{active.name}</p>
                <p className="text-xs text-lo mt-0.5">{active.phoneNumber}</p>
                <SPill status={active.status} />
              </div>

              {/* Stats */}
              <div className="space-y-2">
                {[
                  { label: 'Source',   value: 'WhatsApp' },
                  { label: 'Priority', value: active.priority || 'MEDIUM' },
                  { label: 'Created',  value: new Date(active.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) },
                  { label: 'Messages', value: msgs.length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-edge">
                    <span className="text-xs text-lo">{label}</span>
                    <span className="text-xs font-medium text-mid">{value}</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {active.notes?.length > 0 && (
                <div>
                  <p className="text-2xs font-bold text-lo uppercase tracking-widest mb-2">Notes</p>
                  <div className="space-y-2">
                    {active.notes.slice(0, 3).map((n, i) => (
                      <div key={i} className="bg-panel-2 border border-edge rounded-lg p-2.5">
                        <p className="text-xs text-mid leading-relaxed">{n.text}</p>
                        <p className="text-2xs text-lo mt-1">{ago(n.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Link href={`/leads/${active._id}`}>
                  <button className="op-btn-outline w-full justify-center text-xs py-2">
                    <ArrowUpRight size={13} />
                    Full Detail
                  </button>
                </Link>
                <a href={`https://wa.me/${active.phoneNumber}`} target="_blank" rel="noopener noreferrer">
                  <button className="w-full flex items-center justify-center gap-1.5 bg-signal-dim hover:bg-signal/15 border border-signal-ring text-signal text-xs font-medium py-2 rounded-lg transition-all">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-signal">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Open in WhatsApp
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
