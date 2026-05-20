import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Shell from '../../components/layout/Shell';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
import { leadService } from '../../services/leadService';
import { timeAgo, fmtTime, fmtDate, cn } from '../../lib/utils';
import {
  ArrowLeft, Phone, Send, FileText, Calendar,
  ChevronDown, Zap, MessageSquare, CheckCheck,
  MoreHorizontal, Clock, Sparkles
} from 'lucide-react';

const STATUSES = ['NEW','CONTACTED','INTERESTED','CLOSED','LOST'];
const QUICK = ['Thank you for reaching out!', 'Can we schedule a call?', 'I\'ll get back to you shortly.', 'Please share more details.'];

export default function LeadDetail() {
  const [lead, setLead] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('notes');
  const [statusMenu, setStatusMenu] = useState(false);
  const [note, setNote] = useState('');
  const bottom = useRef(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    Promise.all([leadService.getLeadById(id), leadService.getMessagesForLead(id)])
      .then(([l, m]) => { setLead(l.data); setMsgs(m.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (t) => {
    const msg = t || text.trim();
    if (!msg) return;
    setSending(true);
    try {
      await leadService.sendMessage(id, { messageText: msg });
      setText('');
      const r = await leadService.getMessagesForLead(id);
      setMsgs(r.data || []);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const changeStatus = async (s) => {
    try {
      await leadService.updateLeadStatus(id, { status: s });
      setLead({ ...lead, status: s });
      setStatusMenu(false);
    } catch (e) { console.error(e); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      await leadService.addNote(id, { text: note });
      setNote('');
      const r = await leadService.getLeadById(id);
      setLead(r.data);
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <Shell>
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    </Shell>
  );

  if (!lead) return (
    <Shell>
      <div className="text-center py-20">
        <p className="text-ink-3 mb-4">Lead not found</p>
        <Link href="/leads"><button className="btn-primary">Back to Leads</button></Link>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        <Link href="/leads">
          <button className="btn-ghost mb-4 -ml-1 text-xs">
            <ArrowLeft size={14} /> Back to Leads
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5" style={{ height: 'calc(100vh - 160px)' }}>

          {/* Chat */}
          <div className="card flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={lead.name} size="md" />
                <div>
                  <p className="text-sm font-bold text-ink-1">{lead.name}</p>
                  <p className="text-xs text-ink-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-wa inline-block" />
                    {lead.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`https://wa.me/${lead.phoneNumber}`} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-wa/8 hover:bg-wa/15 border border-wa/15 rounded-xl flex items-center justify-center transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-wa">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <button className="btn-ghost p-2"><MoreHorizontal size={15} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {msgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 bg-surface-3 border border-line rounded-2xl flex items-center justify-center mb-3">
                    <MessageSquare size={20} className="text-ink-4" />
                  </div>
                  <p className="text-sm font-bold text-ink-2 mb-1">No messages yet</p>
                  <p className="text-xs text-ink-4">WhatsApp messages will appear here automatically</p>
                </div>
              ) : (
                msgs.map((m, i) => {
                  const mine = m.sender === 'business';
                  return (
                    <div key={m._id || i} className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-message-in`}>
                      {!mine && <Avatar name={lead.name} size="xs" className="mr-2 mt-1 flex-shrink-0" />}
                      <div className={`max-w-[75%] flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                        <div className={cn(
                          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                          mine
                            ? 'bg-green text-void font-medium rounded-tr-sm shadow-glow-green-sm'
                            : 'bg-surface-3 border border-line text-ink-1 rounded-tl-sm'
                        )}>
                          {m.messageText}
                        </div>
                        <div className={`flex items-center gap-1 ${mine ? 'flex-row-reverse' : ''}`}>
                          <span className="text-2xs text-ink-4">{fmtTime(m.timestamp)}</span>
                          {mine && <CheckCheck size={11} className="text-green/50" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottom} />
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2.5 border-t border-line flex gap-2 overflow-x-auto flex-shrink-0">
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="px-3 py-1.5 bg-surface-2 hover:bg-green-dim hover:text-green border border-line hover:border-green-border rounded-full text-xs text-ink-3 whitespace-nowrap transition-all duration-150 flex-shrink-0">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-line flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Type a message..."
                  className="input flex-1 py-2.5 text-sm"
                />
                <button onClick={() => send()} disabled={!text.trim() || sending}
                  className="w-10 h-10 bg-green hover:bg-green/90 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all flex-shrink-0 shadow-glow-green-sm">
                  {sending
                    ? <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                    : <Send size={15} className="text-void" strokeWidth={2.5} />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            {/* Lead info */}
            <div className="card p-5">
              <p className="text-2xs font-bold text-ink-4 uppercase tracking-widest mb-4">Lead Details</p>
              <div className="space-y-3">
                {[
                  { label: 'Status', value: (
                    <div className="relative">
                      <button onClick={() => setStatusMenu(!statusMenu)} className="flex items-center gap-1">
                        <StatusPill status={lead.status} />
                        <ChevronDown size={11} className="text-ink-4" />
                      </button>
                      {statusMenu && (
                        <div className="absolute right-0 top-full mt-1.5 bg-surface-2 border border-line-2 rounded-xl shadow-float z-20 py-1.5 min-w-[140px]">
                          {STATUSES.map(s => (
                            <button key={s} onClick={() => changeStatus(s)}
                              className="w-full text-left px-3 py-2 text-xs text-ink-3 hover:text-ink-1 hover:bg-surface-3 transition-colors">
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )},
                  { label: 'Source', value: <span className="text-xs text-wa font-medium">WhatsApp</span> },
                  { label: 'Priority', value: <span className="text-xs text-ink-2">{lead.priority}</span> },
                  { label: 'Created', value: <span className="text-xs text-ink-3">{timeAgo(lead.createdAt)}</span> },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-ink-4">{label}</span>
                    {value}
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="card flex-1 flex flex-col overflow-hidden">
              <div className="flex border-b border-line">
                {[
                  { id: 'notes', icon: FileText, label: 'Notes' },
                  { id: 'followup', icon: Calendar, label: 'Follow-up' },
                ].map(({ id, icon: Icon, label }) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all',
                      tab === id ? 'text-green border-b-2 border-green bg-green-muted' : 'text-ink-4 hover:text-ink-2'
                    )}>
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {tab === 'notes' && (
                  <div className="space-y-3">
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Add a note..."
                      className="input resize-none h-24 text-xs"
                    />
                    <button onClick={addNote} disabled={!note.trim()}
                      className="btn-primary w-full py-2 text-xs justify-center disabled:opacity-40">
                      <Zap size={12} strokeWidth={2.5} />
                      Save Note
                    </button>
                    {lead.notes?.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {lead.notes.map((n, i) => (
                          <div key={i} className="bg-surface-2 border border-line rounded-xl p-3">
                            <p className="text-xs text-ink-2 leading-relaxed">{n.text}</p>
                            <p className="text-2xs text-ink-4 mt-1.5">{timeAgo(n.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'followup' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-ink-3 mb-1.5">Date & Time</label>
                      <input type="datetime-local" className="input text-xs" />
                    </div>
                    <button className="btn-primary w-full py-2 text-xs justify-center">
                      <Clock size={12} />
                      Set Reminder
                    </button>
                    {lead.followUpDate && (
                      <div className="bg-amber/8 border border-amber/20 rounded-xl p-3 flex items-center gap-2">
                        <Clock size={12} className="text-amber flex-shrink-0" />
                        <p className="text-xs text-amber">{fmtDate(lead.followUpDate)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
