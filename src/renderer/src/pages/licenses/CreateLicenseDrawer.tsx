import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Drawer } from '../../components/Drawer';
import { BUSINESS_PROFILES, DEFAULT_NEW_MODULES, MODULES, PLANS, useCreateLicense } from '../../lib/licenses';
import { formatDate } from './shared';

type PlanKey = (typeof PLANS)[number]['key'];

function Section({ n, title, hint, children }: { n: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="px-5 sm:px-6 py-5 border-b border-line last:border-b-0">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-mono text-[11px] text-accent-ink">{n}</span>
        <h3 className="text-[13.5px] font-medium text-fg m-0">{title}</h3>
        {hint && <span className="text-[11.5px] text-faint ml-auto">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

export function CreateLicenseDrawer({ open, onClose }: { open: boolean; onClose: () => void; onCreated?: () => void }) {
  const navigate = useNavigate();
  const create = useCreateLicense();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [seats, setSeats] = useState(4);
  const [plan, setPlan] = useState<PlanKey>('annual');
  const [profiles, setProfiles] = useState<string[]>(['standard']);
  const [modules, setModules] = useState<Record<string, boolean>>(DEFAULT_NEW_MODULES);

  useEffect(() => {
    if (open) {
      setName(''); setPhone(''); setSeats(4); setPlan('annual');
      setProfiles(['standard']); setModules(DEFAULT_NEW_MODULES);
    }
  }, [open]);

  const planDays = PLANS.find((p) => p.key === plan)?.days ?? null;
  const expiresAt = planDays ? new Date(Date.now() + planDays * 86_400_000) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate(
      {
        userName: name.trim(),
        whatsappNumber: phone.trim() || '+92 300 0000000',
        maxDevices: seats,
        licenseType: plan,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        modules,
        businessProfiles: profiles,
      },
      {
        onSuccess: (res: any) => {
          toast.success(`License issued for ${name.trim()}`);
          onClose();
          if (res?.data?.id) navigate(`/licenses/${res.data.id}`);
        },
        onError: (err: any) => toast.error(err?.message || 'Could not issue license'),
      },
    );
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      label="Issue new license"
      width={600}
      header={
        <div>
          <span className="eyebrow">New license</span>
          <h2 className="text-[18px] font-medium text-fg m-0 mt-1.5 tracking-tight">Issue a license key</h2>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11.5px] text-faint truncate">
            {name.trim() ? `${name.trim()} · ${seats} seats · ${plan}` : 'Store name is required'}
          </span>
          <div className="flex gap-2 shrink-0">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" form="create-license" className="btn btn-primary" disabled={!name.trim() || create.isPending}>
              {create.isPending ? 'Issuing…' : 'Issue license'}
            </button>
          </div>
        </div>
      }
    >
      <form id="create-license" onSubmit={submit}>
        <Section n="01" title="Store">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <span className="eyebrow block mb-2">Store / client name</span>
              <input className="input" required autoFocus placeholder="e.g. Al-Madina Cafe" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="eyebrow block mb-2">WhatsApp</span>
              <input className="input" placeholder="+92 300 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <div>
              <span className="eyebrow block mb-2">Terminal seats</span>
              <div className="flex items-center h-9 rounded-[9px] border border-line bg-surface-2 overflow-hidden">
                <button type="button" className="w-9 h-full flex items-center justify-center bg-transparent border-0 text-muted hover:text-fg cursor-pointer" onClick={() => setSeats((s) => Math.max(1, s - 1))} aria-label="Fewer seats">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={seats}
                  onChange={(e) => setSeats(Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                  className="flex-1 min-w-0 h-full text-center bg-transparent border-x border-line text-[13px] text-fg num outline-none"
                  aria-label="Terminal seats"
                />
                <button type="button" className="w-9 h-full flex items-center justify-center bg-transparent border-0 text-muted hover:text-fg cursor-pointer" onClick={() => setSeats((s) => Math.min(50, s + 1))} aria-label="More seats">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Section>

        <Section n="02" title="Plan" hint={expiresAt ? `Expires ${formatDate(expiresAt)}` : 'Never expires'}>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Plan">
            {PLANS.map((p) => {
              const on = plan === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPlan(p.key)}
                  className={`p-3 rounded-[10px] border text-left cursor-pointer transition-colors ${
                    on ? 'bg-surface-2 border-accent-ink' : 'bg-transparent border-line hover:border-line-strong'
                  }`}
                >
                  <span className={`block text-[13px] font-medium ${on ? 'text-fg' : 'text-muted'}`}>{p.label}</span>
                  <span className="block font-mono text-[10.5px] text-faint mt-1">{p.days ? `${p.days} days` : 'no expiry'}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section n="03" title="Business profile" hint="One locks categories, several filter them">
          <div className="flex flex-wrap gap-1.5">
            {BUSINESS_PROFILES.map((bp) => {
              const on = profiles.includes(bp.key);
              return (
                <button
                  key={bp.key}
                  type="button"
                  aria-pressed={on}
                  title={bp.label}
                  onClick={() =>
                    setProfiles((prev) =>
                      prev.includes(bp.key) ? (prev.length > 1 ? prev.filter((k) => k !== bp.key) : prev) : [...prev, bp.key],
                    )
                  }
                  className={`flex items-center gap-2 h-7 px-2.5 rounded-[7px] text-[12px] cursor-pointer transition-colors border ${
                    on ? 'bg-surface-3 border-line-strong text-fg' : 'bg-transparent border-line text-faint hover:text-muted hover:border-line-strong'
                  }`}
                >
                  <span className="dot" style={{ color: on ? bp.color : 'var(--faint)' }} />
                  {bp.shortTag}
                </button>
              );
            })}
          </div>
        </Section>

        <Section n="04" title="Modules" hint={`${Object.values(modules).filter(Boolean).length} of ${MODULES.length} on`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {MODULES.map((m) => {
              const on = !!modules[m.key];
              return (
                <button
                  key={m.key}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => setModules((p) => ({ ...p, [m.key]: !p[m.key] }))}
                  className={`flex items-center gap-3 h-11 px-3 rounded-[9px] border cursor-pointer text-left transition-colors ${
                    on ? 'bg-surface-2 border-line-strong' : 'bg-transparent border-line hover:border-line-strong'
                  }`}
                >
                  <m.icon className={`w-4 h-4 shrink-0 ${on ? 'text-accent-ink' : 'text-faint'}`} />
                  <span className={`flex-1 text-[12.5px] truncate ${on ? 'text-fg' : 'text-muted'}`}>{m.label}</span>
                  <span className="switch" data-on={on} aria-hidden />
                </button>
              );
            })}
          </div>
        </Section>
      </form>
    </Drawer>
  );
}
