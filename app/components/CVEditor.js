'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/utils/api'
import CVVariableBuilder from './CVVariableBuilder'

const VARS_STORAGE_KEY = 'cv_user_variables_v1'

function encodeVar(def) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(def)))) } catch { return '' }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const FONTS = [
  { name: 'Inter', css: 'Inter, sans-serif' },
  { name: 'Arial', css: 'Arial, sans-serif' },
  { name: 'Helvetica', css: 'Helvetica, Arial, sans-serif' },
  { name: 'Georgia', css: 'Georgia, serif' },
  { name: 'Times New Roman', css: '"Times New Roman", serif' },
  { name: 'Courier New', css: '"Courier New", monospace' },
  { name: 'Verdana', css: 'Verdana, sans-serif' },
]
const SIZES = [9, 10, 11, 12, 14, 16, 18, 24, 32, 48]
const COLORS = ['#ffffff','#c7ccd6','#9aa0ab','#5c6270','#4f8cff','#5fd0c6','#6ee7b7','#facc15','#fb923c','#f87171','#f472b6','#a78bfa']
const ZOOMS = [50, 75, 100, 125, 150]

const STYLE_MAP = { h1: 'Titre 1', h2: 'Titre 2', h3: 'Sous-titre' }

function chip(val) {
  return `<span contenteditable="false" data-var="1" style="display:inline-block;padding:1px 8px;margin:0 1px;border-radius:6px;background:rgba(79,140,255,0.15);color:#9cc0ff;font-weight:500;white-space:nowrap;box-shadow:inset 0 0 0 1px rgba(79,140,255,0.32);">${val}</span>`
}

const INITIAL_HTML =
  '<div style="text-align:center;">' +
    '<h1>' + chip('TEKO FABRICE FOLLY') + '</h1>' +
    '<p style="text-align:center;color:#b9bcc6;font-size:12.5pt;margin:0 0 16px;">' + chip('Développeur Web et Mobile full-stack') + '</p>' +
    '<div style="text-align:center;color:#aeb2bd;font-size:10.5pt;line-height:1.95;">' +
      'Âge : ' + chip('26 ans') + ' &nbsp;·&nbsp; Email : ' + chip('tekofabricefolly@gmail.com') + '<br>' +
      'Téléphone : ' + chip('+33 7 45 17 88 05') + ' &nbsp;·&nbsp; Portfolio : ' + chip('teko-portfolio.dev') + '<br>' +
      'GitHub : ' + chip('github.com/Teko13') + ' &nbsp;·&nbsp; LinkedIn : ' + chip('linkedin.com/in/teko-fabrice-folly') +
    '</div>' +
  '</div>' +
  '<hr>' +
  '<h2>Résumé professionnel</h2>' +
  '<p>Développeur web et mobile, je conçois des projets de bout en bout avec une approche autonome et structurée. Ma soif d’apprendre me pousse à explorer sans cesse de nouvelles technologies et à affiner mes pratiques. Je privilégie des solutions claires, performantes et sécurisées, en gardant toujours l’expérience utilisateur au centre.</p>' +
  '<h2>Compétences techniques</h2>' +
  '<h3>Développement web full-stack</h3>' +
  '<p>Création d’applications web et de sites complets, du design utilisateur jusqu’à la logique serveur. Stack : React.js, Next.js, Node.js, JavaScript, PHP, Symfony.</p>' +
  '<h3>Développement mobile</h3>' +
  '<p>Applications cross-platform avec React Native et Expo, intégration d’API et publication sur les stores.</p>' +
  '<h2>Projets récents</h2>' +
  '<ul><li>Portfolio CMS — plateforme de gestion de contenu personnelle (Next.js, Supabase).</li><li>CertiScan — vérification de documents administratifs via codes QR 2D-Doc.</li></ul>' +
  '<h2>Formation</h2>' +
  '<p>Titre professionnel Concepteur Développeur d’Applications — 2024.</p>'

// Separator component
function Sep() {
  return <div style={{ width: 1, height: 22, background: '#33333c', margin: '0 6px', flexShrink: 0 }} />
}

