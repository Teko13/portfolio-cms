// Résolution des variables dynamiques du CV contre les données réelles de la base.
// Partagé entre /api/cv/resolve (aperçu à l'insertion) et /api/cv/save-html (PDF final).

export const esc = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const escAttr = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')

export function decodeDef(b64) {
  try {
    const bin = Buffer.from(b64, 'base64').toString('binary')
    return JSON.parse(decodeURIComponent(escape(bin)))
  } catch {
    return null
  }
}

function collectTables(defs) {
  const set = new Set()
  for (const d of defs) {
    if (!d?.parts) continue
    for (const p of d.parts) {
      if (p.kind === 'field' || p.kind === 'loop') set.add(p.table)
    }
  }
  return set
}

async function fetchTables(tables, supabase) {
  const dataByTable = {}
  for (const t of tables) {
    const { data } = await supabase.from(t).select('*')
    let rows = data || []
    if (rows.length && 'index' in rows[0]) {
      rows = [...rows].sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    } else if (rows.length && 'cree_le' in rows[0]) {
      rows = [...rows].sort((a, b) => new Date(a.cree_le) - new Date(b.cree_le))
    }
    dataByTable[t] = rows
  }
  return dataByTable
}

// Détecte une date ISO (timestamp ou date) renvoyée par la base
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/

// Reformate une valeur date ISO en MM/AAAA ; laisse les autres valeurs intactes
function formatValue(raw) {
  if (typeof raw === 'string' && ISO_DATE_RE.test(raw.trim())) {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) {
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      return `${mm}/${d.getUTCFullYear()}`
    }
  }
  return raw
}

// Applique le style d'un élément (gras / italique / souligné / lien / à la ligne)
function applyStyle(rawValue, o = {}) {
  let v = esc(rawValue)
  if (o.link && rawValue != null && String(rawValue) !== '') {
    v = `<a href="${escAttr(rawValue)}" style="color:#2563eb;">${v}</a>`
  }
  if (o.bold) v = `<strong>${v}</strong>`
  if (o.italic) v = `<em>${v}</em>`
  if (o.underline) v = `<u>${v}</u>`
  if (o.newLine) v = `<div>${v}</div>`
  return v
}

function renderRow(tpl, row) {
  return tpl
    .map((it) => applyStyle(it.kind === 'text' ? it.value : formatValue(row?.[it.column]), it))
    .join('')
}

export function renderDef(def, dataByTable) {
  if (!def?.parts) return ''
  let out = ''
  for (const p of def.parts) {
    if (p.kind === 'text') {
      out += applyStyle(p.value, p)
    } else if (p.kind === 'field') {
      out += applyStyle(formatValue((dataByTable[p.table] || [])[0]?.[p.column]), p)
    } else if (p.kind === 'loop') {
      const gap = Number(p.gap) || 0
      const rendered = (dataByTable[p.table] || []).map((r) => renderRow(p.template, r))
      if (p.layout === 'inline') {
        out += rendered.join(', ')
      } else if (p.layout === 'lines') {
        out += rendered.map((r) => `<div style="margin-bottom:${gap}px;">${r}</div>`).join('')
      } else {
        out += `<ul style="list-style:disc;padding-left:22px;margin:6px 0;">` +
          rendered.map((r) => `<li style="margin-bottom:${gap}px;">${r}</li>`).join('') +
          `</ul>`
      }
    }
  }
  return out
}

// Résout une seule définition de variable → HTML rendu.
export async function resolveDef(def, supabase) {
  const dataByTable = await fetchTables(collectTables([def]), supabase)
  return renderDef(def, dataByTable)
}

// Remplace tous les blocs <cv-var data-cv-var="..."> du HTML par les données réelles.
export async function resolveVariablesInHtml(html, supabase) {
  const re = /<cv-var\b[^>]*data-cv-var="([^"]*)"[^>]*>[\s\S]*?<\/cv-var>/g
  const matches = [...html.matchAll(re)]
  if (matches.length === 0) return html

  const defs = matches.map((m) => decodeDef(m[1]))
  const dataByTable = await fetchTables(collectTables(defs), supabase)

  let i = 0
  return html.replace(re, () => renderDef(defs[i++], dataByTable))
}
