'use client'

import { useState, useMemo } from 'react'

const LAYOUTS = [
  { id: 'bullets', label: 'Liste à puces' },
  { id: 'lines', label: 'Une ligne par entrée' },
  { id: 'inline', label: 'En ligne (virgules)' },
]

let _uid = 0
const uid = () => `p${Date.now()}_${_uid++}`

const inputStyle = {
  height: 32, padding: '0 9px', background: '#1a1a1f', border: '1px solid #34343d',
  borderRadius: 7, color: '#e6e6ea', fontSize: 12.5, outline: 'none', fontFamily: 'Inter', boxSizing: 'border-box',
}
const selectStyle = { ...inputStyle, cursor: 'pointer' }

const smallBtn = {
  height: 28, padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 5,
  background: '#23232a', border: '1px solid #34343d', borderRadius: 7, color: '#cfcfd6',
  fontSize: 12, cursor: 'pointer', fontWeight: 500,
}

const iconBtn = {
  width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: '#23232a', border: '1px solid #34343d', borderRadius: 6, color: '#cfcfd6',
  fontSize: 12, cursor: 'pointer', padding: 0,
}
const miniToggle = {
  width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: '#23232a', border: '1px solid #34343d', borderRadius: 6, color: '#cfcfd6',
  fontSize: 11.5, cursor: 'pointer', padding: 0,
}
const miniToggleOn = { background: 'rgba(79,140,255,0.22)', color: '#9cc0ff', borderColor: 'rgba(79,140,255,0.4)' }

// Boutons de style réutilisables pour un élément (texte / champ / colonne)
function StyleToggles({ item, onChange }) {
  const T = (key, label, title, extra) => (
    <button onClick={() => onChange({ [key]: !item[key] })} title={title}
      style={{ ...miniToggle, ...(item[key] ? miniToggleOn : {}), ...(extra || {}) }}>{label}</button>
  )
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {T('bold', 'B', 'Gras', { fontWeight: 800 })}
      {T('italic', 'I', 'Italique', { fontStyle: 'italic', fontFamily: 'Georgia, serif' })}
      {T('underline', 'U', 'Souligné', { textDecoration: 'underline' })}
      {T('link', '🔗', 'Transformer la valeur en lien')}
      {T('newLine', '↵', 'Afficher à la ligne')}
    </div>
  )
}