// Toolbar button component
function TBtn({ title, onClick, onMouseDown, children, active, style: extraStyle }) {
  return (
    <button
      title={title}
      onMouseDown={onMouseDown || ((e) => e.preventDefault())}
      onClick={onClick}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(79,140,255,0.22)' : 'transparent',
        border: 'none', borderRadius: 7,
        color: active ? '#9cc0ff' : '#cfcfd6',
        cursor: 'pointer', flexShrink: 0, padding: 0,
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}

export default function CVEditor() {
  const router = useRouter()
  const editorRef = useRef(null)
  const pageWrapRef = useRef(null)
  const linkInputRef = useRef(null)
  const imgInputRef = useRef(null)
  const savedRangeRef = useRef(null)
  const lastRangeRef = useRef(null)
  const toastTimerRef = useRef(null)

  const [menu, setMenu] = useState(null)
  const [styleLabel, setStyleLabel] = useState('Texte normal')
  const [fontLabel, setFontLabel] = useState('Inter')
  const [sizeLabel, setSizeLabel] = useState('11')
  const [curColor, setCurColor] = useState('#e6e6ea')
  const [zoom, setZoom] = useState(100)
  const [showDone, setShowDone] = useState(false)
  const [saveMain, setSaveMain] = useState(true)
  const [toast, setToast] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedPdfUrl, setSavedPdfUrl] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [draftStatus, setDraftStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'

  // Variable builder
  const [schemaTables, setSchemaTables] = useState([])
  const [userVars, setUserVars] = useState([])
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingVar, setEditingVar] = useState(null)

  // Active format states for toolbar
  const [fmtBold, setFmtBold] = useState(false)
  const [fmtItalic, setFmtItalic] = useState(false)
  const [fmtUnderline, setFmtUnderline] = useState(false)
  const [fmtAlignLeft, setFmtAlignLeft] = useState(false)
  const [fmtAlignCenter, setFmtAlignCenter] = useState(false)
  const [fmtAlignRight, setFmtAlignRight] = useState(false)
  const [fmtBullet, setFmtBullet] = useState(false)
  const [fmtNumbered, setFmtNumbered] = useState(false)

  // Load DB schema (tables + columns) for the variable builder
  useEffect(() => {
    async function loadSchema() {
      try {
        const res = await fetch('/api/cv/schema')
        const json = await res.json()
        if (json.success) setSchemaTables(json.tables || [])
      } catch {}
    }
    loadSchema()
  }, [])

  // Load saved variables from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VARS_STORAGE_KEY)
      if (raw) setUserVars(JSON.parse(raw))
    } catch {}
  }, [])

  const persistVars = useCallback((next) => {
    setUserVars(next)
    try { localStorage.setItem(VARS_STORAGE_KEY, JSON.stringify(next)) } catch {}
  }, [])

  const saveVariable = useCallback((def) => {
    persistVars((() => {
      const exists = userVars.some(v => v.id === def.id)
      return exists ? userVars.map(v => v.id === def.id ? def : v) : [...userVars, def]
    })())
    setBuilderOpen(false)
    setEditingVar(null)
  }, [userVars, persistVars])

  const deleteVariable = useCallback((id) => {
    persistVars(userVars.filter(v => v.id !== id))
  }, [userVars, persistVars])

  const restoreLastRange = useCallback(() => {
    const r = lastRangeRef.current
    editorRef.current?.focus()
    if (r) { const s = window.getSelection(); s.removeAllRanges(); s.addRange(r) }
  }, [])

  // Insert a variable: resolve it with real data, render it formatted, with a "dynamic" signature.
  // The definition is kept in data-cv-var so it is re-resolved at save/PDF time.
  const insertUserVar = useCallback(async (def) => {
    restoreLastRange()
    let inner = ''
    try {
      const res = await fetch('/api/cv/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ def }),
      })
      const json = await res.json()
      inner = json.html || ''
    } catch {}

    const enc = encodeVar(def)
    const safeName = escapeHtml(def.name)
    const isBlock = (def.parts || []).some(p => p.kind === 'loop' && p.layout !== 'inline')
    const display = isBlock ? 'block' : 'inline-block'
    const sig = `<span contenteditable="false" style="position:absolute;top:-9px;right:8px;display:inline-flex;align-items:center;gap:3px;padding:1px 7px;border-radius:10px;background:#1d1d22;border:1px solid rgba(94,208,150,0.45);color:#8fe0b4;font-size:9px;font-weight:600;line-height:1.5;white-space:nowrap;user-select:none;">⚡ ${safeName}</span>`
    const body = inner || '<span style="color:#8a8e98;">(aucune donnée)</span>'
    const block = `<cv-var contenteditable="false" data-var="1" data-cv-var="${enc}" title="Variable dynamique : ${safeName}" style="display:${display};position:relative;${isBlock ? 'margin:10px 0;' : 'margin:0 2px;'}padding:7px 10px;border-left:2px solid #5ed096;background:rgba(94,208,150,0.07);border-radius:4px;vertical-align:top;">${sig}${body}</cv-var>`

    restoreLastRange()
    document.execCommand('insertHTML', false, block + (isBlock ? '<p><br></p>' : ' '))
    lastRangeRef.current = null
  }, [restoreLastRange])

  // Charge le brouillon sauvegardé (ou le contenu par défaut) UNE SEULE FOIS au montage.
  // contentEditable non contrôlé : sans ce garde, React réécraserait le contenu édité.
  useEffect(() => {
    let cancelled = false
    async function loadDraft() {
      let html = INITIAL_HTML
      try {
        const res = await fetch('/api/cv/draft')
        const json = await res.json()
        if (json?.html) html = json.html
      } catch {}
      const ed = editorRef.current
      if (!cancelled && ed && !ed.dataset.initialized) {
        ed.innerHTML = html
        ed.dataset.initialized = '1'
      }
    }
    loadDraft()
    return () => { cancelled = true }
  }, [])

  // Apply zoom
  useEffect(() => {
    if (pageWrapRef.current) {
      pageWrapRef.current.style.transform = `scale(${zoom / 100})`
      pageWrapRef.current.style.transformOrigin = 'top center'
    }
  }, [zoom])

  // Selection change → update toolbar state
  const updateActive = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    try {
      setFmtBold(document.queryCommandState('bold'))
      setFmtItalic(document.queryCommandState('italic'))
      setFmtUnderline(document.queryCommandState('underline'))
      setFmtAlignLeft(document.queryCommandState('justifyLeft'))
      setFmtAlignCenter(document.queryCommandState('justifyCenter'))
      setFmtAlignRight(document.queryCommandState('justifyRight'))
      setFmtBullet(document.queryCommandState('insertUnorderedList'))
      setFmtNumbered(document.queryCommandState('insertOrderedList'))
      const b = (document.queryCommandValue('formatBlock') || '').toLowerCase()
      setStyleLabel(STYLE_MAP[b] || 'Texte normal')
    } catch {}
  }, [])

  useEffect(() => {
    const onSel = () => {
      const s = window.getSelection()
      if (s?.anchorNode && editorRef.current?.contains(s.anchorNode)) {
        if (s.rangeCount) lastRangeRef.current = s.getRangeAt(0).cloneRange()
        updateActive()
      }
    }
    const onDoc = (e) => {
      if (menu && !e.target.closest('[data-menu]')) setMenu(null)
    }
    document.addEventListener('selectionchange', onSel)
    document.addEventListener('mousedown', onDoc)
    return () => {
      document.removeEventListener('selectionchange', onSel)
      document.removeEventListener('mousedown', onDoc)
    }
  }, [menu, updateActive])

  const exec = useCallback((cmd, val) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    updateActive()
  }, [updateActive])

  const saveRange = useCallback(() => {
    const s = window.getSelection()
    if (s?.rangeCount) savedRangeRef.current = s.getRangeAt(0).cloneRange()
  }, [])

  const restoreRange = useCallback(() => {
    if (savedRangeRef.current) {
      const s = window.getSelection()
      s.removeAllRanges()
      s.addRange(savedRangeRef.current)
    }
  }, [])

  const applyStyle = useCallback((styleObj) => {
    const sel = window.getSelection()
    if (!sel?.rangeCount) return
    const range = sel.getRangeAt(0)
    if (range.collapsed) return
    const span = document.createElement('span')
    Object.assign(span.style, styleObj)
    try { range.surroundContents(span) }
    catch { const frag = range.extractContents(); span.appendChild(frag); range.insertNode(span) }
    const r = document.createRange()
    r.selectNodeContents(span)
    sel.removeAllRanges()
    sel.addRange(r)
  }, [])

  const setBlock = useCallback((tag, label) => {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, tag)
    setStyleLabel(label)
    setMenu(null)
    updateActive()
  }, [updateActive])

  const applyFontSize = useCallback((px) => {
    editorRef.current?.focus()
    applyStyle({ fontSize: px + 'px' })
    setSizeLabel(String(px))
    setMenu(null)
  }, [applyStyle])

  const applyFont = useCallback((css, name) => {
    editorRef.current?.focus()
    applyStyle({ fontFamily: css })
    setFontLabel(name)
    setMenu(null)
  }, [applyStyle])

  const applyColor = useCallback((c) => {
    editorRef.current?.focus()
    document.execCommand('styleWithCSS', false, true)
    document.execCommand('foreColor', false, c)
    setCurColor(c)
    setMenu(null)
  }, [])


  const applyLink = useCallback(() => {
    const u = linkInputRef.current?.value.trim()
    restoreRange()
    editorRef.current?.focus()
    if (u) {
      const sel = window.getSelection()
      if (sel?.rangeCount && !sel.getRangeAt(0).collapsed) document.execCommand('createLink', false, u)
      else document.execCommand('insertHTML', false, `<a href="${u}">${u}</a>`)
    }
    setMenu(null)
  }, [restoreRange])

  const applyImage = useCallback(() => {
    const u = imgInputRef.current?.value.trim()
    restoreRange()
    editorRef.current?.focus()
    const html = u
      ? `<img src="${u}" style="max-width:100%;border-radius:5px;margin:6px 0;">`
      : `<div contenteditable="false" style="height:150px;display:flex;align-items:center;justify-content:center;background:repeating-linear-gradient(45deg,#26262d,#26262d 10px,#222228 10px,#222228 20px);border:1px solid #34343d;border-radius:7px;color:#8a8e98;font-family:monospace;font-size:12px;margin:6px 0;">image · glissez votre fichier</div>`
    document.execCommand('insertHTML', false, html)
    setMenu(null)
  }, [restoreRange])

  // Make non-editable variable chips deletable with Backspace/Delete
  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Delete') return
    const sel = window.getSelection()
    if (!sel || !sel.isCollapsed || !sel.rangeCount) return
    const { startContainer, startOffset } = sel.getRangeAt(0)
    const isChip = (n) => n && n.nodeType === 1 && n.getAttribute && n.getAttribute('data-var') === '1'

    let target = null
    if (e.key === 'Backspace') {
      if (startContainer.nodeType === 1) target = startContainer.childNodes[startOffset - 1]
      else if (startOffset === 0) target = startContainer.previousSibling
    } else {
      if (startContainer.nodeType === 1) target = startContainer.childNodes[startOffset]
      else if (startOffset === startContainer.length) target = startContainer.nextSibling
    }
    if (isChip(target)) {
      e.preventDefault()
      target.remove()
    }
  }, [])

  // Sauvegarde manuelle du brouillon (persistance de la saisie, sans génération de PDF)
  const handleSaveDraft = useCallback(async () => {
    setDraftStatus('saving')
    try {
      const html = editorRef.current?.innerHTML || ''
      await api.post('/api/cv/draft', { html })
      setDraftStatus('saved')
    } catch (e) {
      console.error('Erreur sauvegarde brouillon:', e)
      setDraftStatus('error')
    }
  }, [])

  // Ctrl/Cmd+S → sauvegarde le brouillon
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleSaveDraft()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleSaveDraft])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveError('')
    try {
      const html = editorRef.current?.innerHTML || ''
      const json = await api.post('/api/cv/save-html', { html, saveAsMain: saveMain })
      if (json?.pdfUrl) {
        // Redirection automatique vers le nouveau PDF généré
        window.location.href = json.pdfUrl
        return
      }
      setShowDone(false)
      setToast(true)
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(false), 7000)
    } catch (e) {
      console.error('Erreur sauvegarde CV:', e)
      setSaveError('Échec de la génération du PDF. Vérifiez votre connexion et réessayez.')
    } finally {
      setSaving(false)
    }
  }, [saveMain])

  const toggleMenu = useCallback((name) => {
    setMenu(prev => prev === name ? null : name)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .cv-editor-page { font-family: Inter, Arial, sans-serif; color: #e6e6ea; font-size: 11pt; line-height: 1.62; caret-color: #4f8cff; }
        .cv-editor-page h1 { font-size: 25pt; font-weight: 800; text-align: center; letter-spacing: .4px; color: #fff; margin: 0 0 4px; }
        .cv-editor-page h2 { font-size: 13pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #fff; border-bottom: 1px solid #3a3a44; padding-bottom: 6px; margin: 24px 0 12px; }
        .cv-editor-page h3 { font-size: 11.5pt; font-weight: 600; color: #cdd0d8; margin: 14px 0 4px; }
        .cv-editor-page p { margin: 0 0 10px; }
        .cv-editor-page ul, .cv-editor-page ol { padding-left: 22px; margin: 0 0 10px; }
        .cv-editor-page li { margin: 0 0 5px; }
        .cv-editor-page a { color: #7fb0ff; }
        .cv-editor-page hr { border: none; border-top: 1px solid #3a3a44; margin: 18px 0; }
        .cv-editor-page:focus { outline: none; }
        .cv-ed-scroll::-webkit-scrollbar { width: 12px; }
        .cv-ed-scroll::-webkit-scrollbar-thumb { background: #2c2c34; border-radius: 8px; border: 3px solid #141417; }
        .cv-tb-scroll { scrollbar-width: none; }
        .cv-tb-scroll::-webkit-scrollbar { height: 0; }
        .cv-hover:hover { background: rgba(255,255,255,0.07) !important; }
        .cv-menu-item:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#141417', fontFamily: 'Inter, Arial, sans-serif', color: '#e6e6ea', WebkitFontSmoothing: 'antialiased', zIndex: 1000 }}>

        {/* ── Top bar ── */}
        <div style={{ height: 54, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#1b1b20', borderBottom: '1px solid #2a2a31' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <button
              onClick={() => router.push('/dashboard/portfolio')}
              title="Quitter"
              className="cv-hover"
              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#23232a', border: '1px solid #313139', borderRadius: 9, color: '#cfcfd6', cursor: 'pointer', flexShrink: 0 }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/><path d="M20 12H9"/><path d="M16 8l4 4-4 4"/></svg>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7fb0ff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: '#f1f1f4', whiteSpace: 'nowrap' }}>CV — Teko Fabrice Folly</span>
              </div>
              <span style={{ fontSize: 11.5, color: draftStatus === 'error' ? '#f87171' : draftStatus === 'saved' ? '#8fe0b4' : '#7c7c86', marginLeft: 25 }}>
                {draftStatus === 'saving' ? 'Enregistrement du brouillon…'
                  : draftStatus === 'saved' ? 'Brouillon enregistré'
                  : draftStatus === 'error' ? 'Échec de l’enregistrement'
                  : 'Brouillon — pensez à enregistrer'}
              </span>
            </div>
          </div>
          <button
            onClick={() => { setMenu(null); setShowDone(true) }}
            className="cv-hover"
            style={{ height: 36, padding: '0 18px', display: 'flex', alignItems: 'center', gap: 8, background: '#4f8cff', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            Terminé
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="cv-tb-scroll" style={{ height: 50, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2, padding: '0 12px', background: '#1b1b20', borderBottom: '1px solid #2a2a31', overflow: 'visible' }}>

          {/* Undo / Redo */}
          <TBtn title="Annuler (Ctrl+Z)" onClick={() => exec('undo')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 8L3 12l4 4"/><path d="M3 12h12a5 5 0 0 1 0 10h-1"/></svg>
          </TBtn>
          <TBtn title="Rétablir (Ctrl+Y)" onClick={() => exec('redo')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8l4 4-4 4"/><path d="M21 12H9a5 5 0 0 0 0 10h1"/></svg>
          </TBtn>

          <Sep />

          {/* Spellcheck */}
          <TBtn title="Vérifier l'orthographe" onClick={() => {
            const ed = editorRef.current
            if (ed) { const ns = !ed.spellcheck; ed.spellcheck = ns; ed.setAttribute('spellcheck', String(ns)); ed.blur(); ed.focus() }
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-10 4 10"/><path d="M4.2 14h5.6"/><path d="M13.5 18.5l2.5 2.5 5-5"/></svg>
          </TBtn>

          <Sep />

          {/* Enregistrer le brouillon (sauvegarde manuelle, sans PDF) */}
          <button onMouseDown={e => e.preventDefault()} onClick={handleSaveDraft} title="Enregistrer le brouillon (Ctrl/Cmd+S)"
            className="cv-hover"
            disabled={draftStatus === 'saving'}
            style={{ height: 32, display: 'flex', alignItems: 'center', gap: 6, padding: '0 11px', flexShrink: 0, background: 'transparent', border: '1px solid #2f2f38', borderRadius: 7, color: '#dcdce2', cursor: draftStatus === 'saving' ? 'default' : 'pointer', fontSize: 12.5, fontWeight: 500 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
            {draftStatus === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
          </button>

          <Sep />

          {/* Text style */}
          <div data-menu style={{ position: 'relative', flexShrink: 0 }}>
            <button onMouseDown={e => e.preventDefault()} onClick={() => toggleMenu('style')} title="Style de texte"
              className="cv-hover"
              style={{ height: 32, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', minWidth: 108, justifyContent: 'space-between', background: 'transparent', border: 'none', borderRadius: 7, color: '#dcdce2', cursor: 'pointer', fontSize: 13 }}>
              <span>{styleLabel}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {menu === 'style' && (
              <div style={{ position: 'absolute', top: 38, left: 0, zIndex: 60, background: '#23232a', border: '1px solid #34343d', borderRadius: 11, boxShadow: '0 14px 38px rgba(0,0,0,0.55)', padding: 6, minWidth: 210 }}>
                {[['P','Texte normal',13.5,'#dcdce2',400,'none',0],['H1','Titre 1',21,'#fff',800,'none',0],['H2','Titre 2',16,'#fff',700,'uppercase',0.5],['H3','Sous-titre',14,'#cdd0d8',600,'none',0]].map(([tag, label, sz, col, wt, tt, ls]) => (
                  <div key={tag} onMouseDown={e => e.preventDefault()} onClick={() => setBlock(tag, label)}
                    className="cv-menu-item"
                    style={{ padding: '9px 11px', borderRadius: 8, cursor: 'pointer', color: col, fontSize: sz, fontWeight: wt, textTransform: tt, letterSpacing: ls }}>
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Sep />

          {/* Font */}
          <div data-menu style={{ position: 'relative', flexShrink: 0 }}>
            <button onMouseDown={e => e.preventDefault()} onClick={() => toggleMenu('font')} title="Police de caractère"
              className="cv-hover"
              style={{ height: 32, display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', minWidth: 128, justifyContent: 'space-between', background: 'transparent', border: 'none', borderRadius: 7, color: '#dcdce2', cursor: 'pointer', fontSize: 13 }}>
              <span>{fontLabel}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {menu === 'font' && (
              <div style={{ position: 'absolute', top: 38, left: 0, zIndex: 60, background: '#23232a', border: '1px solid #34343d', borderRadius: 11, boxShadow: '0 14px 38px rgba(0,0,0,0.55)', padding: 6, minWidth: 190, maxHeight: 300, overflowY: 'auto' }}>
                {FONTS.map(f => (
                  <div key={f.name} onMouseDown={e => e.preventDefault()} onClick={() => applyFont(f.css, f.name)}
                    className="cv-menu-item"
                    style={{ padding: '9px 11px', borderRadius: 8, cursor: 'pointer', color: '#dcdce2', fontSize: 14, fontFamily: f.css }}>
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Sep />

          {/* Font size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <TBtn title="Réduire" onClick={() => applyFontSize(Math.max(6, (parseInt(sizeLabel) || 11) - 1))} style={{ width: 28, fontSize: 18 }}>−</TBtn>
            <div data-menu style={{ position: 'relative' }}>
              <button onMouseDown={e => e.preventDefault()} onClick={() => toggleMenu('size')} title="Taille de police"
                className="cv-hover"
                style={{ width: 44, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#202027', border: '1px solid #2f2f38', borderRadius: 7, color: '#e6e6ea', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                {sizeLabel}
              </button>
              {menu === 'size' && (
                <div style={{ position: 'absolute', top: 38, left: 0, zIndex: 60, background: '#23232a', border: '1px solid #34343d', borderRadius: 11, boxShadow: '0 14px 38px rgba(0,0,0,0.55)', padding: 6, minWidth: 70, maxHeight: 260, overflowY: 'auto' }}>
                  {SIZES.map(s => (
                    <div key={s} onMouseDown={e => e.preventDefault()} onClick={() => applyFontSize(s)}
                      className="cv-menu-item"
                      style={{ padding: '7px 12px', borderRadius: 7, cursor: 'pointer', color: '#dcdce2', fontSize: 13.5, textAlign: 'center' }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <TBtn title="Agrandir" onClick={() => applyFontSize(Math.min(96, (parseInt(sizeLabel) || 11) + 1))} style={{ width: 28, fontSize: 18 }}>+</TBtn>
          </div>

          <Sep />

          {/* Bold / Italic / Underline */}
          <TBtn title="Gras (Ctrl+B)" onClick={() => exec('bold')} active={fmtBold} style={{ fontSize: 15, fontWeight: 800 }}>B</TBtn>
          <TBtn title="Italique (Ctrl+I)" onClick={() => exec('italic')} active={fmtItalic} style={{ fontSize: 15, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>I</TBtn>
          <TBtn title="Souligné (Ctrl+U)" onClick={() => exec('underline')} active={fmtUnderline} style={{ fontSize: 15, textDecoration: 'underline' }}>U</TBtn>

          {/* Text color */}
          <div data-menu style={{ position: 'relative', flexShrink: 0 }}>
            <TBtn title="Couleur du texte" onClick={() => toggleMenu('color')} style={{ width: 34, flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>A</span>
              <span style={{ width: 18, height: 3, borderRadius: 2, background: curColor }} />
            </TBtn>
            {menu === 'color' && (
              <div style={{ position: 'absolute', top: 38, left: 0, zIndex: 60, background: '#23232a', border: '1px solid #34343d', borderRadius: 11, boxShadow: '0 14px 38px rgba(0,0,0,0.55)', padding: 10, width: 176 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 7 }}>
                  {COLORS.map(c => (
                    <div key={c} onMouseDown={e => e.preventDefault()} onClick={() => applyColor(c)} title={c}
                      style={{ width: 22, height: 22, borderRadius: 6, cursor: 'pointer', background: c, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Sep />

          {/* Link */}
          <div data-menu style={{ position: 'relative', flexShrink: 0 }}>
            <TBtn title="Insérer un lien" onClick={() => { saveRange(); toggleMenu('link') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>
            </TBtn>
            {menu === 'link' && (
              <div style={{ position: 'absolute', top: 38, left: 0, zIndex: 60, background: '#23232a', border: '1px solid #34343d', borderRadius: 11, boxShadow: '0 14px 38px rgba(0,0,0,0.55)', padding: 12, width: 280 }}>
                <div style={{ fontSize: 12, color: '#8a8e98', marginBottom: 7 }}>Insérer un lien</div>
                <input ref={linkInputRef} placeholder="https://exemple.com"
                  style={{ width: '100%', height: 34, padding: '0 10px', background: '#1a1a1f', border: '1px solid #34343d', borderRadius: 8, color: '#e6e6ea', fontSize: 13, outline: 'none', fontFamily: 'Inter', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                  <button onClick={() => setMenu(null)} className="cv-hover" style={{ height: 30, padding: '0 12px', background: 'transparent', border: 'none', borderRadius: 7, color: '#aeb2bd', cursor: 'pointer', fontSize: 12.5 }}>Annuler</button>
                  <button onClick={applyLink} style={{ height: 30, padding: '0 14px', background: '#4f8cff', border: 'none', borderRadius: 7, color: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>Appliquer</button>
                </div>
              </div>
            )}
          </div>

          {/* Image */}
          <div data-menu style={{ position: 'relative', flexShrink: 0 }}>
            <TBtn title="Insérer une image" onClick={() => { saveRange(); toggleMenu('image') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 16l-5-5L5 21"/></svg>
            </TBtn>
            {menu === 'image' && (
              <div style={{ position: 'absolute', top: 38, left: 0, zIndex: 60, background: '#23232a', border: '1px solid #34343d', borderRadius: 11, boxShadow: '0 14px 38px rgba(0,0,0,0.55)', padding: 12, width: 280 }}>
                <div style={{ fontSize: 12, color: '#8a8e98', marginBottom: 7 }}>Insérer une image (URL)</div>
                <input ref={imgInputRef} placeholder="https://… ou laisser vide"
                  style={{ width: '100%', height: 34, padding: '0 10px', background: '#1a1a1f', border: '1px solid #34343d', borderRadius: 8, color: '#e6e6ea', fontSize: 13, outline: 'none', fontFamily: 'Inter', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                  <button onClick={() => setMenu(null)} className="cv-hover" style={{ height: 30, padding: '0 12px', background: 'transparent', border: 'none', borderRadius: 7, color: '#aeb2bd', cursor: 'pointer', fontSize: 12.5 }}>Annuler</button>
                  <button onClick={applyImage} style={{ height: 30, padding: '0 14px', background: '#4f8cff', border: 'none', borderRadius: 7, color: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>Insérer</button>
                </div>
              </div>
            )}
          </div>

          <Sep />

          {/* Alignment */}
          <TBtn title="Aligner à gauche" onClick={() => exec('justifyLeft')} active={fmtAlignLeft}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M4 12h10M4 18h13"/></svg>
          </TBtn>
          <TBtn title="Centrer" onClick={() => exec('justifyCenter')} active={fmtAlignCenter}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M7 12h10M5 18h14"/></svg>
          </TBtn>
          <TBtn title="Aligner à droite" onClick={() => exec('justifyRight')} active={fmtAlignRight}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M10 12h10M7 18h13"/></svg>
          </TBtn>

          <Sep />

          {/* Lists */}
          <TBtn title="Liste à puces" onClick={() => exec('insertUnorderedList')} active={fmtBullet}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none"/><path d="M9 6h11M9 12h11M9 18h11"/></svg>
          </TBtn>
          <TBtn title="Liste numérotée" onClick={() => exec('insertOrderedList')} active={fmtNumbered}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 6h10M10 12h10M10 18h10"/><text x="2.5" y="8" fontSize="6.5" fill="currentColor" stroke="none" fontFamily="Inter">1</text><text x="2.5" y="14" fontSize="6.5" fill="currentColor" stroke="none" fontFamily="Inter">2</text><text x="2.5" y="20" fontSize="6.5" fill="currentColor" stroke="none" fontFamily="Inter">3</text></svg>
          </TBtn>

          <Sep />

          {/* Variables */}
          <button onMouseDown={e => e.preventDefault()} onClick={() => { setMenu(null); setEditingVar(null); setBuilderOpen(true) }} title="Créer une variable de la base de données"
            className="cv-hover"
            style={{ height: 32, display: 'flex', alignItems: 'center', gap: 7, padding: '0 11px', flexShrink: 0, background: 'rgba(79,140,255,0.12)', border: '1px solid rgba(79,140,255,0.3)', borderRadius: 7, color: '#9cc0ff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4H8a3 3 0 0 0-3 3v2a2 2 0 0 1-2 2 2 2 0 0 1 2 2v2a3 3 0 0 0 3 3h1"/><path d="M15 4h1a3 3 0 0 1 3 3v2a2 2 0 0 0 2 2 2 2 0 0 0-2 2v2a3 3 0 0 1-3 3h-1"/></svg>
            Variables
          </button>

          <div style={{ flex: 1, minWidth: 14 }} />

          {/* Zoom */}
          <div data-menu style={{ position: 'relative', flexShrink: 0 }}>
            <button onMouseDown={e => e.preventDefault()} onClick={() => toggleMenu('zoom')} title="Zoom"
              className="cv-hover"
              style={{ height: 32, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', background: 'transparent', border: '1px solid #2f2f38', borderRadius: 7, color: '#cfcfd6', cursor: 'pointer', fontSize: 13 }}>
              <span>{zoom}%</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {menu === 'zoom' && (
              <div style={{ position: 'absolute', top: 38, right: 0, zIndex: 60, background: '#23232a', border: '1px solid #34343d', borderRadius: 11, boxShadow: '0 14px 38px rgba(0,0,0,0.55)', padding: 6, minWidth: 96 }}>
                {ZOOMS.map(z => (
                  <div key={z} onMouseDown={e => e.preventDefault()} onClick={() => { setZoom(z); setMenu(null) }}
                    className="cv-menu-item"
                    style={{ padding: '8px 12px', borderRadius: 7, cursor: 'pointer', color: '#dcdce2', fontSize: 13, textAlign: 'center' }}>
                    {z}%
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Editor area (left variables panel + document) ── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* Left: created variables */}
          <div className="cv-ed-scroll" style={{ width: 240, flexShrink: 0, background: '#17171b', borderRight: '1px solid #2a2a31', overflowY: 'auto', padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.6px', color: '#6f737d' }}>Mes variables</span>
              <button onClick={() => { setEditingVar(null); setBuilderOpen(true) }} title="Créer une variable"
                style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(79,140,255,0.14)', border: '1px solid rgba(79,140,255,0.3)', borderRadius: 6, color: '#9cc0ff', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>+</button>
            </div>

            {userVars.length === 0 ? (
              <div style={{ fontSize: 12, color: '#6f737d', lineHeight: 1.6, padding: '8px 4px' }}>
                Aucune variable.<br />Cliquez sur <span style={{ color: '#9cc0ff' }}>Variables</span> dans la barre d’outils pour en créer une.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {userVars.map(v => (
                  <div key={v.id} style={{ background: '#1f1f25', border: '1px solid #2f2f38', borderRadius: 9, padding: '10px 11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                      <span style={{ color: '#8fe0b4', fontSize: 12 }}>⚡</span>
                      <span style={{ fontSize: 13, color: '#e6e6ea', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onMouseDown={e => e.preventDefault()} onClick={() => insertUserVar(v)} title="Insérer dans le document"
                        style={{ flex: 1, height: 27, background: '#4f8cff', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 11.5, fontWeight: 600 }}>Insérer</button>
                      <button onClick={() => { setEditingVar(v); setBuilderOpen(true) }} title="Modifier"
                        style={{ width: 27, height: 27, background: '#23232a', border: '1px solid #34343d', borderRadius: 6, color: '#cfcfd6', cursor: 'pointer', fontSize: 12 }}>✎</button>
                      <button onClick={() => deleteVariable(v.id)} title="Supprimer"
                        style={{ width: 27, height: 27, background: '#23232a', border: '1px solid #34343d', borderRadius: 6, color: '#f87171', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document */}
          <div className="cv-ed-scroll" style={{ flex: 1, overflow: 'auto', background: '#141417', padding: '36px 0 90px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div ref={pageWrapRef} style={{ flexShrink: 0 }}>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck
                className="cv-editor-page"
                onKeyDown={handleKeyDown}
                onInput={() => setDraftStatus(s => (s === 'saved' || s === 'error') ? 'idle' : s)}
                style={{
                  width: 794,
                  minHeight: 1123,
                  boxSizing: 'border-box',
                  padding: '72px 80px',
                  background: '#1d1d22',
                  borderRadius: 3,
                  boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 26px 64px rgba(0,0,0,0.55)',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Terminé modal ── */}
        {showDone && (
          <div onClick={() => setShowDone(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(8,8,10,0.62)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 440, maxWidth: '100%', background: '#1e1e24', border: '1px solid #34343d', borderRadius: 16, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', padding: 26 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(79,140,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7fb0ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f3f3f5', marginBottom: 6 }}>Enregistrer ce CV ?</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#9a9aa3', marginBottom: 20 }}>Cette nouvelle version sera enregistrée et ajoutée à votre portfolio. Vous pourrez la modifier à tout moment.</div>
              <div onClick={() => setSaveMain(prev => !prev)}
                className="cv-hover"
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', border: '1px solid #34343d', borderRadius: 11, cursor: 'pointer', marginBottom: 22 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: saveMain ? '#4f8cff' : 'transparent', boxShadow: `inset 0 0 0 1.5px ${saveMain ? '#4f8cff' : '#4a4a54'}` }}>
                  {saveMain && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 13.5, color: '#e6e6ea', fontWeight: 500 }}>Définir comme mon CV principal</span>
                  <span style={{ fontSize: 11.5, color: '#7c7c86' }}>Affiché par défaut sur votre portfolio public</span>
                </div>
              </div>
              {saveError && (
                <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 9, color: '#f87171', fontSize: 12.5 }}>
                  {saveError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setShowDone(false)} className="cv-hover" style={{ height: 38, padding: '0 16px', background: 'transparent', border: '1px solid #34343d', borderRadius: 9, color: '#cfcfd6', cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}>Annuler</button>
                <button onClick={handleSave} disabled={saving} style={{ height: 38, padding: '0 18px', background: saving ? '#3a5fa8' : '#4f8cff', border: 'none', borderRadius: 9, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13.5, fontWeight: 600 }}>
                  {saving ? 'Enregistrement…' : 'Enregistrer sur mon portfolio'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast ── */}
        {toast && (
          <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', alignItems: 'center', gap: 11, padding: '13px 18px', background: '#1f1f25', border: '1px solid #34343d', borderRadius: 12, boxShadow: '0 16px 44px rgba(0,0,0,0.5)' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(94,208,150,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5ed096" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
            <span style={{ fontSize: 13.5, color: '#e6e6ea', fontWeight: 500 }}>CV enregistré sur votre portfolio</span>
            {savedPdfUrl && (
              <a href={savedPdfUrl} target="_blank" rel="noopener noreferrer"
                style={{ marginLeft: 6, fontSize: 13, color: '#7fb0ff', fontWeight: 600, textDecoration: 'none' }}>
                Voir le PDF →
              </a>
            )}
          </div>
        )}

        {/* ── Variable builder ── */}
        {builderOpen && (
          <CVVariableBuilder
            tables={schemaTables}
            editing={editingVar}
            onClose={() => { setBuilderOpen(false); setEditingVar(null) }}
            onSave={saveVariable}
          />
        )}
      </div>
    </>
  )
}