// Aperçu : applique le style à un jeton (texte ou {table.col})
function fmtPreview(rawHtml, o = {}) {
  let v = rawHtml
  if (o.link) v = `<span style="color:#9cc0ff;text-decoration:underline;">${v}</span>`
  if (o.bold) v = `<strong>${v}</strong>`
  if (o.italic) v = `<em>${v}</em>`
  if (o.underline) v = `<u>${v}</u>`
  if (o.newLine) v = `<div>${v}</div>`
  return v
}
function tokenHtml(raw) {
  const esc = (raw || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<span style="color:#9cc0ff;background:rgba(79,140,255,0.14);border-radius:4px;padding:0 4px;">{${esc}}</span>`
}
function textHtml(raw) {
  return (raw || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function CVVariableBuilder({ tables, onClose, onSave, editing }) {
  const [name, setName] = useState(editing?.name || '')
  const [parts, setParts] = useState(editing?.parts || [])

  const tableMap = useMemo(() => {
    const m = {}
    for (const t of tables) m[t.name] = t.columns.map(c => c.name)
    return m
  }, [tables])

  const firstTable = tables[0]?.name || ''

  // ── Part mutations ──
  const addText = () => setParts(p => [...p, { id: uid(), kind: 'text', value: '' }])
  const addField = (table, column) => setParts(p => [...p, {
    id: uid(), kind: 'field',
    table: table || firstTable,
    column: column || (tableMap[table || firstTable]?.[0] || ''),
  }])
  const addLoop = () => setParts(p => [...p, {
    id: uid(), kind: 'loop', table: firstTable, layout: 'bullets', gap: 4,
    template: [{ id: uid(), kind: 'col', column: tableMap[firstTable]?.[0] || '' }],
  }])

  const updatePart = (id, patch) => setParts(p => p.map(x => x.id === id ? { ...x, ...patch } : x))
  const removePart = (id) => setParts(p => p.filter(x => x.id !== id))
  const movePart = (id, dir) => setParts(p => {
    const i = p.findIndex(x => x.id === id)
    const j = dir === 'up' ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= p.length) return p
    const next = [...p]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  })

  // Loop template mutations
  const addLoopItem = (loopId, kind) => setParts(p => p.map(x => {
    if (x.id !== loopId) return x
    const item = kind === 'text'
      ? { id: uid(), kind: 'text', value: '' }
      : { id: uid(), kind: 'col', column: tableMap[x.table]?.[0] || '' }
    return { ...x, template: [...x.template, item] }
  }))
  const updateLoopItem = (loopId, itemId, patch) => setParts(p => p.map(x => {
    if (x.id !== loopId) return x
    return { ...x, template: x.template.map(it => it.id === itemId ? { ...it, ...patch } : it) }
  }))
  const removeLoopItem = (loopId, itemId) => setParts(p => p.map(x => {
    if (x.id !== loopId) return x
    return { ...x, template: x.template.filter(it => it.id !== itemId) }
  }))

  // ── Preview (structure only, no data) ──
  const preview = useMemo(() => {
    const renderRowTpl = (tpl, table) => tpl.map(it =>
      fmtPreview(it.kind === 'text' ? textHtml(it.value) : tokenHtml(`${table}.${it.column}`), it)
    ).join('')
    return parts.map(part => {
      if (part.kind === 'text') return { type: 'inline', html: fmtPreview(textHtml(part.value), part) }
      if (part.kind === 'field') return { type: 'inline', html: fmtPreview(tokenHtml(`${part.table}.${part.column}`), part) }
      const row = renderRowTpl(part.template, part.table)
      if (part.layout === 'inline') return { type: 'inline', html: row + ', …' }
      if (part.layout === 'lines') return { type: 'lines', rows: [row, '…'], gap: Number(part.gap) || 0 }
      return { type: 'bullets', rows: [row, '…'], gap: Number(part.gap) || 0 }
    })
  }, [parts])

  const canSave = name.trim() && parts.length > 0

  const handleSave = () => {
    if (!canSave) return
    onSave({ id: editing?.id || `v${Date.now()}`, name: name.trim(), parts })
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(8,8,10,0.62)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 960, maxWidth: '100%', height: 660, maxHeight: '92vh', background: '#1c1c22', border: '1px solid #34343d', borderRadius: 16, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ flexShrink: 0, padding: '18px 22px', borderBottom: '1px solid #2a2a31', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f3f3f5' }}>{editing ? 'Modifier la variable' : 'Créer une variable'}</div>
            <div style={{ fontSize: 12, color: '#8a8e98', marginTop: 2 }}>Combinez du texte, des champs et des boucles sur vos tables</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#23232a', border: '1px solid #313139', borderRadius: 8, color: '#cfcfd6', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* Left: tables & columns */}
          <div style={{ width: 250, flexShrink: 0, borderRight: '1px solid #2a2a31', overflowY: 'auto', padding: 12, background: '#19191e' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.6px', color: '#6f737d', padding: '4px 6px 10px' }}>Tables de la base</div>
            {tables.map(t => (
              <div key={t.name} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#cdd0d8', padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7fb0ff" strokeWidth="1.7"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v16" /></svg>
                  {t.name}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '2px 6px 0' }}>
                  {t.columns.map(c => (
                    <button key={c.name} title={`Ajouter ${t.name}.${c.name}`} onClick={() => addField(t.name, c.name)}
                      style={{ padding: '3px 8px', fontSize: 11.5, background: '#23232a', border: '1px solid #313139', borderRadius: 6, color: '#aeb2bd', cursor: 'pointer' }}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: composition */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>

              <label style={{ fontSize: 12, color: '#8a8e98', display: 'block', marginBottom: 6 }}>Nom de la variable</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="ex. Liste des projets"
                style={{ ...inputStyle, width: '100%', height: 36, fontSize: 13, marginBottom: 18 }} />

              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button onClick={addText} style={smallBtn}>+ Texte</button>
                <button onClick={() => addField()} style={smallBtn}>+ Champ</button>
                <button onClick={addLoop} style={smallBtn}>+ Boucle (itérer une table)</button>
              </div>

              {parts.length === 0 && (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6f737d', fontSize: 13, border: '1px dashed #34343d', borderRadius: 10 }}>
                  Composez votre variable : ajoutez du texte, un champ, ou une boucle.<br />Cliquez aussi une colonne à gauche pour l’insérer.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {parts.map((part, idx) => (
                  <div key={part.id} style={{ background: '#202027', border: '1px solid #2f2f38', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: part.kind === 'loop' ? '#9cc0ff' : '#7c8089' }}>
                        {part.kind === 'text' ? 'Texte' : part.kind === 'field' ? 'Champ' : 'Boucle'}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => movePart(part.id, 'up')} disabled={idx === 0} style={{ ...iconBtn, opacity: idx === 0 ? 0.3 : 1 }}>↑</button>
                        <button onClick={() => movePart(part.id, 'down')} disabled={idx === parts.length - 1} style={{ ...iconBtn, opacity: idx === parts.length - 1 ? 0.3 : 1 }}>↓</button>
                        <button onClick={() => removePart(part.id)} style={{ ...iconBtn, color: '#f87171' }}>✕</button>
                      </div>
                    </div>

                    {part.kind === 'text' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input value={part.value} onChange={e => updatePart(part.id, { value: e.target.value })} placeholder="Texte fixe…"
                          style={{ ...inputStyle, width: '100%' }} />
                        <StyleToggles item={part} onChange={patch => updatePart(part.id, patch)} />
                      </div>
                    )}

                    {part.kind === 'field' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <select value={part.table} onChange={e => updatePart(part.id, { table: e.target.value, column: tableMap[e.target.value]?.[0] || '' })} style={{ ...selectStyle, flex: 1 }}>
                            {tables.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                          </select>
                          <select value={part.column} onChange={e => updatePart(part.id, { column: e.target.value })} style={{ ...selectStyle, flex: 1 }}>
                            {(tableMap[part.table] || []).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <StyleToggles item={part} onChange={patch => updatePart(part.id, patch)} />
                      </div>
                    )}

                    {part.kind === 'loop' && (
                      <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: '#8a8e98', marginBottom: 4 }}>Itérer sur</div>
                            <select value={part.table} onChange={e => updatePart(part.id, { table: e.target.value, template: [{ id: uid(), kind: 'col', column: tableMap[e.target.value]?.[0] || '' }] })} style={{ ...selectStyle, width: '100%' }}>
                              {tables.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                            </select>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: '#8a8e98', marginBottom: 4 }}>Mise en page</div>
                            <select value={part.layout} onChange={e => updatePart(part.id, { layout: e.target.value })} style={{ ...selectStyle, width: '100%' }}>
                              {LAYOUTS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                            </select>
                          </div>
                          <div style={{ width: 88 }}>
                            <div style={{ fontSize: 11, color: '#8a8e98', marginBottom: 4 }}>Espace (px)</div>
                            <input type="number" min="0" value={part.gap ?? 0} onChange={e => updatePart(part.id, { gap: e.target.value })}
                              disabled={part.layout === 'inline'} style={{ ...inputStyle, width: '100%', opacity: part.layout === 'inline' ? 0.4 : 1 }} />
                          </div>
                        </div>

                        <div style={{ fontSize: 11, color: '#8a8e98', marginBottom: 6 }}>Rendu de chaque entrée</div>
                        <div style={{ background: '#1a1a1f', border: '1px solid #2f2f38', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {part.template.map(it => (
                            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ fontSize: 10.5, color: '#6f737d', width: 42, flexShrink: 0 }}>{it.kind === 'text' ? 'texte' : 'champ'}</span>
                              {it.kind === 'text' ? (
                                <input value={it.value} onChange={e => updateLoopItem(part.id, it.id, { value: e.target.value })} placeholder="séparateur / texte…" style={{ ...inputStyle, flex: 1, height: 28 }} />
                              ) : (
                                <select value={it.column} onChange={e => updateLoopItem(part.id, it.id, { column: e.target.value })} style={{ ...selectStyle, flex: 1, height: 28 }}>
                                  {(tableMap[part.table] || []).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              )}
                              <StyleToggles item={it} onChange={patch => updateLoopItem(part.id, it.id, patch)} />
                              <button onClick={() => removeLoopItem(part.id, it.id)} style={{ ...iconBtn, color: '#f87171' }}>✕</button>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                            <button onClick={() => addLoopItem(part.id, 'col')} style={{ ...smallBtn, height: 26 }}>+ Champ</button>
                            <button onClick={() => addLoopItem(part.id, 'text')} style={{ ...smallBtn, height: 26 }}>+ Texte</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ flexShrink: 0, borderTop: '1px solid #2a2a31', padding: '12px 18px', background: '#19191e', maxHeight: 160, overflowY: 'auto' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.6px', color: '#6f737d', marginBottom: 8 }}>Aperçu (structure)</div>
              <div style={{ fontSize: 12.5, color: '#cdd0d8', lineHeight: 1.6 }}>
                {preview.length === 0 ? <span style={{ color: '#6f737d' }}>—</span> : preview.map((seg, i) => {
                  if (seg.type === 'inline') return <span key={i} dangerouslySetInnerHTML={{ __html: seg.html }} />
                  if (seg.type === 'lines') return <div key={i}>{seg.rows.map((r, j) => <div key={j} style={{ marginBottom: seg.gap }} dangerouslySetInnerHTML={{ __html: r }} />)}</div>
                  return <ul key={i} style={{ margin: '4px 0', paddingLeft: 20, listStyle: 'disc' }}>{seg.rows.map((r, j) => <li key={j} style={{ marginBottom: seg.gap }} dangerouslySetInnerHTML={{ __html: r }} />)}</ul>
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, padding: '14px 22px', borderTop: '1px solid #2a2a31', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ height: 38, padding: '0 16px', background: 'transparent', border: '1px solid #34343d', borderRadius: 9, color: '#cfcfd6', cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}>Annuler</button>
          <button onClick={handleSave} disabled={!canSave} style={{ height: 38, padding: '0 18px', background: canSave ? '#4f8cff' : '#2c3a55', border: 'none', borderRadius: 9, color: canSave ? '#fff' : '#7c8aa5', cursor: canSave ? 'pointer' : 'not-allowed', fontSize: 13.5, fontWeight: 600 }}>
            {editing ? 'Mettre à jour' : 'Enregistrer la variable'}
          </button>
        </div>
      </div>
    </div>
  )
}
