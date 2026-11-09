/**
 * dsh-boot-suite — 浏览器半侧（合并版）
 * ---------------------------------------------------------------------------
 * 由两个插件合并而来：
 *   · 开机动画  ← 原 dsh-startup-screen/lib/client.js（DSH 设置页「启动动画」）
 *   · 聊天壁纸  ← 原 dsh-chat-wallpaper/lib/client.js（DSH 设置页「聊天背景」）
 *
 * 两半各在自己的 IIFE 里跑，互不污染作用域；对外只注册 dsh-boot-suite 一个模块 id
 * （必须等于 bundle 行名，否则 ModuleLoader 会报 loaded without registering）。
 *
 * 执行顺序：开机动画先（它要在 DOM 里立起 #dsh-startup-root，壁纸半侧的起始闸门
 * 靠这个浮层判断"开机动画放完没有"）；导出合并顺序：壁纸先、开机动画后 ——
 * 壁纸半侧自己声明 inject: []，开机动画半侧要 inject: [slots]，后者必须赢。
 */
window.__ModuleLoader__.load({
  id: 'dsh-boot-suite',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    /* 第一段执行：开机动画（原 dsh-startup-screen）*/
    var __bootHalf = (function () {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var react = require('react')
    var h = react.createElement

    var API = '/dsh-startup/config'
    var STARTUP_ROUTE = '/dsh-startup'

    /* ── CSS ─────────────────────────────────────────────────────────────── */
    var CSS = [
      '.__ss_root{max-width:620px;display:flex;flex-direction:column;gap:14px;font-size:13px;color:var(--dsw-alias-label-primary)}',
      '.__ss_version{font-family:ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary)}',
      '.__ss_group{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:11px}',
      '.__ss_groupTitle{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary)}',
      '.__ss_field{display:flex;flex-direction:column;gap:5px}',
      '.__ss_label{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.__ss_hint{font-size:11px;line-height:1.55;color:var(--dsw-alias-label-tertiary)}',
      '.__ss_row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
      '.__ss_input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 10px;font-size:13px;box-sizing:border-box;width:100%;outline:none}',
      '.__ss_input:focus{border-color:var(--dsw-alias-state-business-primary)}',
      '.__ss_inputMono{font-family:ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:.06em}',
      '.__ss_select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 8px;font:inherit;font-size:13px;min-width:180px}',
      '.__ss_check{display:flex;align-items:flex-start;gap:8px;cursor:pointer}',
      '.__ss_check input{margin-top:2px;accent-color:var(--dsw-alias-state-business-primary)}',
      '.__ss_checkText{display:flex;flex-direction:column;gap:2px}',
      '.__ss_two{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.__ss_actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:2px}',
      '.__ss_btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font:inherit;font-size:13px;cursor:pointer}',
      '.__ss_btn:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}',
      '.__ss_btn:disabled{opacity:.5;cursor:default}',
      '.__ss_btnPrimary{border-color:var(--dsw-alias-state-business-primary,#3964fe);background:var(--dsw-alias-state-business-primary,#3964fe);color:#fff}',
      '.__ss_status{font-size:12px;color:var(--dsw-alias-label-tertiary)}',
      '.__ss_ok{font-size:12px;color:var(--dsw-alias-state-business-primary)}',
      '.__ss_link{font-size:12px;color:var(--dsw-alias-state-business-primary);text-decoration:none;border-bottom:1px dashed currentColor}',
      '.__ss_err{font-size:12px;color:var(--dsw-alias-state-error-primary,#f85149)}',
      '.__ss_swatch{width:38px;height:26px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;cursor:pointer}',
      '.__ss_preview{margin-top:2px;border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px}',
      '.__ss_previewText{font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:1.5}',
      '.__ss_selectWrap{position:relative;display:inline-block;min-width:180px;max-width:100%}',
      '.__ss_select{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;cursor:pointer;text-align:left}',
      '.__ss_select.is-open{border-color:var(--dsw-alias-state-business-primary)}',
      '.__ss_selectLabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.__ss_selectCaret{flex:none;opacity:.7;font-size:11px}',
      '.__ss_selectMenu{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:40;display:flex;flex-direction:column;gap:0;padding:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background-color:#1b1d22;background-image:linear-gradient(var(--dsw-alias-bg-overlay, rgba(22,23,27,.95)), var(--dsw-alias-bg-overlay, rgba(22,23,27,.95))),linear-gradient(var(--dsw-alias-bg-overlay, rgba(22,23,27,.95)), var(--dsw-alias-bg-overlay, rgba(22,23,27,.95)));backdrop-filter:blur(8px);box-shadow:0 10px 28px rgba(0,0,0,.45);max-height:280px;overflow:auto;box-sizing:border-box}',
      '.__ss_selectMenu.is-up{top:auto;bottom:calc(100% + 4px)}',
      '.__ss_selectItem{display:block;width:100%;text-align:left;border:none;background:transparent;color:var(--dsw-alias-label-primary);border-radius:6px;padding:6px 8px;font:inherit;font-size:13px;cursor:pointer}',
      '.__ss_selectItem:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.12))}',
      '.__ss_selectItem.is-on{color:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #e6762b));font-weight:600}'
    ].join('')
    var tagId = 'dsh-startup-screen/main.css'
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
      var tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-startup-screen'
      tag.dataset.pluginCss = tagId
      tag.textContent = CSS
      document.head.appendChild(tag)
    }

    /* ── 表单原子 ────────────────────────────────────────────────────────── */
    function Field(props) {
      return h('div', { className: '__ss_field' },
        h('label', { className: '__ss_label' }, props.label),
        props.children,
        props.hint ? h('div', { className: '__ss_hint' }, props.hint) : null
      )
    }

    function TextInput(props) {
      return h('input', {
        className: '__ss_input' + (props.mono ? ' __ss_inputMono' : ''),
        type: 'text',
        value: props.value == null ? '' : String(props.value),
        placeholder: props.placeholder || '',
        maxLength: props.maxLength || 64,
        spellCheck: false,
        onChange: (e) => props.onChange(e.target.value)
      })
    }

    function Select(props) {
      var openState = react.useState(false)
      var open = openState[0]
      var setOpen = openState[1]
      var upState = react.useState(false)
      var openUp = upState[0]
      var setOpenUp = upState[1]
      var wrapRef = react.useRef(null)
      var btnRef = react.useRef(null)
      var opts = props.options || []
      var cur = opts.find(function (o) { return String(o[0]) === String(props.value) }) || opts[0] || ['', '']
      var label = cur[1]

      function measure() {
        var el = btnRef.current
        if (!el) return
        var r = el.getBoundingClientRect()
        var topLimit = 8
        var bottomLimit = (window.innerHeight || 800) - 8
        var node = el.parentNode
        while (node && node.nodeType === 1 && node !== document.body) {
          var st = window.getComputedStyle(node)
          if (/(auto|scroll)/.test(st.overflowY) && node.clientHeight > 0) {
            var nr = node.getBoundingClientRect()
            topLimit = Math.max(topLimit, nr.top + 2)
            bottomLimit = Math.min(bottomLimit, nr.bottom - 2)
            break
          }
          node = node.parentNode
        }
        var below = bottomLimit - r.bottom
        var above = r.top - topLimit
        var useUp = below < 280 && above > below
        setOpenUp(useUp)
        var maxH = Math.max(120, Math.min(280, (useUp ? above : below) - 8))
        if (wrapRef.current) {
          wrapRef.current.style.setProperty('--ss-menu-max', maxH + 'px')
          var menu = wrapRef.current.querySelector('.__ss_selectMenu')
          if (menu) menu.style.maxHeight = maxH + 'px'
        }
      }

      react.useEffect(function () {
        if (!open) return
        measure()
        function onDocDown(e) {
          if (!wrapRef.current) return
          if (!wrapRef.current.contains(e.target)) setOpen(false)
        }
        function onKey(e) {
          if (e.key === 'Escape') {
            setOpen(false)
            try { btnRef.current.focus() } catch (err) {}
          }
        }
        function onScroll(e) {
          if (!wrapRef.current) return
          if (!wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', onDocDown, true)
        document.addEventListener('keydown', onKey, true)
        window.addEventListener('scroll', onScroll, true)
        return function () {
          document.removeEventListener('mousedown', onDocDown, true)
          document.removeEventListener('keydown', onKey, true)
          window.removeEventListener('scroll', onScroll, true)
        }
      }, [open])

      return h('div', { className: '__ss_selectWrap' + (open ? ' is-open' : ''), ref: wrapRef },
        h('button', {
          className: '__ss_select' + (open ? ' is-open' : ''),
          type: 'button',
          ref: btnRef,
          'aria-haspopup': 'listbox',
          'aria-expanded': open ? 'true' : 'false',
          onClick: function () { setOpen(!open) }
        },
          h('span', { className: '__ss_selectLabel' }, label),
          h('span', { className: '__ss_selectCaret', 'aria-hidden': 'true' }, 'v')
        ),
        open ? h('div', {
          className: '__ss_selectMenu' + (openUp ? ' is-up' : ''),
          role: 'listbox',
          style: { maxHeight: 'var(--ss-menu-max, 280px)' }
        }, opts.map(function (o) {
          var on = String(o[0]) === String(props.value)
          return h('button', {
            key: o[0],
            type: 'button',
            role: 'option',
            'aria-selected': on ? 'true' : 'false',
            className: '__ss_selectItem' + (on ? ' is-on' : ''),
            onClick: function () {
              setOpen(false)
              if (on) return
              props.onChange(o[0])
            }
          }, o[1])
        })) : null
      )
    }


    function Check(props) {
      return h('label', { className: '__ss_check' },
        h('input', {
          type: 'checkbox',
          checked: !!props.checked,
          onChange: (e) => props.onChange(e.target.checked)
        }),
        h('span', { className: '__ss_checkText' },
          h('span', null, props.label),
          props.hint ? h('span', { className: '__ss_hint' }, props.hint) : null
        )
      )
    }

    function ColorInput(props) {
      return h('input', {
        className: '__ss_swatch',
        type: 'color',
        value: props.value,
        onChange: (e) => props.onChange(e.target.value)
      })
    }

    function Range(props) {
      return h('div', { className: '__ss_row' },
        h('input', {
          type: 'range',
          min: props.min, max: props.max, step: props.step || 0.05,
          value: props.value,
          style: { flex: '1 1 200px' },
          onChange: (e) => props.onChange(Number(e.target.value))
        }),
        h('span', { className: '__ss_status' }, props.display)
      )
    }

    /* ── 语音：读系统里可用的音色，女声排在前面 ─────────────────────────── */
    var NATURAL_HINTS = ['natural', 'neural', 'online', 'premium', 'enhanced', 'siri', 'google']
    var FEMALE_HINTS = [
      'aria', 'jenny', 'michelle', 'emma', 'ava', 'libby', 'sonia', 'maisie',
      'zira', 'samantha', 'karen', 'moira', 'tessa', 'victoria', 'serena', 'allison',
      'susan', 'fiona', 'hazel', 'female', 'woman',
      'xiaoxiao', 'xiaoyi', 'xiaomo', 'huihui', 'yaoyao', '晓晓', '晓伊', '女声'
    ]
    var MALE_HINTS = ['david', 'mark', 'guy', 'ryan', 'george', 'daniel', 'alex', 'fred',
      'male', 'yunxi', 'yunjian', 'kangkang']

    function hits(name, list) {
      for (var i = 0; i < list.length; i++) if (name.indexOf(list[i]) !== -1) return true
      return false
    }
    /** 神经网络音色优先，其次女声，最后剔掉男声 —— 和运行时 splash.js 的打分口径一致 */
    function scoreVoice(name, lang, want) {
      var sc = 0
      if (hits(name, NATURAL_HINTS)) sc += 60
      if (hits(name, FEMALE_HINTS)) sc += 40
      if (hits(name, MALE_HINTS)) sc -= 45
      if (String(lang || '').indexOf(want) === 0) sc += 25
      return sc
    }

    function readVoices() {
      try {
        var s = window.speechSynthesis
        if (!s || typeof s.getVoices !== 'function') return []
        var list = s.getVoices() || []
        var want = 'en'
        var scored = list.map(function (v, i) {
          var name = String(v.name || '').toLowerCase()
          return {
            v: v,
            natural: hits(name, NATURAL_HINTS),
            female: hits(name, FEMALE_HINTS),
            sc: scoreVoice(name, String(v.lang || '').toLowerCase(), want),
            i: i
          }
        })
        scored.sort(function (a, b) {
          if (a.sc !== b.sc) return b.sc - a.sc
          return a.i - b.i
        })
        return scored.map(function (x) { return x.v })
      } catch (e) { return [] }
    }

    function speakSample(text, draft) {
      try {
        var s = window.speechSynthesis
        if (!s) return false
        s.cancel()
        var u = new window.SpeechSynthesisUtterance(text || 'Access permission required.')
        var list = readVoices()
        var target = null
        for (var i = 0; i < list.length; i++) if (list[i].name === draft.voiceName) target = list[i]
        if (target) { u.voice = target; u.lang = target.lang }
        u.rate = Math.min(2, Math.max(0.5, Number(draft.voiceRate) || 1))
        u.pitch = Math.min(2, Math.max(0, Number(draft.voicePitch) || 1))
        u.volume = Math.min(1, Math.max(0, Number(draft.voiceVolume) || 0.9))
        if (draft.voiceLang === 'zh') { u.text = '需要访问许可，验证通过。'; u.lang = 'zh-CN' }
        s.speak(u)
        return true
      } catch (e) { return false }
    }

    function VoicePicker(props) {
      var [list, setList] = react.useState(readVoices)
      react.useEffect(function () {
        var s = window.speechSynthesis
        if (!s) return
        var on = function () { setList(readVoices()) }
        try { s.addEventListener('voiceschanged', on) } catch (e) {}
        var t = setTimeout(on, 400)
        return function () {
          try { s.removeEventListener('voiceschanged', on) } catch (e) {}
          clearTimeout(t)
        }
      }, [])
      var auto = window.__DSH_STARTUP_API__ && window.__DSH_STARTUP_API__.voice
      var opts = [['', '自动（优先神经网络女声）' + (auto ? ' → ' + auto : '')]].concat(
        list.map(function (v) {
          var name = String(v.name || '').toLowerCase()
          var mark = hits(name, NATURAL_HINTS) ? '★ ' : (hits(name, FEMALE_HINTS) ? '♀ ' : '')
          return [v.name, mark + v.name + ' · ' + (v.lang || '')]
        })
      )
      return h('div', { className: '__ss_field' },
        h('label', { className: '__ss_label' }, '音色'),
        h('div', { className: '__ss_row' },
          h(Select, { value: props.value || '', options: opts, onChange: props.onChange }),
          h('button', {
            className: '__ss_btn',
            type: 'button',
            onClick: props.onPreview
          }, '试听')
        ),
        h('div', { className: '__ss_hint' },
          list.length
            ? '★ = 神经网络音色（念长句自然，推荐）；♀ = 女声但多为老式拼接合成，念长句会发塑料。'
              + '共 ' + list.length + ' 个，已按"神经网络 → 女声 → 排除男声"排好序。'
            : '这台机器暂时读不到系统音色（浏览器可能要等 voiceschanged，或系统没装英语语音包）。'
        )
      )
    }

    /* ── 面板 ────────────────────────────────────────────────────────────── */
    /* 本地兜底默认值：Host 半侧若是旧版本（配置里还没有语音字段），
       面板也要能正常显示这些控件，而不是一片 undefined。 */
    var FALLBACK = {
      voice: true, voiceLang: 'en', voiceName: '', voiceRate: 0.88, voicePitch: 0.85,
      voiceVolume: 0.9, voiceCue: true, voiceLead: 240, welcomeDelay: 550, voiceSource: 'asset', voicePack: 'f', voiceFx: 'robot',
      sound: true, soundVolume: 0.5, bedNoise: false,
      transitionIn: 'dissolve', transitionJoin: 'dissolve', transitionOut: 'dissolve',
      transitionMs: 600, transitionDir: 'left',
      colorMode: 'color',
      bgmEnabled: false, bgmFile: '', bgmFile2: '', bgmVolume: 0.5, bgmBpm: 100, bgmBeats1: 16, bgmBeats2: 32,
      bgm1Start: 0, bgm2Start: 0, bgm1FadeIn: 1, bgm1FadeOut: 1, bgm2FadeIn: 1, bgm2FadeOut: 2,
      bgmCrossfade: 1200, bgmLoop: true, bgm2Loop: false, bgmDuck: true,
      act1VideoSound: false, act2VideoSound: false
    }
    function num(v, d) {
      var n = Number(v)
      return isFinite(n) ? n : d
    }

    /* 版本号的来源，按可靠性排序：
       1) 面板自己从 /dsh-startup/config 拿到的（Host 读的是它自己的 package.json）
       2) Host 往 index 里注入的 window.__DSH_STARTUP_VERSION__
          —— 桌面端走浏览器半侧自举时没有 1，就靠这一条
       3) 下面这个常量：两份都没拿到时的兜底，别让面板显示 undefined
       版本号本身只在 lib/index.js 里读一次，这里不重复维护。 */
    var FALLBACK_VERSION = '3.0.0'
    /* 手动选包成功后置 true：让还在后台跑的“浏览器下载监听”不要再弹第二次更新器 */
    var __manualUpdateApplied = false
    function readInjectedVersion() {
      try {
        var v = window.__DSH_STARTUP_VERSION__
        return v ? String(v) : ''
      } catch (e) { return '' }
    }

    /* ── v2.14.0：用户自备 BGM 的波形选段编辑器 ─────────────────────
       不拖左右边界：选段宽度 = 拍数 × 60 / BPM，整段左右拖动。
       音频只在本机读取；画布峰值由 Web Audio 解码后计算。 */
    var __waveCtx = null
    function waveCtx() {
      if (__waveCtx) return __waveCtx
      try {
        var AC = window.AudioContext || window.webkitAudioContext
        __waveCtx = AC ? new AC() : null
      } catch (e) { __waveCtx = null }
      return __waveCtx
    }
    function clampNum(v, lo, hi) { return Math.min(hi, Math.max(lo, Number(v) || 0)) }

    function WaveformEditor(props) {
      var canvasRef = react.useRef(null)
      var [peaks, setPeaks] = react.useState(null)
      var [dur, setDur] = react.useState(0)
      var [err, setErr] = react.useState('')
      var [drag, setDrag] = react.useState(null)
      var file = props.file || ''
      var bpm = clampNum(props.bpm, 40, 220)
      var beats = clampNum(props.beats, 4, 128)
      var winSec = beats * 60 / bpm

      react.useEffect(function () {
        var alive = true
        setPeaks(null); setDur(0); setErr('')
        if (!file) return function () { alive = false }
        fetch('/dsh-startup/music/file?name=' + encodeURIComponent(file), { cache: 'no-store' })
          .then(function (r) { if (!r.ok) throw new Error('读取失败'); return r.arrayBuffer() })
          .then(function (ab) {
            var c = waveCtx()
            if (!c) throw new Error('浏览器不支持音频解码')
            return c.decodeAudioData(ab)
          })
          .then(function (buf) {
            if (!alive) return
            var data = buf.getChannelData(0)
            var n = 900
            var step = Math.max(1, Math.floor(data.length / n))
            var out = new Float32Array(n)
            var max = 0.0001
            for (var i = 0; i < n; i++) {
              var from = i * step
              var to = Math.min(data.length, from + step)
              var m = 0
              for (var j = from; j < to; j += 3) { var v = data[j] < 0 ? -data[j] : data[j]; if (v > m) m = v }
              out[i] = m; if (m > max) max = m
            }
            for (var k = 0; k < n; k++) out[k] = out[k] / max
            setPeaks(out); setDur(buf.duration)
          })
          .catch(function (e) { if (alive) setErr(String((e && e.message) || e)) })
        return function () { alive = false }
      }, [file])

      react.useEffect(function () {
        var cv = canvasRef.current
        if (!cv) return
        var W = 900, H = 110
        var dpr = window.devicePixelRatio || 1
        cv.width = W * dpr; cv.height = H * dpr
        var g = cv.getContext('2d')
        if (!g) return
        g.setTransform(dpr, 0, 0, dpr, 0, 0)
        g.clearRect(0, 0, W, H)
        g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, 0, W, H)
        if (!peaks || !dur) return
        var start = clampNum(props.start, 0, Math.max(0, dur - winSec))
        var x1 = start / dur * W
        var x2 = Math.min(W, (start + winSec) / dur * W)
        g.fillStyle = 'rgba(255,117,0,.16)'; g.fillRect(x1, 0, Math.max(2, x2 - x1), H)
        g.strokeStyle = '#ffb27a'; g.lineWidth = 2
        g.strokeRect(x1 + 1, 1, Math.max(2, x2 - x1) - 2, H - 2)
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1
        g.beginPath()
        for (var i = 0; i < peaks.length; i++) {
          var x = i / (peaks.length - 1) * W
          var h = Math.max(1, peaks[i] * (H - 16))
          g.moveTo(x, H / 2 - h / 2); g.lineTo(x, H / 2 + h / 2)
        }
        g.stroke()
        g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, Math.max(0, Math.min(x1, W)), H)
        g.fillRect(Math.min(W, x2), 0, Math.max(0, W - x2), H)
      }, [peaks, dur, props.start, winSec])

      function onDown(e) {
        if (!peaks || !dur) return
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch (e2) {}
        setDrag({ x: e.clientX, start: clampNum(props.start, 0, Math.max(0, dur - winSec)) })
      }
      function onMove(e) {
        if (!drag || !dur) return
        var rect = e.currentTarget.getBoundingClientRect()
        if (!rect.width) return
        var dxSec = (e.clientX - drag.x) / rect.width * dur
        var next = clampNum(drag.start + dxSec, 0, Math.max(0, dur - winSec))
        next = Math.round(next * 100) / 100
        if (next !== props.start) props.onChange(next)
      }
      function onUp() { setDrag(null) }

      var start = clampNum(props.start, 0, Math.max(0, dur - winSec))
      var fmt = function (t) { return (Math.round(t * 10) / 10).toFixed(1) + 's' }
      return h('div', { className: '__ss_wave' },
        h('canvas', {
          ref: canvasRef,
          style: { width: '100%', height: '110px', display: 'block', borderRadius: '8px', cursor: 'grab', touchAction: 'none' },
          onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp
        }),
        h('div', { className: '__ss_hint', style: { marginTop: '6px' } },
          err ? ('波形读取失败：' + err)
            : (!peaks ? '正在读取波形…'
              : (props.label || '') + ' 选段 ' + fmt(start) + ' → ' + fmt(Math.min(dur, start + winSec)) +
                '（' + Math.round(winSec * 10) / 10 + 's · ' + beats + ' 拍 @ ' + bpm + ' BPM）；按住波形左右拖动选段')
        )
      )
    }

    function Panel() {
      var [draft, setDraft] = react.useState(null)
      var [defaults, setDefaults] = react.useState(null)
      var [file, setFile] = react.useState('')
      var [version, setVersion] = react.useState(readInjectedVersion)
      var [error, setError] = react.useState(null)
      var [notice, setNotice] = react.useState(null)
      var [busy, setBusy] = react.useState(false)
      var [templates, setTemplates] = react.useState([])
      var [hiddenTemplates, setHiddenTemplates] = react.useState([])
      var [voicePacks, setVoicePacks] = react.useState([])
      var [musicFiles, setMusicFiles] = react.useState([])
      var [update, setUpdate] = react.useState(null)
      var [checking, setChecking] = react.useState(false)
      var [updating, setUpdating] = react.useState(false)
      var [updateMsg, setUpdateMsg] = react.useState('')
      var [waitingDownload, setWaitingDownload] = react.useState(false)
      var [diagnosing, setDiagnosing] = react.useState(false)

      function load() {
        setError(null)
        return fetch(API, { headers: { Accept: 'application/json' } })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'load failed')
            setDraft(Object.assign({}, FALLBACK, j.config))
            setDefaults(Object.assign({}, FALLBACK, j.defaults))
            setFile(j.file || '')
            if (j.version) setVersion(String(j.version))
          })
          .catch((e) => setError('读取配置失败：' + String(e && e.message ? e.message : e)))
      }

      react.useEffect(() => { load() }, [])

      /* 模板列表：宿主扫描 templates/ 与 ~/.dsh/startup-templates/
         导入/删除后要能立刻刷新，所以抽成函数 */
      function refreshTemplates() {
        return fetch('/dsh-startup/templates', { headers: { Accept: 'application/json' }, cache: 'no-store' })
          .then((r) => r.json())
          .then((j) => {
            if (j && j.ok === true && Array.isArray(j.templates)) setTemplates(j.templates)
            if (j && j.ok === true) setHiddenTemplates(Array.isArray(j.hidden) ? j.hidden : [])
          })
          .catch(() => { /* 拉不到就只显示「内置」 */ })
      }
      react.useEffect(() => { refreshTemplates() }, [])

      /* 音色包列表：来自 lib/assets/voices/manifest.json，由宿主只读下发 */
      function refreshVoices() {
        return fetch('/dsh-startup/voices', { headers: { Accept: 'application/json' }, cache: 'no-store' })
          .then((r) => r.json())
          .then((j) => { if (j && j.ok === true && Array.isArray(j.packs)) setVoicePacks(j.packs) })
          .catch(() => { /* 拉不到就只显示内置音色 */ })
      }
      react.useEffect(() => { refreshVoices() }, [])

      /* 背景音乐列表与导入（文件只写本机 ~/.dsh/startup-music） */
      function refreshMusic() {
        return fetch(STARTUP_ROUTE + '/music/list', { cache: 'no-store', headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json() })
          .then(function (j) { if (j && j.ok === true && Array.isArray(j.files)) setMusicFiles(j.files) })
          .catch(function () { /* 拉不到就显示空 */ })
      }
      react.useEffect(function () { refreshMusic() }, [])

      function importMusic(which) {
        var inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = '.mp3,.wav,.ogg,.m4a,.aac,.flac,audio/*'
        inp.onchange = function () {
          var f0 = inp.files && inp.files[0]
          if (!f0) return
          if (f0.size > 100 * 1024 * 1024) { setError('音乐文件不能超过 100MB'); return }
          setBusy(true); setError(null); setNotice(null)
          f0.arrayBuffer().then(function (ab) {
            return fetch(STARTUP_ROUTE + '/music/upload?name=' + encodeURIComponent(f0.name), {
              method: 'POST',
              headers: { 'Content-Type': 'application/octet-stream' },
              body: ab
            })
          }).then(function (r) { return r.json() }).then(function (j) {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '导入失败')
            return refreshMusic().then(function () {
              set(which === 2 ? 'bgmFile2' : 'bgmFile', j.file)
              setNotice('音乐已导入到本机（不会上传）。选好选段后点「保存设置」。')
            })
          }).catch(function (e) {
            setError('导入音乐失败：' + String((e && e.message) || e))
          }).then(function () { setBusy(false) })
        }
        inp.click()
      }

      function deleteMusic(fileName) {
        if (!fileName) return
        if (!window.confirm('删除这首本地音乐？\n只删 ~/.dsh/startup-music 里的副本，不会动你原来的文件。')) return
        setBusy(true)
        fetch(STARTUP_ROUTE + '/music/delete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: fileName })
        }).then(function (r) { return r.json() }).then(function (j) {
          if (!j || j.ok !== true) throw new Error((j && j.error) || '删除失败')
          return refreshMusic()
        }).catch(function (e) { setError('删除失败：' + String((e && e.message) || e)) })
          .then(function () { setBusy(false) })
      }

      function musicOptions() {
        var opts = [['', '同第一段']]
        for (var i = 0; i < musicFiles.length; i++) {
          var m = musicFiles[i]
          if (!m || !m.file) continue
          opts.push([m.file, String(m.name || m.file)])
        }
        return opts
      }

      function voiceOptions() {
        var opts = []
        for (var i = 0; i < voicePacks.length; i++) {
          var v = voicePacks[i]
          if (!v || !v.id) continue
          opts.push([v.id, String(v.name || v.id)])
        }
        return opts
      }

      function set(key, value) {
        setNotice(null)
        setDraft((d) => Object.assign({}, d, { [key]: value }))
      }

      function save() {
        if (!draft) return
        setBusy(true); setNotice(null); setError(null)
        fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patch: draft })
        })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'save failed')
            setDraft(j.config)
            setNotice('已保存。下次打开 DSH 生效；点「立即预览」可以先看效果。')
          })
          .catch((e) => setError('保存失败：' + String(e && e.message ? e.message : e)))
          .then(() => setBusy(false))
      }

      function reset() {
        setBusy(true); setNotice(null); setError(null)
        fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset' })
        })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'reset failed')
            setDraft(j.config)
            setNotice('已恢复默认。')
          })
          .catch((e) => setError('恢复默认失败：' + String(e && e.message ? e.message : e)))
          .then(() => setBusy(false))
      }

      /** 一键诊断：让宿主写一份报告到桌面，用户直接发给作者。生成中按钮禁用，防止连点刷屏。 */
      function runDiagnose() {
        if (diagnosing) return
        setDiagnosing(true)
        setNotice('正在生成诊断报告，请稍等…')
        setError(null)
        fetch(STARTUP_ROUTE + '/diagnose', { method: 'POST' })
          .then(function (r) { return r.json() })
          .then(function (j) {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '生成失败')
            setNotice('诊断报告已生成到桌面：' + j.file + '（报告里不含任何密钥/密码）')
          })
          .catch(function (e) {
            setNotice(null)
            setError('生成诊断报告失败：' + String((e && e.message) || e))
          })
          .then(function () { setDiagnosing(false) })
      }

      /** 检查更新：问宿主（宿主去读 GitHub latest release，避开浏览器 CORS）。 */
      function checkUpdate() {
        setChecking(true)
        fetch(STARTUP_ROUTE + '/update-check?refresh=1', { cache: 'no-store' })
          .then(function (r) { return r.json() })
          .then(function (j) { setUpdate(j || { ok: false }) })
          .catch(function (e) { setUpdate({ ok: false, error: String((e && e.message) || e) }) })
          .then(function () { setChecking(false) })
      }

      /** 下载完成/本地选择后：确认重启 -> 启动外部更新器 */
      function confirmAndApply(version) {
        var yes = window.confirm(
          '本次更新需要重启 DSH。' + String.fromCharCode(10) +
          '请确认没有正在进行的对话。' + String.fromCharCode(10, 10) +
          '是否现在重启？'
        )
        if (!yes) {
          setUpdating(false)
          setUpdateMsg('已准备好更新。想继续时，再点一次「立即更新」即可。')
          return
        }
        setUpdating(true)
        setUpdateMsg('更新器窗口已打开：请手动完全退出 DSH（窗口+托盘），退出后会自动安装并重新打开。')
        fetch(STARTUP_ROUTE + '/update-apply', { method: 'POST' })
          .then(function (r) { return r.json() })
          .then(function (k) {
            if (!k || k.ok !== true) throw new Error((k && k.error) || '启动更新器失败')

          })
          .catch(function (e) {
            setUpdating(false)
            setUpdateMsg('更新失败：' + String((e && e.message) || e))
          })
      }

      /** 立即更新：让系统浏览器下载（走浏览器自己的代理），插件监听 Downloads 自动接住 */
      function runUpdate() {
        if (!update || !update.latest || updating) return
        __manualUpdateApplied = false
        setUpdating(true)
        setWaitingDownload(true)
        setUpdateMsg('正在让浏览器下载 v' + update.latest + '（使用浏览器自己的代理）…')
        fetch(STARTUP_ROUTE + '/update-browser-download', { method: 'POST' })
          .then(function (r) { return r.json() })
          .then(function (j) {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '无法启动浏览器下载')
            setUpdateMsg('已用 ' + (j.browser === 'chrome' ? 'Chrome' : '默认浏览器') + ' 打开下载，完成后会自动继续（最多等 30 分钟）。等太久可以点「打开下载文件夹」或「选择安装包」。')
            return fetch(STARTUP_ROUTE + '/update-watch-download?version=' + encodeURIComponent(update.latest))
          })
          .then(function (r) { return r.json() })
          .then(function (j) {
            setWaitingDownload(false)
            if (__manualUpdateApplied) return
            if (!j || j.ok !== true) throw new Error((j && j.error) || '没有等到下载文件')
            setUpdating(false)
            setUpdateMsg('已获取 v' + j.version + '（' + Math.round(j.size / 1048576) + ' MB）')
            confirmAndApply(j.version)
          })
          .catch(function (e) {
            setWaitingDownload(false)
            if (__manualUpdateApplied) return
            setUpdating(false)
            setUpdateMsg('浏览器下载没接住：' + String((e && e.message) || e) + '。可以点「打开下载文件夹」找到 zip 后点「选择安装包」。')
          })
      }

      /** 打开系统下载文件夹（等下载时的手动出口） */
      function openDownloads() {
        fetch(STARTUP_ROUTE + '/open-downloads', { method: 'POST' })
          .then(function (r) { return r.json() })
          .then(function (j) {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '打不开文件夹')
            setUpdateMsg('已打开下载文件夹：' + j.dir + '。找到 dsh-boot-suite 的 zip 后，点「选择安装包」选它。')
          })
          .catch(function (e) { setUpdateMsg('打开下载文件夹失败：' + String((e && e.message) || e)) })
      }

      /** 浏览器下载好 zip 后，从本地选择文件（完全不依赖宿主联网） */
      function pickLocalPackage() {
        if (!update || !update.latest) return
        var inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = '.zip'
        inp.onchange = function () {
          var f = inp.files && inp.files[0]
          if (!f) return
          setUpdating(true)
          setUpdateMsg('正在读取本地安装包…')
          f.arrayBuffer()
            .then(function (buf) {
              return fetch(STARTUP_ROUTE + '/update-upload?version=' + encodeURIComponent(update.latest), {
                method: 'POST',
                headers: { 'Content-Type': 'application/octet-stream' },
                body: buf
              })
            })
            .then(function (r) { return r.json() })
            .then(function (j) {
              if (!j || j.ok !== true) throw new Error((j && j.error) || '本地安装包无效')
              __manualUpdateApplied = true
              setWaitingDownload(false)
              setUpdating(false)
              setUpdateMsg('已载入本地安装包 v' + j.version + '（' + Math.round(j.size / 1048576) + ' MB）')
              confirmAndApply(j.version)
            })
            .catch(function (e) {
              setUpdating(false)
              setUpdateMsg('载入本地安装包失败：' + String((e && e.message) || e))
            })
        }
        inp.click()
      }

      /** 导入自定义动画（v2.12.0）：视频/动图/图片 → 宿主生成用户模板，第一幕/第二幕下拉都能选。
          文件只写进 ~/.dsh/startup-templates/，不碰安装目录、不上传。 */
      function importAnimation() {
        var inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = 'video/mp4,video/webm,image/gif,image/png,image/jpeg,image/webp,.mp4,.webm,.gif,.png,.jpg,.jpeg,.webp'
        inp.onchange = function () {
          var f = inp.files && inp.files[0]
          if (!f) return
          setNotice(null)
          var ext = (String(f.name).match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase()
          var isVideo = ext === '.mp4' || ext === '.webm'
          var isImage = ['.gif', '.png', '.jpg', '.jpeg', '.webp'].indexOf(ext) >= 0
          if (!isVideo && !isImage) { setNotice('只支持 mp4 / webm / gif / png / jpg / webp'); return }
          if (f.size > 64 * 1024 * 1024) { setNotice('文件超过 64MB，请先压缩再导入'); return }
          setBusy(true)
          setNotice('正在导入「' + f.name + '」…')
          var duration = 6000, width = 0, height = 0
          function probe() {
            return new Promise(function (resolve) {
              var url = ''
              try { url = URL.createObjectURL(f) } catch (eU) { resolve(); return }
              function done() { try { URL.revokeObjectURL(url) } catch (eR) {}; resolve() }
              if (isVideo) {
                var v = document.createElement('video')
                v.preload = 'metadata'
                v.onloadedmetadata = function () {
                  var d = Number(v.duration)
                  if (isFinite(d) && d > 0.2) duration = Math.round(Math.min(60, d) * 1000)
                  done()
                }
                v.onerror = done
                v.src = url
              } else {
                var img = new Image()
                img.onload = function () { width = img.naturalWidth || 0; height = img.naturalHeight || 0; done() }
                img.onerror = done
                img.src = url
              }
            })
          }
          probe()
            .then(function () { return f.arrayBuffer() })
            .then(function (buf) {
              return fetch(STARTUP_ROUTE + '/import-animation?name=' + encodeURIComponent(f.name) +
                '&duration=' + duration + '&width=' + width + '&height=' + height, {
                method: 'POST',
                headers: { 'Content-Type': 'application/octet-stream' },
                body: buf
              })
            })
            .then(function (r) { return r.json() })
            .then(function (j) {
              if (!j || j.ok !== true) throw new Error((j && j.error) || '导入失败')
              setNotice('已导入「' + j.name + '」（' + Math.round(j.size / 1048576 * 10) / 10 + ' MB）：可在「启动动画第一幕 / 第二幕」下拉里选择它（标 · 本地）。')
              return fetch('/dsh-startup/templates', { headers: { Accept: 'application/json' }, cache: 'no-store' })
                .then(function (r) { return r.json() })
                .then(function (t) { if (t && t.ok === true && Array.isArray(t.templates)) setTemplates(t.templates) })
                .catch(function () { /* 刷新列表失败不影响导入 */ })
            })
            .catch(function (e) { setNotice('导入失败：' + String((e && e.message) || e)) })
            .then(function () { setBusy(false) })
        }
        inp.click()
      }

      function findTemplate(id) {
        if (!id) return null
        for (var ti2 = 0; ti2 < templates.length; ti2++) {
          if (templates[ti2] && templates[ti2].id === id) return templates[ti2]
        }
        return null
      }

      /** 删除/隐藏模板（v2.12.4）：本地模板删文件（不可恢复）；内置模板写进 hiddenTemplates（可恢复）。
          如果它正被第一/第二幕引用，自动把配置切回默认，避免下一次开机找不到模板。 */
      function deleteTemplate(id) {
        if (!draft || !id) return
        var item = findTemplate(id)
        var name = (item && item.name) || id
        var isUser = !!(item && item.source === 'user')
        var ok = true
        try {
          ok = window.confirm(isUser
            ? '删除本地模板「' + name + '」？\n\n只删这个模板的文件，不会动你的其它动画；删除后无法恢复（需要的话重新导入即可）。'
            : '隐藏内置模板「' + name + '」？\n\n不会删除安装文件，之后可以在「模板」组底部点「恢复已隐藏的内置模板」找回。')
        } catch (e) { ok = true }
        if (!ok) return
        setBusy(true); setNotice(null); setError(null)
        var inUseAct1 = (draft.template || '') === id
        var inUseAct2 = (draft.act2 || '') === id
        fetch(STARTUP_ROUTE + '/templates/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id })
        })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '删除失败')
            return refreshTemplates()
          })
          .then(function () {
            if (!inUseAct1 && !inUseAct2) return null
            var patch = {}
            if (inUseAct1) patch.template = ''
            if (inUseAct2) patch.act2 = ''
            return fetch(API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ patch: patch })
            })
              .then((r) => r.json())
              .then((j2) => { if (j2 && j2.ok === true) setDraft(Object.assign({}, FALLBACK, j2.config)) })
              .catch(() => { /* 删模板成功，配置复位失败下轮保存再修 */ })
          })
          .then(function () {
            setNotice((isUser ? '已删除本地模板「' : '已隐藏内置模板「') + name + '」' + (inUseAct1 || inUseAct2 ? '；因为它正被引用，已切回默认。' : '。'))
          })
          .catch(function (e) { setError('删除模板失败：' + String((e && e.message) || e)) })
          .then(function () { setBusy(false) })
      }

      /** 恢复全部被隐藏的内置模板（v2.12.4） */
      function restoreHiddenTemplates() {
        setBusy(true); setNotice(null); setError(null)
        fetch(STARTUP_ROUTE + '/templates/unhide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}'
        })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '恢复失败')
            return refreshTemplates()
          })
          .then(function () { setNotice('已恢复全部被隐藏的内置模板。') })
          .catch(function (e) { setError('恢复内置模板失败：' + String((e && e.message) || e)) })
          .then(function () { setBusy(false) })
      }

      /** 立即预览：**先把宿主最新的配置和模板灌回 window，再让运行时重播**。
          只调 replay() 的话，运行时手里的还是首屏注入那会儿的旧配置/旧模板 ——
          表现就是「换了模板点预览还是老动画，非得重启」。 */
      function preview() {
        setBusy(true)
        setNotice(null)
        fetch(API, { headers: { Accept: 'application/json' }, cache: 'no-store' })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) return
            /* v2.13.15：预览必须带上「当前还没保存的修改」。
               原来只灌宿主已保存的配置：用户选完音色/效果直接点「立即预览」，
               运行时拿到的还是旧配置 —— 表现就是「选了日文音色，预览仍播英文」。 */
            if (j.config) window.__DSH_STARTUP__ = Object.assign({}, FALLBACK, j.config, draft || {})
            try {
              if (j.template) window.__DSH_STARTUP_TEMPLATE__ = j.template
              else delete window.__DSH_STARTUP_TEMPLATE__
              if (j.template2) window.__DSH_STARTUP_TEMPLATE2__ = j.template2
              else delete window.__DSH_STARTUP_TEMPLATE2__
            } catch (e) { /* 删不掉就让它回落内置 */ }
          })
          .catch(() => { /* 拿不到最新配置就用旧的，至少还能重播 */ })
          .then(function () {
            setBusy(false)
            /* v2.15.2：点「立即预览」后按钮仍保持焦点，播放时空格会再次触发按钮 click（看起来像重播）。
               重播前先失焦，空格才能交给模板自己的交互（切 tips / 彩蛋按钮）。 */
            try { var ae = document.activeElement; if (ae && typeof ae.blur === 'function') ae.blur() } catch (eBlur) { /* noop */ }
            var api = window.__DSH_STARTUP_API__
            if (api && typeof api.replay === 'function') { api.replay(); return }
            window.location.reload()
          })
      }

      /* 版本号常驻顶部，不进骨架屏 —— 它不依赖配置接口，
         接口挂了也该看得见当前装的是哪一版。 */
      var versionLine = h('div', { className: '__ss_version' }, '版本 v' + (version || FALLBACK_VERSION))

      if (!draft) {
        return h('div', { className: '__ss_root' },
          versionLine,
          h('div', { className: '__ss_status' }, error ? error : '读取配置中…'),
          error ? h('div', { className: '__ss_actions' },
            h('button', { className: '__ss_btn', onClick: load }, '重试')
          ) : null
        )
      }

      var modeOptions = [
        ['session', '每个浏览器会话一次'],
        ['daily', '每天一次'],
        ['always', '每次打开都播放']
      ]

      function isUserTemplate(id) {
        if (!id) return false
        for (var ti = 0; ti < templates.length; ti++) {
          if (templates[ti] && templates[ti].id === id) return templates[ti].source === 'user'
        }
        return false
      }
      /* v2.14.0：模板分类。正式下拉只放「正式模板」；其余归到「测试类模板」。
         默认：内置模板里只有 archive-warm（第一幕）与 whale-girl-scan / -4k（第二幕）算正式；
         用户本地导入的算正式；被手动「归类」或「移出」的以配置为准。 */
      var PROD_TEMPLATES = { template: { 'archive-warm': 1 }, act2: { 'whale-girl-scan': 1, 'whale-girl-scan-4k': 1, 'whale-girl-scan-4k-h264': 1, 'bigfish-v5-act2': 1 } }
      function findTemplate(id) {
        for (var fi = 0; fi < (templates || []).length; fi++) if (templates[fi] && templates[fi].id === id) return templates[fi]
        return null
      }
      function templateLabel(t) { return t.name + (t.source === 'user' ? ' · 本地' : '') }
      function isTestTemplate(id, act) {
        if (!id) return false
        var tt = Array.isArray(draft.testTemplates) ? draft.testTemplates : []
        var pp = Array.isArray(draft.promotedTemplates) ? draft.promotedTemplates : []
        if (tt.indexOf(id) >= 0) return true
        if (pp.indexOf(id) >= 0) return false
        var t = findTemplate(id)
        if (t && t.source === 'user') return false
        var prod = PROD_TEMPLATES[act] || {}
        return !prod[id]
      }
      function testOptionsFor(act) {
        return (templates || []).filter(function (t) { return isTestTemplate(t.id, act) }).map(function (t) { return [t.id, templateLabel(t)] })
      }
      function toggleTest(id, act) {
        if (!id) return
        var now = isTestTemplate(id, act)
        var tt = (Array.isArray(draft.testTemplates) ? draft.testTemplates : []).slice()
        var pp = (Array.isArray(draft.promotedTemplates) ? draft.promotedTemplates : []).slice()
        if (now) { if (pp.indexOf(id) < 0) pp.push(id); tt = tt.filter(function (x) { return x !== id }) }
        else { if (tt.indexOf(id) < 0) tt.push(id); pp = pp.filter(function (x) { return x !== id }) }
        set('testTemplates', tt)
        set('promotedTemplates', pp)
      }
      var templateOptions = [['', '内置（档案暖白）']].concat(
        (templates || []).filter(function (t) { return !isTestTemplate(t.id, 'template') }).map(function (t) { return [t.id, templateLabel(t)] })
      )
      if (draft.template && isTestTemplate(draft.template, 'template')) {
        var curT = findTemplate(draft.template)
        templateOptions = [[draft.template, '【测试类】' + (curT ? templateLabel(curT) : draft.template)]].concat(templateOptions)
      }
      var act2Options = [['', '不播放（第一幕结束直接进聊天）']].concat(
        (templates || []).filter(function (t) { return !isTestTemplate(t.id, 'act2') }).map(function (t) { return [t.id, templateLabel(t)] })
      )
      if (draft.act2 && isTestTemplate(draft.act2, 'act2')) {
        var curT2 = findTemplate(draft.act2)
        act2Options = [[draft.act2, '【测试类】' + (curT2 ? templateLabel(curT2) : draft.act2)]].concat(act2Options)
      }
      var testOptions1 = testOptionsFor('template')
      var testOptions2 = testOptionsFor('act2')
      var transitionOptions = [
        ['dissolve', '交叉叠化（默认）'],
        ['flash', '闪白'],
        ['glitch', '故障'],
        ['scanline', '扫描线'],
        ['slide', '推移'],
        ['iris', '虹膜'],
        ['black', '黑场'],
        ['none', '硬切']
      ]
      var transitionDirOptions = [
        ['left', '从左往右'],
        ['right', '从右往左'],
        ['up', '从下往上'],
        ['down', '从上往下']
      ]

      /* 档案暖白专属设置组：只有第一幕选「档案暖白」（或内置空值）时才显示；
         其他模板（含新模板/用户导入）应由模板自己提供参数，而不是这套 */
      var isArchiveWarm = !draft.template || draft.template === 'archive-warm'
      var isBigfish = draft.template === 'division-bigfish-codex'
      var hasSecondAct = !!(draft.act2 && draft.act2 !== '')
      var musicLoop = draft.bgmLoop !== false

      return h('div', { className: '__ss_root' },
        versionLine,

        /* 开关 */
        h('div', { className: '__ss_group' },
          h('div', { className: '__ss_groupTitle' }, '播放'),
          h(Check, {
            label: '启用启动动画',
            hint: '关闭后直接进主界面，不再显示启动界面。',
            checked: draft.enabled,
            onChange: (v) => set('enabled', v)
          }),
          h(Field, { label: '播放时机' },
            h(Select, { value: draft.mode, options: modeOptions, onChange: (v) => set('mode', v) })
          ),
          h(Field, { label: '速度倍率', hint: '0.35 慢放 · 1 原速 · 3 快放；参考片时长约 27 秒，默认整套约 16 秒。' },
            h('div', { className: '__ss_row' },
              h('input', {
                type: 'range', min: 0.35, max: 3, step: 0.05,
                value: draft.speed,
                style: { flex: '1 1 240px' },
                onChange: (e) => set('speed', Number(e.target.value))
              }),
              h('span', { className: '__ss_status' }, Number(draft.speed).toFixed(2) + '×')
            )
          )
        ),

        /* 自定义动画（v2.12.0）：导入后自动生成用户模板，第一幕/第二幕下拉都能选 */
        h('div', { className: '__ss_group' },
          h('div', { className: '__ss_groupTitle' }, '自定义动画'),
          h('div', { className: '__ss_hint' }, '把你的视频 / 动图 / 图片导入成模板，再到下面的「模板」组里选它（第一幕 / 第二幕都行）。文件只存本机，不会上传。'),
          h('div', { className: '__ss_row' },
            h('button', {
              className: '__ss_btn',
              type: 'button',
              disabled: busy,
              onClick: function () { importAnimation() }
            }, busy ? '处理中…' : '📥 导入动画'),
            h('span', { className: '__ss_hint' }, '支持 mp4 / webm / gif / png / jpg / webp，单文件 ≤ 64MB')
          )
        ),

        /* 用户自备 BGM（v2.14.0；v2.15.9 不循环模式 + 无第二幕不出第二段） */
        h('div', { className: '__ss_group', style: (isArchiveWarm || isBigfish) ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '背景音乐（用户自备）'),
          h('div', { className: '__ss_hint' },
            '导入你自己的音乐给开机动画配乐：只存本机、不上传、不内置。请确认你拥有该音乐的使用权。'
          ),
          isBigfish ? h('div', { className: '__ss_hint' }, '当前选的是「全景大肥鱼-含彩蛋版」：音乐从第一幕开始，到动画结束淡出；这个模板没有第二幕，第二段音乐不参与，音量、循环、淡入淡出、闪避有效。') : null,
          h(Check, {
            checked: draft.bgmEnabled === true,
            onChange: (v) => set('bgmEnabled', v),
            label: '启用背景音乐'
          }),
          h(Check, {
            checked: musicLoop,
            onChange: (v) => set('bgmLoop', v),
            label: '循环播放'
          }),
          !musicLoop ? h('div', { className: '__ss_hint' }, '已关闭循环：整首音乐只播一遍，拍速/拍数/选段自动隐藏；闪避仍然有效。') : null,
          h('div', { className: '__ss_row' },
            h('button', { className: '__ss_btn', type: 'button', disabled: busy, onClick: function () { importMusic(1) } }, '🎵 导入音乐'),
            h('span', { className: '__ss_hint' }, draft.bgmFile || '还没有导入音乐'),
            draft.bgmFile ? h('button', {
              className: '__ss_btn', type: 'button', disabled: busy,
              onClick: function () { deleteMusic(draft.bgmFile) }
            }, '删除') : null
          ),
          hasSecondAct ? h(Field, { label: '第二段换曲', hint: '默认与第一段同一首；第二段从「启动动画第二幕」开始，覆盖终幕欢迎语。' },
            h('div', { className: '__ss_row' },
              h(Select, { value: draft.bgmFile2 || '', options: musicOptions(), onChange: (v) => set('bgmFile2', v) }),
              h('button', { className: '__ss_btn', type: 'button', disabled: busy, onClick: function () { importMusic(2) } }, '导入第二首')
            )
          ) : null,
          musicLoop ? h('div', { className: '__ss_two' },
            h(Field, { label: '拍速（BPM）', hint: '只用来计算选段长度：时长 = 拍数 × 60 / BPM' },
              h(Select, {
                value: String(draft.bgmBpm || 100),
                options: [60, 70, 80, 90, 100, 110, 120, 130, 140, 160, 180].map(function (b) { return [String(b), b + ' BPM'] }),
                onChange: (v) => set('bgmBpm', Number(v))
              })),
            h(Field, { label: '第一幕拍数', hint: '至少 2 个八拍；默认 16 拍。' },
              h(Select, {
                value: String(draft.bgmBeats1 || 16),
                options: [8, 16, 24, 32, 48, 64, 96, 128].map(function (b) { return [String(b), b + ' 拍'] }),
                onChange: (v) => set('bgmBeats1', Number(v))
              }))
          ) : null,
          (musicLoop && draft.bgmFile) ? h(Field, { label: '第一段选段' },
            h(WaveformEditor, {
              file: draft.bgmFile, label: '第一幕',
              bpm: draft.bgmBpm, beats: draft.bgmBeats1,
              start: draft.bgm1Start, onChange: (v) => set('bgm1Start', v)
            })) : null,
          (hasSecondAct && musicLoop) ? h(Field, { label: '第二幕拍数', hint: '默认 32 拍；第二段结束直接进聊天。' },
            h(Select, {
              value: String(draft.bgmBeats2 || 32),
              options: [8, 16, 24, 32, 48, 64, 96, 128].map(function (b) { return [String(b), b + ' 拍'] }),
              onChange: (v) => set('bgmBeats2', Number(v))
            })) : null,
          (hasSecondAct && musicLoop && (draft.bgmFile2 || draft.bgmFile)) ? h(Field, { label: '第二段选段' },
            h(WaveformEditor, {
              file: draft.bgmFile2 || draft.bgmFile, label: '第二幕',
              bpm: draft.bgmBpm, beats: draft.bgmBeats2,
              start: draft.bgm2Start, onChange: (v) => set('bgm2Start', v)
            })) : null,
          h('div', { className: '__ss_two' },
            h(Field, { label: '第一段淡入 / 淡出', hint: '0–10 秒，可小数。' },
              h('div', { className: '__ss_row' },
                h(Range, {
                  min: 0, max: 10, step: 0.1, value: draft.bgm1FadeIn == null ? 1 : draft.bgm1FadeIn,
                  display: (draft.bgm1FadeIn == null ? 1 : draft.bgm1FadeIn).toFixed(1) + 's',
                  onChange: (v) => set('bgm1FadeIn', v)
                }),
                h(Range, {
                  min: 0, max: 10, step: 0.1, value: draft.bgm1FadeOut == null ? 1 : draft.bgm1FadeOut,
                  display: (draft.bgm1FadeOut == null ? 1 : draft.bgm1FadeOut).toFixed(1) + 's',
                  onChange: (v) => set('bgm1FadeOut', v)
                })
              )),
            hasSecondAct ? h(Field, { label: '第二段淡入 / 结束淡出', hint: '结束淡出 = 最后一段音乐收到 0 的时长。' },
              h('div', { className: '__ss_row' },
                h(Range, {
                  min: 0, max: 10, step: 0.1, value: draft.bgm2FadeIn == null ? 1 : draft.bgm2FadeIn,
                  display: (draft.bgm2FadeIn == null ? 1 : draft.bgm2FadeIn).toFixed(1) + 's',
                  onChange: (v) => set('bgm2FadeIn', v)
                }),
                h(Range, {
                  min: 0, max: 10, step: 0.1, value: draft.bgm2FadeOut == null ? 2 : draft.bgm2FadeOut,
                  display: (draft.bgm2FadeOut == null ? 2 : draft.bgm2FadeOut).toFixed(1) + 's',
                  onChange: (v) => set('bgm2FadeOut', v)
                })
              )) : null
          ),
          h('div', { className: '__ss_two' },
            h(Field, { label: '音乐音量', hint: '相对配音 0–100%，默认 50%。' },
              h(Range, {
                min: 0, max: 1, step: 0.05, value: draft.bgmVolume == null ? 0.5 : draft.bgmVolume,
                display: Math.round((draft.bgmVolume == null ? 0.5 : draft.bgmVolume) * 100) + '%',
                onChange: (v) => set('bgmVolume', v)
              })),
            hasSecondAct ? h(Field, { label: '两段交叉', hint: '换曲时旧曲淡出与新曲淡入重叠的时长。' },
              h(Range, {
                min: 0, max: 5000, step: 100, value: draft.bgmCrossfade == null ? 1200 : draft.bgmCrossfade,
                display: (draft.bgmCrossfade == null ? 1200 : draft.bgmCrossfade) + ' ms',
                onChange: (v) => set('bgmCrossfade', v)
              })) : null
          ),
          h('div', { className: '__ss_row' },
            (hasSecondAct && musicLoop) ? h(Check, { checked: draft.bgm2Loop === true, onChange: (v) => set('bgm2Loop', v), label: '第二段循环' }) : null,
            h(Check, { checked: draft.bgmDuck !== false, onChange: (v) => set('bgmDuck', v), label: '配音时自动闪避音乐' })
          ),
          h('div', { className: '__ss_hint' }, '提示：切歌/删歌后请点「保存设置」；冷启动生效，也可用「立即预览」试听。')
        ),

        /* 模板：第一幕 / 第二幕 分开选 */
        h('div', { className: '__ss_group' },
          h('div', { className: '__ss_groupTitle' }, '模板'),
          h(Field, {
            label: '启动动画第一幕',
            hint: '先播这一段。默认「档案暖白」，结尾是 WELCOME TO DEEPSEEK HARNESS。'
          },
            h('div', { className: '__ss_row', style: { flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' } },
              h(Select, {
                value: draft.template || '',
                options: templateOptions,
                onChange: (v) => set('template', v)
              }),
              h('button', {
                className: '__ss_btn',
                type: 'button',
                disabled: busy || !(draft.template || ''),
                title: isTestTemplate(draft.template, 'template') ? '把这个动画放回正式模板列表' : '把这个动画归到测试类模板',
                style: { marginLeft: 'auto', minWidth: '112px' },
                onClick: function () { toggleTest(draft.template, 'template') }
              }, isTestTemplate(draft.template, 'template') ? '移出测试类' : '归类该动画'),
              h('button', {
                className: '__ss_btn',
                type: 'button',
                disabled: busy || !(draft.template || ''),
                title: !draft.template ? '没有选择模板' : (isUserTemplate(draft.template) ? '删除这个本地动画' : '隐藏内置模板（可恢复）'),
                style: { marginLeft: '8px', minWidth: '112px' },
                onClick: function () { deleteTemplate(draft.template) }
              }, '删除该动画')
            )
          ),
          h(Field, {
            label: '第一幕视频原声',
            hint: '第一幕使用视频/导入动画时，是否播放视频自带的声音；默认静音。'
          },
            h(Check, { checked: draft.act1VideoSound === true, onChange: (v) => set('act1VideoSound', v), label: '播放第一幕视频原声' })
          ),
          h(Field, {
            label: '启动动画第二幕',
            hint: '第一幕播完接着播这一段；选「不播放」就第一幕结束直接进聊天。'
          },
            h('div', { className: '__ss_row', style: { flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' } },
              h(Select, {
                value: draft.act2 || '',
                options: act2Options,
                onChange: (v) => set('act2', v)
              }),
              h('button', {
                className: '__ss_btn',
                type: 'button',
                disabled: busy || !(draft.act2 || ''),
                title: isTestTemplate(draft.act2, 'act2') ? '把这个动画放回正式模板列表' : '把这个动画归到测试类模板',
                style: { marginLeft: 'auto', minWidth: '112px' },
                onClick: function () { toggleTest(draft.act2, 'act2') }
              }, isTestTemplate(draft.act2, 'act2') ? '移出测试类' : '归类该动画'),
              h('button', {
                className: '__ss_btn',
                type: 'button',
                disabled: busy || !(draft.act2 || ''),
                title: !draft.act2 ? '没有选择模板' : (isUserTemplate(draft.act2) ? '删除这个本地动画' : '隐藏内置模板（可恢复）'),
                style: { marginLeft: '8px', minWidth: '112px' },
                onClick: function () { deleteTemplate(draft.act2) }
              }, '删除该动画')
            )
          ),
          h(Field, {
            label: '第二幕视频原声',
            hint: '第二幕视频里自带配音/音乐时打开；默认静音。打开后会和背景音乐同时响。'
          },
            h(Check, { checked: draft.act2VideoSound === true, onChange: (v) => set('act2VideoSound', v), label: '播放第二幕视频原声' })
          ),
          h('div', { className: '__ss_row' },
            h('button', {
              className: '__ss_btn',
              type: 'button',
              onClick: function () { openTemplateEditor() }
            }, '打开模板编辑器'),
            h('span', { className: '__ss_hint' }, '在网页里改文案/配色/分幕，保存后回到这里选它')
          ),
          h('div', { className: '__ss_hint' }, '每一幕右侧的「删除该动画」：本地动画会删除文件；内置模板只是隐藏，可随时恢复。'),
          h('div', { className: '__ss_group', style: { marginTop: '18px' } },
            h('div', { className: '__ss_groupTitle' }, '测试类模板'),
            h('div', { className: '__ss_hint' }, '正式下拉只保留常用模板；其余模板归在这里。每幕右侧的「归类该动画 / 移出测试类」可以随时调整分类。'),
            h(Field, { label: '第一幕（测试类）', hint: '选中即切换第一幕；不会影响正式模板列表。' },
              h(Select, {
                value: draft.template && isTestTemplate(draft.template, 'template') ? draft.template : '',
                options: [['', testOptions1.length ? '选择测试类模板…' : '（暂无测试类模板）']].concat(testOptions1),
                onChange: function (v) { if (v) set('template', v) }
              })
            ),
            h(Field, { label: '第二幕（测试类）', hint: '选中即切换第二幕；选「不播放」请用上面的正式下拉。' },
              h(Select, {
                value: draft.act2 && isTestTemplate(draft.act2, 'act2') ? draft.act2 : '',
                options: [['', testOptions2.length ? '选择测试类模板…' : '（暂无测试类模板）']].concat(testOptions2),
                onChange: function (v) { if (v) set('act2', v) }
              })
            ),
            hiddenTemplates.length
              ? h('div', { className: '__ss_row' },
                  h('button', { className: '__ss_btn', type: 'button', disabled: busy, onClick: function () { restoreHiddenTemplates() } }, '恢复已隐藏的内置模板（' + hiddenTemplates.length + '）'),
                  h('span', { className: '__ss_hint' }, '恢复后会重新出现在上面的下拉里')
                )
              : null
          )
        ),

        /* 三段转场（v2.12.0）：第一幕入场 / 两幕衔接 / 第二幕退场 */
        h('div', { className: '__ss_group' },
          h('div', { className: '__ss_groupTitle' }, '转场'),
          h(Field, { label: '第一幕入场', hint: '黑屏进入第一幕的方式；默认交叉叠化（淡入）。' },
            h(Select, { value: draft.transitionIn || 'dissolve', options: transitionOptions, onChange: (v) => set('transitionIn', v) })
          ),
          h(Field, { label: '第一幕 → 第二幕', hint: '两幕之间的衔接；默认交叉叠化。' },
            h(Select, { value: draft.transitionJoin || 'dissolve', options: transitionOptions, onChange: (v) => set('transitionJoin', v) })
          ),
          h(Field, { label: '第二幕 → 桌面', hint: '第二幕结束退场的方式；默认交叉叠化（淡出）。' },
            h(Select, { value: draft.transitionOut || 'dissolve', options: transitionOptions, onChange: (v) => set('transitionOut', v) })
          ),
          h(Field, { label: '转场时长', hint: '200–2000ms；默认 600ms。' },
            h(Range, {
              min: 200, max: 2000, step: 50,
              value: draft.transitionMs == null ? 600 : draft.transitionMs,
              display: (draft.transitionMs == null ? 600 : draft.transitionMs) + ' ms',
              onChange: (v) => set('transitionMs', v)
            })
          ),
          h(Field, { label: '扫描线 / 推移方向', hint: '只对「扫描线」「推移」两种转场生效。' },
            h(Select, { value: draft.transitionDir || 'left', options: transitionDirOptions, onChange: (v) => set('transitionDir', v) })
          )
        ),

        /* v2.15.0：iframe 启动模板「全境大肥鱼」的专属文案（只在选中它时出现） */
        draft.template === 'division-bigfish-codex'
          ? h('div', { className: '__ss_group' },
              h('div', { className: '__ss_groupTitle' }, '全景大肥鱼-含彩蛋版 · 专属文案'),
              h('div', { className: '__ss_hint' }, '只对第一幕「全景大肥鱼-含彩蛋版」生效；留空则用模板自带默认值。'),
              h(Field, { label: '连接用户名', hint: '动画提示条和登录动画里的用户名；最多 20 个字符，\\ / : * ? " < > | 等特殊符号会被忽略。' },
                h(TextInput, { value: draft.bigfishUsername || '', maxLength: 20, onChange: (v) => set('bigfishUsername', Array.from(String(v || '').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim()).slice(0, 20).join('')) })
              ),
              h(Field, { label: '提示条标题' },
                h(TextInput, { value: draft.bigfishTitle || '', maxLength: 60, onChange: (v) => set('bigfishTitle', v) })
              ),
              h(Field, { label: '提示条正文' },
                h(TextInput, { value: draft.bigfishDesc || '', maxLength: 120, onChange: (v) => set('bigfishDesc', v) })
              ),
              h(Field, { label: '强制掉线彩蛋', hint: '只影响这一次启动，方便测试；测试完请关掉。' },
                h(Check, { checked: draft.bigfishForceEgg === true, onChange: (v) => set('bigfishForceEgg', v) })
              ),
              h(Field, { label: '配音效果', hint: '与全局「声音效果」同一套参数，只作用于这个模板自带的五句配音。' },
                h(Select, {
                  value: draft.bigfishVoiceFx || 'none',
                  options: [
                    ['none', '无（原声）'],
                    ['ai-mech', 'AI 机械音'],
                    ['robot', '机器人'],
                    ['radio', '无线电'],
                    ['oldtv', '老电视'],
                    ['dark', '低沉']
                  ],
                  onChange: (v) => set('bigfishVoiceFx', v)
                })
              ),
              h(Field, { label: '配音音量', hint: '只作用于这个模板自带的五句配音；默认 50%，可随时调。' },
                h(Range, {
                  min: 0, max: 100, step: 5,
                  value: draft.bigfishVoiceVolume == null ? 50 : draft.bigfishVoiceVolume,
                  display: (draft.bigfishVoiceVolume == null ? 50 : draft.bigfishVoiceVolume) + '%',
                  onChange: (v) => set('bigfishVoiceVolume', Number(v))
                })
              )
            )
          : null,

        /* 聊天背景引导（另一个窗口的设置） */
        h('div', { className: '__ss_group' },
          h('div', { className: '__ss_groupTitle' }, '聊天背景'),
          h('div', { className: '__ss_hint', style: { lineHeight: '1.9' } },
            '聊天背景是另一个窗口的设置：打开 DSH 设置 →「聊天背景」，',
            '可以选聊天底图 / 大字横幅。',
            h('br'),
            '把图片丢进 ~/.dsh/chat-wallpaper 即可换底图。'
          )
        ),

        /* 身份 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '身份资料'),
          h(Field, {
            label: '身份名称',
            hint: '终幕「欢迎 xxx 访问 / WELCOME, XXX」里的 xxx，也出现在第二步的身份卡上。'
          }, h(TextInput, { value: draft.identity, placeholder: '例如：JOYCE MOORE', onChange: (v) => set('identity', v) })),
          h('div', { className: '__ss_two' },
            h(Field, { label: '身份编号', hint: '显示在第二步身份卡上，建议用数字（如 0087）。' },
              h(TextInput, { value: draft.identityId, mono: true, onChange: (v) => set('identityId', v) })),
            h(Field, { label: '权限等级' },
              h(TextInput, { value: draft.accessLevel, mono: true, onChange: (v) => set('accessLevel', v) }))
          )
        ),

        /* 交互 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '交互'),
          h(Check, {
            label: '需要人工确认',
            hint: '第 1、2 步停下来等按钮 / Enter / 空格；关闭则整段自动播放。',
            checked: draft.requireInteraction,
            onChange: (v) => set('requireInteraction', v)
          }),
          h(Check, {
            label: '允许跳过',
            hint: '右上角显示 SKIP，按 Esc 也能直接进主界面。',
            checked: draft.allowSkip,
            onChange: (v) => set('allowSkip', v)
          }),
          h(Check, {
            label: '音效',
            hint: '默认关闭；开启后在交互确认时有轻微电子音（浏览器需先有一次用户操作）。',
            checked: draft.sound,
            onChange: (v) => set('sound', v)
          }),
          h(Check, {
            label: '背景底噪（硬盘嗡鸣 / 老电视沙沙声）',
            hint: '默认关闭。开启后整段开机铺一层很轻的低频底噪，像机器通电；觉得吵就关掉。',
            checked: draft.bedNoise === true,
            onChange: (v) => set('bedNoise', v)
          })
        ),

        /* 语音与音效 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '语音与音效'),
          h(Check, {
            label: '启用配音播报',
            hint: '每一行的台词都在文字出现的同一时刻念出来，动画等这句话念完再走下一步。',
            checked: draft.voice,
            onChange: (v) => set('voice', v)
          }),
          draft.voice ? h(Field, {
            label: '配音音色',
            hint: '6 套完整干音：英文 1 套（音色F·默认）+ 日文 5 套（日文音色1–5）；可再叠声音效果。'
              + '选完音色后，下面的「声音效果」可以再叠一层处理，或选「无」保留原声。'
          },
            h(Select, {
              value: draft.voicePack || 'f',
              options: voiceOptions(),
              onChange: (v) => set('voicePack', v)
            })
          ) : null,
          draft.voice ? h(Field, {
            label: '声音效果',
            hint: '默认「机器人」；5 个音效都来自模板编辑器里的同一套参数，实时叠加在所选音色上。'
              + '选「无（原声）」就是干净人声；只影响全局配音素材，模板自带的配音不受影响。'
          },
            h(Select, {
              value: draft.voiceFx || 'none',
              options: [
                ['none', '无（原声）'],
                ['ai-mech', 'AI 机械音'],
                ['robot', '机器人（默认）'],
                ['radio', '无线电'],
                ['oldtv', '老电视'],
                ['dark', '低沉']
              ],
              onChange: (v) => set('voiceFx', v)
            })
          ) : null,
          draft.voice ? h(Field, { label: '开口前留白', hint: '提示音响过之后停多久再开口。电影旁白/机场广播都有这一拍，240ms 起最像"系统在播报"。' },
            h(Range, {
              value: num(draft.voiceLead, 240), min: 0, max: 800, step: 20,
              display: Math.round(num(draft.voiceLead, 240)) + ' ms',
              onChange: (v) => set('voiceLead', v)
            })
          ) : null,
          draft.voice ? h(Field, { label: '终幕语音延迟', hint: '05→06 的过场和声钟约 1.5 秒；默认等它收尾再进最后一句。觉得欢迎语进得太早/太晚，就调这里。' },
            h(Range, {
              value: num(draft.welcomeDelay, 550), min: 0, max: 3000, step: 50,
              display: Math.round(num(draft.welcomeDelay, 550)) + ' ms',
              onChange: (v) => set('welcomeDelay', v)
            })
          ) : null,
          draft.voice ? h(Field, { label: '音量' },
            h(Range, { value: num(draft.voiceVolume, 0.9), min: 0, max: 1, display: Math.round(num(draft.voiceVolume, 0.9) * 100) + '%', onChange: (v) => set('voiceVolume', v) })
          ) : null,
          draft.voice ? h(Check, {
            label: '播报前提示音',
            hint: '念台词之前先响两声轻提示 —— 这一笔让 TTS 从「浏览器念字」变成「系统播报」，是 AI 感的关键。',
            checked: draft.voiceCue,
            onChange: (v) => set('voiceCue', v)
          }) : null,
          h(Check, {
            label: '界面音效',
            hint: '咔哒 / 双音确认 / 过场噪声扫频 / 结尾和声钟，全部 WebAudio 现场合成，不含音频文件。',
            checked: draft.sound,
            onChange: (v) => set('sound', v)
          }),
          draft.sound ? h(Field, { label: '音效音量' },
            h(Range, { value: num(draft.soundVolume, 0.5), min: 0, max: 1, display: Math.round(num(draft.soundVolume, 0.5) * 100) + '%', onChange: (v) => set('soundVolume', v) })
          ) : null
        ),

        /* 视觉 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '视觉'),
          h(Field, { label: '主题' },
            h(Select, {
              value: draft.theme,
              options: [['light', '浅色 · 暖白档案底板（参考片原色）'], ['dark', '深色 · 暗底板']],
              onChange: (v) => set('theme', v)
            })
          ),
          h('div', { className: '__ss_two' },
            h(Field, { label: '强调色 · 橙' },
              h('div', { className: '__ss_row' },
                h(ColorInput, { value: draft.accent, onChange: (v) => set('accent', v) }),
                h('span', { className: '__ss_status' }, draft.accent)
              )
            ),
            h(Field, { label: '故障色 · 蓝' },
              h('div', { className: '__ss_row' },
                h(ColorInput, { value: draft.glitchB, onChange: (v) => set('glitchB', v) }),
                h('span', { className: '__ss_status' }, draft.glitchB)
              )
            )
          )
        ),

        /* 文案 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '文案'),
          h('div', { className: '__ss_two' },
            h(Field, { label: '左上 · 主标题' }, h(TextInput, { value: draft.brand1, onChange: (v) => set('brand1', v) })),
            h(Field, { label: '左上 · 产品行' },
              h('div', { className: '__ss_row' },
                h(TextInput, { value: draft.brand3a, onChange: (v) => set('brand3a', v) }),
                h('span', { className: '__ss_status' }, '+'),
                h(TextInput, { value: draft.brand3b, onChange: (v) => set('brand3b', v) })
              )
            )
          ),
          h(Field, { label: '左上 · 副标题' }, h(TextInput, { value: draft.brand2, maxLength: 40, onChange: (v) => set('brand2', v) })),
          h('div', { className: '__ss_two' },
            h(Field, { label: '黑幕 · 中文' }, h(TextInput, { value: draft.orgZh, onChange: (v) => set('orgZh', v) })),
            h(Field, { label: '黑幕 · 英文' }, h(TextInput, { value: draft.orgEn, mono: true, onChange: (v) => set('orgEn', v) }))
          ),
          h('div', { className: '__ss_two' },
            h(Field, { label: '黑幕 · 小字' }, h(TextInput, { value: draft.orgSub, mono: true, onChange: (v) => set('orgSub', v) })),
            h(Field, { label: '终幕 · 黑框' }, h(TextInput, { value: draft.welcomeBox, onChange: (v) => set('welcomeBox', v) }))
          ),
          h(Field, { label: '右下 · 页脚' }, h(TextInput, { value: draft.footer, mono: true, onChange: (v) => set('footer', v) }))
        ),

        /* 预览 + 操作 */
        h('div', { className: '__ss_preview' },
          h('div', { className: '__ss_previewText' },
            '预览会按当前「已保存」的配置重播一次。想先看新配置，先点保存再预览。',
            file ? h('div', { style: { marginTop: '4px', opacity: 0.75 } }, '配置文件：' + file) : null
          ),
          h('button', { className: '__ss_btn', onClick: preview }, '立即预览')
        ),

        /* 版本与更新 */
        h('div', { className: '__ss_row', style: { marginTop: '10px' } },
          h('button', { className: '__ss_btn', disabled: checking, onClick: checkUpdate }, checking ? '检查中…' : '检查更新'),
          h('button', { className: '__ss_btn', disabled: diagnosing, onClick: runDiagnose }, diagnosing ? '生成中…' : '生成诊断报告'),
          h('span', {
            className: (update && update.ok && update.hasUpdate) ? '__ss_ok' : '__ss_hint'
          }, (function () {
            if (checking) return '正在读取 GitHub 最新版本…'
            if (!update) return '当前版本 v' + (version || FALLBACK_VERSION)
            if (update.ok === false) return '检查失败：' + (update.error || '未知') + '（不影响使用）'
            if (update.hasUpdate) return '有新版本 v' + update.latest + '（当前 v' + update.current + '）'
            return '已是最新（v' + (update.current || version) + '）'
          })()),
          (update && update.ok && update.hasUpdate && update.url)
            ? h('a', { className: '__ss_link', href: update.url, target: '_blank', rel: 'noreferrer' }, '打开下载页')
            : null,
          (update && update.ok && update.hasUpdate)
            ? h('button', { className: '__ss_btn __ss_btnPrimary', disabled: updating, onClick: runUpdate }, updating ? '更新中…' : '立即更新')
            : null,
          (update && update.ok && update.hasUpdate)
            ? h('button', { className: '__ss_btn', disabled: updating && !waitingDownload, onClick: pickLocalPackage }, '选择安装包')
            : null,
          (update && update.ok && update.hasUpdate && waitingDownload)
            ? h('button', { className: '__ss_btn', onClick: openDownloads }, '打开下载文件夹')
            : null
        ),
        (update && update.ok && update.hasUpdate)
          ? h('div', { className: '__ss_hint', style: { marginTop: '6px', lineHeight: '1.8' } },
              '下载会优先用 Chrome（Edge + IDM 可能拦下载）。如果没自动继续，点「打开下载文件夹」找到 zip，再点「选择安装包」。')
          : null,
        waitingDownload
          ? h('div', { className: '__ss_hint', style: { marginTop: '6px', lineHeight: '1.8', color: '#c98a2b' } },
              '正在等浏览器下载（最多 30 分钟）。下载完成后会自动继续；如果已经下好，点「打开下载文件夹」看看，或直接点「选择安装包」选那个 zip。')
          : null,
        h('div', { className: '__ss_hint', style: { marginTop: '6px', lineHeight: '1.8' } },
          '回滚保护：安装新版本前，桌面会自动多一个「紧急回滚-V当前版本」按钮。新版装不上、或装完 DSH 打不开时，完全退出 DSH（窗口+托盘）后双击它，就能回到更新前的版本；它只换插件版本，不动你的设置。更新成功后旧按钮会被自动替换，不会越积越多——确认新版正常后也不用手动删。'),
        updateMsg ? h('div', { className: '__ss_hint', style: { marginTop: '6px', lineHeight: '1.8' } }, updateMsg) : null,

        /* 鸣谢 */
        h('div', { className: '__ss_group', style: { marginTop: '10px' } },
          h('div', { className: '__ss_groupTitle' }, '鸣谢（原动画版权归原作者）'),
          h('div', { className: '__ss_hint', style: { lineHeight: '1.9' } },
            '片头（档案暖白）参考：沈宏宏（@6shenhonghong9） · ',
            h('a', { className: '__ss_link', href: 'https://github.com/6shenhonghong9/dsh-startup-screen', target: '_blank', rel: 'noreferrer' }, 'dsh-startup-screen'),
            h('br'),
            '鲸鱼娘素材：NativeDog1/dsh-boot-animation 内置片库「DeepSeek娘扫描睁眼」（BSD-3-Clause）；随包提供 2K/4K 两版可选；8K 版请自行下载（桌面端有内存崩溃风险，仅建议网页端/收藏）：https://github.com/1catmint1/dsh-boot-animation-8k（8K 超分：1catmint1，BSD-3-Clause） · ',
            h('a', { className: '__ss_link', href: 'https://github.com/NativeDog1/dsh-boot-animation', target: '_blank', rel: 'noreferrer' }, 'dsh-boot-animation'),
            h('br'),
            '皮肤「封锁橙」原作者：之一ONETHING（B 站） · ',
            h('a', { className: '__ss_link', href: 'https://github.com/oenthing/blockade-orange-dsh-skin', target: '_blank', rel: 'noreferrer' }, 'blockade-orange-dsh-skin'),
            h('br'),
            '余额表盘原作者：胡萨尔cC（B 站）/ @goooooooeg · ',
            h('a', { className: '__ss_link', href: 'https://github.com/goooooooeg/dsh-balance-hud', target: '_blank', rel: 'noreferrer' }, 'dsh-balance-hud'),
            h('br'),
            '配音：DeepSeek · 语音包与台词由作者提供'
          )
        ),

        h('div', { className: '__ss_actions' },
          h('button', {
            className: '__ss_btn __ss_btnPrimary',
            disabled: busy,
            onClick: save
          }, busy ? '处理中…' : '保存'),
          h('button', { className: '__ss_btn', disabled: busy, onClick: reset }, '恢复默认'),
          h('button', { className: '__ss_btn', disabled: busy, onClick: load }, '放弃修改'),
          notice ? h('span', { className: '__ss_ok' }, notice) : null,
          error ? h('span', { className: '__ss_err' }, error) : null
        )
      )
    }

    /* ── 桌面端自举 ──────────────────────────────────────────────────────── */
    /* Host 半侧靠 ctx.webServer.tapIndex 往 index.html 里注入启动界面。
       web profile 一定走这条路；但 Electron 也可能改用 file:// + IPC 直接下发
       前端（dsh-host-webserver 的注释就写着 "Electron uses file:// plus IPC
       instead"），那时 index 注入整条不生效。所以浏览器半侧自己兜一层：
       没被 Host 接管时，由本侧建根节点 + 拉 splash.css/splash.js 自举。

       判定全在 window 上，不去猜宿主类型：
         __DSH_STARTUP_BOOT__  Host 已经注入过（index）/ 本侧已经自举过（client）
         __DSH_STARTUP_SKIP__  Host 侧的兜底脚本已判定"这次不播"
         __DSH_STARTUP__       配置已就位（Host 注入的）
       Host 判定失效时不该被静默吃掉，所以这里在拦到 SKIP 之前，还要看一眼
       Host 侧根本没跑过（BOOT 标记为空）这种情况：把兜底脚本的同款判定补做一遍。 */
    var BOOT_ROUTE = '/dsh-startup'

    function readFlag(store, key) {
      try {
        var s = window[store]
        return s ? s.getItem(key) : null
      } catch (e) { return null }
    }

    function writeFlag(store, key, value) {
      try {
        var s = window[store]
        if (s) s.setItem(key, value)
      } catch (e) { /* 隐私模式下可能抛，忽略 */ }
    }

    /* ── 桌面窗口的原生按钮条 ────────────────────────────────────────────
       Electron 的 titleBarOverlay 画在页面之上，任何 z-index 都盖不住。
       DSH 的 preload 会测量 body 里一个探针 span 的 background-color/color，
       再 setTitleBarOverlay() 画那条带子，并在 <head> 变动时重新测量。
       所以片头期间把探针改成透明：三个按钮就浮在动画上，而不是压在一条实心条上。
       片头结束移除样式，head 变动本身触发重新测量，DSH 恢复自己的颜色。 */
    /* 让 DSH preload 重新测一次探针颜色：往 head 塞一个空 style 再撤掉。
       preload 监听的是 head 的 childList，所以这样能强制它重发 titleBarOverlay。 */
    function syncCaptionProbe() {
      try {
        var s = document.createElement('style')
        s.textContent = '/*dsh-cw-caption-sync*/'
        ;(document.head || document.documentElement).appendChild(s)
        setTimeout(function () {
          try { if (s.parentNode) s.parentNode.removeChild(s) } catch (e) { /* 忽略 */ }
        }, 0)
      } catch (e) { /* 纯装饰，失败不影响功能 */ }
    }
    try { window.__DSH_CW_SYNC_CAPTION__ = syncCaptionProbe } catch (e) { /* 忽略 */ }

    function adaptCaption(on) {
      try {
        var ID = 'dsh-startup-caption'
        var old = document.getElementById(ID)
        /* data-dsh-caption 是给壁纸样式用的开关：片头期间探针必须保持透明，
           壁纸里那对「窗口按钮固定色」规则看到这个属性就不生效。 */
        try {
          if (on) document.documentElement.setAttribute('data-dsh-caption', '1')
          else document.documentElement.removeAttribute('data-dsh-caption')
        } catch (eAttr) { /* 忽略 */ }
        if (!on) {
          if (old && old.parentNode) old.parentNode.removeChild(old)
          /* 片头结束 / 真正移除探针样式后，强制 preload 重测一次，
             让窗口按钮带换上壁纸样式里那对固定色。 */
          syncCaptionProbe()
          return
        }
        if (old) return
        /* mac 没有 titleBarOverlay；其余平台一律尝试（没有探针时这条样式是空操作）。
           早期版本还额外要求 html[data-platform] 存在，实测某些桌面版本该属性为空，
           那条 gate 反而把功能挡掉了。 */
        var platform = document.documentElement && document.documentElement.dataset
          ? document.documentElement.dataset.platform : ''
        if (platform === 'darwin') return
        var st = document.createElement('style')
        st.id = ID
        /* 探针选择器照抄 DSH Desktop preload 的测量对象，另附两种兜底写法 */
        st.textContent = [
          'body>span[style*="dsw-specific-sidebar-fill"]',
          'body span[style*="dsw-specific-sidebar-fill"]',
          'body>span[style*="sidebar-fill"]'
        ].join(',') + '{background-color:transparent !important;color:#dfe7f3 !important}'
        ;(document.head || document.documentElement).appendChild(st)
      } catch (e) { /* 纯装饰，失败不影响任何功能 */ }
    }

    /* 一次性探针：标题栏那条带子到底由什么控制？把现场事实写回诊断日志，
       比反复猜选择器可靠。启动后 1.5 秒跑一次，开销可忽略。 */
    function probeCaption() {
      try {
        var out = {
          dataset: Object.assign({}, document.documentElement.dataset || {}),
          applied: !!document.getElementById('dsh-startup-caption'),
          rootPresent: !!document.getElementById('dsh-startup-root'),
          bootFlag: String(window.__DSH_STARTUP_BOOT__ || ''),
          skipFlag: window.__DSH_STARTUP_SKIP__ === true,
          probes: [],
          corner: '',
          cornerStack: [],
          frameEls: []
        }
        var spans = document.querySelectorAll('body > span, body span')
        for (var i = 0; i < spans.length && out.probes.length < 6; i++) {
          var st = String(spans[i].getAttribute('style') || '')
          if (st.indexOf('sidebar-fill') !== -1) {
            out.probes.push({
              tag: spans[i].tagName,
              parent: spans[i].parentNode ? spans[i].parentNode.tagName : '',
              style: st.slice(0, 140)
            })
          }
        }
        try {
          var el = document.elementFromPoint(window.innerWidth - 40, 18)
          out.corner = el ? (el.tagName + '#' + (el.id || '') + '.' + String(el.className || '').slice(0, 60)) : ''
          /* 记录右上角 6 层堆栈：新 DSH 的标题栏探针可能换了容器，单看一层不够 */
          var node = el
          for (var d = 0; node && d < 6; d++) {
            var cs = null
            try { cs = window.getComputedStyle(node) } catch (e3) { cs = null }
            out.cornerStack.push({
              tag: node.tagName,
              id: node.id || '',
              cls: String(node.className || '').slice(0, 80),
              bg: cs ? cs.backgroundColor : '',
              pe: cs ? cs.pointerEvents : ''
            })
            node = node.parentNode
          }
        } catch (e2) { /* noop */ }
        try {
          var frames = document.querySelectorAll('[class*="frame"], [class*="Frame"]')
          for (var fi = 0; fi < frames.length && out.frameEls.length < 8; fi++) {
            var fe = frames[fi]
            var fcs = null
            try { fcs = window.getComputedStyle(fe) } catch (e4) { fcs = null }
            out.frameEls.push({
              tag: fe.tagName,
              id: fe.id || '',
              cls: String(fe.className || '').slice(0, 80),
              bg: fcs ? fcs.backgroundColor : '',
              rect: (function () { try { var r = fe.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] } catch (e5) { return null } })()
            })
          }
        } catch (e6) { /* noop */ }
        fetch(BOOT_ROUTE + '/diag', {
          method: 'POST',
          headers: { 'content-type': 'text/plain' },
          body: 'caption-probe ' + JSON.stringify(out)
        }).catch(function () { /* 诊断失败不影响启动 */ })
      } catch (e) { /* noop */ }
    }

    function markBooted() {
      try { window.__DSH_STARTUP_BOOT__ = 'client' } catch (e) { /* noop */ }
    }

    /* 片头结束后把标题栏还给 DSH；再兜一个 40 秒的上限，防止动画异常时一直透明 */
    try {
      window.addEventListener('dsh-startup:done', function () { adaptCaption(false) })
      setTimeout(function () { adaptCaption(false) }, 40000)
    } catch (e) { /* noop */ }

    /** 挂一个 <script src>；失败时调 fail(err)。 */
    function loadScript(src, fail) {
      var s = document.createElement('script')
      s.src = src
      s.async = false
      if (typeof fail === 'function') {
        s.addEventListener('load', function () { fail(null) })
        s.addEventListener('error', function () { fail(new Error('script load failed: ' + src)) })
      }
      ;(document.head || document.documentElement).appendChild(s)
    }

    /** 挂一份 <link rel=stylesheet>；失败时调 fail(err)。 */
    function loadCss(href, fail) {
      var link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      if (typeof fail === 'function') {
        link.addEventListener('load', function () { fail(null) })
        link.addEventListener('error', function () { fail(new Error('css load failed: ' + href)) })
      }
      ;(document.head || document.documentElement).appendChild(link)
    }

    /** 移除根节点、解开滚动锁定 —— 自举任何一步失败都要把页面还回去。 */
    function release(ok) {
      if (ok) return
      adaptCaption(false)
      try {
        var r = document.getElementById('dsh-startup-root')
        if (r && r.parentNode) r.parentNode.removeChild(r)
        if (document.documentElement.classList) document.documentElement.classList.remove('dsu-lock')
        if (document.body && document.body.style) document.body.style.overflow = ''
        window.__DSH_STARTUP_FAILED__ = true
      } catch (e) { /* 兜底不再抛 */ }
    }

    function injectRoot(cfg) {
      var root = document.getElementById('dsh-startup-root')
      if (!root) {
        root = document.createElement('div')
        root.id = 'dsh-startup-root'
        document.body.appendChild(root)
      }
      root.className = 'dsu-root dsu-boot'
      adaptCaption(true)
      setTimeout(probeCaption, 1500)
      setTimeout(probeCaption, 4200)
      if (document.documentElement.classList) document.documentElement.classList.add('dsu-lock')
      if (document.body && document.body.style) document.body.style.overflow = 'hidden'

      /* 样式与运行时都从 Host 路由取 —— 同一份文件，不额外维护内联副本 */
      var failed = false
      var cssReady = false
      var scriptReady = false
      function guard(err) {
        if (err) {
          if (!failed && typeof console !== 'undefined' && console.warn) {
            console.warn('[dsh-startup-screen] 启动界面自举失败，已放开页面：', err.message)
            reportDiag('injectRoot 失败: ' + err.message)
          }
          failed = true
          release(false)
          return
        }
        if (cssReady && scriptReady) release(true)
      }

      loadCss(BOOT_ROUTE + '/splash.css', function (err) {
        if (err) { guard(err); return }
        cssReady = true
        guard(null)
      })

      /* 配置先落 window：splash.js 载入时直接读它 */
      window.__DSH_STARTUP__ = cfg || {}
      try {
        delete window.__DSH_STARTUP_LOADED__
      } catch (e) { window.__DSH_STARTUP_LOADED__ = undefined }
      loadScript(BOOT_ROUTE + '/splash.js?t=' + Date.now(), function (err) {
        if (err) { guard(err); return }
        scriptReady = true
        guard(null)
      })

      /* 自愈：样式与脚本都拿到了、这个标记还在，就说明动画没接管，放行 */
      setTimeout(function () {
        try {
          var r = document.getElementById('dsh-startup-root')
          if (r && r.className && r.className.indexOf('dsu-boot') !== -1) release(false)
        } catch (e) { /* 兜底不再抛 */ }
      }, 9000)
    }

    function selfBoot() {
      try {
        if (typeof window === 'undefined' || typeof document === 'undefined') return
        if (!document.body) return
        if (window.__DSH_STARTUP_BOOT__) return          /* 已被 Host 或本侧接管 */
        if (window.__DSH_STARTUP__) return               /* 配置已在页面上：Host 注入过 */
        if (document.getElementById('dsh-startup-root')) return
        /* 已经出过错的地方不要再扑一次 */
        if (window.__DSH_STARTUP_FAILED__ === true) return
        markBooted()
        fetch(API, { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json() })
          .then(function (j) { return j && j.ok === true ? j.config : null })
          .catch(function () { return null })
          .then(function (cfg) {
            cfg = cfg || { enabled: true, mode: 'session', speed: 1 }
            if (cfg.enabled === false) return
            var today = new Date().toISOString().slice(0, 10)
            if (cfg.mode === 'session' && readFlag('sessionStorage', 'dsh-startup-screen:shown') === '1') return
            if (cfg.mode === 'daily' && readFlag('localStorage', 'dsh-startup-screen:day') === today) return
            /* 回填判定标记，保证与 Host 侧同款语义（splash.js 会读这两个键） */
            if (cfg.mode === 'session') writeFlag('sessionStorage', 'dsh-startup-screen:shown', '1')
            if (cfg.mode === 'daily') writeFlag('localStorage', 'dsh-startup-screen:day', today)
            return injectRoot(cfg)
          })
          .catch(function () { /* 自举失败就算了，页面本来就是好的 */ })
      } catch (e) { /* 自举是兜底，绝不许把宿主带崩 */ }
    }

    /* ── 启动期取证 + 黑屏自愈 ────────────────────────────────────────────── */

    /** 把启动期异常回传宿主（POST /dsh-startup/diag）。最多 8 条，失败静默。 */
    var diagSent = 0
    function reportDiag(msg) {
      if (diagSent >= 8) return
      diagSent++
      try {
        fetch(API.replace('/config', '/diag'), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: String(msg).slice(0, 900)
        }).catch(function () { /* 取证失败不影响启动 */ })
      } catch (e) { /* 同上 */ }
    }

    /* 黑屏自愈：Host 那侧把黑幕（根节点 + CSS）注进来了，但运行时没起来。
       成因可能是 splash.js 被栅栏拦下、加载后抛错，或者注入行里的外部脚本
       被页面侧解释器丢掉了。判据：800ms 后根节点仍带 dsu-boot、运行时既没
       加载过也没挂出 API —— 那就自己把 CSS/JS 补上。800ms 足够让正常的
       script-src 行跑完；跑不完说明它压根没执行，这时候补注入是唯一出路。
       宁可多闪一下，也不能停在一块纯黑屏上干等 9 秒兜底。 */
    var healDone = false
    function healBlackScreen() {
      try {
        setTimeout(function () {
          try {
            if (typeof window === 'undefined' || typeof document === 'undefined') return
            if (window.__DSH_STARTUP_FAILED__ === true) return
            if (window.__DSH_STARTUP_LOADED__) return
            if (window.__DSH_STARTUP_API__) return
            var root = document.getElementById('dsh-startup-root')
            if (!root) return
            if ((root.className || '').indexOf('dsu-boot') === -1) return
            /* 注意：判据只看"运行时有没有真的跑起来"，不看"文档里有没有 script 标签"。
               2.1.1 就是栽在这上面 —— 标签在文档里但被当成 innerHTML 插进去、永远
               不执行，于是自愈以为"只等就好"，动画彻底不出现。
               这里直接补一次 DOM 注入的 loadScript（这条路实测一定能执行），
               splash.js 自身的 __DSH_STARTUP_LOADED__ 单例守卫会挡住第二次初始化。 */
            healDone = true
            reportDiag('heal: 800ms 运行时未起来，自行注入（boot=' + String(window.__DSH_STARTUP_BOOT__) + '）')
            markBooted()
            injectRoot(window.__DSH_STARTUP__ || {})
          } catch (e) { /* 自愈失败也不能带崩宿主 */ }
        }, 800)
      } catch (e) { /* noop */ }
    }

    /* 启动期错误回传：只关心来自 /dsh-startup/ 的脚本错误 */
    try {
      window.addEventListener('error', function (ev) {
        try {
          var file = (ev && ev.filename) || ''
          if (file.indexOf('/dsh-startup/') === -1) return
          reportDiag('onerror: ' + String((ev && ev.message) || '') + ' @ ' + file + ':' + String((ev && ev.lineno) || 0))
        } catch (e) { /* noop */ }
      })
      window.addEventListener('unhandledrejection', function (ev) {
        try {
          var r = ev && ev.reason
          reportDiag('unhandledrejection: ' + String((r && r.message) || r))
        } catch (e) { /* noop */ }
      })
    } catch (e) { /* noop */ }

    /* ── 模板编辑器：在应用内嵌一层全屏面板打开 ─────────────────────────────
       不能用 window.open —— Electron 渲染进程通常不允许新开窗口，点了没反应。
       这里直接在 body 上盖一个 iframe，同源、带会话，编辑器里的接口都能用。 */
    function openTemplateEditor() {
      try {
        var old = document.getElementById('dsu-editor-overlay')
        if (old && old.parentNode) old.parentNode.removeChild(old)

        var wrap = document.createElement('div')
        wrap.id = 'dsu-editor-overlay'
        wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#0b0d11;display:flex;flex-direction:column'

        var bar = document.createElement('div')
        bar.style.cssText = 'flex:0 0 auto;display:flex;align-items:center;gap:12px;padding:10px 14px;background:#14161a;color:#e8ecf2;font:14px/1.6 Segoe UI,Microsoft YaHei,sans-serif;border-bottom:1px solid #2a2f38'

        var title = document.createElement('span')
        title.style.cssText = 'font-weight:600;letter-spacing:.02em'
        title.textContent = '启动动画 · 模板编辑器'

        var msg = document.createElement('span')
        msg.style.cssText = 'color:#9aa4b2;font-size:12px;flex:1'
        msg.textContent = '正在加载编辑器…'

        var close = document.createElement('button')
        close.textContent = '✕ 关闭（Esc）'
        /* 关闭是中性操作，不用危险红（红只留给「删除模板」这类真破坏性动作，§2.8.1） */
        close.style.cssText = 'flex:0 0 auto;background:#2a2f38;color:#e8ecf2;border:1px solid #3d4654;border-radius:8px;padding:8px 16px;cursor:pointer;font:inherit;font-weight:600'
        function closeIt() {
          try { if (wrap.parentNode) wrap.parentNode.removeChild(wrap) } catch (e) {}
          try { document.removeEventListener('keydown', onKey, true) } catch (e) {}
        }
        close.onclick = closeIt

        var onKey = function (ev) { if (ev && ev.key === 'Escape') { closeIt() } }
        try { document.addEventListener('keydown', onKey, true) } catch (e) {}

        /* 关闭按钮放最左边：右上角被客户端窗口的最小化/最大化/关闭压着，放那儿点不到 */
        var spacerRight = document.createElement('span')
        spacerRight.style.cssText = 'flex:0 0 150px'
        bar.appendChild(close); bar.appendChild(title); bar.appendChild(msg); bar.appendChild(spacerRight)

        var frame = document.createElement('iframe')
        frame.style.cssText = 'flex:1;border:0;width:100%;height:100%;background:#0b0d11'
        frame.setAttribute('allow', 'clipboard-write')

        wrap.appendChild(bar); wrap.appendChild(frame)
        document.body.appendChild(wrap)

        /* 不走 iframe 导航 —— 那一步会被宿主的信任栅栏挡成空白页。
           先把编辑器页面源码取回来（和设置面板同一个 fetch 通道，能过栅栏），
           再塞进 srcdoc，页面就不用再发一次导航请求了。 */
        fetch(BOOT_ROUTE + '/editor', { headers: { Accept: 'text/html' }, cache: 'no-store' })
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status)
            return r.text()
          })
          .then(function (html) {
            if (!html || html.length < 500) throw new Error('页面内容异常（' + html.length + ' 字节）')
            msg.textContent = '按 Esc 或右上角关闭'
            frame.srcdoc = html
            /* 自检：编辑器脚本跑起来的话左侧表单会被填满；没填满就是被 CSP 拦了 */
            setTimeout(function () {
              try {
                var doc = frame.contentDocument
                var sideEl = doc && doc.getElementById('side')
                if (sideEl && sideEl.children.length > 0) { msg.textContent = '按 Esc 或右上角关闭'; return }
                msg.textContent = '编辑器脚本没跑起来（可能被页面 CSP 拦了内联脚本）—— 把这句话告诉大肥鱼'
              } catch (e) {
                msg.textContent = '读不到编辑器内容：' + String((e && e.message) || e)
              }
            }, 1500)
          })
          .catch(function (e) {
            msg.textContent = '编辑器没加载出来：' + String((e && e.message) || e) + ' —— 把这句话告诉大肥鱼'
          })
      } catch (e) {
        try { console.warn('[dsh-startup-screen] 打不开模板编辑器：', String((e && e.message) || e)) } catch (e2) { /* noop */ }
      }
    }

    /* ── 插件 ────────────────────────────────────────────────────────────── */
    var inject = ['slots']

    function apply(ctx) {
      /* 桌面端兜底：Host 的 index 注入不生效时，由这里自举启动界面。
         正常 web 流程下 __DSH_STARTUP__/__DSH_STARTUP_BOOT__ 已就位，本调用直接返回。 */
      selfBoot()
      /* 标题栏适配不能只放在 injectRoot 里：宿主注入成功时 selfBoot 会提前返回，
         injectRoot 根本不会执行 —— 这就是 2.5.0 里那条没生效的根因。
         这里再补一次（幂等），并挂上一次性探针。 */
      try {
        var bootCfg = window.__DSH_STARTUP__ || null
        if (!bootCfg || bootCfg.enabled !== false) {
          adaptCaption(true)
          setTimeout(probeCaption, 1800)
          setTimeout(probeCaption, 4500)
        }
      } catch (e) { /* noop */ }
      healBlackScreen()
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register(
          { name: 'settings.section', id: 'startup-screen', order: 26, label: '启动动画' },
          function () { return h(Panel, {}) }
        )
      })
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
    })()

    /* 第二段执行：聊天壁纸（原 dsh-chat-wallpaper）*/
    var __wallHalf = (function () {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var TAG_ID = 'dsh-chat-wallpaper/main.css'
    var BG_ID = 'dsh-cw-bg'              /* 聊天底图层（用户自己定的那张图 + 纱；视频也放这一层）*/
    var VIDEO_ID = 'dsh-cw-video'        /* 循环视频元素 */
    var BANNER_ID = 'dsh-cw-banner'      /* 大字横幅层（铺满窗口的那行字，z-index:-1）*/
    var API = '/chat-wallpaper'
    /* v2.13.1：插件自带默认背景图的两个哨兵值（与 host-wallpaper.js 一一对应） */
    var BUILTIN_IMAGE_ID = '__default__'
    var NO_IMAGE_ID = '__none__'
    /* 每次改客户端就把这个号 +1。
       有了它在控制台一眼就能判断"浏览器里跑的是不是最新那份" ——
       排查问题时，分不清是代码问题还是旧包，会白猜一轮。 */
    var BUILD = 'cw-77'

    function log() {
      try {
        var a = ['[chat-wallpaper]']
        for (var i = 0; i < arguments.length; i++) a.push(arguments[i])
        console.log.apply(console, a)
      } catch (e) { /* console 不可用就算了 */ }
    }

    /* ── 主题判定 ───────────────────────────────────────────────────────── */

    /**
     * 扫 html/body 上所有属性的名字与值，以及 className，找 "dark"。
     *
     * v2.13.5 修复：必须忽略**我们自己写的** dsh-cw-* 类。
     * v2.13.8 补刀：光忽略 dsh-cw-dark/light 不够——壁纸模式还会写
     * dsh-cw-bg-dark（暗壁纸），里面同样含 "dark"。结果浅色外观 + 暗壁纸时
     * 仍被误判成深色外观，侧边栏/输入框继续刷白字。
     * 现在一律剥掉整个 dsh-cw-* 命名空间。
     */
    function markerSaysDark() {
      var els = [document.documentElement, document.body]
      for (var i = 0; i < els.length; i++) {
        var el = els[i]
        if (!el) continue
        var cls = String(el.className || '').replace(/dsh-cw-[a-z0-9-]+/gi, '')
        if (/dark/i.test(cls)) return true
        var attrs = el.attributes || []
        for (var j = 0; j < attrs.length; j++) {
          var a = attrs[j]
          if (/^dsh-cw-/i.test(String(a.value || ''))) continue
          if (/^data-dsh-cw/i.test(String(a.name || ''))) continue
          if (/dark/i.test(a.name) || /dark/i.test(String(a.value))) return true
        }
      }
      return false
    }

    /**
     * v2.13.5：直接读 DSH 主题插件写的文字 token，判断当前是深色还是浅色。
     * v2.13.8：同时支持 #rrggbb / #rgb / rgb()/rgba()，并检查 html 与 body，
     * 因为主题插件到底把变量写在哪一层并不保证。
     * 返回 true=深色主题，false=浅色主题，null=读不到（退回旧判定）。
     */
    function tokenSaysDark() {
      var toLum = function (raw) {
        var s = String(raw || '').trim()
        if (!s) return null
        var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s)
        if (m) {
          var h = m[1]
          if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
          var r3 = parseInt(h.slice(0, 2), 16), g3 = parseInt(h.slice(2, 4), 16), b3 = parseInt(h.slice(4, 6), 16)
          return (0.2126 * r3 + 0.7152 * g3 + 0.0722 * b3) / 255
        }
        var m2 = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/.exec(s)
        if (!m2) return null
        if (m2[4] !== undefined && parseFloat(m2[4]) === 0) return null
        return (0.2126 * +m2[1] + 0.7152 * +m2[2] + 0.0722 * +m2[3]) / 255
      }
      try {
        if (typeof getComputedStyle !== 'function') return null
        var els = [document.body, document.documentElement]
        for (var i = 0; i < els.length; i++) {
          if (!els[i]) continue
          var lum = toLum(getComputedStyle(els[i]).getPropertyValue('--dsw-alias-label-primary'))
          if (lum !== null) return lum > 0.55
        }
        return null
      } catch (e) { return null }
    }

    /** 兜底：量一下外壳的实心底色亮度（必须在注入我们自己的 CSS 之前调用） */
    function bgLuminance() {
      try {
        var el = document.getElementById('root') || document.body
        var c = getComputedStyle(el).backgroundColor
        var m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(c || '')
        if (!m) return -1
        var alpha = m[4] === undefined ? 1 : parseFloat(m[4])
        // 透明底 = 判断不了，必须返回"未知"。
        // 否则会把 rgba(0,0,0,0) 当成纯黑判成深色 —— 而我们的 CSS 恰恰把外壳变透明，
        // 于是主题一变，壁纸就自己判自己深色、把自己撤掉（自杀式回归）。
        if (!(alpha > 0)) return -1
        return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255
      } catch (e) { return -1 }
    }

    /**
     * 主题判定。
     *
     * 亮度只在**第一次**判定时量，之后缓存 —— 因为一旦我们的 CSS 生效，
     * 外壳底色就变透明了，再量只会得到"未知"（见 bgLuminance 的注释）。
     * 之后的主题变化靠标记判定（MutationObserver 会在属性变化时重跑）。
     */
    var measuredLum = null

    function looksDark() {
      var tok = tokenSaysDark()
      if (tok !== null) return tok
      if (markerSaysDark()) return true
      if (measuredLum === null) measuredLum = bgLuminance()
      return measuredLum >= 0 && measuredLum < 0.45
    }

    /* ── 背景亮度采样 / 文字自适应（v2.13.5）────────────────────────────────
       目的：壁纸暗就白字、壁纸亮就黑字，跟 DSH 外观是浅色还是深色无关。
       之前"纱"只跟外观走：浅色外观 + 深色壁纸 → 白纱把暗图盖亮，或反过来
       深色外观 + 亮图 → 深纱盖暗。用户想保留的暗背景经常被洗掉。
       现在：纱和兜底色都改跟壁纸原始亮度走；文字颜色只覆盖聊天区根节点。 */

    var BG_DARK = 'dsh-cw-bg-dark'     /* 壁纸偏暗：压深纱 */
    var BG_LIGHT = 'dsh-cw-bg-light'   /* 壁纸偏亮：压白纱 */
    var TXT_LIGHT = 'dsh-cw-txt-light' /* 暗背景 → 文字提亮 */
    var TXT_DARK = 'dsh-cw-txt-dark'   /* 亮背景 → 文字压深 */
    var PANEL_LIGHT = 'dsh-cw-panel-light' /* 暗背景 → 侧边栏/输入框深色面板 */
    var PANEL_DARK = 'dsh-cw-panel-dark'   /* 亮背景 → 侧边栏/输入框浅色面板 */
    var bgMode = null                  /* 'dark' | 'light' | null */
    var txtTargets = []                /* v2.13.6：聊天区 + 侧边栏 + 输入框多个根节点 */
    var lumTimer = null
    var imgLumCache = {}

    function relLum(r, g, b) { return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 }

    /** 把一个 <img>/<video> 缩到 24×24 画到画布上，取**中间区域**平均亮度（透明处按黑算）
     *  v2.13.9：不再平均整张图——聊天文字主要压在画面中间，整图平均会被四角带偏
     *  （比如中间亮、四周暗的壁纸会误判成暗背景，白字压亮处就看不清）。 */
    function sampleLum(el) {
      try {
        if (!el) return -1
        var c = document.createElement('canvas')
        c.width = 24; c.height = 24
        var ctx = c.getContext('2d', { willReadFrequently: true })
        if (!ctx) return -1
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, 24, 24)
        ctx.drawImage(el, 0, 0, 24, 24)
        var d = ctx.getImageData(0, 0, 24, 24).data
        var sum = 0, n = 0
        for (var y = 6; y < 18; y++) {
          for (var x = 6; x < 18; x++) {
            var i = (y * 24 + x) * 4
            if (d[i + 3] < 16) continue
            sum += relLum(d[i], d[i + 1], d[i + 2]); n++
          }
        }
        return n ? sum / n : -1
      } catch (e) { return -1 }
    }

    /** 当前壁纸的原始亮度（不含纱）。-1 = 还没准备好 */
    function rawLum() {
      var v = document.getElementById(VIDEO_ID)
      if (v && v.readyState >= 2) return sampleLum(v)
      var img = document.querySelector('#' + BG_ID + ' > img')
      if (img && img.complete && img.naturalWidth) {
        var k = img.currentSrc || img.src || ''
        if (imgLumCache[k] == null) imgLumCache[k] = sampleLum(img)
        return imgLumCache[k]
      }
      return -1
    }

    /**
     * v2.13.9：读「纱」的实际深浅（颜色 + 透明度）。
     *
     * 纱现在只跟 DSH 外观走（浅色外观用浅色纱、深色外观用深色纱），
     * 用户在设置页拖的浓度滑块直接改的就是这个。文字颜色必须按
     * 「壁纸 + 纱」叠完后的真实亮度来定，否则纱很浓时白字会压在亮底上。
     */
    function veilBlend() {
      try {
        var v = document.querySelector('#' + BG_ID + ' > .dsh-cw-veil')
        if (!v || typeof getComputedStyle !== 'function') return null
        var bg = String(getComputedStyle(v).backgroundImage || '')
        var re = /rgba?\(([^)]+)\)/g
        var m, sumA = 0, sumL = 0, n = 0
        while ((m = re.exec(bg))) {
          var p = m[1].split(/[,/]/)
          var r = parseFloat(p[0]), g = parseFloat(p[1]), b = parseFloat(p[2])
          var a = p.length > 3 ? parseFloat(p[3]) : 1
          if (!isFinite(r) || !isFinite(g) || !isFinite(b) || !isFinite(a)) continue
          sumA += a; sumL += relLum(r, g, b); n++
        }
        if (!n) return null
        return { alpha: sumA / n, lum: sumL / n }
      } catch (e) { return null }
    }

    /** 壁纸 + 纱 叠完之后的实际亮度（-1 = 还没准备好） */
    function effectiveLum() {
      var raw = rawLum()
      if (!(raw >= 0)) return -1
      var veil = veilBlend()
      if (!veil || !(veil.alpha > 0)) return raw
      var a = Math.max(0, Math.min(1, veil.alpha))
      return raw * (1 - a) + veil.lum * a
    }

    function setBgClass(mode) {
      if (bgMode === mode) return
      bgMode = mode
      try {
        document.documentElement.classList.remove(BG_DARK, BG_LIGHT)
        if (mode) document.documentElement.classList.add(mode === 'dark' ? BG_DARK : BG_LIGHT)
      } catch (e) { /* 忽略 */ }
    }

    /** 元素可见 + 有尺寸才返回 rect，否则 null */
    function rectOf(el) {
      try {
        if (!el || !el.getBoundingClientRect) return null
        var r = el.getBoundingClientRect()
        if (!(r.width > 2 && r.height > 2)) return null
        var s = window.getComputedStyle ? window.getComputedStyle(el) : null
        if (s && (s.display === 'none' || s.visibility === 'hidden')) return null
        return r
      } catch (e) { return null }
    }

    function findMarkdown() {
      try {
        var list = document.querySelectorAll('[class*="markdown"]')
        for (var i = list.length - 1; i >= 0; i--) {
          if (rectOf(list[i])) return list[i]
        }
      } catch (e) { /* 忽略 */ }
      return null
    }

    /** 聊天输入框（textarea / contenteditable / role=textbox），取最靠下、可见的一个 */
    function findComposer() {
      try {
        var list = document.querySelectorAll('textarea, [contenteditable="true"], [contenteditable=""], [role="textbox"]')
        var best = null, bestArea = 0
        for (var i = 0; i < list.length; i++) {
          var r = rectOf(list[i])
          if (!r || r.width < 120 || r.height < 16) continue
          if (r.top < (window.innerHeight || 800) * 0.35) continue
          var area = r.width * r.height
          if (area > bestArea) { bestArea = area; best = list[i] }
        }
        return best
      } catch (e) { return null }
    }

    function commonAncestor(a, b) {
      var set = []
      for (var n = a; n; n = n.parentElement) set.push(n)
      for (var m = b; m; m = m.parentElement) {
        if (set.indexOf(m) !== -1) return m
      }
      return null
    }

    /**
     * 找「聊天正文」根节点：从 markdown 往上爬，取**不含输入框**的最高一层。
     *
     * v2.13.8 关键修正：2.13.6/2.13.7 用的是 markdown 与输入框的公共祖先，
     * 那个节点把输入框也包了进去，于是给聊天正文刷的白字 token 传进了输入框，
     * 浅色外观下出现「白底白字」。现在刻意停在输入框外面，输入框完全交给
     * DSH 自己的主题 token（浅色外观深字、深色外观浅字，它本来是对的）。
     * 只在聊天页有效（没有 markdown 就返回 null，设置页不会被改）。
     */
    function findChatRoot() {
      try {
        var md = findMarkdown()
        if (!md) return null
        var comp = findComposer()
        var vw = (typeof window !== 'undefined' && window.innerWidth) || 1200
        var el = md
        var best = null
        var guard = 0
        while (el && guard++ < 14) {
          if (comp && el.contains(comp)) break
          var r = rectOf(el)
          if (r && r.width <= vw * 0.92 && r.width >= 320 && r.height >= 160) best = el
          var p = el.parentElement
          if (!p || p === document.body || p === document.documentElement) break
          el = p
        }
        return best
      } catch (e) { return null }
    }

    /**
     * 找侧边栏容器（会话列表）。优先按 class 里的 sidebar 命中；
     * 找不到再退化为「贴左边、窄、全高」的布局判断。
     */
    function findSidebarRoot() {
      try {
        var cands = document.querySelectorAll('[class*="sidebar"], [class*="Sidebar"]')
        var best = null, bestArea = 0
        for (var i = 0; i < cands.length; i++) {
          var r = rectOf(cands[i])
          if (!r) continue
          if (r.left > 90 || r.width < 140 || r.width > 620) continue
          if (r.height < (window.innerHeight || 800) * 0.5) continue
          var area = r.width * r.height
          if (area > bestArea) { bestArea = area; best = cands[i] }
        }
        if (best) return best
        var all = document.querySelectorAll('body *')
        var limit = Math.min(all.length, 3000)
        for (var j = 0; j < limit; j++) {
          var rr = rectOf(all[j])
          if (!rr) continue
          if (rr.left > 40 || rr.width < 160 || rr.width > 620) continue
          if (rr.height < (window.innerHeight || 800) * 0.55) continue
          var ar = rr.width * rr.height
          if (ar > bestArea) { bestArea = ar; best = all[j] }
        }
        return best
      } catch (e) { return null }
    }

    /**
     * 找顶部标题栏（logo / 窗口控制按钮所在的一条）。
     * 布局特征：贴顶、很矮、横跨聊天区大半宽度。
     */
    function findHeaderRoot() {
      try {
        var vw = (typeof window !== 'undefined' && window.innerWidth) || 1200
        var cands = document.querySelectorAll('header, [class*="titlebar"], [class*="title-bar"], [class*="titleBar"], [class*="header"]')
        var best = null, bestArea = 0
        for (var i = 0; i < cands.length; i++) {
          var r = rectOf(cands[i])
          if (!r) continue
          if (r.top > 24 || r.height < 24 || r.height > 110) continue
          if (r.left > vw * 0.25 || r.width < vw * 0.35) continue
          var area = r.width * r.height
          if (area > bestArea) { bestArea = area; best = cands[i] }
        }
        if (best) return best
        /* 兜底：扫贴顶的矮条 */
        var all = document.querySelectorAll('body *')
        var limit = Math.min(all.length, 3000)
        for (var j = 0; j < limit; j++) {
          var rr = rectOf(all[j])
          if (!rr) continue
          if (rr.top > 20 || rr.height < 26 || rr.height > 90) continue
          if (rr.left > vw * 0.2 || rr.width < vw * 0.4) continue
          var ar = rr.width * rr.height
          if (ar > bestArea) { bestArea = ar; best = all[j] }
        }
        return best
      } catch (e) { return null }
    }

    /** 输入框外面那层「面板」（圆角卡片）——给它加面板底色，输入的文字才看得见 */
    function findInputBox(input) {
      try {
        if (!input) return null
        var el = input, best = null
        var vh = (typeof window !== 'undefined' && window.innerHeight) || 900
        for (var i = 0; i < 8 && el && el !== document.body; i++) {
          var r = rectOf(el)
          if (!r) break
          if (r.width > (window.innerWidth || 1200) * 0.22 && r.height > 36 && r.height < vh * 0.55) best = el
          if (r.width > (window.innerWidth || 1200) * 0.9) break
          el = el.parentElement
        }
        return best || (input.parentElement || input)
      } catch (e) { return null }
    }

    function clearTxtTargets() {
      for (var i = 0; i < txtTargets.length; i++) {
        try {
          txtTargets[i].classList.remove(TXT_DARK, TXT_LIGHT, PANEL_LIGHT, PANEL_DARK)
        } catch (e) { /* 忽略 */ }
      }
      txtTargets = []
    }

    function setTxtMode(mode) {
      try {
        clearTxtTargets()
        if (!mode) return
        /* v2.13.8：
           - 聊天正文：跟壁纸亮度走（暗壁纸白字 / 亮壁纸黑字），只作用在不含输入框的正文容器；
           - 侧边栏 / 顶部标题栏：**只垫一块跟 DSH 外观同深浅的面板**，不碰文字/图标 token。
             DSH 自己的按钮、图标、徽标在浅色外观下本来就是深色，在深色外观下本来就是浅色，
             之前硬刷 token 才把「新会话」「收起侧边栏」「完全权限」刷成白底白图标；
           - 输入框：完全交给 DSH 原生主题，不再刷 token、不再垫面板。 */
        var appDark = looksDark()
        var chatTxt = mode === 'dark' ? TXT_LIGHT : TXT_DARK
        var chromePanel = appDark ? PANEL_LIGHT : PANEL_DARK
        var chat = findChatRoot()
        var side = findSidebarRoot()
        var hdr = findHeaderRoot()
        var targets = []
        if (chat) { chat.classList.add(chatTxt); targets.push(chat) }
        if (side) { side.classList.add(chromePanel); targets.push(side) }
        if (hdr) { hdr.classList.add(chromePanel); targets.push(hdr) }
        txtTargets = targets
      } catch (e) { /* 忽略 */ }
    }

    function refreshContrast() {
      if (!current) return
      var lum = effectiveLum()
      if (!(lum >= 0)) {
        /* 壁纸还没画出来（或视频未就绪）：先按外观主题给文字一个初值，
           别让侧边栏/输入框在加载空档里没有对比色 */
        setTxtMode(looksDark() ? 'dark' : 'light')
        return
      }
      var mode = lum < 0.45 ? 'dark' : 'light'
      setBgClass(mode)
      setTxtMode(mode)
    }

    function startContrast() {
      stopContrast()
      refreshContrast()
      /* 视频亮度会随画面变；图片也允许用户在设置里换图，所以统一 1.5s 复核一次 */
      lumTimer = setInterval(refreshContrast, 1500)
    }

    function stopContrast() {
      if (lumTimer) { try { clearInterval(lumTimer) } catch (e) {} lumTimer = null }
      setBgClass(null)
      setTxtMode(null)
    }

    /* ── CSS ─────────────────────────────────────────────────────────────── */

    /**
     * 生成注入的 CSS。
     *
     * 所有规则都挂在 JS 写上去的 .dsh-cw-dark / .dsh-cw-light 上，
     * 不依赖 DSH 内部的主题标记叫什么名字。
     *
     * 两个层：
     *   #dsh-cw-bg      聊天底图 + 纱   z-index:-2（只有配了图才有）
     *   #dsh-cw-banner  大字横幅        z-index:-1（只有配了横幅才有）
     * "外壳让开"（--dsw-alias-bg-base: transparent）只在"背后有东西要看"时才做。
     */
    function buildCss(cfg) {
      var B = '#' + BG_ID
      var N = '#' + BANNER_ID
      var V = '.dsh-cw-veil'
      var hasImage = !!cfg.__imageOk
      var hasVideo = !!cfg.__videoOk
      var hasVisual = hasImage || hasVideo
      var hasBanner = !!(cfg.banner && String(cfg.banner).trim())
      var L = []

      /* ── 外壳让开：只要"背后有东西要看"（底图 / 视频 / 大字）── */
      if (hasVisual || hasBanner) {
        L.push('/* 让开的只是 html/body 自己的底色 */')
        L.push('html.dsh-cw-light, html.dsh-cw-light body,')
        L.push('html.dsh-cw-dark, html.dsh-cw-dark body { background: transparent !important; }')
        L.push('html.dsh-cw-light body {')
        L.push('  --dsw-alias-bg-base: transparent;')
        L.push('  --dsw-specific-sidebar-fill: ' + cfg.sidebarLight + ';')
        L.push('}')
        L.push('html.dsh-cw-dark body {')
        L.push('  --dsw-alias-bg-base: transparent;')
        L.push('  --dsw-specific-sidebar-fill: ' + cfg.sidebarDark + ';')
        L.push('}')
        /* ── Windows 右上角：最小化 / 最大化 / 关闭 ────────────────────────
           DSH Desktop 的 preload 在 body 里放一个隐藏 span 探针，用它的
           background-color(--dsw-specific-sidebar-fill) 与 color(--dsw-alias-label-primary)
           通过 IPC 调 Electron 的 titleBarOverlay。我们给外壳换过半透明底色后，
           探针算出的那对颜色可能变成「半透明底色 + 和背景同色的图标」，
           表现就是按钮还在、但白底白图标 / 黑底黑图标。
           这里直接给探针一对固定高对比色，不依赖 DSH token，也不受半透明影响。
           data-dsh-caption 存在时（片头播放中）不生效，保证片头期间标题栏仍是透明的。 */
        L.push('html:not([data-dsh-caption]).dsh-cw-light body>span[style*="dsw-specific-sidebar-fill"],')
        L.push('html:not([data-dsh-caption]).dsh-cw-light body span[style*="dsw-specific-sidebar-fill"] { background-color: #f9fafb !important; color: #0f1115 !important; }')
        L.push('html:not([data-dsh-caption]).dsh-cw-dark body>span[style*="dsw-specific-sidebar-fill"],')
        L.push('html:not([data-dsh-caption]).dsh-cw-dark body span[style*="dsw-specific-sidebar-fill"] { background-color: #1b1b1c !important; color: #f9fafb !important; }')
      }

      /* ── 聊天底图层（最底，z-index:-2）：静态图 / 循环视频 + 纱 ── */
      if (hasVisual) {
        L.push('/* 聊天底图层：最底层、不拦点击 */')
        L.push(B + ' {')
        L.push('  position: fixed; inset: 0; z-index: -2;')
        L.push('  pointer-events: none; overflow: hidden;')
        L.push('}')
        L.push('html.dsh-cw-light ' + B + ' { background: ' + cfg.fallbackLight + '; }')
        L.push('html.dsh-cw-dark ' + B + ' { background: ' + cfg.fallbackDark + '; }')
        if (hasImage) {
          L.push(B + ' > img {')
          L.push('  position: absolute; inset: 0;')
          L.push('  width: 100%; height: 100%; display: block;')
          L.push('  object-fit: ' + (cfg.imageFit || 'cover') + '; object-position: center;')
          L.push('}')
        }
        if (hasVideo) {
          L.push('/* 循环视频：铺满窗口，静音自动循环；在静态图之上、纱之下 */')
          L.push(B + ' > video {')
          L.push('  position: absolute; inset: 0;')
          L.push('  width: 100%; height: 100%; display: block;')
          L.push('  object-fit: cover; object-position: center;')
          L.push('  transition: opacity 300ms ease;')
          L.push('}')
        }
        L.push('/* 纱：底图/视频上的文字靠它撑对比度。浅色压白纱、深色压深纱 */')
        L.push(B + ' > ' + V + ' { position: absolute; inset: 0; }')
        L.push('html.dsh-cw-light ' + B + ' > ' + V + ' { background: linear-gradient(' + cfg.veilLightA + ', ' + cfg.veilLightB + '); }')
        L.push('html.dsh-cw-dark ' + B + ' > ' + V + ' { background: linear-gradient(' + cfg.veilDarkA + ', ' + cfg.veilDarkB + '); }')
      /* v2.13.17：黑白原版素材模式 —— 不染色，直接关掉主题色纱（模糊仍可单独调） */
      L.push('html.dsh-cw-mono ' + B + ' > ' + V + ' { background: transparent !important; }')
        /* v2.13.11 镜头模糊：只模糊纱后面的壁纸/视频，纱上的聊天文字不受影响。
           0 = 不生成规则（完全不动）；100 = 约 24px。 */
        if (Number(cfg.veilBlur) > 0) {
          var blurPx = Math.round(Number(cfg.veilBlur) / 100 * 240) / 10
          L.push(B + ' > ' + V + ' { -webkit-backdrop-filter: blur(' + blurPx + 'px); backdrop-filter: blur(' + blurPx + 'px); }')
        }
        /* v2.13.5：兜底底色跟「壁纸实际亮度」走（后写，优先级更高）。
           v2.13.9：**纱不再跟壁纸亮度走**——纱是用户按外观主题手动调的
           （浅色主题一个滑块、深色主题一个滑块），若这里再按壁纸亮度强塞
           另一种纱，用户拖滑块就会「看起来没反应」。纱只保留上面两条主题规则。 */
        L.push('html.' + BG_DARK + ' ' + B + ' { background: ' + cfg.fallbackDark + '; }')
        L.push('html.' + BG_LIGHT + ' ' + B + ' { background: ' + cfg.fallbackLight + '; }')
        /* 文字自适应：只给聊天区根节点加 class，覆盖文字/边框/卡片 token。
           浅色文字版（暗背景）与深色文字版（亮背景）互斥。 */
        L.push('.' + TXT_LIGHT + ' {')
        L.push('  --dsw-alias-label-primary: #f5f7fa !important;')
        L.push('  --dsw-alias-label-secondary: #d7dbe2 !important;')
        L.push('  --dsw-alias-label-tertiary: #b9bec7 !important;')
        L.push('  --dsw-alias-label-caption: #a8adb6 !important;')
        L.push('  --dsw-alias-label-dimmed: #8e939c !important;')
        L.push('  --dsw-alias-link: #8ec5ff !important;')
        L.push('  --dsw-alias-border-l1: rgba(255,255,255,.18) !important;')
        L.push('  --dsw-alias-border-l2: rgba(255,255,255,.12) !important;')
        L.push('  --dsw-alias-bg-layer-1: rgba(18,20,26,.72) !important;')
        L.push('  --dsw-alias-bg-layer-2: rgba(26,29,36,.78) !important;')
        L.push('  --dsw-alias-bg-overlay: rgba(10,12,17,.85) !important;')
        L.push('}')
        L.push('.' + TXT_DARK + ' {')
        L.push('  --dsw-alias-label-primary: #111418 !important;')
        L.push('  --dsw-alias-label-secondary: #4b5058 !important;')
        L.push('  --dsw-alias-label-tertiary: #6c727b !important;')
        L.push('  --dsw-alias-label-caption: #7b828b !important;')
        L.push('  --dsw-alias-label-dimmed: #8c939c !important;')
        L.push('  --dsw-alias-link: #1668c4 !important;')
        L.push('  --dsw-alias-border-l1: rgba(0,0,0,.14) !important;')
        L.push('  --dsw-alias-border-l2: rgba(0,0,0,.10) !important;')
        L.push('  --dsw-alias-bg-layer-1: rgba(255,255,255,.66) !important;')
        L.push('  --dsw-alias-bg-layer-2: rgba(255,255,255,.78) !important;')
        L.push('  --dsw-alias-bg-overlay: rgba(255,255,255,.86) !important;')
        L.push('}')
        /* v2.13.6：文字兜底色（没走 token 的节点也能继承到正确颜色）
           v2.13.9：加一层很轻的文字阴影，背景明暗不均/网格极密的区域也能读 */
        L.push('.' + TXT_LIGHT + ' { color: #eef2f8 !important; text-shadow: 0 1px 2px rgba(0,0,0,.55), 0 0 10px rgba(0,0,0,.35); }')
        L.push('.' + TXT_DARK + ' { color: #10141a !important; text-shadow: 0 1px 2px rgba(255,255,255,.7), 0 0 10px rgba(255,255,255,.5); }')
        /* v2.13.8：侧边栏 / 顶部标题栏只垫一块跟 DSH 外观同深浅的面板。
           不再覆盖它们的文字/图标 token —— 原生按钮在浅色外观下就是浅底深字，
           深色外观下就是深底浅字，硬刷只会刷出白底白图标。 */
        L.push('.' + PANEL_LIGHT + ' { background-color: rgba(8,11,18,.72) !important; }')
        L.push('.' + PANEL_DARK + ' { background-color: rgba(248,250,253,.93) !important; }')
        /* 行内代码 / 文件名 chip */
        L.push('.' + TXT_LIGHT + ' :not(pre) > code { background: rgba(255,255,255,.16) !important; color: #f3f6fb !important; }')
        L.push('.' + TXT_DARK + ' :not(pre) > code { background: rgba(0,0,0,.07) !important; color: #10141a !important; }')
      }

      if (hasBanner) {
        L.push('/* 大字横幅：铺满窗口的那行字（矢量文字，不是拉伸的图片）*/')
        L.push(N + ' {')
        L.push('  position: fixed; inset: 0; z-index: -1;')
        L.push('  pointer-events: none; overflow: hidden;')
        L.push('  display: flex; align-items: center; justify-content: center;')
        L.push('}')
        L.push(N + ' > span {')
        L.push('  display: block; white-space: nowrap;')
        L.push('  line-height: 1; letter-spacing: 0.02em; font-weight: 800;')
        L.push('  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "HarmonyOS Sans SC", "Noto Sans SC", system-ui, sans-serif;')
        L.push('}')
        L.push('html.dsh-cw-light ' + N + ' > span { color: rgba(18,20,28, var(--cw-banner-a, ' + (cfg.bannerOpacity == null ? 0.12 : cfg.bannerOpacity) + ')); }')
        L.push('html.dsh-cw-dark ' + N + ' > span { color: rgba(255,255,255, var(--cw-banner-a, ' + (cfg.bannerOpacity == null ? 0.12 : cfg.bannerOpacity) + ')); }')
      }

      return L.join('\n')
    }

    function styleTag() {
      return document.querySelector('style[data-plugin-css="' + TAG_ID + '"]')
    }

    function injectCss(cfg) {
      var existing = styleTag()
      if (existing) existing.remove()
      var tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-chat-wallpaper'
      tag.dataset.pluginCss = TAG_ID
      tag.textContent = buildCss(cfg)
      document.head.appendChild(tag)
    }

    function removeCss() {
      var existing = styleTag()
      if (existing) existing.remove()
    }

    /* ── DOM ─────────────────────────────────────────────────────────────── */

    /** 撤掉聊天底图层（最底那层）*/
    function removeBg() {
      var el = document.getElementById(BG_ID)
      if (el) el.remove()
    }

    /* ── 大字横幅 ────────────────────────────────────────────────────────
       用户要的是"进聊天后一眼看到铺满窗口的大字"。
       聊天消息里的字最大也就十几像素，永远做不到 —— 所以必须做成背景层。
       用**真文字**而不是图片：矢量，放多大都不糊。 */

    var bannerResize = null

    /**
     * 把字号调到"铺满窗口"。
     *
     * 不猜公式（中英混排宽度不一样：中文 1em，拉丁字母约 0.5em）——
     * 而是**量一次**：先把字号设成 100px，量出实际宽度，再按窗口宽度等比放大。
     * 这样对任意长度、任意中英混排的文字都成立。
     */
    function fitBanner() {
      var el = document.getElementById(BANNER_ID)
      if (!el) return
      var span = el.querySelector('span')
      if (!span) return
      try {
        span.style.fontSize = '100px'
        var w = span.getBoundingClientRect().width || span.scrollWidth || 0
        if (!(w > 0)) return                    /* 量不到就先不设，等下一次 resize */
        var vw = (typeof window !== 'undefined' && window.innerWidth) || document.documentElement.clientWidth || 1200
        var size = Math.max(20, Math.floor(100 * (vw * 0.96) / w))
        span.style.fontSize = size + 'px'
      } catch (e) { /* 忽略 */ }
    }

    function mountBanner(cfg) {
      var text = cfg.banner == null ? '' : String(cfg.banner).trim()
      var existing = document.getElementById(BANNER_ID)
      if (!text) { if (existing) existing.remove(); return null }
      if (existing) {
        /* 已经在了：只更新文字/透明度，不重建 */
        var s = existing.querySelector('span')
        if (s) s.textContent = text
        existing.style.setProperty('--cw-banner-a', String(cfg.bannerOpacity == null ? 0.12 : cfg.bannerOpacity))
        fitBanner()
        return existing
      }

      var el = document.createElement('div')
      el.id = BANNER_ID
      el.setAttribute('aria-hidden', 'true')
      el.style.setProperty('--cw-banner-a', String(cfg.bannerOpacity == null ? 0.12 : cfg.bannerOpacity))
      el.appendChild(document.createElement('span')).textContent = text
      /* 插在底图之上、聊天内容之下：DOM 顺序无所谓，z-index 决定 */
      document.body.insertBefore(el, document.body.firstChild)

      /* 插进 DOM 之后量一次；窗口尺寸变了再量 */
      requestAnimationFrame(fitBanner)
      if (!bannerResize) {
        bannerResize = function () { fitBanner() }
        try { window.addEventListener('resize', bannerResize) } catch (e) {}
      }
      log('挂载大字横幅', { text: text, size: '按窗口自动' })
      return el
    }

    function removeBanner() {
      var el = document.getElementById(BANNER_ID)
      if (el) el.remove()
      if (bannerResize) {
        try { window.removeEventListener('resize', bannerResize) } catch (e) {}
        bannerResize = null
      }
    }

    /**
     * 聊天底图层：用户自己定的那张图 + 纱。**在最底下。**
     * 有图就挂、没图就什么都不挂；和上面的大字横幅互相独立。
     */
    var visibilityBound = false
    function bindVisibilityPause() {
      if (visibilityBound || typeof document === 'undefined') return
      visibilityBound = true
      try {
        document.addEventListener('visibilitychange', function () {
          var v = document.getElementById(VIDEO_ID)
          if (!v) return
          try {
            if (document.hidden) v.pause()
            else { var p = v.play(); if (p && p.catch) p.catch(function () {}) }
          } catch (e) { /* 忽略 */ }
        })
      } catch (e) { /* 忽略 */ }
    }

    /**
     * 聊天底图层：静态图 / 循环视频 + 纱。**在最底下。**
     * 有图/视频就挂、都没有就什么都不挂；和上面的大字横幅互相独立。
     */
    function mountBg(cfg) {
      if (!cfg.__imageOk && !cfg.__videoOk) return null
      var already = document.getElementById(BG_ID)
      if (already) return already

      var bg = document.createElement('div')
      bg.id = BG_ID
      bg.setAttribute('aria-hidden', 'true')

      if (cfg.__imageOk) {
        var img = document.createElement('img')
        img.alt = ''
        img.setAttribute('aria-hidden', 'true')
        img.addEventListener('error', function () {
          log('聊天底图加载失败 → 撤掉它')
          if (img.parentNode) img.parentNode.removeChild(img)
        })
        img.src = API + '/image?t=' + Date.now()
        bg.appendChild(img)
      }

      if (cfg.__videoOk && cfg.__video) {
        var video = document.createElement('video')
        video.id = VIDEO_ID
        video.setAttribute('aria-hidden', 'true')
        video.muted = true
        video.defaultMuted = true
        video.loop = true
        video.autoplay = true
        video.playsInline = true
        video.preload = 'auto'
        video.addEventListener('error', function () {
          log('循环视频加载失败 → 回落静态底图')
          try { if (video.parentNode) video.parentNode.removeChild(video) } catch (e) {}
        })
        video.setAttribute('data-id', cfg.__video.id)
        video.src = cfg.__video.videoUrl + (cfg.__video.videoUrl.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now()
        bg.appendChild(video)
        try { var p = video.play(); if (p && p.catch) p.catch(function () {}) } catch (e) {}
        bindVisibilityPause()
      }

      var veil = document.createElement('div')
      veil.className = 'dsh-cw-veil'

      bg.appendChild(veil)
      document.body.insertBefore(bg, document.body.firstChild)
      log('挂载聊天底图层', { image: cfg.__imageOk, video: cfg.__videoOk })
      return bg
    }

    /* ── 随机轮换（shuffle）──────────────────────────────────────────────── */
    var shuffleTimer = null
    function stopShuffle() {
      if (shuffleTimer) { try { clearInterval(shuffleTimer) } catch (e) {} shuffleTimer = null }
    }
    function startShuffle(cfg) {
      stopShuffle()
      if (!cfg.__videoOk || cfg.videoMode !== 'shuffle') return
      var minutes = Number(cfg.videoShuffleMinutes)
      if (!(minutes > 0)) return          /* 0 = 每次启动随机，host 已随机，无需定时器 */
      var ms = Math.max(1, Math.min(1440, minutes)) * 60000
      shuffleTimer = setInterval(function () {
        fetch(API + '/config', { cache: 'no-store' })
          .then(function (r) { return r.json() })
          .then(function (data) {
            var v = data && data.video && data.video.current
            if (!v) return
            var el = document.getElementById(VIDEO_ID)
            if (!el) return
            if (el.getAttribute('data-id') === v.id) return
            el.setAttribute('data-id', v.id)
            el.style.opacity = '0'
            setTimeout(function () {
              el.src = v.videoUrl + (v.videoUrl.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now()
              try { var p2 = el.play(); if (p2 && p2.catch) p2.catch(function () {}) } catch (e) {}
              el.style.opacity = '1'
            }, 300)
          })
          .catch(function () { /* 换片失败就继续放当前这段 */ })
      }, ms)
    }

    /* ── 生命周期 ───────────────────────────────────────────────────────── */

    var current = null         // 当前生效的配置
    var observer = null
    var themeClass = null      // 当前写到 <html> 上的主题 class

    /** 把主题判定结果写到 <html> 的 class 上 —— CSS 全部读它，不读 DSH 的标记 */
    function setThemeClass(dark) {
      var next = dark ? 'dsh-cw-dark' : 'dsh-cw-light'
      if (themeClass === next) return
      document.documentElement.classList.remove('dsh-cw-dark', 'dsh-cw-light')
      document.documentElement.classList.add(next)
      themeClass = next
    }

    function applyNow(cfg) {
      current = cfg
      var dark = looksDark()
      setThemeClass(dark)
      /* v2.13.17：黑白（原版素材）模式 → 关掉主题色纱，保留原画面 */
      try { document.documentElement.classList.toggle('dsh-cw-mono', cfg.colorMode === 'mono') } catch (e) { /* 忽略 */ }
      log('套用壁纸', { image: cfg.__image, theme: dark ? 'dark' : 'light' })
      injectCss(cfg)
      mountBg(cfg)            /* 最底：聊天底图（用户自己定的那张，可选）*/
      mountBanner(cfg)        /* 其上：铺满窗口的大字（可选）*/
      /* v2.13.5：先按主题给个初值避免闪一下，再按壁纸实际亮度校正 */
      if (cfg.__imageOk || cfg.__videoOk) {
        setBgClass(dark ? 'dark' : 'light')
        setTxtMode(dark ? 'dark' : 'light')
        startContrast()
      } else {
        stopContrast()
      }
    }

    /**
     * 撤场：把 CSS / 底图 / 横幅全部收回，页面回到原样（测试清场原语；运行期不再调用）。
     *
     * ★★ 必须同时清掉 `current` 并断开主题观察者 ★★
     * 否则会"复活"：撤场后 current 还留着 → 下一次 html/body 属性变化把观察者叫醒
     * → 它发现"没挂载" → applyNow(current) → 把壁纸重新挂起来 → 无限循环。
     */
    function teardown() {
      current = null
      stopShuffle()
      stopContrast()
      if (observer) {
        try { observer.disconnect() } catch (e) { /* 忽略 */ }
        observer = null
      }
      removeCss()
      removeBg()
      removeBanner()
      try {
        document.documentElement.classList.remove('dsh-cw-dark', 'dsh-cw-light', 'dsh-cw-mono')
        themeClass = null
      } catch (e) { /* 忽略 */ }
    }

    /** 主题变化时只换主题 class（换纱换色）。观察者**只改 class**，绝不挂载/重挂任何层。 */
    function watchTheme(cfg) {
      if (observer || typeof MutationObserver === 'undefined') return
      observer = new MutationObserver(function () {
        if (!current) return
        var dark = looksDark()
        var want = dark ? 'dsh-cw-dark' : 'dsh-cw-light'
        if (themeClass !== want) {
          log('主题切换 →', dark ? '深色纱' : '白纱')
          setThemeClass(dark)
        }
        /* 外观变了文字 token 也变；壁纸亮度和文字模式可能得跟着重算一次 */
        refreshContrast()
        /* 外观切换后窗口按钮那对固定色也要换（浅底深图标 ↔ 深底浅图标），
           触发一次 preload 重测 titleBarOverlay */
        try { if (window.__DSH_CW_SYNC_CAPTION__) window.__DSH_CW_SYNC_CAPTION__() } catch (e) { /* 忽略 */ }
      })
      observer.observe(document.documentElement, { attributes: true })
      if (document.body) observer.observe(document.body, { attributes: true })
    }

    /** 调宿主接口，拿 JSON（失败一律返回 null，绝不抛） */
    function api(path, opts) {
      return fetch(API + path, opts)
        .then(function (r) { return r.json() })
        .catch(function (e) { log('设置面板请求失败', path, String(e && e.message)); return null })
    }

    /* ── 启动 ───────────────────────────────────────────────────────────── */

    var booted = false

    /**
     * 自举。**只跑一次** —— 重复自举会重复 fetch + 重复注 CSS，没必要。
     * 需要重新读配置就刷新页面。壁纸不再等开机动画、不再有「解析到视频」这道门：
     * 拿到底图/横幅配置就直接挂上。
     */
    function boot() {
      if (booted) { log('已自举过 → 跳过重复自举（要重读配置请刷新页面）'); return }
      booted = true
      wdiag('boot 开始')
      log('client build ' + BUILD + ' 已加载')
      try {
        fetch(API + '/config', { cache: 'no-store' })
          .then(function (r) { return r.json() })
          .then(function (data) {
            var cfg = data && data.config ? data.config : null
            if (!cfg) { log('拿不到配置，放弃'); return }
            /* 背景图/循环视频：宿主已经解析好了，这里只拿"有没有" */
            cfg.__imageOk = !!data.imageOk
            cfg.__image = data.image
            cfg.__videoOk = !!(data.video && data.video.enabled && data.video.current)
            cfg.__video = data.video && data.video.current ? data.video.current : null
            wdiag('config ok image=' + String(data.imageOk) + ' video=' + String(data.video && data.video.count || 0))
            applyNow(cfg)
            startShuffle(cfg)
            watchTheme(cfg)
          })
          .catch(function (e) { log('请求配置失败，放弃', String(e && e.message)) })
      } catch (e) {
        wdiag('boot 失败: ' + String((e && e.message) || e))
        log('自举失败，放弃（绝不能把宿主带崩）', String(e && e.message))
      }
    }

    /* 壁纸半侧的诊断：回传给 /dsh-startup/diag，最多 10 条。
       "壁纸那半边到底跑没跑" 这个问题，光看控制台是看不到的 —— 落进日志里。 */
    var wdiagSent = 0
    function wdiag(msg) {
      if (wdiagSent >= 10) return
      wdiagSent++
      try {
        fetch('/dsh-startup/diag', {
          method: 'POST',
          headers: { 'content-type': 'text/plain' },
          body: 'wall: ' + String(msg).slice(0, 800)
        }).catch(function () { /* 取证失败不影响运行 */ })
      } catch (e) { /* noop */ }
    }

    function apply(ctx) {
      /* 设置页入口：与「启动动画」并列的「聊天背景」（order 27）。 */
      try {
        if (ctx && ctx.slots && typeof ctx.slots.inject === 'function') {
          ctx.slots.inject('settings.section', function () {
            return ctx.slots.register(
              { name: 'settings.section', id: 'chat-wallpaper', order: 27, label: '聊天背景' },
              function () { return cwH(WallpaperPanel, {}) }
            )
          })
          wdiag('settings.section 已注册（聊天背景）')
        } else {
          wdiag('没有 ctx.slots，设置页入口跳过')
        }
      } catch (e) { wdiag('设置节注册失败: ' + String((e && e.message) || e)) }

      if (typeof document === 'undefined') { wdiag('没有 document，放弃自举'); return }
      wdiag('apply: readyState=' + document.readyState)
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true })
        /* 保险：DOMContentLoaded 万一在 apply 之前就烧掉了（客户端模块晚于它加载），
           监听器永远不触发，壁纸就整块死掉。2 秒后自己补一次。 */
        setTimeout(function () {
          try { if (!booted) { wdiag('DOMContentLoaded 没等到，强制自举'); boot() } } catch (e) { /* noop */ }
        }, 2000)
      } else {
        boot()
      }
    }

    /* ══ 设置页「聊天背景」面板（React）══════════════════════════════════════
       与「启动动画」并列（order 26 → 27）。数据走宿主自带的 HTTP 接口（/chat-wallpaper/*）。 */
    var cwReact = require('react')
    var cwH = cwReact.createElement
    /* v2.16.3：自绘下拉（跟随设置面板的 3D 平面；原生 <select> 的系统弹层无法被 CSS 变换） */
    function CwSelect(props) {
      var openState = cwReact.useState(false)
      var open = openState[0]
      var setOpen = openState[1]
      var upState = cwReact.useState(false)
      var openUp = upState[0]
      var setOpenUp = upState[1]
      var wrapRef = cwReact.useRef(null)
      var btnRef = cwReact.useRef(null)
      var opts = props.options || []
      var cur = opts.find(function (o) { return String(o[0]) === String(props.value) }) || opts[0] || ['', '']

      function measure() {
        var el = btnRef.current
        if (!el) return
        var r = el.getBoundingClientRect()
        var topLimit = 8
        var bottomLimit = (window.innerHeight || 800) - 8
        var node = el.parentNode
        while (node && node.nodeType === 1 && node !== document.body) {
          var st = window.getComputedStyle(node)
          if (/(auto|scroll)/.test(st.overflowY) && node.clientHeight > 0) {
            var nr = node.getBoundingClientRect()
            topLimit = Math.max(topLimit, nr.top + 2)
            bottomLimit = Math.min(bottomLimit, nr.bottom - 2)
            break
          }
          node = node.parentNode
        }
        var below = bottomLimit - r.bottom
        var above = r.top - topLimit
        var useUp = below < 280 && above > below
        setOpenUp(useUp)
        var maxH = Math.max(120, Math.min(280, (useUp ? above : below) - 8))
        if (wrapRef.current) {
          var menu = wrapRef.current.querySelector('.__ss_selectMenu')
          if (menu) menu.style.maxHeight = maxH + 'px'
        }
      }

      cwReact.useEffect(function () {
        if (!open) return
        measure()
        function onDocDown(e) {
          if (!wrapRef.current) return
          if (!wrapRef.current.contains(e.target)) setOpen(false)
        }
        function onKey(e) {
          if (e.key === 'Escape') {
            setOpen(false)
            try { btnRef.current.focus() } catch (err) {}
          }
        }
        function onScroll(e) {
          if (!wrapRef.current) return
          if (!wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', onDocDown, true)
        document.addEventListener('keydown', onKey, true)
        window.addEventListener('scroll', onScroll, true)
        return function () {
          document.removeEventListener('mousedown', onDocDown, true)
          document.removeEventListener('keydown', onKey, true)
          window.removeEventListener('scroll', onScroll, true)
        }
      }, [open])

      return cwH('div', { className: '__ss_selectWrap' + (open ? ' is-open' : ''), ref: wrapRef },
        cwH('button', {
          className: '__ss_select' + (open ? ' is-open' : ''),
          type: 'button',
          ref: btnRef,
          disabled: !!props.disabled,
          'aria-haspopup': 'listbox',
          'aria-expanded': open ? 'true' : 'false',
          onClick: function () { if (!props.disabled) setOpen(!open) }
        },
          cwH('span', { className: '__ss_selectLabel' }, cur[1]),
          cwH('span', { className: '__ss_selectCaret', 'aria-hidden': 'true' }, 'v')
        ),
        open ? cwH('div', { className: '__ss_selectMenu' + (openUp ? ' is-up' : ''), role: 'listbox' },
          opts.map(function (o) {
            var on = String(o[0]) === String(props.value)
            return cwH('button', {
              key: o[0],
              type: 'button',
              role: 'option',
              'aria-selected': on ? 'true' : 'false',
              className: '__ss_selectItem' + (on ? ' is-on' : ''),
              onClick: function () {
                setOpen(false)
                if (on) return
                props.onChange(o[0])
              }
            }, o[1])
          })
        ) : null
      )
    }


    /** 把 rgba(...) 里的 alpha 换掉，保留 RGB。 */
    function withAlpha(color, a) {
      var s = String(color || '')
      var m = /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*(?:,\s*[0-9.]+\s*)?\)$/.exec(s)
      if (!m) return 'rgba(0,0,0,' + Number(a).toFixed(2) + ')'
      return 'rgba(' + m[1] + ',' + m[2] + ',' + m[3] + ',' + Number(a).toFixed(2) + ')'
    }

    function WallpaperPanel() {
      var [data, setData] = cwReact.useState(null)
      var [draft, setDraft] = cwReact.useState(null)
      var [busy, setBusy] = cwReact.useState(false)
      var [error, setError] = cwReact.useState(null)
      var [notice, setNotice] = cwReact.useState(null)
      var [refreshing, setRefreshing] = cwReact.useState(false)

      function load(manual) {
        setError(null)
        if (manual) { setNotice(null); setRefreshing(true) }
        return Promise.all([api('/images'), api('/config', { cache: 'no-store' }), api('/videos')])
          .then(function (arr) {
            var images = arr[0] || {}
            var conf = arr[1] || {}
            var vids = arr[2] || {}
            var cfg = conf.config || {}
            var next = {
              images: images.images || [],
              current: images.current || null,
              imageSource: images.imageSource || '',
              builtinId: images.builtinId || '',
              builtinName: images.builtinName || '',
              dropDir: images.dropDir || '',
              dropDirExists: !!images.dropDirExists,
              veil: images.veil || { light: 0.8, dark: 0.5 },
              banner: cfg.banner || '',
              bannerOpacity: cfg.bannerOpacity == null ? 0.12 : cfg.bannerOpacity,
              veilLightA: cfg.veilLightA || 'rgba(253,250,254,.80)',
              veilDarkA: cfg.veilDarkA || 'rgba(8,10,16,.74)',
              veilBlur: cfg.veilBlur == null ? 0 : Math.max(0, Math.min(100, Number(cfg.veilBlur) || 0)),
              image: conf.image || null,
              imageFit: cfg.imageFit === 'contain' ? 'contain' : 'cover',
              colorMode: cfg.colorMode === 'mono' ? 'mono' : 'color',
              video: {
                bgMode: vids.bgMode || 'image',
                videoMode: vids.videoMode || 'single',
                selectedId: vids.selectedId || '',
                currentId: vids.currentId || '',
                shuffleMinutes: Number(vids.shuffleMinutes) || 0,
                roots: Array.isArray(vids.roots) ? vids.roots : [],
                items: Array.isArray(vids.items) ? vids.items : []
              }
            }
            setData(next)
            setDraft({ banner: next.banner, bannerOpacity: next.bannerOpacity, dark: looksDark(), newRoot: '', shuffleMin: next.video.shuffleMinutes })
            if (manual) {
              setNotice('已重新读取：图片 ' + next.images.length + ' 张 / 视频 ' + next.video.items.length + ' 个'
                + (next.dropDirExists ? '' : '（丢图目录还不存在，点「打开图片文件夹」会创建）'))
            }
          })
          .catch(function (e) { setError('读取失败：' + String((e && e.message) || e)) })
          .then(function () { if (manual) setRefreshing(false) })
      }
      cwReact.useEffect(function () { load() }, [])

      function apply(patch, full) {
        setBusy(true); setNotice(null); setError(null)
        return api('/set', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(patch)
        })
          .then(function (r) {
            if (!r || !r.ok) throw new Error((r && r.error) || '写入失败')
            return api('/config', { cache: 'no-store' })
          })
          .then(function (conf) {
            var cfg = conf && conf.config ? conf.config : null
            if (!cfg) return null
            cfg.__imageOk = !!conf.imageOk
            cfg.__image = conf.image
            cfg.__videoOk = !!(conf.video && conf.video.enabled && conf.video.current)
            cfg.__video = conf.video && conf.video.current ? conf.video.current : null
            if (full) { removeBg(); removeCss(); applyNow(cfg) }
            else { current = cfg; injectCss(cfg) }
            if (full) startShuffle(cfg)
            setNotice('已保存并生效')
            return load()
          })
          .catch(function (e) { setError('保存失败：' + String((e && e.message) || e)) })
          .then(function () { setBusy(false) })
      }

      function postVideos(payload) {
        return api('/videos/roots', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      }
      function deleteVideo(item) {
        var ok = true
        try { ok = window.confirm('删除视频「' + item.title + '」？\n\n' + (item.kind === 'project' ? '这是壁纸引擎项目，会删除整个文件夹（含 project.json、预览图和视频文件），无法恢复。' : '会删除这个视频文件，无法恢复。')) } catch (e) { ok = true }
        if (!ok) return
        setBusy(true); setNotice(null); setError(null)
        api('/videos/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.id }) })
          .then(function (r) { if (!r || !r.ok) throw new Error((r && r.error) || '删除失败'); return load() })
          .then(function () { setNotice('已删除视频「' + item.title + '」') })
          .catch(function (e) { setError('删除视频失败：' + String((e && e.message) || e)) })
          .then(function () { setBusy(false) })
      }
      function addVideoRoot() {
        var p = String(draft.newRoot || '').trim()
        if (!p) { setNotice('先在输入框里填一个目录路径'); return }
        setBusy(true); setNotice(null); setError(null)
        postVideos({ action: 'add', path: p })
          .then(function (r) { if (!r || !r.ok) throw new Error((r && r.error) || '添加失败'); return load() })
          .then(function () { setNotice('已添加视频目录') })
          .catch(function (e) { setError('添加目录失败：' + String((e && e.message) || e)) })
          .then(function () { setBusy(false) })
      }
      function rootAction(action, root) {
        setBusy(true); setNotice(null); setError(null)
        postVideos({ action: action, path: root.path })
          .then(function (r) { if (!r || !r.ok) throw new Error((r && r.error) || '操作失败'); return load() })
          .then(function () { setNotice(action === 'remove' ? '已移除视频目录（文件不会被删）' : '已打开目录') })
          .catch(function (e) { setError('目录操作失败：' + String((e && e.message) || e)) })
          .then(function () { setBusy(false) })
      }

      if (!data || !draft) return cwH('div', { className: '__ss_root' }, '读取中…')

      var dark = !!draft.dark
      var veilNow = dark ? data.veilDarkA : data.veilLightA
      var veilAlpha = dark ? data.veil.dark : data.veil.light

      var thumb = function (im) {
        var selected = im.builtin
          ? (im.builtinId ? data.builtinId === im.builtinId : (im.selected != null ? im.selected : data.imageSource === 'builtin'))
          : (data.current && data.current.split(/[\\/]/).pop() === im.name)
        return cwH('button', {
          key: im.name,
          type: 'button',
          title: im.builtin ? ('内置背景：' + im.name + '（随插件安装；删不掉）') : (im.name + ' · ' + im.sizeKB + ' KB · ' + im.mtime),
          disabled: busy,
          onClick: function () { apply({ image: im.builtin ? (im.builtinId || BUILTIN_IMAGE_ID) : im.name }, true) },
          style: {
            position: 'relative', padding: 0, border: '2px solid ' + (selected ? 'var(--dsw-alias-state-business-primary,#3964fe)' : 'var(--dsw-alias-border-l2)'),
            borderRadius: 8, background: 'var(--dsw-alias-bg-layer-3)', cursor: 'pointer', overflow: 'hidden', width: 132, height: 76
          }
        },
          cwH('img', { src: im.url, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } }),
          cwH('span', {
            style: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '2px 4px', fontSize: 10, background: 'rgba(0,0,0,.55)', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
          }, im.name)
        )
      }

      return cwH('div', { className: '__ss_root' },
        cwH('div', { className: '__ss_group' },
          cwH('div', { className: '__ss_groupTitle' }, '当前状态'),
          cwH('div', { className: '__ss_hint' },
            '背景图：' + (data.imageSource === 'builtin'
              ? (data.builtinName || '默认背景（内置）')
              : (data.image ? data.image.split(/[\\/]/).pop() : '（没有背景图，使用 DSH 默认底色）')),
            cwH('br'),
            '循环视频：' + (data.video && data.video.items.length ? ('已扫描 ' + data.video.items.length + ' 段' + (data.video.bgMode === 'video' && data.video.currentId ? '，正在播放' : '，未启用')) : '（视频目录里还没有视频）'),
            cwH('br'),
            '丢图目录：' + (data.dropDir || '（尚未创建，点「打开图片文件夹」会自动创建）')
          ),
          cwH('div', { className: '__ss_row' },
            cwH('button', {
              className: '__ss_btn', type: 'button', disabled: busy,
              onClick: function () {
                setNotice(null); setError(null)
                api('/open-dir', { method: 'POST' }).then(function (j) {
                  if (j && j.ok) setNotice('已打开图片文件夹：' + (j.opened || data.dropDir))
                  else setError('打开图片文件夹失败：' + ((j && j.error) || '宿主没有返回'))
                })
              }
            }, '打开图片文件夹'),
            cwH('button', { className: '__ss_btn', type: 'button', disabled: busy || refreshing, onClick: function () { load(true) } }, refreshing ? '刷新中…' : '刷新')
          )
        ),

        cwH('div', { className: '__ss_group' },
          cwH('div', { className: '__ss_groupTitle' }, '背景图'),
          cwH('div', { className: '__ss_hint' }, '点一下立刻换。前两张是插件自带的内置背景（默认 / 黑发雪夜战术少女），开箱就有；把图丢进上面的目录也会出现在这里，按修改时间取最新那张。'),
          data.images.length
            ? cwH('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } }, data.images.map(thumb))
            : cwH('div', { className: '__ss_hint' }, '目录里还没有图。点「打开图片文件夹」，把 jpg / png / webp 丢进去，再点刷新。只扫描这一层，子文件夹里的不算（支持 jpg/png/webp/gif/avif/bmp）。'),
          cwH('div', { className: '__ss_row', style: { marginTop: 8 } },
            cwH('span', { className: '__ss_status' }, '图片适配'),
            cwH(CwSelect, { value: data.imageFit, disabled: busy, options: [['cover', '铺满窗口（裁切多余部分）'], ['contain', '完整显示（不裁切，留底色边）']], onChange: function (v) { apply({ imageFit: v }, true) } })
          ),
          cwH('div', { className: '__ss_row' },
            cwH('button', { className: '__ss_btn', type: 'button', disabled: busy, onClick: function () { apply({ image: NO_IMAGE_ID }, true) } }, '不用背景图')
          )
        ),

        cwH('div', { className: '__ss_group' },
          cwH('div', { className: '__ss_groupTitle' }, '循环视频'),
          cwH('div', { className: '__ss_hint' },
            '默认静音、自动循环、铺满窗口。视频只读取本机目录、不会上传；支持壁纸引擎项目文件夹（自动读取 project.json 的标题/预览图）。'
          ),
          cwH('div', { className: '__ss_row', style: { marginTop: 8 } },
            cwH('span', { className: '__ss_status' }, '背景类型'),
            cwH(CwSelect, { value: data.video.bgMode, disabled: busy, options: [['image', '静态底图'], ['video', '循环视频']], onChange: function (v) { apply({ bgMode: v }, true) } }),
            cwH('span', { className: '__ss_status', style: { marginLeft: 16 } }, '播放模式'),
            cwH(CwSelect, { value: data.video.videoMode, disabled: busy, options: [['single', '手动选择'], ['shuffle', '随机轮换']], onChange: function (v) { apply({ videoMode: v }, true) } })
          ),
          cwH('div', { className: '__ss_row', style: { marginTop: 8 } },
            cwH('span', { className: '__ss_status' }, '色彩模式'),
            cwH(CwSelect, { value: data.colorMode, disabled: busy, options: [['color', '彩色（默认）'], ['mono', '黑白（原版素材，不染色）']], onChange: function (v) { apply({ colorMode: v }, true) } })
          ),
          cwH('div', { className: '__ss_hint' }, '黑白模式会关掉主题色纱、保留原画面颜色，适合本身就是黑白的动态壁纸；彩色模式不做任何调色。'),
          data.video.videoMode === 'shuffle'
            ? cwH('div', { className: '__ss_row' },
                cwH('span', { className: '__ss_status' }, '轮换间隔（分钟，0 = 每次启动随机）'),
                cwH('input', {
                  className: '__ss_input', type: 'number', min: 0, max: 1440, value: draft.shuffleMin, disabled: busy,
                  style: { width: 96 },
                  onChange: function (ev) { var d = Object.assign({}, draft); d.shuffleMin = ev.target.value; setDraft(d) }
                }),
                cwH('button', {
                  className: '__ss_btn', type: 'button', disabled: busy,
                  onClick: function () { apply({ videoShuffleMinutes: Math.max(0, Math.min(1440, Math.round(Number(draft.shuffleMin) || 0))) }, false) }
                }, '保存间隔')
              )
            : null,
          cwH('div', { className: '__ss_hint', style: { marginTop: 8, fontWeight: 600 } }, '视频目录（可添加自定义目录，避免占满某个分区）'),
          (data.video.roots || []).map(function (root) {
            return cwH('div', { key: root.path, className: '__ss_row', style: { marginTop: 4 } },
              cwH('span', { className: '__ss_status', style: { flex: '1 1 auto', textAlign: 'left', wordBreak: 'break-all' } }, root.path + (root.exists ? '' : '（不存在）')),
              cwH('button', { className: '__ss_btn', type: 'button', disabled: busy, onClick: function () { rootAction('open', root) } }, '打开'),
              root.removable
                ? cwH('button', { className: '__ss_btn', type: 'button', disabled: busy, onClick: function () { rootAction('remove', root) } }, '移除')
                : cwH('span', { className: '__ss_hint' }, '默认目录')
            )
          }),
          cwH('div', { className: '__ss_row', style: { marginTop: 6 } },
            cwH('input', {
              className: '__ss_input', type: 'text', placeholder: '例如 D:\wallpapers\loops', value: draft.newRoot, disabled: busy,
              style: { flex: '1 1 260px' },
              onChange: function (ev) { var d = Object.assign({}, draft); d.newRoot = ev.target.value; setDraft(d) }
            }),
            cwH('button', { className: '__ss_btn', type: 'button', disabled: busy, onClick: function () { addVideoRoot() } }, '添加目录')
          ),
          cwH('div', { className: '__ss_hint', style: { marginTop: 8, fontWeight: 600 } }, '视频列表（' + data.video.items.length + '）'),
          data.video.items.length
            ? cwH('div', null, data.video.items.map(function (it) {
                return cwH('div', { key: it.id, className: '__ss_row', style: { marginTop: 6, alignItems: 'center', gap: 10 } },
                  it.previewUrl
                    ? cwH('img', { src: it.previewUrl, alt: '', style: { width: 96, height: 54, objectFit: 'cover', borderRadius: 6, flex: '0 0 auto' } })
                    : cwH('div', { style: { width: 96, height: 54, borderRadius: 6, background: 'rgba(127,127,127,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } }, '🎬'),
                  cwH('div', { style: { flex: '1 1 auto', minWidth: 0 } },
                    cwH('div', { style: { fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, it.title + (it.kind === 'project' ? '（壁纸引擎）' : '')),
                    cwH('div', { className: '__ss_hint', style: { marginTop: 2 } }, it.folder + ' · ' + it.sizeMB + ' MB' + (it.id === data.video.currentId ? ' · 正在播放' : ''))
                  ),
                  cwH('button', { className: '__ss_btn', type: 'button', disabled: busy, onClick: function () { apply({ videoId: it.id, bgMode: 'video' }, true) } }, it.id === data.video.currentId ? '重播' : '使用'),
                  cwH('button', { className: '__ss_btn', type: 'button', disabled: busy, onClick: function () { deleteVideo(it) } }, '删除')
                )
              }))
            : cwH('div', { className: '__ss_hint' }, '还没有视频。把 mp4/webm 或壁纸引擎的项目文件夹放进上面的目录，再点下方「刷新」。'),
          cwH('div', { className: '__ss_row', style: { marginTop: 8 } },
            cwH('button', { className: '__ss_btn', type: 'button', disabled: busy || !(data.video.roots && data.video.roots.length), onClick: function () { if (data.video.roots && data.video.roots.length) rootAction('open', data.video.roots[0]) } }, '打开视频文件夹'),
            cwH('button', { className: '__ss_btn', type: 'button', disabled: busy || refreshing, onClick: function () { load(true) } }, refreshing ? '刷新中…' : '刷新')
          )
        ),

        cwH('div', { className: '__ss_group' },
          cwH('div', { className: '__ss_groupTitle' }, '纱的浓度（' + (dark ? '深色主题' : '浅色主题') + '）'),
          cwH('div', { className: '__ss_hint' }, '盖在背景图上的那层纱，越浓字越清楚、背景越淡。'),
          cwH('div', { className: '__ss_row' },
            cwH('input', {
              type: 'range', min: 0, max: 100, step: 1,
              value: Math.round(veilAlpha * 100), disabled: busy,
              style: { flex: 1 },
              onChange: function (ev) {
                var v = Number(ev.target.value) / 100
                var patch = {}
                patch[dark ? 'veilDarkA' : 'veilLightA'] = withAlpha(veilNow, v)
                apply(patch, false)
                var d = Object.assign({}, data); d.veil[dark ? 'dark' : 'light'] = v; setData(d)
              }
            }),
            cwH('span', { className: '__ss_status' }, Math.round(veilAlpha * 100) + '%')
          ),
          cwH('div', { style: { marginTop: 10, fontWeight: 600 } }, '镜头模糊'),
          cwH('div', { className: '__ss_hint' }, '让背景图/视频变模糊，聊天文字保持清晰。0 = 完全不模糊，100 = 最模糊。'),
          cwH('div', { className: '__ss_row' },
            cwH('input', {
              type: 'range', min: 0, max: 100, step: 5,
              value: Math.round(data.veilBlur), disabled: busy,
              style: { flex: 1 },
              onChange: function (ev) {
                var v = Number(ev.target.value)
                apply({ veilBlur: v }, false)
                var d = Object.assign({}, data); d.veilBlur = v; setData(d)
              }
            }),
            cwH('span', { className: '__ss_status' }, Math.round(data.veilBlur) + '%')
          )
        ),

        cwH('div', { className: '__ss_group' },
          cwH('div', { className: '__ss_groupTitle' }, '大字横幅'),
          cwH('div', { className: '__ss_hint' }, '铺满窗口的一行字（矢量文字，不会糊）。留空 = 不要横幅。'),
          cwH('input', {
            className: '__ss_input', type: 'text', value: draft.banner, disabled: busy,
            placeholder: '例如：DEEPSEEK HARNESS',
            onChange: function (ev) { var d = Object.assign({}, draft); d.banner = ev.target.value; setDraft(d) }
          }),
          cwH('div', { className: '__ss_row' },
            cwH('input', {
              type: 'range', min: 0, max: 40, step: 1, value: Math.round(draft.bannerOpacity * 100), disabled: busy,
              style: { flex: 1 },
              onChange: function (ev) { var d = Object.assign({}, draft); d.bannerOpacity = Number(ev.target.value) / 100; setDraft(d) }
            }),
            cwH('span', { className: '__ss_status' }, Math.round(draft.bannerOpacity * 100) + '%')
          )
        ),

        cwH('div', { className: '__ss_actions' },
          cwH('button', {
            className: '__ss_btn __ss_btnPrimary', type: 'button', disabled: busy,
            onClick: function () { apply({ banner: draft.banner, bannerOpacity: draft.bannerOpacity }, true) }
          }, busy ? '保存中…' : '保存'),
          error ? cwH('span', { className: '__ss_err' }, error) : null,
          notice ? cwH('span', { className: '__ss_ok' }, notice) : null
        )
      )
    }

    exports.apply = apply
    exports.inject = []       // 不需要任何客户端服务

    /* 测试钩子：只给 node:vm 冒烟测试用，不参与运行时逻辑。
       有了它们就能在不启动 DSH 的情况下验证 CSS 生成、主题判定、挂载/撤场。 */
    exports.__buildCss = buildCss
    exports.__looksDark = looksDark
    exports.__markerSaysDark = markerSaysDark
    exports.__tokenSaysDark = tokenSaysDark
    exports.__TAG_ID = TAG_ID
    exports.__BG_ID = BG_ID
    exports.__BANNER_ID = BANNER_ID
    exports.__VIDEO_ID = VIDEO_ID
    exports.__startShuffle = startShuffle
    exports.__stopShuffle = stopShuffle
    exports.__THEME_CLASSES = ['dsh-cw-dark', 'dsh-cw-light']
    exports.__BG_CLASSES = [BG_DARK, BG_LIGHT]
    exports.__TEXT_CLASSES = [TXT_DARK, TXT_LIGHT]
    exports.__PANEL_CLASSES = [PANEL_DARK, PANEL_LIGHT]
    exports.__findChatRoot = findChatRoot
    exports.__findSidebarRoot = findSidebarRoot
    exports.__findHeaderRoot = findHeaderRoot
    exports.__findComposer = findComposer
    exports.__findInputBox = findInputBox
    exports.__setTxtMode = setTxtMode
    exports.__resetLum = function () { measuredLum = null }
    exports.__mountBg = mountBg
    exports.__mountBanner = mountBanner
    exports.__fitBanner = fitBanner
    exports.__applyNow = applyNow
    exports.__watchTheme = watchTheme
    exports.__teardown = teardown
    exports.__hasCurrent = function () { return !!current }
    exports.__BUILD = BUILD

    return module.exports
    })()

    /* 第三段执行：认证（原 dsh-ui-auth）——独立 IIFE，导出 apply/inject。
       设置页三块 UI（用户管理 / 模型 / 分享管理）与 i18n DOM 替换都在这一段里；
       认证半侧坏了不能拖垮开机动画，所以最后由 apply 单独 try/catch。 */
    var __authHalf = (function () {
    var module = { exports: {} }
    var exports = module.exports

"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// node_modules/@simplewebauthn/browser/script/helpers/bufferToBase64URLString.js
var require_bufferToBase64URLString = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/bufferToBase64URLString.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.bufferToBase64URLString = bufferToBase64URLString;
    function bufferToBase64URLString(buffer) {
      const bytes = new Uint8Array(buffer);
      let str = "";
      for (const charCode of bytes) {
        str += String.fromCharCode(charCode);
      }
      const base64String = btoa(str);
      return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/base64URLStringToBuffer.js
var require_base64URLStringToBuffer = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/base64URLStringToBuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.base64URLStringToBuffer = base64URLStringToBuffer;
    function base64URLStringToBuffer(base64URLString) {
      const base64 = base64URLString.replace(/-/g, "+").replace(/_/g, "/");
      const padLength = (4 - base64.length % 4) % 4;
      const padded = base64.padEnd(base64.length + padLength, "=");
      const binary = atob(padded);
      const buffer = new ArrayBuffer(binary.length);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return buffer;
    }
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/browserSupportsWebAuthn.js
var require_browserSupportsWebAuthn = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/browserSupportsWebAuthn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2._browserSupportsWebAuthnInternals = void 0;
    exports2.browserSupportsWebAuthn = browserSupportsWebAuthn;
    function browserSupportsWebAuthn() {
      return exports2._browserSupportsWebAuthnInternals.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential === "function");
    }
    exports2._browserSupportsWebAuthnInternals = {
      stubThis: (value) => value
    };
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/toPublicKeyCredentialDescriptor.js
var require_toPublicKeyCredentialDescriptor = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/toPublicKeyCredentialDescriptor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toPublicKeyCredentialDescriptor = toPublicKeyCredentialDescriptor;
    var base64URLStringToBuffer_js_1 = require_base64URLStringToBuffer();
    function toPublicKeyCredentialDescriptor(descriptor) {
      const { id } = descriptor;
      return {
        ...descriptor,
        id: (0, base64URLStringToBuffer_js_1.base64URLStringToBuffer)(id),
        transports: descriptor.transports,
        type: descriptor.type
      };
    }
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/isValidDomain.js
var require_isValidDomain = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/isValidDomain.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isValidDomain = isValidDomain;
    function isValidDomain(hostname) {
      return (
        // Consider localhost valid as well since it's okay wrt Secure Contexts
        hostname === "localhost" || // Support punycode (ACE) or ascii labels and domains
        /^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(hostname)
      );
    }
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/webAuthnError.js
var require_webAuthnError = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/webAuthnError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WebAuthnError = void 0;
    var WebAuthnError = class extends Error {
      constructor({ message: message2, code, cause, name }) {
        super(message2, { cause });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.name = name ?? cause.name;
        this.code = code;
      }
    };
    exports2.WebAuthnError = WebAuthnError;
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/identifyRegistrationError.js
var require_identifyRegistrationError = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/identifyRegistrationError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.identifyRegistrationError = identifyRegistrationError;
    var isValidDomain_js_1 = require_isValidDomain();
    var webAuthnError_js_1 = require_webAuthnError();
    function identifyRegistrationError({ error, options }) {
      const { publicKey } = options;
      if (!publicKey) {
        throw Error("options was missing required publicKey property");
      }
      if (error.name === "AbortError") {
        if (options.signal instanceof AbortSignal) {
          return new webAuthnError_js_1.WebAuthnError({
            message: "Registration ceremony was sent an abort signal",
            code: "ERROR_CEREMONY_ABORTED",
            cause: error
          });
        }
      } else if (error.name === "ConstraintError") {
        if (publicKey.authenticatorSelection?.requireResidentKey === true) {
          return new webAuthnError_js_1.WebAuthnError({
            message: "Discoverable credentials were required but no available authenticator supported it",
            code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
            cause: error
          });
        } else if (
          // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
          options.mediation === "conditional" && publicKey.authenticatorSelection?.userVerification === "required"
        ) {
          return new webAuthnError_js_1.WebAuthnError({
            message: "User verification was required during automatic registration but it could not be performed",
            code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
            cause: error
          });
        } else if (publicKey.authenticatorSelection?.userVerification === "required") {
          return new webAuthnError_js_1.WebAuthnError({
            message: "User verification was required but no available authenticator supported it",
            code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
            cause: error
          });
        }
      } else if (error.name === "InvalidStateError") {
        return new webAuthnError_js_1.WebAuthnError({
          message: "The authenticator was previously registered",
          code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
          cause: error
        });
      } else if (error.name === "NotAllowedError") {
        return new webAuthnError_js_1.WebAuthnError({
          message: error.message,
          code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
          cause: error
        });
      } else if (error.name === "NotSupportedError") {
        const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param) => param.type === "public-key");
        if (validPubKeyCredParams.length === 0) {
          return new webAuthnError_js_1.WebAuthnError({
            message: 'No entry in pubKeyCredParams was of type "public-key"',
            code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
            cause: error
          });
        }
        return new webAuthnError_js_1.WebAuthnError({
          message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
          code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
          cause: error
        });
      } else if (error.name === "SecurityError") {
        const effectiveDomain = globalThis.location.hostname;
        if (!(0, isValidDomain_js_1.isValidDomain)(effectiveDomain)) {
          return new webAuthnError_js_1.WebAuthnError({
            message: `${globalThis.location.hostname} is an invalid domain`,
            code: "ERROR_INVALID_DOMAIN",
            cause: error
          });
        } else if (publicKey.rp.id !== effectiveDomain) {
          return new webAuthnError_js_1.WebAuthnError({
            message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: error
          });
        }
      } else if (error.name === "TypeError") {
        if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
          return new webAuthnError_js_1.WebAuthnError({
            message: "User ID was not between 1 and 64 characters",
            code: "ERROR_INVALID_USER_ID_LENGTH",
            cause: error
          });
        }
      } else if (error.name === "UnknownError") {
        return new webAuthnError_js_1.WebAuthnError({
          message: "The authenticator was unable to process the specified options, or could not create a new credential",
          code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
          cause: error
        });
      }
      return error;
    }
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/webAuthnAbortService.js
var require_webAuthnAbortService = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/webAuthnAbortService.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WebAuthnAbortService = void 0;
    var BaseWebAuthnAbortService = class {
      constructor() {
        Object.defineProperty(this, "controller", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
      }
      createNewAbortSignal() {
        if (this.controller) {
          const abortError = new Error("Cancelling existing WebAuthn API call for new one");
          abortError.name = "AbortError";
          this.controller.abort(abortError);
        }
        const newController = new AbortController();
        this.controller = newController;
        return newController.signal;
      }
      cancelCeremony() {
        if (this.controller) {
          const abortError = new Error("Manually cancelling existing WebAuthn API call");
          abortError.name = "AbortError";
          this.controller.abort(abortError);
          this.controller = void 0;
        }
      }
    };
    exports2.WebAuthnAbortService = new BaseWebAuthnAbortService();
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/toAuthenticatorAttachment.js
var require_toAuthenticatorAttachment = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/toAuthenticatorAttachment.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toAuthenticatorAttachment = toAuthenticatorAttachment;
    var attachments = ["cross-platform", "platform"];
    function toAuthenticatorAttachment(attachment) {
      if (!attachment) {
        return;
      }
      if (attachments.indexOf(attachment) < 0) {
        return;
      }
      return attachment;
    }
  }
});

// node_modules/@simplewebauthn/browser/script/methods/startRegistration.js
var require_startRegistration = __commonJS({
  "node_modules/@simplewebauthn/browser/script/methods/startRegistration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.startRegistration = startRegistration;
    var bufferToBase64URLString_js_1 = require_bufferToBase64URLString();
    var base64URLStringToBuffer_js_1 = require_base64URLStringToBuffer();
    var browserSupportsWebAuthn_js_1 = require_browserSupportsWebAuthn();
    var toPublicKeyCredentialDescriptor_js_1 = require_toPublicKeyCredentialDescriptor();
    var identifyRegistrationError_js_1 = require_identifyRegistrationError();
    var webAuthnAbortService_js_1 = require_webAuthnAbortService();
    var toAuthenticatorAttachment_js_1 = require_toAuthenticatorAttachment();
    async function startRegistration(options) {
      if (!options.optionsJSON && options.challenge) {
        console.warn("startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information.");
        options = { optionsJSON: options };
      }
      const { optionsJSON, useAutoRegister = false } = options;
      if (!(0, browserSupportsWebAuthn_js_1.browserSupportsWebAuthn)()) {
        throw new Error("WebAuthn is not supported in this browser");
      }
      const publicKey = {
        ...optionsJSON,
        challenge: (0, base64URLStringToBuffer_js_1.base64URLStringToBuffer)(optionsJSON.challenge),
        user: {
          ...optionsJSON.user,
          id: (0, base64URLStringToBuffer_js_1.base64URLStringToBuffer)(optionsJSON.user.id)
        },
        excludeCredentials: optionsJSON.excludeCredentials?.map(toPublicKeyCredentialDescriptor_js_1.toPublicKeyCredentialDescriptor)
      };
      const createOptions = {};
      if (useAutoRegister) {
        createOptions.mediation = "conditional";
      }
      createOptions.publicKey = publicKey;
      createOptions.signal = webAuthnAbortService_js_1.WebAuthnAbortService.createNewAbortSignal();
      let credential;
      try {
        credential = await navigator.credentials.create(
          // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
          createOptions
        );
      } catch (err) {
        throw (0, identifyRegistrationError_js_1.identifyRegistrationError)({ error: err, options: createOptions });
      }
      if (!credential) {
        throw new Error("Registration was not completed");
      }
      const { id, rawId, response, type } = credential;
      let transports = void 0;
      if (typeof response.getTransports === "function") {
        transports = response.getTransports();
      }
      let responsePublicKeyAlgorithm = void 0;
      if (typeof response.getPublicKeyAlgorithm === "function") {
        try {
          responsePublicKeyAlgorithm = response.getPublicKeyAlgorithm();
        } catch (error) {
          warnOnBrokenImplementation("getPublicKeyAlgorithm()", error);
        }
      }
      let responsePublicKey = void 0;
      if (typeof response.getPublicKey === "function") {
        try {
          const _publicKey = response.getPublicKey();
          if (_publicKey !== null) {
            responsePublicKey = (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(_publicKey);
          }
        } catch (error) {
          warnOnBrokenImplementation("getPublicKey()", error);
        }
      }
      let responseAuthenticatorData;
      if (typeof response.getAuthenticatorData === "function") {
        try {
          responseAuthenticatorData = (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(response.getAuthenticatorData());
        } catch (error) {
          warnOnBrokenImplementation("getAuthenticatorData()", error);
        }
      }
      return {
        id,
        rawId: (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(rawId),
        response: {
          attestationObject: (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(response.attestationObject),
          clientDataJSON: (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(response.clientDataJSON),
          transports,
          publicKeyAlgorithm: responsePublicKeyAlgorithm,
          publicKey: responsePublicKey,
          authenticatorData: responseAuthenticatorData
        },
        type,
        clientExtensionResults: credential.getClientExtensionResults(),
        authenticatorAttachment: (0, toAuthenticatorAttachment_js_1.toAuthenticatorAttachment)(credential.authenticatorAttachment)
      };
    }
    function warnOnBrokenImplementation(methodName, cause) {
      console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${methodName}. You should report this error to them.
`, cause);
    }
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/browserSupportsWebAuthnAutofill.js
var require_browserSupportsWebAuthnAutofill = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/browserSupportsWebAuthnAutofill.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2._browserSupportsWebAuthnAutofillInternals = void 0;
    exports2.browserSupportsWebAuthnAutofill = browserSupportsWebAuthnAutofill;
    var browserSupportsWebAuthn_js_1 = require_browserSupportsWebAuthn();
    function browserSupportsWebAuthnAutofill() {
      if (!(0, browserSupportsWebAuthn_js_1.browserSupportsWebAuthn)()) {
        return exports2._browserSupportsWebAuthnAutofillInternals.stubThis(new Promise((resolve) => resolve(false)));
      }
      const globalPublicKeyCredential = globalThis.PublicKeyCredential;
      if (globalPublicKeyCredential?.isConditionalMediationAvailable === void 0) {
        return exports2._browserSupportsWebAuthnAutofillInternals.stubThis(new Promise((resolve) => resolve(false)));
      }
      return exports2._browserSupportsWebAuthnAutofillInternals.stubThis(globalPublicKeyCredential.isConditionalMediationAvailable());
    }
    exports2._browserSupportsWebAuthnAutofillInternals = {
      stubThis: (value) => value
    };
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/identifyAuthenticationError.js
var require_identifyAuthenticationError = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/identifyAuthenticationError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.identifyAuthenticationError = identifyAuthenticationError;
    var isValidDomain_js_1 = require_isValidDomain();
    var webAuthnError_js_1 = require_webAuthnError();
    function identifyAuthenticationError({ error, options }) {
      const { publicKey } = options;
      if (!publicKey) {
        throw Error("options was missing required publicKey property");
      }
      if (error.name === "AbortError") {
        if (options.signal instanceof AbortSignal) {
          return new webAuthnError_js_1.WebAuthnError({
            message: "Authentication ceremony was sent an abort signal",
            code: "ERROR_CEREMONY_ABORTED",
            cause: error
          });
        }
      } else if (error.name === "NotAllowedError") {
        return new webAuthnError_js_1.WebAuthnError({
          message: error.message,
          code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
          cause: error
        });
      } else if (error.name === "SecurityError") {
        const effectiveDomain = globalThis.location.hostname;
        if (!(0, isValidDomain_js_1.isValidDomain)(effectiveDomain)) {
          return new webAuthnError_js_1.WebAuthnError({
            message: `${globalThis.location.hostname} is an invalid domain`,
            code: "ERROR_INVALID_DOMAIN",
            cause: error
          });
        } else if (publicKey.rpId !== effectiveDomain) {
          return new webAuthnError_js_1.WebAuthnError({
            message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: error
          });
        }
      } else if (error.name === "UnknownError") {
        return new webAuthnError_js_1.WebAuthnError({
          message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
          code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
          cause: error
        });
      }
      return error;
    }
  }
});

// node_modules/@simplewebauthn/browser/script/methods/startAuthentication.js
var require_startAuthentication = __commonJS({
  "node_modules/@simplewebauthn/browser/script/methods/startAuthentication.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.startAuthentication = startAuthentication;
    var bufferToBase64URLString_js_1 = require_bufferToBase64URLString();
    var base64URLStringToBuffer_js_1 = require_base64URLStringToBuffer();
    var browserSupportsWebAuthn_js_1 = require_browserSupportsWebAuthn();
    var browserSupportsWebAuthnAutofill_js_1 = require_browserSupportsWebAuthnAutofill();
    var toPublicKeyCredentialDescriptor_js_1 = require_toPublicKeyCredentialDescriptor();
    var identifyAuthenticationError_js_1 = require_identifyAuthenticationError();
    var webAuthnAbortService_js_1 = require_webAuthnAbortService();
    var toAuthenticatorAttachment_js_1 = require_toAuthenticatorAttachment();
    async function startAuthentication(options) {
      if (!options.optionsJSON && options.challenge) {
        console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information.");
        options = { optionsJSON: options };
      }
      const { optionsJSON, useBrowserAutofill = false, verifyBrowserAutofillInput = true } = options;
      if (!(0, browserSupportsWebAuthn_js_1.browserSupportsWebAuthn)()) {
        throw new Error("WebAuthn is not supported in this browser");
      }
      let allowCredentials;
      if (optionsJSON.allowCredentials?.length !== 0) {
        allowCredentials = optionsJSON.allowCredentials?.map(toPublicKeyCredentialDescriptor_js_1.toPublicKeyCredentialDescriptor);
      }
      const publicKey = {
        ...optionsJSON,
        challenge: (0, base64URLStringToBuffer_js_1.base64URLStringToBuffer)(optionsJSON.challenge),
        allowCredentials
      };
      const getOptions = {};
      if (useBrowserAutofill) {
        if (!await (0, browserSupportsWebAuthnAutofill_js_1.browserSupportsWebAuthnAutofill)()) {
          throw Error("Browser does not support WebAuthn autofill");
        }
        const eligibleInputs = document.querySelectorAll("input[autocomplete$='webauthn']");
        if (eligibleInputs.length < 1 && verifyBrowserAutofillInput) {
          throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
        }
        getOptions.mediation = "conditional";
        publicKey.allowCredentials = [];
      }
      getOptions.publicKey = publicKey;
      getOptions.signal = webAuthnAbortService_js_1.WebAuthnAbortService.createNewAbortSignal();
      let credential;
      try {
        credential = await navigator.credentials.get(
          // TODO: Newer versions of Deno require this casting, revisit once we're using Deno 2.6+
          getOptions
        );
      } catch (err) {
        throw (0, identifyAuthenticationError_js_1.identifyAuthenticationError)({ error: err, options: getOptions });
      }
      if (!credential) {
        throw new Error("Authentication was not completed");
      }
      const { id, rawId, response, type } = credential;
      let userHandle = void 0;
      if (response.userHandle) {
        userHandle = (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(response.userHandle);
      }
      return {
        id,
        rawId: (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(rawId),
        response: {
          authenticatorData: (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(response.authenticatorData),
          clientDataJSON: (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(response.clientDataJSON),
          signature: (0, bufferToBase64URLString_js_1.bufferToBase64URLString)(response.signature),
          userHandle
        },
        type,
        clientExtensionResults: credential.getClientExtensionResults(),
        authenticatorAttachment: (0, toAuthenticatorAttachment_js_1.toAuthenticatorAttachment)(credential.authenticatorAttachment)
      };
    }
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/identifySignalError.js
var require_identifySignalError = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/identifySignalError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.identifySignalError = identifySignalError;
    var isValidDomain_js_1 = require_isValidDomain();
    var webAuthnError_js_1 = require_webAuthnError();
    function identifySignalError({ error, options }) {
      if (error.name === "SecurityError") {
        const effectiveDomain = globalThis.location.hostname;
        if (!(0, isValidDomain_js_1.isValidDomain)(effectiveDomain)) {
          return new webAuthnError_js_1.WebAuthnError({
            message: `"${globalThis.location.hostname}" is an invalid domain`,
            code: "ERROR_INVALID_DOMAIN",
            cause: error
          });
        }
        return new webAuthnError_js_1.WebAuthnError({
          message: `The browser does not support Related Origins to enable signals for RP ID "${options.rpID}" on domain "${globalThis.location.hostname}"`,
          code: "ERROR_INVALID_RP_ID",
          cause: error
        });
      }
      if (options.signalName === "unknownCredential") {
        if (error.name === "TypeError") {
          return new webAuthnError_js_1.WebAuthnError({
            message: "credentialID is an invalid base64url string",
            code: "ERROR_SIGNAL_INVALID_ARGUMENT",
            cause: error
          });
        }
      } else if (options.signalName === "allAcceptedCredentials") {
        if (error.name === "TypeError") {
          return new webAuthnError_js_1.WebAuthnError({
            message: "userID, or an entry in allAcceptedCredentialIDs, is an invalid base64url string",
            code: "ERROR_SIGNAL_INVALID_ARGUMENT",
            cause: error
          });
        }
      } else if (options.signalName === "currentUserDetails") {
        if (error.name === "TypeError") {
          return new webAuthnError_js_1.WebAuthnError({
            message: "userID is an invalid base64url string",
            code: "ERROR_SIGNAL_INVALID_ARGUMENT",
            cause: error
          });
        }
      }
      return new webAuthnError_js_1.WebAuthnError({
        message: error.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: error
      });
    }
  }
});

// node_modules/@simplewebauthn/browser/script/methods/sendSignal.js
var require_sendSignal = __commonJS({
  "node_modules/@simplewebauthn/browser/script/methods/sendSignal.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.sendSignal = sendSignal;
    var identifySignalError_js_1 = require_identifySignalError();
    async function sendSignal(opts) {
      const { signalName } = opts;
      if (signalName === "unknownCredential") {
        return _callSignalUnknownCredential(opts);
      } else if (signalName === "allAcceptedCredentials") {
        return _callSignalAllAcceptedCredentials(opts);
      } else if (signalName === "currentUserDetails") {
        return _callSignalCurrentUserDetails(opts);
      }
      throw new Error(`Received unrecognized signalName "${opts.signalName}"`);
    }
    async function _callSignalUnknownCredential(opts) {
      const globalPublicKeyCredential = globalThis.PublicKeyCredential;
      if (typeof globalPublicKeyCredential.signalUnknownCredential !== "function") {
        throw new Error("This browser does not support PublicKeyCredential.signalUnknownCredential()");
      }
      try {
        await globalPublicKeyCredential.signalUnknownCredential({
          rpId: opts.rpID,
          credentialId: opts.credentialID
        });
      } catch (err) {
        throw (0, identifySignalError_js_1.identifySignalError)({ error: err, options: opts });
      }
      return void 0;
    }
    async function _callSignalAllAcceptedCredentials(opts) {
      const globalPublicKeyCredential = globalThis.PublicKeyCredential;
      if (typeof globalPublicKeyCredential.signalAllAcceptedCredentials !== "function") {
        throw new Error("This browser does not support PublicKeyCredential.signalAllAcceptedCredentials()");
      }
      try {
        await globalPublicKeyCredential.signalAllAcceptedCredentials({
          rpId: opts.rpID,
          userId: opts.userID,
          allAcceptedCredentialIds: opts.allAcceptedCredentialIDs
        });
      } catch (err) {
        throw (0, identifySignalError_js_1.identifySignalError)({ error: err, options: opts });
      }
      return void 0;
    }
    async function _callSignalCurrentUserDetails(opts) {
      const globalPublicKeyCredential = globalThis.PublicKeyCredential;
      if (typeof globalPublicKeyCredential.signalCurrentUserDetails !== "function") {
        throw new Error("This browser does not support PublicKeyCredential.signalCurrentUserDetails()");
      }
      try {
        await globalPublicKeyCredential.signalCurrentUserDetails({
          rpId: opts.rpID,
          userId: opts.userID,
          name: opts.userName,
          displayName: opts.userDisplayName ?? ""
        });
      } catch (err) {
        throw (0, identifySignalError_js_1.identifySignalError)({ error: err, options: opts });
      }
      return void 0;
    }
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/getBrowserCapabilities.js
var require_getBrowserCapabilities = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/getBrowserCapabilities.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2._getBrowserCapabilitiesInternals = void 0;
    exports2.getBrowserCapabilities = getBrowserCapabilities;
    async function getBrowserCapabilities() {
      if (typeof PublicKeyCredential.getClientCapabilities === "function") {
        const capabilities = await PublicKeyCredential.getClientCapabilities();
        let _userVerifyingPlatformAuthenticator = mapCapabilityToEnum(capabilities.userVerifyingPlatformAuthenticator);
        if (_userVerifyingPlatformAuthenticator === "unknown" && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
          const isUVPAA = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (isUVPAA) {
            _userVerifyingPlatformAuthenticator = "supported";
          } else {
            _userVerifyingPlatformAuthenticator = "unsupported";
          }
        }
        let _conditionalGet = mapCapabilityToEnum(capabilities.conditionalGet);
        if (_conditionalGet === "unknown" && typeof PublicKeyCredential.isConditionalMediationAvailable === "function") {
          const isCMA = await PublicKeyCredential.isConditionalMediationAvailable();
          if (isCMA) {
            _conditionalGet = "supported";
          } else {
            _conditionalGet = "unsupported";
          }
        }
        return exports2._getBrowserCapabilitiesInternals.stubThis({
          conditionalCreate: mapCapabilityToEnum(capabilities.conditionalCreate),
          conditionalGet: _conditionalGet,
          hybridTransport: mapCapabilityToEnum(capabilities.hybridTransport),
          passkeyPlatformAuthenticator: mapCapabilityToEnum(capabilities.passkeyPlatformAuthenticator),
          userVerifyingPlatformAuthenticator: _userVerifyingPlatformAuthenticator,
          relatedOrigins: mapCapabilityToEnum(capabilities.relatedOrigins),
          signalAllAcceptedCredentials: mapCapabilityToEnum(capabilities.signalAllAcceptedCredentials),
          signalCurrentUserDetails: mapCapabilityToEnum(capabilities.signalCurrentUserDetails),
          signalUnknownCredential: mapCapabilityToEnum(capabilities.signalUnknownCredential)
        });
      }
      return exports2._getBrowserCapabilitiesInternals.stubThis({
        conditionalCreate: "unknown",
        conditionalGet: "unknown",
        hybridTransport: "unknown",
        passkeyPlatformAuthenticator: "unknown",
        userVerifyingPlatformAuthenticator: "unknown",
        relatedOrigins: "unknown",
        signalAllAcceptedCredentials: "unknown",
        signalCurrentUserDetails: "unknown",
        signalUnknownCredential: "unknown"
      });
    }
    function mapCapabilityToEnum(value) {
      if (value === true) {
        return "supported";
      } else if (value === false) {
        return "unsupported";
      } else if (typeof value === "undefined") {
        return "unknown";
      } else {
        throw new Error("Unexpected capability value:", value);
      }
    }
    exports2._getBrowserCapabilitiesInternals = {
      stubThis: (value) => value
    };
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/browserSupportsPasskeys.js
var require_browserSupportsPasskeys = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/browserSupportsPasskeys.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.browserSupportsPasskeys = browserSupportsPasskeys;
    var browserSupportsWebAuthn_js_1 = require_browserSupportsWebAuthn();
    var getBrowserCapabilities_js_1 = require_getBrowserCapabilities();
    async function browserSupportsPasskeys() {
      if (!(0, browserSupportsWebAuthn_js_1.browserSupportsWebAuthn)()) {
        return new Promise((resolve) => resolve(false));
      }
      const capabilities = await (0, getBrowserCapabilities_js_1.getBrowserCapabilities)();
      const { passkeyPlatformAuthenticator, userVerifyingPlatformAuthenticator, hybridTransport } = capabilities;
      return passkeyPlatformAuthenticator === "supported" || hybridTransport === "supported" || userVerifyingPlatformAuthenticator === "supported";
    }
  }
});

// node_modules/@simplewebauthn/browser/script/helpers/platformAuthenticatorIsAvailable.js
var require_platformAuthenticatorIsAvailable = __commonJS({
  "node_modules/@simplewebauthn/browser/script/helpers/platformAuthenticatorIsAvailable.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.platformAuthenticatorIsAvailable = platformAuthenticatorIsAvailable;
    var browserSupportsWebAuthn_js_1 = require_browserSupportsWebAuthn();
    function platformAuthenticatorIsAvailable() {
      if (!(0, browserSupportsWebAuthn_js_1.browserSupportsWebAuthn)()) {
        return new Promise((resolve) => resolve(false));
      }
      return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  }
});

// node_modules/@simplewebauthn/browser/script/types/index.js
var require_types = __commonJS({
  "node_modules/@simplewebauthn/browser/script/types/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/@simplewebauthn/browser/script/index.js
var require_script = __commonJS({
  "node_modules/@simplewebauthn/browser/script/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_startRegistration(), exports2);
    __exportStar(require_startAuthentication(), exports2);
    __exportStar(require_sendSignal(), exports2);
    __exportStar(require_browserSupportsWebAuthn(), exports2);
    __exportStar(require_browserSupportsPasskeys(), exports2);
    __exportStar(require_platformAuthenticatorIsAvailable(), exports2);
    __exportStar(require_browserSupportsWebAuthnAutofill(), exports2);
    __exportStar(require_base64URLStringToBuffer(), exports2);
    __exportStar(require_bufferToBase64URLString(), exports2);
    __exportStar(require_getBrowserCapabilities(), exports2);
    __exportStar(require_webAuthnAbortService(), exports2);
    __exportStar(require_webAuthnError(), exports2);
    __exportStar(require_types(), exports2);
  }
});

// src/i18n-phrases.ts
var PHRASES = [
  // ===== 通用 =====
  ["解锁", "Unlock"],
  ["添加", "Add"],
  ["删除", "Delete"],
  ["取消", "Cancel"],
  ["确认", "Confirm"],
  ["保存", "Save"],
  ["重命名", "Rename"],
  ["启用", "Enable"],
  ["停用", "Disable"],
  ["安装", "Install"],
  ["卸载", "Uninstall"],
  ["更新", "Update"],
  ["升级", "Upgrade"],
  ["重载", "Reload"],
  ["禁用", "Disable"],
  ["撤销", "Revoke"],
  ["拒绝", "Reject"],
  ["是", "Yes"],
  ["否", "No"],
  ["管理", "Admin"],
  ["管理员", "Administrator"],
  ["用户", "User"],
  ["普通用户", "User"],
  ["类型", "Type"],
  ["角色", "Role"],
  ["操作", "Actions"],
  ["创建者", "Created by"],
  ["剩余", "Remaining"],
  ["加载中…", "Loading…"],
  ["验证中…", "Verifying…"],
  ["未命名", "Untitled"],
  ["未命名配置", "Untitled profile"],
  ["暂无用量", "No usage yet"],
  ["暂无邀请码", "No invite codes yet"],
  ["未使用", "Unused"],
  ["已备份", "Backed up"],
  ["可同步", "Synced"],
  ["仅此设备", "This device only"],
  // ===== 登录页 =====
  ["请登录后继续访问", "Sign in to continue"],
  ["用户名", "Username"],
  ["密码", "Password"],
  ["动态码（可选）", "Code (optional)"],
  ["已启用两步验证时填写 6 位动态码", "Enter the 6-digit code if 2FA is enabled"],
  ["登 录", "Sign in"],
  ["或", "or"],
  ["🔑 使用通行密钥登录", "🔑 Sign in with a passkey"],
  ["也可使用已绑定的通行密钥（指纹 / 面容 / 设备 PIN，或手机扫码）", "Or use a bound passkey (fingerprint / face / device PIN, or scan with your phone)"],
  ["访问受保护 · ", "Protected access · "],
  ["注册账号", "Create account"],
  ["显示/隐藏密码", "Show or hide password"],
  ["该账号已启用两步验证，请输入验证器中的 6 位动态码后再次登录", "This account uses two-step verification — enter the 6-digit code from your authenticator and sign in again"],
  ["该账号已开启两步验证，请使用通行密钥完成第二步验证…", "This account uses two-step verification — complete the second step with your passkey…"],
  ["登录失败 (", "Sign-in failed ("],
  ["网络错误，请重试", "Network error, please retry"],
  ["已取消或该设备没有可用的通行密钥", "Cancelled, or this device has no usable passkey"],
  ["当前浏览器不支持通行密钥", "This browser does not support passkeys"],
  // ===== 注册页 =====
  ["注册新账号（需要有效邀请码）", "Create an account (a valid invite code is required)"],
  ["邮箱", "Email"],
  ["邀请码", "Invite code"],
  ["确认密码", "Confirm password"],
  ["注 册", "Create account"],
  ["已有账号？返回登录", "Already registered? Sign in"],
  ["密码不满足强度要求（至少 8 位且含两种字符类型）", "The password does not meet the requirement (8+ characters, two classes)"],
  ["两次输入的密码不一致", "The two passwords do not match"],
  ["至少 8 位且含两种字符类型（大小写字母/数字/符号）", "At least 8 characters with two classes (upper, lower, digit, symbol)"],
  ["密码强度：", "Password strength: "],
  ["注册失败 (", "Registration failed ("],
  ["新用户注册必须输入有效邀请码；每个码可按设置的可注册次数使用。", "Registration requires a valid invite code; each code can be used as many times as configured."],
  // ===== 注册成功引导页 =====
  ["注册成功，欢迎 ", "Welcome, "],
  ["建议现在为账号添加", "Consider adding a"],
  ["第二个登录因子", "second sign-in factor"],
  ["，二选一（也可以两个都加）：", " now — pick one, or add both:"],
  ["TOTP 动态码", "TOTP code"],
  ["通行密钥", "Passkey"],
  ["：用 Google Authenticator / Microsoft Authenticator 等验证器 App 扫码，用下方按钮开始；", ": scan the code with an authenticator app such as Google Authenticator or Microsoft Authenticator, then use the button below."],
  ["：用指纹 / 面容 / 设备 PIN 直接登录。登录后到【设置】→【用户管理】→「通行密钥（Passkey）」添加本机密钥，或用手机扫码添加。", ": sign in with fingerprint, face or device PIN. After signing in, add one under Settings → User management → Passkey, or scan with your phone."],
  ["立即添加 TOTP 令牌", "Add a TOTP token now"],
  ["稍后再说，进入首页", "Skip for now"],
  ["启用两步验证", "Enable two-step verification"],
  ["绑定任一因子后，可在【用户管理】→「两步验证」开关启用两步验证；也可以跳过此步稍后再设置。", "Once a factor is bound you can switch two-step verification on under User management; you can also skip this and set it up later."],
  ["密钥（无法扫码时手动输入）", "Secret (type manually if you cannot scan)"],
  ["验证器中的 6 位动态码", "6-digit code from the authenticator"],
  ["输入验证器中的 6 位动态码以启用", "Enter the 6-digit code from your authenticator to enable"],
  ["请输入 6 位动态验证码", "Enter the 6-digit code"],
  ["验证码不正确", "Incorrect code"],
  ["TOTP 已启用", "TOTP enabled"],
  ["生成失败 (", "Generation failed ("],
  ["验证失败 (", "Verification failed ("],
  // ===== 用户管理：账号与改密 =====
  ["用户管理", "User management"],
  ["我的账号", "My account"],
  ["当前登录：", "Signed in as: "],
  ["昵称（显示名）", "Display name"],
  ["保存个人信息", "Save profile"],
  ["退出登录", "Sign out"],
  ["个人信息已保存", "Profile saved"],
  ["（我）", " (me)"],
  ["当前密码", "Current password"],
  ["新密码（至少 8 位，含两种字符类型）", "New password (8+ characters, two classes)"],
  ["确认新密码", "Confirm new password"],
  ["修改密码", "Change password"],
  ["当前密码正确，已解锁下面的输入框", "Current password correct — the fields below are unlocked"],
  ["当前密码不正确，下面的输入框保持锁定", "Current password incorrect — the fields below stay locked"],
  ["离开此输入框时会自动校验；校验通过前下面两个输入框锁定", "Leaving this field verifies it; the two fields below stay locked until it passes"],
  ["强度很高", "strong"],
  ["刚满足要求（建议再加长或混合更多字符类型）", "just meets the requirement (longer or more varied is better)"],
  ["不满足要求（至少 8 位且含两类字符）", "not sufficient (at least 8 characters and two classes)"],
  ["两次输入一致", "Both entries match"],
  ["两次输入不一致", "The two entries differ"],
  ["新密码至少 8 位且含两种及以上字符类型（大小写字母/数字/符号）", "The new password needs 8+ characters and at least two classes (upper, lower, digit, symbol)"],
  ["两次输入的新密码不一致", "The two new passwords do not match"],
  ["密码已修改（其他设备上的登录已失效）", "Password changed (sessions on other devices are now invalid)"],
  ["请输入当前密码", "Enter your current password"],
  ["当前密码不正确", "Current password is incorrect"],
  // ===== 用户管理：两步验证（TOTP） =====
  ["两步验证", "Two-step verification"],
  ["两步验证（TOTP）", "Two-step verification (TOTP)"],
  ["两步验证已开启", "Two-step verification is on"],
  ["已启用 TOTP", "TOTP enabled"],
  ["未启用 TOTP", "TOTP not enabled"],
  ["未绑定 TOTP", "TOTP not bound"],
  ["已绑定 TOTP", "TOTP bound"],
  ["已绑定 ", "Bound "],
  ["未绑定", "Not bound"],
  ["已启用两步验证（登录需密码 + 动态码）", "Two-step verification on (sign-in needs password + code)"],
  ["已启用两步验证（登录需密码 + 通行密钥）", "Two-step verification on (sign-in needs password + passkey)"],
  ["已关闭两步验证（登录仅需密码，通行密钥仍可直接登录）", "Two-step verification off (sign-in needs only the password; passkeys still work)"],
  ["未启用两步验证（登录仅需密码）", "Two-step verification off (sign-in needs only the password)"],
  ["开启后登录需要第二个因子：已绑定 TOTP 时用动态码，否则用通行密钥。", "When on, signing in needs a second factor: the TOTP code if bound, otherwise a passkey."],
  ["关闭后仅凭密码即可登录（通行密钥仍可直接登录）；开启状态下改动通行密钥需要先通过二次验证。", "When off, the password alone signs you in (passkeys still work); while on, changing passkeys first requires a second-step check."],
  ["生成 TOTP 密钥", "Generate TOTP secret"],
  ["移除 TOTP", "Remove TOTP"],
  ["TOTP 密钥已生成，请用验证器扫码或手动输入后输入 6 位动态码启用", "TOTP secret generated — scan it with your authenticator or enter it manually, then type the 6-digit code to enable"],
  ["使用 Google Authenticator / Microsoft Authenticator 等应用，通过 otpauth 链接或手动输入密钥添加本账号；启用后每次登录输入 6 位动态码。", "Add this account in an app such as Google Authenticator or Microsoft Authenticator via the otpauth link or by typing the secret; after enabling, sign-in asks for a 6-digit code."],
  ["用验证器扫描二维码添加（Google Authenticator / Microsoft Authenticator 等）", "Scan the QR code with your authenticator (Google Authenticator, Microsoft Authenticator, …)"],
  ["otpauth 链接", "otpauth link"],
  ["TOTP 二维码", "TOTP QR code"],
  ["已启用 TOTP，如需更换请先移除现有令牌", "TOTP is already enabled — remove the existing token before replacing it"],
  ["确定移除 TOTP 令牌？移除后两步验证将由通行密钥完成（登录需「密码 + 通行密钥」）。", "Remove the TOTP token? Two-step verification will then rely on a passkey (sign-in needs password + passkey)."],
  ["确定移除 TOTP 令牌？移除后两步验证会自动关闭，登录仅需密码。", "Remove the TOTP token? Two-step verification will switch off and sign-in will need only the password."],
  ["请输入当前 6 位动态验证码以确认移除", "Enter the current 6-digit code to confirm removal"],
  ["移除令牌需输入当前 6 位动态码", "Removing the token requires the current 6-digit code"],
  ["TOTP 已移除", "TOTP removed"],
  ["请先生成 TOTP 密钥", "Generate a TOTP secret first"],
  ["当前账号没有 TOTP 令牌，两步验证由通行密钥完成。如需改用动态码，可在下方生成并绑定 TOTP。", "This account has no TOTP token; two-step verification uses a passkey. To switch to codes, generate and bind TOTP below."],
  ["请先绑定 TOTP 令牌或添加通行密钥，再开启两步验证", "Bind a TOTP token or add a passkey before enabling two-step verification"],
  ["6 位动态码", "6-digit code"],
  // ===== 用户管理：通行密钥 =====
  ["通行密钥（Passkey）", "Passkey"],
  ["添加通行密钥", "Add passkey"],
  ["重命名通行密钥", "Rename passkey"],
  ["删除通行密钥", "Delete passkey"],
  ["＋ 本机通行密钥", "＋ This device"],
  ["📱 手机扫码添加", "📱 Scan with phone"],
  ["名称（可选，便于区分设备）", "Name (optional, to tell devices apart)"],
  ["例如：我的笔记本 / iPhone", "e.g. My laptop / iPhone"],
  ["用指纹 / 面容 / 设备 PIN 代替密码登录。私钥永不离开设备，服务器只保存公钥；一个账号可以绑定多个（本机设备、多台手机）。", "Use fingerprint, face or device PIN instead of a password. The private key never leaves your device; the server stores only the public key. An account can bind several (this device, more than one phone)."],
  ["「本机通行密钥」使用这台电脑的指纹 / 面容 / Windows Hello；「手机扫码添加」由浏览器显示二维码，用手机相机扫码后在本机完成绑定（手机无需与电脑处于同一网络）。", "This device uses your computer fingerprint, face or Windows Hello; Scan with phone shows a QR code that your phone camera reads, and the binding finishes on this computer (the phone does not need to share its network)."],
  ["通行密钥已添加", "Passkey added"],
  ["通行密钥已重命名", "Passkey renamed"],
  ["通行密钥已删除", "Passkey deleted"],
  ["该通行密钥已绑定", "That passkey is already bound"],
  ["删除通行密钥「", 'Delete the passkey "'],
  ["」？删除后该设备将无法再用它登录。", '"? That device will no longer be able to sign in with it.'],
  ["为这个通行密钥设置新名称：", "New name for this passkey:"],
  ["通行密钥 ", "Passkey "],
  ["· 最近使用：", "· last used: "],
  ["当前地址无法使用通行密钥", "Passkeys are unavailable at this address"],
  ["当前访问地址无法使用通行密钥。", "Passkeys cannot be used at the current address."],
  ["请改用 http://", "Use http://"],
  ["通行密钥可以代替密码登录，因此改动前必须确认是你本人。", "A passkey can sign you in instead of a password, so confirm it is you before changing it."],
  ["确认身份 · ", "Confirm identity · "],
  ["该账号的第二步验证是通行密钥：提交密码后会再要求你完成一次通行密钥验证。", "This account uses a passkey as the second step: after the password you will be asked to complete one passkey check."],
  ["通行密钥脚本不可用", "The passkey helper script is unavailable"],
  ["未找到可用的通行密钥", "No usable passkey was found"],
  ["该账号没有可用的通行密钥", "This account has no usable passkey"],
  ["该账号没有可用的通行密钥，请改用其他验证方式", "This account has no usable passkey — use another verification method"],
  ["该账号已开启两步验证且仅剩这一个通行密钥：请先绑定 TOTP 令牌，或先关闭两步验证", "Two-step verification is on and this is the only passkey: bind a TOTP token first, or switch two-step verification off"],
  ["通行密钥不存在", "Passkey not found"],
  ["通行密钥与账号不匹配", "The passkey does not belong to this account"],
  ["清除通行密钥", "Clear passkeys"],
  ["清除用户「", 'Clear every passkey of "'],
  ["」的全部通行密钥？该用户将无法再用通行密钥登录（用于设备丢失时的账号救援）。", '"? That user will no longer be able to sign in with a passkey (account rescue when a device is lost).'],
  ["该用户的通行密钥已清除", "That user passkeys were cleared"],
  // ===== 用户管理：用户表格与邀请码 =====
  ["昵称", "Display name"],
  ["已用 / 可注册", "Used / allowed"],
  ["创建用户", "Create user"],
  ["初始密码（至少 8 位，含两种字符类型）", "Initial password (8+ characters, two classes)"],
  ["初始密码至少 8 位且含两种及以上字符类型", "The initial password needs 8+ characters and at least two classes"],
  ["密码仅本次设置，之后无法查看", "Set once, and not viewable later"],
  ["用户名仅允许 2-32 位字母、数字、下划线、点或短横线", "Usernames allow 2-32 letters, digits, underscore, dot or hyphen"],
  ["用户已创建", "User created"],
  ["用户已删除", "User deleted"],
  ["角色已更新", "Role updated"],
  ["确定删除用户「", 'Delete the user "'],
  ["」？该操作不可撤销。", '"? This cannot be undone.'],
  ["为用户「", 'Set a new password for "'],
  ["」设置新密码（至少 8 位，含两种字符类型）：", '" (8+ characters, two classes):'],
  ["密码已重置", "Password reset"],
  ["重置密码", "Reset password"],
  ["切换角色", "Change role"],
  ["将「", 'Change "'],
  ["」的角色改为「", '" to "'],
  ["不能删除当前登录的账号", "You cannot delete the account you are signed in with"],
  ["不能删除最后一个管理员", "The last administrator cannot be deleted"],
  ["不能降级最后一个管理员", "The last administrator cannot be demoted"],
  ["说明：管理员可以新增、删除用户并重置密码，也可以在设备丢失时清除某个用户的通行密钥（用于账号救援），但无法查看任何人的当前密码。不能删除或降级最后一个管理员。", "Note: an administrator can add users, delete them, reset passwords and clear a user passkeys when a device is lost (account rescue), but cannot see anyone current password. The last administrator cannot be deleted or demoted."],
  ["邀请码管理（管理员）", "Invite codes"],
  ["生成邀请码", "Generate invite codes"],
  ["生成数量（1-50）", "How many (1-50)"],
  ["每个码可注册次数（1-100）", "Uses per code (1-100)"],
  ["生成数量需为 1-50", "The count must be between 1 and 50"],
  ["每个邀请码可用次数需为 1-100", "Uses per code must be between 1 and 100"],
  ["邀请码已生成", "Invite codes generated"],
  ["邀请码已撤销", "Invite code revoked"],
  ["撤销邀请码「", 'Revoke the invite code "'],
  ["」？已注册用户不受影响。", '"? Users who already registered are unaffected.'],
  // ===== 永久忽略提醒 =====
  ["永久忽略登录提醒", "Ignore the sign-in reminder permanently"],
  ["取消永久忽略", "Stop ignoring"],
  ["已永久忽略登录提醒", "Sign-in reminder permanently ignored"],
  ["已取消永久忽略", "No longer ignoring"],
  ["（已永久忽略登录提醒）", " (sign-in reminder permanently ignored)"],
  // ===== 通用提示 / 校验 =====
  ["请输入名称", "Enter a name"],
  ["存储未就绪", "Storage is not ready"],
  ["服务初始化中，请稍后重试", "The service is starting, please retry shortly"],
  ["未登录或会话已过期", "Not signed in, or the session expired"],
  ["未知方法", "Unknown method"],
  ["需要管理员权限", "Administrator permission required"],
  ["请求体格式错误", "Malformed request body"],
  ["用户名或密码错误", "Wrong username or password"],
  ["请输入用户名和密码", "Enter a username and password"],
  ["请输入邀请码", "Enter an invite code"],
  ["邀请码无效或已用完", "The invite code is invalid or exhausted"],
  ["邀请码不存在", "Invite code not found"],
  ["用户不存在", "User not found"],
  ["用户名已存在", "That username already exists"],
  ["账号不存在", "Account not found"],
  ["账号数据写入失败，请重试", "Could not save the account, please retry"],
  ["目标用户不存在", "The target user does not exist"],
  ["目标用户不存在或尚未分配配置标识", "The target user does not exist or has no profile identifier yet"],
  ["密码至少 ", "Password must be at least "],
  ["密码过长（最多 ", "Password too long (at most "],
  ["位）", " characters)"],
  ["6 位", "6 characters"],
  ["密码格式错误", "Malformed password"],
  ["密码不正确", "Wrong password"],
  ["原密码不正确", "The current password is incorrect"],
  ["口令不正确", "Wrong password"],
  ["密码需包含至少两种字符类型（大写字母、小写字母、数字、符号）", "The password must contain at least two classes (upper, lower, digit, symbol)"],
  ["尝试次数过多，请 ", "Too many attempts, please "],
  ["秒后再试", " seconds later"],
  ["尝试过于频繁，请稍后再试", "Too many attempts, please retry shortly"],
  ["次 / ", " × / "],
  ["已达上限 ", "Limit reached "],
  ["输入验证码", "Enter the code"],
  ["位）或任意 ", " characters) or any "],
  ["本次登录已失效，请重新输入密码", "That sign-in attempt expired, enter the password again"],
  ["本次验证不属于当前账号，请重新验证身份", "This verification belongs to another account, please verify again"],
  ["本次验证已失效，请重新验证身份", "This verification expired, please verify again"],
  ["来源地址已变化，请重新验证身份", "The origin changed, please verify again"],
  ["验证已超时，请重新验证身份", "Verification timed out, please verify again"],
  ["验证未完成", "Verification not completed"],
  ["请求失败 (", "Request failed ("],
  // ===== 模型与分享（键已用于客户端切片，这里补齐短语与消息） =====
  ["模型", "Model"],
  ["名称", "Name"],
  ["余额", "Balance"],
  ["默认", "Default"],
  ["查余额（全部配置）", "Check balance (all profiles)"],
  ["设为默认", "Set as default"],
  ["选用分享", "Use shared"],
  ["校验有效性", "Check key"],
  ["检查 Key", "Check key"],
  ["检查中…", "Checking…"],
  ["查询中…", "Querying…"],
  ["需先解锁", "Unlock required"],
  ["稍后重试", "Retry later"],
  ["不可用", "Unavailable"],
  ["未选择配置", "No profile selected"],
  ["管理员分享", "Shared by admin"],
  ["添加我自己的配置", "Add your own profile"],
  ["当前登录口令", "Current password"],
  ["用于解锁私人密钥（不保存）", "Unlocks your private keys (never stored)"],
  ["baseURL（留空用官方地址）", "baseURL (empty = official endpoint)"],
  ["分享名称", "Share name"],
  ["创建分享配置", "Create shared profile"],
  ["分享的 API Key：", "Shared API keys:"],
  ["分享配置", "Shared profile"],
  ["分享", "Share"],
  ["选择分享的 API Key", "Choose a shared API key"],
  ["用量：", "Usage: "],
  ["已授权用户", "Authorized users"],
  ["尚未授权给任何用户", "Not shared with anyone yet"],
  ["取消授权", "Revoke"],
  ["授予用户名", "Username to grant"],
  ["授予", "Grant"],
  ["还没有分享配置。", "No shared profiles yet."],
  ["已授权", "Authorized"],
  ["未授权", "Not authorized"],
  ["例如：共享 DeepSeek", "e.g. Shared DeepSeek"],
  ["例如：我的 DeepSeek", "e.g. My DeepSeek"],
  ["还没有配置。未配置时模型调用会被拒绝——不会回退到部署级配置。", "No profiles yet. Model calls are refused without one — there is no fallback to the deployment configuration."],
  ["这里的配置只属于你自己：其他用户（包括管理员）都无法查看你的 API Key。管理员分享给你的配置可以直接选用，能看到余额，但看不到 Key。", "These profiles belong to you alone: no other user (not even an administrator) can see your API keys. A profile an administrator shares can be selected directly — you see its balance, never its key."],
  ["把你的模型分享给指定用户：对方可以选用并查看余额，但看不到你的 API Key；撤销后立即失效。", "Share your model with specific users: they can select it and see its balance, but never your API key. Revoking takes effect immediately."],
  ["✔ 连通可用，余额 ", "✔ Reachable, balance "],
  ["✔ Key 可用，余额 ", "✔ Key works, balance "],
  ["✘ ", "✘ "],
  ["API Key 不能为空", "The API key cannot be empty"],
  ["无法验证：接口拒绝或网络不可达（请检查 Key 与 baseURL）", "Cannot verify: the endpoint refused or the network is unreachable (check the key and baseURL)"],
  ["当前部署未启用 Key 校验（缺少余额查询实现）", "Key verification is not enabled in this deployment (no balance implementation)"],
  ["分享不存在或未授予", "The share does not exist or was not granted"],
  ["分享配置不存在", "Shared profile not found"],
  ["分享配置不存在或已撤销", "The shared profile does not exist or was revoked"],
  ["配置不存在", "Profile not found"],
  ["配置不存在或缺少密文（需重新录入 Key）", "The profile is missing or has no sealed key (re-enter the key)"],
  ["会话未解锁：私有配置的密钥只在该用户会话内存中（请重新登录）", "Session locked: a private profile key lives only in that user session memory (sign in again)"],
  ["会话未解锁：请重新登录后再使用自己的模型配置", "Session locked: sign in again before using your own model profiles"],
  ["私有配置缺少 KDF 参数", "The private profile has no KDF parameters"],
  ["无法校验（用户记录不可用）", "Cannot verify (the user record is unavailable)"],
  ["拒绝跨用户读取模型配置（仅本人可读）", "Cross-user reads of model profiles are refused (owner only)"],
  // ===== 插件管理器只读提示 =====
  ["仅部署者可以安装、卸载或启停插件（服务端会拒绝该操作）", "Only the deployer can install, uninstall or toggle plugins (the server refuses it)"],
  // ===== 客户端其余 =====
  ["安全随机源不可用", "A secure random source is unavailable"],
  ["WebCrypto 不可用：无法进行配置密钥的加解密", "WebCrypto is unavailable: profile keys cannot be encrypted or decrypted"],
  ["不支持的 DSH 宿主", "Unsupported DSH host"],
  ["建议开启两步验证", "Turn on two-step verification"],
  ["稍后再说", "Later"],
  ["永久忽略", "Ignore permanently"],
  ["添加登录因子：TOTP 动态码令牌（Google Authenticator / Microsoft Authenticator 等）或通行密钥（指纹 / 面容 / 设备 PIN）。", "Add a sign-in factor: a TOTP token (Google Authenticator, Microsoft Authenticator, …) or a passkey (fingerprint, face, device PIN)."]
];

// src/i18n.ts
var DICTIONARY = {
  "dsh-ui-auth": {
    // —— 通用 ——
    "common.unlock": { zh: "解锁", en: "Unlock" },
    "common.add": { zh: "添加", en: "Add" },
    "common.remove": { zh: "删除", en: "Delete" },
    "common.cancel": { zh: "取消", en: "Cancel" },
    "common.save": { zh: "保存", en: "Save" },
    "common.balance": { zh: "查余额", en: "Balance" },
    "common.checkKey": { zh: "校验有效性", en: "Check key" },
    "common.checking": { zh: "校验中…", en: "Checking…" },
    "common.querying": { zh: "查询中…", en: "Querying…" },
    "common.notAvailable": { zh: "不可用", en: "Unavailable" },
    "common.later": { zh: "稍后重试", en: "Retry later" },
    "common.needUnlock": { zh: "需先解锁", en: "Unlock required" },
    "common.none": { zh: "—", en: "—" },
    "common.yes": { zh: "是", en: "Yes" },
    "common.no": { zh: "否", en: "No" },
    // —— 模型页 ——
    "models.title": { zh: "模型", en: "Models" },
    "models.intro": {
      zh: "这里的配置只属于你自己：其他用户（包括管理员）都无法查看你的 API Key。管理员分享给你的配置可以直接选用，能看到余额，但看不到 Key。",
      en: "These profiles belong to you alone: no other user (not even an administrator) can see your API keys. Profiles an administrator shares with you can be selected directly — you can see their balance, never their key."
    },
    "models.passwordLabel": { zh: "当前登录口令", en: "Current password" },
    "models.passwordPlaceholder": { zh: "用于解锁私人密钥（不保存）", en: "Unlocks your private keys (never stored)" },
    "models.balanceAll": { zh: "查余额（全部配置）", en: "Check balance (all profiles)" },
    "models.setDefault": { zh: "设为默认", en: "Set as default" },
    "models.useShare": { zh: "选用分享", en: "Use shared" },
    "models.colName": { zh: "名称", en: "Name" },
    "models.colModel": { zh: "模型", en: "Model" },
    "models.colKey": { zh: "API Key", en: "API key" },
    "models.colDefault": { zh: "默认", en: "Default" },
    "models.colBalance": { zh: "余额", en: "Balance" },
    "models.sharedByAdmin": { zh: "管理员分享", en: "Shared by admin" },
    "models.empty": {
      zh: "还没有配置。未配置时模型调用会被拒绝——不会回退到部署级配置。",
      en: "No profiles yet. Model calls are refused without one — there is no fallback to the deployment configuration."
    },
    "models.addTitle": { zh: "添加我自己的配置", en: "Add your own profile" },
    "models.fieldName": { zh: "名称", en: "Name" },
    "models.fieldModel": { zh: "模型", en: "Model" },
    "models.fieldBaseUrl": { zh: "baseURL（留空用官方地址）", en: "baseURL (empty = official endpoint)" },
    "models.fieldApiKey": { zh: "API Key", en: "API key" },
    "models.namePlaceholder": { zh: "例如：我的 DeepSeek", en: "e.g. My DeepSeek" },
    "models.keyOk": { zh: "✔ 连通可用，余额 {amount}", en: "✔ Reachable, balance {amount}" },
    "models.keyFail": { zh: "✘ {reason}", en: "✘ {reason}" },
    // —— 分享管理 ——
    "shares.title": { zh: "分享管理", en: "Sharing" },
    "shares.intro": {
      zh: "把你的模型分享给指定用户：对方可以选用并查看余额，但看不到你的 API Key；撤销后立即失效。",
      en: "Share your model with specific users: they can select it and see its balance, but never your API key. Revoking takes effect immediately."
    },
    "shares.fieldLabel": { zh: "分享名称", en: "Share name" },
    "shares.fieldModel": { zh: "模型", en: "Model" },
    "shares.fieldBaseUrl": { zh: "baseURL（留空用官方地址）", en: "baseURL (empty = official endpoint)" },
    "shares.fieldApiKey": { zh: "API Key", en: "API key" },
    "shares.create": { zh: "创建分享配置", en: "Create shared profile" },
    "shares.picker": { zh: "分享的 API Key：", en: "Shared API keys:" },
    "shares.usage": { zh: "用量：{value}", en: "Usage: {value}" },
    "shares.usageEmpty": { zh: "暂无用量", en: "No usage yet" },
    "shares.grantees": { zh: "已授权用户", en: "Authorized users" },
    "shares.noGrantees": { zh: "尚未授权给任何用户", en: "Not shared with anyone yet" },
    "shares.revoke": { zh: "取消授权", en: "Revoke" },
    "shares.grantPlaceholder": { zh: "授予用户名", en: "Username to grant" },
    "shares.grant": { zh: "授予", en: "Grant" },
    "shares.empty": { zh: "还没有分享配置。", en: "No shared profiles yet." },
    // —— 修改密码（引导式） ——
    "password.title": { zh: "修改密码", en: "Change password" },
    "password.current": { zh: "当前密码", en: "Current password" },
    "password.new": { zh: "新密码（至少 8 位，含两种字符类型）", en: "New password (8+ chars, two character classes)" },
    "password.confirm": { zh: "确认新密码", en: "Confirm new password" },
    "password.submit": { zh: "修改密码", en: "Change password" },
    "password.hintIdle": {
      zh: "离开此输入框时会自动校验；校验通过前下面两个输入框锁定",
      en: "Leaving this field verifies it; the two fields below stay locked until it passes"
    },
    "password.hintOk": { zh: "当前密码正确，已解锁下面的输入框", en: "Current password correct — the fields below are unlocked" },
    "password.hintBad": { zh: "当前密码不正确，下面的输入框保持锁定", en: "Current password incorrect — the fields below stay locked" },
    "password.strength": { zh: "密码强度：{value}", en: "Password strength: {value}" },
    "password.levelOk": { zh: "很高", en: "strong" },
    "password.levelWarn": { zh: "刚满足要求（建议再加长或混合更多字符类型）", en: "just meets the requirement (longer or more varied is better)" },
    "password.levelBad": { zh: "不满足要求（至少 8 位且含两类字符）", en: "not sufficient (at least 8 characters and two classes)" },
    "password.match": { zh: "两次输入一致", en: "Both entries match" },
    "password.mismatch": { zh: "两次输入不一致", en: "The two entries differ" }
  }
};
function message(locale, key, params) {
  const entry = DICTIONARY["dsh-ui-auth"][key];
  const template = entry === void 0 ? String(key) : locale === "en" ? entry.en : entry.zh;
  if (params === void 0) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match);
}
function normalizeLocale(tag) {
  if (typeof tag !== "string" || tag === "") return "en";
  return /^zh\b/i.test(tag) ? "zh" : "en";
}
function dictionaries() {
  const zh = {};
  const en = {};
  for (const [key, entry] of Object.entries(DICTIONARY["dsh-ui-auth"])) {
    zh[key] = entry.zh;
    en[key] = entry.en;
  }
  return { zh, en };
}
var ORDERED_PHRASES = PHRASES.filter(([zh, en]) => zh !== "" && en !== "" && zh !== en).slice().sort((a, b) => b[0].length - a[0].length);
function translatePhrase(locale, text) {
  if (locale !== "en" || text === "") return text;
  let result = text;
  for (const [zh, en] of ORDERED_PHRASES) {
    if (result.includes(zh)) result = result.split(zh).join(en);
  }
  return result;
}

// src/client.ts
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var React = require("react");
var SWA = require_script();
var AUTH_CSS = [
  ".dshua{display:flex;flex-direction:column;gap:18px;padding:4px 2px 18px;max-width:720px;color:var(--dsw-alias-label-primary)}",
  ".dshua h2{margin:0 0 10px;font-size:16px;font-weight:700;color:var(--dsw-alias-label-primary)}",
  ".dshua .card{background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:18px 20px}",
  ".dshua .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}",
  ".dshua .grow{flex:1;min-width:180px}",
  ".dshua label{display:block;font-size:12px;color:var(--dsw-alias-label-secondary);margin:10px 0 4px}",
  ".dshua input, .dshua select{padding:8px 10px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:13px;font:inherit;outline:none;width:100%;box-sizing:border-box}",
  ".dshua input:focus, .dshua select:focus{border-color:var(--dsw-alias-brand-primary)}",
  ".dshua button{padding:8px 14px;border:0;border-radius:7px;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font-size:13px;font-weight:600;font:inherit;cursor:pointer}",
  ".dshua button:hover{background:var(--dsw-alias-button-primary-hover)}",
  ".dshua button.ghost{background:transparent;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}",
  ".dshua button.ghost:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-button-ghost-active-border)}",
  ".dshua button.danger{background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground)}",
  ".dshua button.danger:hover{background:var(--dsw-alias-state-error-primary);opacity:.88}",
  ".dshua button:disabled{opacity:.55;cursor:default}",
  ".dshua .msg{font-size:13px;color:var(--dsw-alias-state-success-primary);min-height:16px}",
  ".dshua .err{font-size:13px;color:var(--dsw-alias-state-error-primary);min-height:16px}",
  ".dshua .meta{font-size:12px;color:var(--dsw-alias-label-tertiary);margin-left:8px}",
  ".dshua table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px;color:var(--dsw-alias-label-primary)}",
  ".dshua th, .dshua td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--dsw-alias-border-l1)}",
  ".dshua th{font-size:12px;color:var(--dsw-alias-label-secondary);font-weight:600}",
  ".dshua .actions{display:flex;gap:6px}",
  ".dshua .badge{padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;display:inline-block}",
  ".dshua .badge.admin{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);color:var(--dsw-alias-brand-primary)}",
  ".dshua .badge.user{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
  ".dshua .muted{font-size:12px;color:var(--dsw-alias-label-tertiary)}",
  ".dshua .switch{position:relative;display:inline-flex;align-items:center;cursor:pointer;user-select:none;vertical-align:middle}",
  ".dshua .switch input{position:absolute;opacity:0;width:0;height:0}",
  ".dshua .switch .track{position:relative;width:40px;height:22px;border-radius:22px;background:var(--dsw-alias-interactive-bg-hover,#2a2f3a);transition:background .2s;flex-shrink:0}",
  ".dshua .switch .track .thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}",
  ".dshua .switch input:checked + .track{background:var(--dsw-alias-brand-primary,#4f7cff)}",
  ".dshua .switch input:checked + .track .thumb{transform:translateX(18px)}",
  ".dshua .switch input:disabled + .track{opacity:.55}",
  // —— 表格 / 工具条 / 字段：与「用户管理」页保持同一套排班（12px 标题、≥10px 横向、≥5px 纵向） ——
  ".dshua table{border-collapse:collapse;width:100%;margin:4px 0}",
  ".dshua th,.dshua td{text-align:left;padding:6px 10px;border-bottom:1px solid var(--dsw-alias-border-l2);font-size:13px}",
  ".dshua th{color:var(--dsw-alias-label-secondary);font-weight:600}",
  ".dshua button{font-size:12px;padding:6px 12px;white-space:nowrap}",
  ".dshua .toolbar{display:flex;flex-wrap:wrap;gap:5px 10px;align-items:flex-end}",
  ".dshua .actions{display:flex;flex-wrap:wrap;gap:5px 10px;margin:10px 0 0}",
  ".dshua .field{display:flex;flex-direction:column;margin:0 0 10px;min-width:160px}",
  ".dshua .fields{display:flex;flex-direction:column}",
  ".dshua .fields .field{width:100%}",
  ".dshua .fields input{width:100%}",
  ".dshua .field.compact input{padding:4px 10px;font-size:12px;height:75%;min-height:24px}",
  ".dshua input.pw-ok,input.pw-ok:disabled{border-color:#2ecc71;box-shadow:0 0 6px 2px rgba(46,204,113,.35)}",
  ".dshua input.pw-warn,input.pw-warn:disabled{border-color:#f1c40f;box-shadow:0 0 6px 2px rgba(241,196,15,.35)}",
  ".dshua input.pw-bad,input.pw-bad:disabled{border-color:#e74c3c;box-shadow:0 0 6px 2px rgba(231,76,60,.35)}",
  ".dshua input.locked,input.locked:disabled{background:var(--dsw-alias-interactive-bg-hover);opacity:.72}",
  ".dshua .pw-hint{font-size:12px;color:var(--dsw-alias-label-secondary);margin:1px 0 8px}",
  ".dshua .field > label{margin:0 0 4px;font-size:12px;color:var(--dsw-alias-label-secondary)}",
  ".dshua .muted{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px}",
  ".dshua input,.dshua select{min-width:120px}"
].join("");
function injectAuthCss() {
  if (typeof document === "undefined") return;
  if (document.querySelector('style[data-plugin-css="dsh-ui-auth"]') !== null) return;
  var tag = document.createElement("style");
  tag.dataset.plugin = "dsh-ui-auth";
  tag.dataset.pluginCss = "dsh-ui-auth";
  tag.textContent = AUTH_CSS;
  document.head.appendChild(tag);
}
function rpc(method, body) {
  return fetch("/auth/rpc/" + method, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {})
  }).then(async (r) => {
    var j = {};
    try {
      j = await r.json();
    } catch (e) {
    }
    if (r.status === 401) {
      var p = encodeURIComponent(location.pathname + location.search);
      location.href = "/auth/login?next=" + p;
      var err = new Error("session-expired");
      err.code = "session-expired";
      throw err;
    }
    if (!r.ok || j.ok !== true) throw new Error(j.error || "请求失败 (" + r.status + ")");
    return j;
  });
}
function roleLabel(role) {
  return role === "admin" ? "管理" : "用户";
}
function AuthUsersPage() {
  var _s = React.useState, _e = React.useEffect;
  var meS = _s(null), me = meS[0], setMe = meS[1];
  var errS = _s(""), err = errS[0], setErr = errS[1];
  var msgS = _s(""), msg = msgS[0], setMsg = msgS[1];
  var busyS = _s(false), busy = busyS[0], setBusy = busyS[1];
  var pDisplayS = _s(""), pDisplay = pDisplayS[0], setPDisplay = pDisplayS[1];
  var pEmailS = _s(""), pEmail = pEmailS[0], setPEmail = pEmailS[1];
  function passwordLevel(value) {
    var classes = 0;
    if (/[a-z]/.test(value)) classes += 1;
    if (/[A-Z]/.test(value)) classes += 1;
    if (/[0-9]/.test(value)) classes += 1;
    if (/[^A-Za-z0-9]/.test(value)) classes += 1;
    if (value.length < 8 || classes < 2) return "bad";
    if (value.length >= 12 && classes >= 3) return "ok";
    return "warn";
  }
  function levelText(level) {
    return level === "ok" ? "强度很高" : level === "warn" ? "刚满足要求（建议再加长或混合更多字符类型）" : "不满足要求（至少 8 位且含两类字符）";
  }
  var oldPwS = _s(""), oldPw = oldPwS[0], setOldPw = oldPwS[1];
  var oldCheckS = _s("idle"), oldCheck = oldCheckS[0], setOldCheck = oldCheckS[1];
  var newPwS = _s(""), newPw = newPwS[0], setNewPw = newPwS[1];
  var newPw2S = _s(""), newPw2 = newPw2S[0], setNewPw2 = newPw2S[1];
  var usersS = _s([]), users = usersS[0], setUsers = usersS[1];
  var cNameS = _s(""), cName = cNameS[0], setCName = cNameS[1];
  var cPwS = _s(""), cPw = cPwS[0], setCPw = cPwS[1];
  var cRoleS = _s("user"), cRole = cRoleS[0], setCRole = cRoleS[1];
  var cDisplayS = _s(""), cDisplay = cDisplayS[0], setCDisplay = cDisplayS[1];
  var cEmailS = _s(""), cEmail = cEmailS[0], setCEmail = cEmailS[1];
  var usersVersionS = _s(0), usersVersion = usersVersionS[0], setUsersVersion = usersVersionS[1];
  var invitesS = _s([]), invites = invitesS[0], setInvites = invitesS[1];
  var iAmountS = _s("1"), iAmount = iAmountS[0], setIAmount = iAmountS[1];
  var iUsesS = _s("1"), iUses = iUsesS[0], setIUses = iUsesS[1];
  var invitesVersionS = _s(0), invitesVersion = invitesVersionS[0], setInvitesVersion = invitesVersionS[1];
  var totpS = _s({ enabled: false, ignore: false }), totp = totpS[0], setTotp = totpS[1];
  var tSecretS = _s(""), tSecret = tSecretS[0], setTSecret = tSecretS[1];
  var tOtpAuthS = _s(""), tOtpAuth = tOtpAuthS[0], setTOtpAuth = tOtpAuthS[1];
  var tQrUrlS = _s(""), tQrUrl = tQrUrlS[0], setTQrUrl = tQrUrlS[1];
  var tCodeS = _s(""), tCode = tCodeS[0], setTCode = tCodeS[1];
  var tRmCodeS = _s(""), tRmCode = tRmCodeS[0], setTRmCode = tRmCodeS[1];
  var pkS = _s({ loaded: false, list: [], twoFactor: false, totpBound: false, max: 20, rp: null });
  var pk = pkS[0];
  var setPk = pkS[1];
  var pkNameS = _s(""), pkName = pkNameS[0], setPkName = pkNameS[1];
  var suS = _s({ open: false, action: "", id: "", preferred: "", need: "", ticket: "", busy: false, error: "" });
  var su = suS[0];
  var setSu = suS[1];
  var suPwS = _s(""), suPw = suPwS[0], setSuPw = suPwS[1];
  var suCodeS = _s(""), suCode = suCodeS[0], setSuCode = suCodeS[1];
  var isAdmin = me !== null && me.role === "admin";
  _e(function() {
    var cancelled = false;
    rpc("me", {}).then(function(j) {
      if (cancelled) return;
      setMe(j.me);
      setPDisplay(j.me.displayName || "");
      setPEmail(j.me.email || "");
    }).catch(function(e) {
      if (e.code !== "session-expired" && !cancelled) setErr(e.message);
    });
    return function() {
      cancelled = true;
    };
  }, []);
  _e(function() {
    if (!isAdmin) return;
    var cancelled = false;
    rpc("listUsers", {}).then(function(j) {
      if (!cancelled) setUsers(j.users || []);
    }).catch(function(e) {
      if (e.code !== "session-expired" && !cancelled) setErr(e.message);
    });
    return function() {
      cancelled = true;
    };
  }, [isAdmin, usersVersion]);
  function refreshUsers() {
    setUsersVersion(function(v) {
      return v + 1;
    });
  }
  _e(function() {
    if (!isAdmin) return;
    var cancelled = false;
    rpc("inviteList", {}).then(function(j) {
      if (!cancelled) setInvites(j.invites || []);
    }).catch(function(e) {
      if (e.code !== "session-expired" && !cancelled) setErr(e.message);
    });
    return function() {
      cancelled = true;
    };
  }, [isAdmin, invitesVersion]);
  function refreshInvites() {
    setInvitesVersion(function(v) {
      return v + 1;
    });
  }
  function createInvites() {
    var amount = parseInt(iAmount, 10);
    var uses = parseInt(iUses, 10);
    if (!(amount >= 1 && amount <= 50)) {
      setErr("生成数量需为 1-50");
      return;
    }
    if (!(uses >= 1 && uses <= 100)) {
      setErr("每个邀请码可用次数需为 1-100");
      return;
    }
    run(function() {
      return rpc("inviteCreate", { amount, uses }).then(refreshInvites);
    }, "邀请码已生成");
  }
  function revokeInvite(code) {
    if (!window.confirm("撤销邀请码「" + code + "」？已注册用户不受影响。")) return;
    run(function() {
      return rpc("inviteRevoke", { code }).then(refreshInvites);
    }, "邀请码已撤销");
  }
  _e(function() {
    var cancelled = false;
    rpc("totpStatus", {}).then(function(j) {
      if (!cancelled) setTotp({ enabled: j.totp.enabled === true, twoFactor: j.totp.twoFactor === true, ignore: j.totp.ignore === true });
    }).catch(function(e) {
      if (e.code !== "session-expired" && !cancelled) setErr(e.message);
    });
    return function() {
      cancelled = true;
    };
  }, [me === null ? null : me.username]);
  _e(function() {
    var cancelled = false;
    rpc("passkeyList", {}).then(function(j) {
      if (cancelled) return;
      setPk({
        loaded: true,
        list: j.passkeys || [],
        twoFactor: j.twoFactor === true,
        totpBound: j.totpBound === true,
        max: typeof j.max === "number" ? j.max : 20,
        rp: j.rp || null
      });
    }).catch(function(e) {
      if (e.code !== "session-expired" && !cancelled) setErr(e.message);
    });
    return function() {
      cancelled = true;
    };
  }, [me === null ? null : me.username]);
  function refreshTotp() {
    rpc("totpStatus", {}).then(function(j) {
      setTotp({ enabled: j.totp.enabled === true, twoFactor: j.totp.twoFactor === true, ignore: j.totp.ignore === true });
      if (j.totp.enabled === true) {
        setTSecret("");
        setTOtpAuth("");
      }
    }).catch(function(e) {
      if (e.code !== "session-expired") setErr(e.message);
    });
  }
  function toggle2fa() {
    var turningOn = totp.twoFactor !== true;
    var onMsg = totp.enabled ? "已启用两步验证（登录需密码 + 动态码）" : "已启用两步验证（登录需密码 + 通行密钥）";
    run(
      function() {
        return rpc("totpSet2fa", { enabled: turningOn }).then(function() {
          refreshTotp();
          refreshPk();
        });
      },
      turningOn ? onMsg : "已关闭两步验证（登录仅需密码，通行密钥仍可直接登录）"
    );
  }
  function genTotp() {
    run(function() {
      return rpc("totpGenerate", {}).then(function(j) {
        setTSecret(j.secret);
        setTOtpAuth(j.otpauth);
        setTQrUrl(j.qrDataUrl || "");
        setTCode("");
        refreshTotp();
      });
    }, "TOTP 密钥已生成，请用验证器扫码或手动输入后输入 6 位动态码启用");
  }
  function enableTotp() {
    if (!/^\d{6}$/.test(tCode)) {
      setErr("请输入 6 位动态验证码");
      return;
    }
    run(function() {
      return rpc("totpVerify", { code: tCode }).then(refreshTotp);
    }, "TOTP 已启用");
  }
  function removeTotp() {
    var confirmText = pk.list.length > 0 ? "确定移除 TOTP 令牌？移除后两步验证将由通行密钥完成（登录需「密码 + 通行密钥」）。" : "确定移除 TOTP 令牌？移除后两步验证会自动关闭，登录仅需密码。";
    if (!window.confirm(confirmText)) return;
    if (!/^\d{6}$/.test(tRmCode)) {
      setErr("请输入当前 6 位动态验证码以确认移除");
      return;
    }
    run(function() {
      return rpc("totpRemove", { code: tRmCode }).then(function() {
        setTRmCode("");
        refreshTotp();
        refreshPk();
      });
    }, "TOTP 已移除");
  }
  function toggleIgnore() {
    run(function() {
      return rpc("totpIgnore", { ignore: !totp.ignore }).then(refreshTotp);
    }, totp.ignore ? "已取消永久忽略" : "已永久忽略登录提醒");
  }
  function suClosed() {
    return { open: false, action: "", id: "", label: "", preferred: "", need: "", ticket: "", busy: false, error: "" };
  }
  function refreshPk() {
    rpc("passkeyList", {}).then(function(j) {
      setPk({
        loaded: true,
        list: j.passkeys || [],
        twoFactor: j.twoFactor === true,
        totpBound: j.totpBound === true,
        max: typeof j.max === "number" ? j.max : 20,
        rp: j.rp || null
      });
    }).catch(function(e) {
      if (e.code !== "session-expired") setErr(e.message);
    });
  }
  function askStepUp(action, id, preferred, label) {
    setSuPw("");
    setSuCode("");
    setErr("");
    setMsg("");
    setSu({ open: true, action, id, label, preferred, need: "", ticket: "", busy: false, error: "" });
  }
  function stepUpError(e) {
    setSu(function(s) {
      return { ...s, busy: false, error: e && e.message ? e.message : "验证未完成" };
    });
  }
  function finishStepUp(ticket) {
    var action = su.action;
    if (action === "add") {
      return rpc("passkeyAddOptions", { ticket, preferred: su.preferred }).then(function(j) {
        if (typeof window.PublicKeyCredential === "undefined") throw new Error("当前浏览器不支持通行密钥");
        return SWA.startRegistration({ optionsJSON: j.options }).then(function(cred) {
          return rpc("passkeyAddVerify", { ticket, handle: j.handle, response: cred, label: su.label });
        });
      }).then(function() {
        setSu(suClosed());
        setMsg("通行密钥已添加");
        refreshPk();
        refreshTotp();
      }).catch(stepUpError);
    }
    if (action === "rename") {
      return rpc("passkeyRename", { ticket, id: su.id, label: su.label }).then(function() {
        setSu(suClosed());
        setMsg("通行密钥已重命名");
        refreshPk();
      }).catch(stepUpError);
    }
    if (action === "remove") {
      return rpc("passkeyRemove", { ticket, id: su.id }).then(function() {
        setSu(suClosed());
        setMsg("通行密钥已删除");
        refreshPk();
        refreshTotp();
      }).catch(stepUpError);
    }
    setSu(suClosed());
    return void 0;
  }
  function submitStepUp() {
    if (suPw === "") {
      setSu(function(s) {
        return { ...s, error: "请输入当前密码" };
      });
      return;
    }
    var password = suPw;
    var code = suCode;
    var base = { password };
    if (pk.twoFactor && pk.totpBound) base.totp = code;
    setSu(function(s) {
      return { ...s, busy: true, error: "" };
    });
    rpc("passkeyStepUp", base).then(function(j) {
      if (j.need !== "passkey") return finishStepUp(j.ticket || "");
      if (typeof window.PublicKeyCredential === "undefined") throw new Error("当前浏览器不支持通行密钥");
      return SWA.startAuthentication({ optionsJSON: j.options }).then(function(cred) {
        var again = { password, handle: j.handle, response: cred };
        if (pk.twoFactor && pk.totpBound) again.totp = code;
        return rpc("passkeyStepUp", again).then(function(j2) {
          return finishStepUp(j2.ticket || "");
        });
      });
    }).catch(stepUpError);
  }
  function removePasskey(p) {
    if (!window.confirm("删除通行密钥「" + p.label + "」？删除后该设备将无法再用它登录。")) return;
    askStepUp("remove", p.id, "", "");
  }
  function renamePasskey(p) {
    var next = window.prompt("为这个通行密钥设置新名称：", p.label);
    if (next === null) return;
    askStepUp("rename", p.id, "", next.slice(0, 40));
  }
  function passkeyLabel(p) {
    var kind = p.deviceType === "multiDevice" ? "可同步" : "仅此设备";
    var used = typeof p.lastUsedAt === "number" && p.lastUsedAt > 0 ? new Date(p.lastUsedAt).toLocaleString() : "未使用";
    return kind + " · 最近使用：" + used;
  }
  function renderStepUp() {
    if (!su.open) return null;
    var needTotp = pk.twoFactor && pk.totpBound;
    var title = su.action === "add" ? "添加通行密钥" : su.action === "rename" ? "重命名通行密钥" : "删除通行密钥";
    return React.createElement(
      "div",
      {
        style: { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2147483e3 }
      },
      React.createElement(
        "div",
        { className: "card", style: { width: 420, maxWidth: "calc(100vw - 40px)", margin: 0 } },
        React.createElement("h2", null, "确认身份 · " + title),
        React.createElement(
          "div",
          { className: "muted", style: { marginBottom: 4 } },
          "通行密钥可以代替密码登录，因此改动前必须确认是你本人。"
        ),
        React.createElement("label", null, t("password.current")),
        React.createElement("input", { type: "password", value: suPw, onChange: function(e) {
          setSuPw(e.target.value);
        }, autoComplete: "current-password" }),
        needTotp ? React.createElement(
          "div",
          null,
          React.createElement("label", null, "动态码（6 位）"),
          React.createElement("input", { value: suCode, onChange: function(e) {
            setSuCode(e.target.value);
          }, maxLength: 6, placeholder: "6 位动态码" })
        ) : null,
        pk.twoFactor && !pk.totpBound ? React.createElement(
          "div",
          { className: "muted", style: { marginTop: 8 } },
          "该账号的第二步验证是通行密钥：提交密码后会再要求你完成一次通行密钥验证。"
        ) : null,
        su.error !== "" ? React.createElement("div", { className: "err" }, su.error) : null,
        React.createElement(
          "div",
          { className: "row", style: { marginTop: 14 } },
          React.createElement("button", { onClick: submitStepUp, disabled: su.busy }, su.busy ? "验证中…" : "确认"),
          React.createElement("button", { className: "ghost", onClick: function() {
            setSu(suClosed());
            setSuPw("");
            setSuCode("");
          }, disabled: su.busy }, "取消")
        )
      )
    );
  }
  function run(task, okMsg) {
    setBusy(true);
    setErr("");
    setMsg("");
    Promise.resolve().then(task).then(function() {
      if (okMsg) setMsg(okMsg);
    }).catch(function(e) {
      if (e.code !== "session-expired") setErr(e.message);
    }).finally(function() {
      setBusy(false);
    });
  }
  function saveProfile() {
    run(function() {
      return rpc("updateProfile", { displayName: pDisplay, email: pEmail }).then(function(j) {
        setMe(j.me);
      });
    }, "个人信息已保存");
  }
  function checkCurrentPassword() {
    if (oldPw === "") {
      setOldCheck("idle");
      return;
    }
    rpc("verifyPassword", { password: oldPw }).then(function() {
      setOldCheck("ok");
    }).catch(function() {
      setOldCheck("bad");
    });
  }
  function changePassword() {
    if (newPw.length < 8) {
      setErr("新密码至少 8 位且含两种及以上字符类型（大小写字母/数字/符号）");
      return;
    }
    if (newPw !== newPw2) {
      setErr("两次输入的新密码不一致");
      return;
    }
    run(function() {
      return rpc("changePassword", { oldPassword: oldPw, newPassword: newPw }).then(function() {
        setOldPw("");
        setNewPw("");
        setNewPw2("");
      });
    }, "密码已修改（其他设备上的登录已失效）");
  }
  function createUser() {
    if (!/^[A-Za-z0-9_.-]{2,32}$/.test(cName)) {
      setErr("用户名仅允许 2-32 位字母、数字、下划线、点或短横线");
      return;
    }
    if (cPw.length < 8) {
      setErr("初始密码至少 8 位且含两种及以上字符类型");
      return;
    }
    run(function() {
      return rpc("createUser", { username: cName, password: cPw, role: cRole, displayName: cDisplay, email: cEmail }).then(function() {
        setCName("");
        setCPw("");
        setCRole("user");
        setCDisplay("");
        setCEmail("");
        refreshUsers();
      });
    }, "用户已创建");
  }
  function deleteUser(u) {
    if (!window.confirm("确定删除用户「" + u.username + "」？该操作不可撤销。")) return;
    run(function() {
      return rpc("deleteUser", { username: u.username }).then(refreshUsers);
    }, "用户已删除");
  }
  function resetPassword(u) {
    var pw = window.prompt("为用户「" + u.username + "」设置新密码（至少 8 位，含两种字符类型）：");
    if (pw === null) return;
    if (pw.length < 8) {
      setErr("新密码至少 8 位且含两种及以上字符类型（大小写字母/数字/符号）");
      return;
    }
    run(function() {
      return rpc("resetPassword", { username: u.username, newPassword: pw }).then(refreshUsers);
    }, "密码已重置");
  }
  function resetPasskeys(u) {
    if (!window.confirm("清除用户「" + u.username + "」的全部通行密钥？该用户将无法再用通行密钥登录（用于设备丢失时的账号救援）。")) return;
    run(function() {
      return rpc("passkeyReset", { username: u.username }).then(refreshUsers);
    }, "该用户的通行密钥已清除");
  }
  function toggleRole(u) {
    var next = u.role === "admin" ? "user" : "admin";
    if (!window.confirm("将「" + u.username + "」的角色改为「" + roleLabel(next) + "」？")) return;
    run(function() {
      return rpc("setRole", { username: u.username, role: next }).then(refreshUsers);
    }, "角色已更新");
  }
  function logout() {
    try {
      sessionStorage.removeItem("dshua-totp-reminded");
    } catch (e) {
    }
    fetch("/auth/logout", { method: "POST" }).then(function() {
      location.href = "/auth/login";
    }).catch(function() {
      location.href = "/auth/login";
    });
  }
  if (me === null && err === "") {
    return React.createElement("div", { className: "dshua" }, React.createElement("div", null, "加载中…"));
  }
  if (me === null) {
    return React.createElement("div", { className: "dshua" }, React.createElement("div", { className: "err" }, err));
  }
  var cards = [];
  cards.push(React.createElement(
    "div",
    { className: "card", key: "profile" },
    React.createElement("h2", null, "我的账号"),
    React.createElement("div", { className: "meta" }, "当前登录：" + me.username + "（" + roleLabel(me.role) + "）"),
    React.createElement("label", null, "昵称（显示名）"),
    React.createElement("input", { value: pDisplay, onChange: function(e) {
      setPDisplay(e.target.value);
    }, maxLength: 60 }),
    React.createElement("label", null, "邮箱"),
    React.createElement("input", { value: pEmail, onChange: function(e) {
      setPEmail(e.target.value);
    }, maxLength: 120 }),
    React.createElement(
      "div",
      { className: "row", style: { marginTop: 12 } },
      React.createElement("button", { onClick: saveProfile, disabled: busy }, "保存个人信息"),
      React.createElement("button", { className: "ghost", onClick: logout }, "退出登录")
    )
  ));
  var newLevel = passwordLevel(newPw);
  var unlocked = oldCheck === "ok";
  cards.push(React.createElement(
    "div",
    { className: "card", key: "password" },
    React.createElement("h2", null, t("password.submit")),
    React.createElement("label", null, t("password.current")),
    React.createElement("input", {
      type: "password",
      value: oldPw,
      autoComplete: "current-password",
      className: oldCheck === "ok" ? "pw-ok" : oldCheck === "bad" ? "pw-bad" : "",
      onChange: function(e) {
        setOldPw(e.target.value);
        setOldCheck("idle");
      },
      onBlur: checkCurrentPassword
    }),
    React.createElement(
      "div",
      { className: "pw-hint" },
      oldCheck === "ok" ? "当前密码正确，已解锁下面的输入框" : oldCheck === "bad" ? "当前密码不正确，下面的输入框保持锁定" : "离开此输入框时会自动校验；校验通过前下面两个输入框锁定"
    ),
    React.createElement("label", null, "新密码（至少 8 位，含两种字符类型）"),
    React.createElement("input", {
      type: "password",
      value: newPw,
      autoComplete: "new-password",
      disabled: !unlocked,
      className: !unlocked ? "locked" : newPw === "" ? "" : "pw-" + newLevel,
      onChange: function(e) {
        setNewPw(e.target.value);
      }
    }),
    unlocked && newPw !== "" ? React.createElement("div", { className: "pw-hint" }, "密码强度：" + levelText(newLevel)) : null,
    React.createElement("label", null, t("password.confirm")),
    React.createElement("input", {
      type: "password",
      value: newPw2,
      autoComplete: "new-password",
      disabled: !unlocked || newLevel === "bad",
      className: !unlocked || newLevel === "bad" ? "locked" : newPw2 === "" ? "pw-warn" : newPw2 === newPw ? "pw-ok" : "pw-bad",
      onChange: function(e) {
        setNewPw2(e.target.value);
      }
    }),
    newPw2 !== "" && unlocked && newLevel !== "bad" ? React.createElement("div", { className: "pw-hint" }, newPw2 === newPw ? t("password.match") : t("password.mismatch")) : null,
    React.createElement(
      "div",
      { className: "row", style: { marginTop: 12 } },
      React.createElement("button", {
        onClick: changePassword,
        disabled: busy || !unlocked || newLevel === "bad" || newPw2 !== newPw
      }, t("password.submit"))
    )
  ));
  var totpSetup = tSecret === "" ? React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      { className: "muted", style: { marginBottom: 8 } },
      "使用 Google Authenticator / Microsoft Authenticator 等应用，通过 otpauth 链接或手动输入密钥添加本账号；启用后每次登录输入 6 位动态码。"
    ),
    React.createElement("button", { onClick: genTotp, disabled: busy }, "生成 TOTP 密钥")
  ) : React.createElement(
    "div",
    null,
    React.createElement("label", null, "用验证器扫描二维码添加（Google Authenticator / Microsoft Authenticator 等）"),
    tQrUrl !== "" ? React.createElement("img", { src: tQrUrl, alt: "TOTP 二维码", style: { display: "block", width: 200, height: 200, borderRadius: 8, background: "#fff", padding: 6, marginBottom: 6 } }) : null,
    React.createElement("label", null, "密钥（无法扫码时手动输入）"),
    React.createElement("code", { style: { display: "block", padding: "10px", borderRadius: 7, background: "var(--dsw-alias-bg-layer-1)", wordBreak: "break-all" } }, tSecret),
    React.createElement("label", null, "otpauth 链接"),
    React.createElement("code", { style: { display: "block", padding: "10px", borderRadius: 7, background: "var(--dsw-alias-bg-layer-1)", wordBreak: "break-all", fontSize: 12 } }, tOtpAuth),
    React.createElement("label", null, "输入验证器中的 6 位动态码以启用"),
    React.createElement("input", { value: tCode, onChange: function(e) {
      setTCode(e.target.value);
    }, placeholder: "6 位动态码", maxLength: 6 }),
    React.createElement(
      "div",
      { className: "row", style: { marginTop: 12 } },
      React.createElement("button", { onClick: enableTotp, disabled: busy }, "启用 TOTP"),
      React.createElement("button", { className: "ghost", onClick: function() {
        setTSecret("");
        setTOtpAuth("");
        setTQrUrl("");
        setTCode("");
      }, disabled: busy }, "取消")
    )
  );
  var hasFactor = totp.enabled || pk.list.length > 0;
  var factorText = totp.twoFactor ? totp.enabled ? "已启用两步验证（登录需密码 + 动态码）" : "已启用两步验证（登录需密码 + 通行密钥）" : "未启用两步验证（登录仅需密码）";
  cards.push(React.createElement(
    "div",
    { className: "card", key: "totp" },
    React.createElement("h2", null, totp.enabled ? "两步验证（TOTP）" : "两步验证"),
    React.createElement(
      "div",
      null,
      totp.enabled ? React.createElement("span", { className: "badge admin" }, "已绑定 TOTP") : React.createElement("span", { className: "badge user" }, "未绑定 TOTP"),
      pk.list.length > 0 ? React.createElement("span", { className: "badge admin" }, "通行密钥 " + pk.list.length + " 个") : null,
      totp.ignore ? React.createElement("span", { className: "meta" }, "（已永久忽略登录提醒）") : null
    ),
    hasFactor ? React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 10, margin: "4px 0" } },
        React.createElement(
          "label",
          { className: "switch" },
          React.createElement("input", { type: "checkbox", checked: totp.twoFactor === true, onChange: toggle2fa, disabled: busy }),
          React.createElement("span", { className: "track" }, React.createElement("span", { className: "thumb" }))
        ),
        React.createElement("label", { style: { cursor: "pointer", margin: 0, color: "var(--dsw-alias-label-secondary)" } }, factorText)
      ),
      React.createElement(
        "div",
        { className: "muted", style: { marginBottom: 6 } },
        totp.twoFactor ? "关闭后仅凭密码即可登录（通行密钥仍可直接登录）；开启状态下改动通行密钥需要先通过二次验证。" : "开启后登录需要第二个因子：已绑定 TOTP 时用动态码，否则用通行密钥。"
      ),
      totp.enabled ? React.createElement(
        "div",
        null,
        React.createElement("label", null, "移除令牌需输入当前 6 位动态码"),
        React.createElement("input", { value: tRmCode, onChange: function(e) {
          setTRmCode(e.target.value);
        }, placeholder: "6 位动态码", maxLength: 6 }),
        React.createElement(
          "div",
          { className: "row", style: { marginTop: 12 } },
          React.createElement("button", { className: "danger", onClick: removeTotp, disabled: busy }, "移除 TOTP"),
          React.createElement("button", { className: "ghost", onClick: toggleIgnore, disabled: busy }, totp.ignore ? "取消永久忽略" : "永久忽略登录提醒")
        )
      ) : React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "muted", style: { marginBottom: 8 } },
          "当前账号没有 TOTP 令牌，两步验证由通行密钥完成。如需改用动态码，可在下方生成并绑定 TOTP。"
        ),
        totpSetup
      )
    ) : totpSetup
  ));
  var pkSupported = pk.rp !== null && pk.rp.supported === true;
  var pkPort = "";
  try {
    pkPort = location.port !== "" ? ":" + location.port : "";
  } catch (e) {
  }
  cards.push(React.createElement(
    "div",
    { className: "card", key: "passkey" },
    React.createElement("h2", null, "通行密钥（Passkey）"),
    React.createElement(
      "div",
      null,
      pk.list.length > 0 ? React.createElement("span", { className: "badge admin" }, "已绑定 " + pk.list.length + " 个") : React.createElement("span", { className: "badge user" }, "未绑定"),
      pk.twoFactor ? React.createElement("span", { className: "meta" }, "两步验证已开启") : null,
      pk.list.length >= pk.max ? React.createElement("span", { className: "meta" }, "已达上限 " + pk.max + " 个") : null
    ),
    !pk.loaded ? React.createElement("div", { className: "muted", style: { marginTop: 8 } }, "加载中…") : null,
    pk.loaded && !pkSupported ? React.createElement(
      "div",
      { className: "err", style: { marginTop: 8 } },
      (pk.rp !== null && pk.rp.error ? pk.rp.error : "当前访问地址无法使用通行密钥。") + (pk.rp !== null && pk.rp.suggestedHost ? "请改用 http://" + pk.rp.suggestedHost + pkPort + " 打开面板后再试。" : "")
    ) : null,
    pk.loaded && pkSupported ? React.createElement(
      "div",
      { className: "muted", style: { marginTop: 8 } },
      "用指纹 / 面容 / 设备 PIN 代替密码登录。私钥永不离开设备，服务器只保存公钥；一个账号可以绑定多个（本机设备、多台手机）。"
    ) : null,
    pk.loaded && pkSupported && pk.list.length > 0 ? React.createElement(
      "table",
      null,
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("th", null, t("models.colName")),
          React.createElement("th", null, "类型"),
          React.createElement("th", null, "操作")
        )
      ),
      React.createElement(
        "tbody",
        null,
        pk.list.map(function(p) {
          return React.createElement(
            "tr",
            { key: p.id },
            React.createElement(
              "td",
              null,
              p.label,
              p.backedUp ? React.createElement("span", { className: "meta" }, "已备份") : null
            ),
            React.createElement("td", null, React.createElement("span", { className: "muted" }, passkeyLabel(p))),
            React.createElement(
              "td",
              null,
              React.createElement(
                "div",
                { className: "actions" },
                React.createElement("button", { className: "ghost", onClick: function() {
                  renamePasskey(p);
                }, disabled: busy || su.busy }, "重命名"),
                React.createElement("button", { className: "danger", onClick: function() {
                  removePasskey(p);
                }, disabled: busy || su.busy }, t("common.remove"))
              )
            )
          );
        })
      )
    ) : null,
    pk.loaded && pkSupported && pk.list.length < pk.max ? React.createElement(
      "div",
      null,
      React.createElement("label", null, "名称（可选，便于区分设备）"),
      React.createElement("input", { value: pkName, onChange: function(e) {
        setPkName(e.target.value);
      }, maxLength: 40, placeholder: "例如：我的笔记本 / iPhone" }),
      React.createElement(
        "div",
        { className: "row", style: { marginTop: 12 } },
        React.createElement("button", { onClick: function() {
          askStepUp("add", "", "localDevice", pkName);
        }, disabled: busy || su.busy }, "＋ 本机通行密钥"),
        React.createElement("button", { className: "ghost", onClick: function() {
          askStepUp("add", "", "remoteDevice", pkName);
        }, disabled: busy || su.busy }, "📱 手机扫码添加")
      ),
      React.createElement(
        "div",
        { className: "muted", style: { marginTop: 8 } },
        "「本机通行密钥」使用这台电脑的指纹 / 面容 / Windows Hello；「手机扫码添加」由浏览器显示二维码，用手机相机扫码后在本机完成绑定（手机无需与电脑处于同一网络）。"
      )
    ) : null
  ));
  if (isAdmin) {
    cards.push(React.createElement(
      "div",
      { className: "card", key: "admin" },
      React.createElement("h2", null, "用户管理（管理员）"),
      React.createElement("label", null, "新增用户：用户名"),
      React.createElement("input", { value: cName, onChange: function(e) {
        setCName(e.target.value);
      }, placeholder: "2-32 位字母、数字、_ . -", maxLength: 32 }),
      React.createElement("label", null, "初始密码（至少 8 位，含两种字符类型）"),
      React.createElement("input", { type: "password", value: cPw, onChange: function(e) {
        setCPw(e.target.value);
      }, placeholder: "密码仅本次设置，之后无法查看" }),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "grow" },
          React.createElement("label", null, "角色"),
          React.createElement(
            "select",
            { value: cRole, onChange: function(e) {
              setCRole(e.target.value);
            } },
            React.createElement("option", { value: "user" }, "普通用户"),
            React.createElement("option", { value: "admin" }, "管理员")
          )
        ),
        React.createElement(
          "div",
          { className: "grow" },
          React.createElement("label", null, "昵称"),
          React.createElement("input", { value: cDisplay, onChange: function(e) {
            setCDisplay(e.target.value);
          }, maxLength: 60 })
        ),
        React.createElement(
          "div",
          { className: "grow" },
          React.createElement("label", null, "邮箱"),
          React.createElement("input", { value: cEmail, onChange: function(e) {
            setCEmail(e.target.value);
          }, maxLength: 120 })
        )
      ),
      React.createElement(
        "div",
        { className: "row", style: { marginTop: 12 } },
        React.createElement("button", { onClick: createUser, disabled: busy }, "创建用户")
      ),
      React.createElement(
        "table",
        null,
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", null, "用户名"),
            React.createElement("th", null, "角色"),
            React.createElement("th", null, "昵称"),
            React.createElement("th", null, "邮箱"),
            React.createElement("th", null, "通行密钥"),
            React.createElement("th", null, "操作")
          )
        ),
        React.createElement(
          "tbody",
          null,
          users.map(function(u) {
            return React.createElement(
              "tr",
              { key: u.username },
              React.createElement("td", null, u.username, me.username === u.username ? React.createElement("span", { className: "meta" }, "（我）") : null),
              React.createElement("td", null, React.createElement("span", { className: "badge " + u.role }, roleLabel(u.role))),
              React.createElement("td", null, u.displayName || "—"),
              React.createElement("td", null, u.email || "—"),
              React.createElement("td", null, (u.passkeyCount || 0) + " 个"),
              React.createElement(
                "td",
                null,
                React.createElement(
                  "div",
                  { className: "actions" },
                  React.createElement("button", { className: "ghost", onClick: function() {
                    resetPassword(u);
                  }, disabled: busy }, "重置密码"),
                  (u.passkeyCount || 0) > 0 ? React.createElement("button", { className: "ghost", onClick: function() {
                    resetPasskeys(u);
                  }, disabled: busy }, "清除通行密钥") : null,
                  React.createElement("button", { className: "ghost", onClick: function() {
                    toggleRole(u);
                  }, disabled: busy }, "切换角色"),
                  React.createElement("button", { className: "danger", onClick: function() {
                    deleteUser(u);
                  }, disabled: busy }, t("common.remove"))
                )
              )
            );
          })
        )
      ),
      React.createElement(
        "div",
        { className: "muted", style: { marginTop: 8 } },
        "说明：管理员可以新增、删除用户并重置密码，也可以在设备丢失时清除某个用户的通行密钥（用于账号救援），但无法查看任何人的当前密码。不能删除或降级最后一个管理员。"
      )
    ));
  }
  if (isAdmin) {
    cards.push(React.createElement(
      "div",
      { className: "card", key: "invites" },
      React.createElement("h2", null, "邀请码管理（管理员）"),
      React.createElement(
        "div",
        { className: "muted", style: { marginBottom: 6 } },
        "新用户注册必须输入有效邀请码；每个码可按设置的可注册次数使用。"
      ),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "grow" },
          React.createElement("label", null, "生成数量（1-50）"),
          React.createElement("input", { value: iAmount, onChange: function(e) {
            setIAmount(e.target.value);
          }, placeholder: "1" })
        ),
        React.createElement(
          "div",
          { className: "grow" },
          React.createElement("label", null, "每个码可注册次数（1-100）"),
          React.createElement("input", { value: iUses, onChange: function(e) {
            setIUses(e.target.value);
          }, placeholder: "1" })
        ),
        React.createElement(
          "div",
          { className: "grow", style: { alignSelf: "flex-end" } },
          React.createElement("button", { onClick: createInvites, disabled: busy }, "生成邀请码")
        )
      ),
      React.createElement(
        "table",
        null,
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", null, "邀请码"),
            React.createElement("th", null, "已用 / 可注册"),
            React.createElement("th", null, "剩余"),
            React.createElement("th", null, "创建者"),
            React.createElement("th", null, "操作")
          )
        ),
        React.createElement(
          "tbody",
          null,
          invites.length === 0 ? React.createElement("tr", null, React.createElement("td", { colSpan: 5, className: "muted" }, "暂无邀请码")) : invites.map(function(v) {
            return React.createElement(
              "tr",
              { key: v.code },
              React.createElement("td", null, React.createElement("code", null, v.code)),
              React.createElement("td", null, v.used + " / " + v.total),
              React.createElement("td", null, React.createElement("span", { className: "badge " + (v.remaining > 0 ? "user" : "admin") }, v.remaining)),
              React.createElement("td", null, v.createdBy),
              React.createElement(
                "td",
                null,
                React.createElement(
                  "div",
                  { className: "actions" },
                  React.createElement("button", { className: "danger", onClick: function() {
                    revokeInvite(v.code);
                  }, disabled: busy }, "撤销")
                )
              )
            );
          })
        )
      )
    ));
  }
  cards.push(React.createElement("div", { className: "msg", key: "msg" }, msg));
  cards.push(React.createElement("div", { className: "err", key: "err" }, err));
  return React.createElement("div", { className: "dshua" }, cards, renderStepUp());
}
function errText(e) {
  return String(e && (e.message || e.error || e.code) || e);
}
function UserModelsPage() {
  var st = React.useState({ loaded: false, unlocked: false, profiles: [], error: "", selected: "", busy: "" });
  var state = st[0], setState = st[1];
  var pw = React.useState("");
  var password = pw[0], setPassword = pw[1];
  var fm = React.useState({ label: "", model: "deepseek-chat", baseUrl: "", apiKey: "" });
  var form = fm[0], setForm = fm[1];
  var kt = React.useState({ busy: false, result: "" });
  var keyTest = kt[0], setKeyTest = kt[1];
  var bl = React.useState({});
  var balances = bl[0], setBalances = bl[1];
  function refresh(pick) {
    rpc("profileList", {}).then(function(j) {
      var list = j.profiles || [];
      setState(function(prev) {
        var selected = pick !== void 0 ? pick : prev.selected;
        if (selected === "" && list.length > 0) selected = list[0].profileId;
        return { loaded: true, unlocked: j.unlocked === true, profiles: list, error: "", selected, busy: "" };
      });
    }).catch(function(e) {
      setState(function(prev) {
        return { ...prev, loaded: true, error: errText(e), busy: "" };
      });
    });
  }
  React.useEffect(function() {
    refresh();
  }, []);
  function act(method, body, pick) {
    setState(function(prev) {
      return { ...prev, busy: method };
    });
    rpc(method, body).then(function() {
      refresh(pick);
    }).catch(function(e) {
      setState(function(prev) {
        return { ...prev, error: errText(e), busy: "" };
      });
    });
  }
  function queryAllBalances() {
    setState(function(prev) {
      return { ...prev, busy: "balance", error: "" };
    });
    rpc("balanceQueryAll", {}).then(function(j) {
      var results = j.results || {};
      var next = {};
      Object.keys(results).forEach(function(id) {
        var row = results[id] || {};
        next[id] = row.error !== void 0 ? row.error === "locked" ? t("common.needUnlock") : row.error === "rate-limited" ? t("common.later") : row.error === "no-profile" ? "未选择配置" : t("common.notAvailable") : (row.currency || "CNY") + " " + String(row.total);
      });
      setBalances(next);
      setState(function(prev) {
        return { ...prev, busy: "" };
      });
    }).catch(function(e) {
      setState(function(prev) {
        return { ...prev, busy: "", error: errText(e) };
      });
    });
  }
  function checkKeyValidity() {
    setKeyTest({ busy: true, result: "" });
    rpc("profileTestKey", { apiKey: form.apiKey, baseUrl: form.baseUrl }).then(function(j) {
      var b = j.balance || {};
      setKeyTest({ busy: false, result: "✔ 连通可用，余额 " + (b.currency || "CNY") + " " + String(b.total) });
    }).catch(function(e) {
      setKeyTest({ busy: false, result: "✘ " + errText(e) });
    });
  }
  function selectedProfile() {
    return state.profiles.filter(function(p) {
      return String(p.profileId) === state.selected;
    })[0];
  }
  var children = [];
  children.push(React.createElement("h2", null, t("models.title")));
  children.push(React.createElement(
    "div",
    { className: "muted", style: { marginBottom: 10 } },
    "这里的配置只属于你自己：其他用户（包括管理员）都无法查看你的 API Key。管理员分享给你的配置可以直接选用，能看到余额，但看不到 Key。"
  ));
  if (state.error !== "") {
    children.push(React.createElement("div", { style: { color: "var(--dsw-alias-label-error, #ff6b6b)", marginBottom: 8 } }, state.error));
  }
  var toolbar = [];
  if (state.loaded && !state.unlocked) {
    children.push(React.createElement(
      "div",
      { key: "pw-row", className: "fields" },
      React.createElement(
        "div",
        { className: "field compact" },
        React.createElement("label", null, t("models.passwordLabel")),
        React.createElement("input", {
          type: "password",
          placeholder: t("models.passwordPlaceholder"),
          value: password,
          "aria-label": t("models.passwordLabel"),
          onChange: function(e) {
            setPassword(e.target.value);
          }
        })
      )
    ));
    toolbar.push(React.createElement("button", {
      key: "unlock",
      disabled: password === "",
      onClick: function() {
        act("profileUnlock", { password });
        setPassword("");
      }
    }, t("common.unlock")));
  }
  toolbar.push(React.createElement("button", {
    key: "balance",
    disabled: state.profiles.length === 0 || state.busy === "balance",
    onClick: queryAllBalances
  }, state.busy === "balance" ? t("common.querying") : t("models.balanceAll")));
  toolbar.push(React.createElement("button", {
    key: "default",
    disabled: selectedProfile() === void 0 || selectedProfile().source === "shared",
    onClick: function() {
      act("profileSetDefault", { profileId: state.selected });
    }
  }, t("models.setDefault")));
  toolbar.push(React.createElement("button", {
    key: "use",
    disabled: selectedProfile() === void 0 || selectedProfile().source !== "shared",
    onClick: function() {
      var parts = String(state.selected).split("/");
      act("shareSelect", { ownerUid: parts[0], profileId: parts[1] });
    }
  }, t("models.useShare")));
  toolbar.push(React.createElement("button", {
    key: "remove",
    disabled: selectedProfile() === void 0 || selectedProfile().source === "shared",
    onClick: function() {
      act("profileRemove", { profileId: state.selected });
    }
  }, t("common.remove")));
  children.push(React.createElement("div", { key: "toolbar", className: "toolbar" }, toolbar));
  var rows = state.profiles.map(function(p) {
    var id = String(p.profileId);
    var isShared = p.source === "shared";
    return React.createElement(
      "tr",
      {
        key: id,
        onClick: function() {
          setState(function(prev) {
            return { ...prev, selected: id };
          });
        },
        style: { cursor: "pointer", background: state.selected === id ? "var(--dsw-alias-bg-layer-2, rgba(127,127,127,.12))" : void 0 }
      },
      React.createElement("td", null, state.selected === id ? "●" : "○"),
      React.createElement("td", null, p.label || "未命名"),
      React.createElement("td", null, String(p.model || "—")),
      React.createElement("td", null, isShared ? t("models.sharedByAdmin") : p.hint || "—"),
      React.createElement("td", null, p.isDefault ? "是" : ""),
      React.createElement("td", null, balances[id] !== void 0 ? balances[id] : "—")
    );
  });
  children.push(React.createElement(
    "table",
    { key: "table" },
    React.createElement("thead", null, React.createElement(
      "tr",
      null,
      React.createElement("th", null, ""),
      React.createElement("th", null, t("models.colName")),
      React.createElement("th", null, t("models.colModel")),
      React.createElement("th", null, "API Key"),
      React.createElement("th", null, t("models.colDefault")),
      React.createElement("th", null, t("models.colBalance"))
    )),
    React.createElement("tbody", null, rows.length === 0 ? React.createElement("tr", null, React.createElement("td", { colSpan: 6, className: "muted" }, "还没有配置。未配置时模型调用会被拒绝——不会回退到部署级配置。")) : rows)
  ));
  children.push(React.createElement("div", { key: "add-title", style: { fontWeight: 600, margin: "14px 0 6px" } }, t("models.addTitle")));
  children.push(React.createElement(
    "div",
    { key: "add", className: "fields" },
    React.createElement(
      "div",
      { className: "field" },
      React.createElement("label", null, t("models.colName")),
      React.createElement("input", { placeholder: "例如：我的 DeepSeek", value: form.label, onChange: function(e) {
        setForm({ ...form, label: e.target.value });
      } })
    ),
    React.createElement(
      "div",
      { className: "field" },
      React.createElement("label", null, t("models.fieldModel")),
      React.createElement("input", { placeholder: "deepseek-chat", value: form.model, onChange: function(e) {
        setForm({ ...form, model: e.target.value });
      } })
    ),
    React.createElement(
      "div",
      { className: "field" },
      React.createElement("label", null, "baseURL（留空用官方地址）"),
      React.createElement("input", { placeholder: "https://api.deepseek.com", value: form.baseUrl, onChange: function(e) {
        setForm({ ...form, baseUrl: e.target.value });
      } })
    ),
    React.createElement(
      "div",
      { className: "field" },
      React.createElement("label", null, "API Key"),
      React.createElement("input", { type: "password", placeholder: "sk-…", value: form.apiKey, onChange: function(e) {
        setForm({ ...form, apiKey: e.target.value });
      } })
    ),
    React.createElement(
      "div",
      { className: "actions", style: { margin: "0 0 10px" } },
      React.createElement("button", {
        disabled: form.apiKey === "" || keyTest.busy,
        onClick: checkKeyValidity
      }, keyTest.busy ? t("common.checking") : t("common.checkKey")),
      React.createElement("button", {
        disabled: form.model === "" || form.apiKey === "",
        onClick: function() {
          act("profileCreate", { label: form.label, provider: "deepseek", model: form.model, baseUrl: form.baseUrl, apiKey: form.apiKey });
          setForm({ label: "", model: "deepseek-chat", baseUrl: "", apiKey: "" });
        }
      }, t("common.add"))
    )
  ));
  if (keyTest.result !== "") {
    children.push(React.createElement("div", { key: "keytest", className: "pw-hint" }, keyTest.result));
  }
  return React.createElement("div", { className: "dshua" }, React.createElement("div", { className: "card" }, children));
}
function dedupeSettingsNav(key) {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  var labels = [message("zh", key), message("en", key)];
  var converge = function() {
    var navs = document.querySelectorAll("[role=dialog] nav");
    for (var i = 0; i < navs.length; i++) {
      var buttons = navs[i].querySelectorAll("button, [role=button]");
      var kept = 0;
      for (var j = 0; j < buttons.length; j++) {
        var element = buttons[j];
        if (labels.indexOf((element.textContent || "").trim()) === -1) continue;
        kept += 1;
        if (kept > 1) {
          element.style.display = "none";
          element.setAttribute("data-dshua-dedup", "1");
        }
      }
    }
  };
  converge();
  new MutationObserver(converge).observe(document.body, { childList: true, subtree: true });
}
var PLUGIN_MANAGER_ACTIONS = [
  "安装",
  "卸载",
  "启用",
  "停用",
  "禁用",
  "更新",
  "升级",
  "重载",
  "Install",
  "Uninstall",
  "Enable",
  "Disable",
  "Update",
  "Reload"
];
function enforcePluginManagerReadOnly() {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  var mark = function() {
    var nodes = document.querySelectorAll("button, [role=button]");
    for (var i = 0; i < nodes.length; i++) {
      var element = nodes[i];
      if (element.closest(".dshua") !== null) continue;
      if (element.dataset.dshuaReadonly === "1") continue;
      var label = (element.textContent || "").trim();
      if (PLUGIN_MANAGER_ACTIONS.indexOf(label) === -1) continue;
      element.dataset.dshuaReadonly = "1";
      element.setAttribute("disabled", "disabled");
      element.setAttribute("aria-disabled", "true");
      element.setAttribute("title", "仅部署者可以安装、卸载或启停插件（服务端会拒绝该操作）");
      element.style.opacity = "0.5";
      element.style.pointerEvents = "none";
    }
  };
  mark();
  new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
}
function SharesPage() {
  var st = React.useState({ loaded: false, shared: [], usage: [], grants: [], error: "", selected: "" });
  var state = st[0], setState = st[1];
  var fm = React.useState({ label: "", model: "deepseek-chat", baseUrl: "", apiKey: "" });
  var form = fm[0], setForm = fm[1];
  var tk = React.useState({ busy: false, result: "" });
  var keyTest = tk[0], setKeyTest = tk[1];
  var gr = React.useState({ username: "" });
  var grant = gr[0], setGrant = gr[1];
  function refresh(pick) {
    Promise.all([rpc("shareOwn", {}), rpc("shareUsage", {}), rpc("shareGrants", {})]).then(function(r) {
      var shared = r[0].shared || [];
      setState(function(prev) {
        var selected = pick !== void 0 ? pick : prev.selected;
        if (selected === "" && shared.length > 0) selected = shared[0].profileId;
        return { loaded: true, shared, usage: r[1].usage || [], grants: r[2].grants || [], error: "", selected };
      });
    }).catch(function(e) {
      setState(function(prev) {
        return { ...prev, loaded: true, error: errText(e) };
      });
    });
  }
  React.useEffect(function() {
    refresh();
  }, []);
  function act(method, body, pick) {
    rpc(method, body).then(function() {
      refresh(pick);
    }).catch(function(e) {
      setState(function(prev) {
        return { ...prev, error: errText(e) };
      });
    });
  }
  function checkKey() {
    setKeyTest({ busy: true, result: "" });
    rpc("profileTestKey", { apiKey: form.apiKey, baseUrl: form.baseUrl }).then(function(j) {
      var b = j.balance || {};
      setKeyTest({ busy: false, result: "✔ Key 可用，余额 " + (b.currency || "CNY") + " " + String(b.total) });
    }).catch(function(e) {
      setKeyTest({ busy: false, result: "✘ " + errText(e) });
    });
  }
  function granteesOf(profileId) {
    var rows = [];
    state.grants.forEach(function(entry) {
      if ((entry.profileIds || []).indexOf(profileId) !== -1) rows.push(entry);
    });
    return rows;
  }
  function usageOf(profileId) {
    var rows = state.usage.filter(function(u) {
      return u.profileId === profileId;
    });
    if (rows.length === 0) return "暂无用量";
    return rows.map(function(u) {
      return String(u.targetUid).slice(0, 8) + ": " + u.calls + " 次 / " + u.tokens + " tokens";
    }).join("；");
  }
  var children = [];
  children.push(React.createElement("h2", null, t("shares.title")));
  children.push(React.createElement(
    "div",
    { style: { color: "var(--dsw-alias-label-secondary)", fontSize: 13, lineHeight: "20px", marginBottom: 12 } },
    "把你的模型分享给指定用户：对方可以选用并查看余额，但看不到你的 API Key；撤销后立即失效。"
  ));
  if (state.error !== "") {
    children.push(React.createElement("div", { style: { color: "var(--dsw-alias-label-error, #ff6b6b)", marginBottom: 10 } }, state.error));
  }
  children.push(React.createElement(
    "div",
    { key: "new", className: "fields" },
    React.createElement(
      "div",
      { className: "field" },
      React.createElement("label", null, "分享名称"),
      React.createElement("input", { placeholder: "例如：共享 DeepSeek", value: form.label, onChange: function(e) {
        setForm({ ...form, label: e.target.value });
      } })
    ),
    React.createElement(
      "div",
      { className: "field" },
      React.createElement("label", null, t("shares.fieldModel")),
      React.createElement("input", { placeholder: "deepseek-chat", value: form.model, onChange: function(e) {
        setForm({ ...form, model: e.target.value });
      } })
    ),
    React.createElement(
      "div",
      { className: "field" },
      React.createElement("label", null, "baseURL（留空用官方地址）"),
      React.createElement("input", { placeholder: "https://api.deepseek.com", value: form.baseUrl, onChange: function(e) {
        setForm({ ...form, baseUrl: e.target.value });
      } })
    ),
    React.createElement(
      "div",
      { className: "field" },
      React.createElement("label", null, "API Key"),
      React.createElement("input", { type: "password", placeholder: "sk-…", value: form.apiKey, onChange: function(e) {
        setForm({ ...form, apiKey: e.target.value });
      } })
    )
  ));
  children.push(React.createElement(
    "div",
    { key: "new-actions", className: "actions", style: { margin: "0 0 10px" } },
    React.createElement("button", { onClick: checkKey, disabled: form.apiKey === "" || keyTest.busy }, keyTest.busy ? "检查中…" : "检查 Key"),
    React.createElement("button", {
      disabled: form.model === "" || form.apiKey === "",
      onClick: function() {
        act("shareCreate", { label: form.label, provider: "deepseek", model: form.model, baseUrl: form.baseUrl, apiKey: form.apiKey });
        setForm({ label: "", model: "deepseek-chat", baseUrl: "", apiKey: "" });
        setKeyTest({ busy: false, result: "" });
      }
    }, t("shares.create"))
  ));
  if (keyTest.result !== "") {
    children.push(React.createElement("div", { key: "keytest", style: { fontSize: 12, marginBottom: 10, color: "var(--dsw-alias-label-secondary)" } }, keyTest.result));
  }
  if (state.shared.length > 0) {
    children.push(React.createElement(
      "div",
      { key: "picker", style: { display: "flex", gap: 8, alignItems: "center", margin: "6px 0 12px" } },
      React.createElement("span", { style: { whiteSpace: "nowrap" } }, "分享的 API Key："),
      React.createElement("select", {
        value: state.selected,
        "aria-label": "选择分享的 API Key",
        onChange: function(e) {
          setState(function(prev) {
            return { ...prev, selected: e.target.value };
          });
        }
      }, state.shared.map(function(p) {
        return React.createElement("option", { key: p.profileId, value: p.profileId }, (p.label || "分享") + " · " + p.model);
      }))
    ));
  }
  state.shared.forEach(function(p) {
    if (p.profileId !== state.selected) return;
    var rows = granteesOf(p.profileId);
    children.push(React.createElement(
      "div",
      { key: p.profileId, style: { borderTop: "1px solid var(--dsw-alias-border-l2)", paddingTop: 10 } },
      React.createElement("div", { style: { fontWeight: 600 } }, (p.label || "分享") + " · " + p.model),
      React.createElement("div", { style: { color: "var(--dsw-alias-label-secondary)", fontSize: 12, margin: "4px 0 8px" } }, "用量：" + usageOf(p.profileId)),
      React.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, t("shares.grantees")),
      rows.length === 0 ? React.createElement("div", { style: { color: "var(--dsw-alias-label-secondary)", fontSize: 12 } }, t("shares.noGrantees")) : React.createElement("div", null, rows.map(function(entry) {
        return React.createElement(
          "div",
          { key: entry.targetUid, style: { display: "flex", gap: 8, alignItems: "center", padding: "3px 0" } },
          React.createElement("span", null, entry.username),
          React.createElement("button", {
            onClick: function() {
              act("shareRevoke", { profileId: p.profileId, username: entry.username });
            }
          }, t("shares.revoke"))
        );
      })),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", marginTop: 8 } },
        React.createElement("input", {
          placeholder: t("shares.grantPlaceholder"),
          value: grant.username,
          onChange: function(e) {
            setGrant({ username: e.target.value });
          }
        }),
        React.createElement("button", {
          disabled: grant.username === "",
          onClick: function() {
            act("shareGrant", { profileId: p.profileId, username: grant.username }, p.profileId);
            setGrant({ username: "" });
          }
        }, t("shares.grant"))
      )
    ));
  });
  if (state.loaded && state.shared.length === 0) {
    children.push(React.createElement("div", { key: "empty", style: { color: "var(--dsw-alias-label-secondary)" } }, t("shares.empty")));
  }
  return React.createElement("div", { className: "dshua" }, React.createElement("div", { className: "card" }, children));
}
function showTotpReminder() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dshua-totp-reminder") !== null) return;
  try {
    if (sessionStorage.getItem("dshua-totp-reminded") === "1") return;
  } catch (e) {
  }
  var overlay = document.createElement("div");
  overlay.id = "dshua-totp-reminder";
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:2147483000";
  var card = document.createElement("div");
  card.style.cssText = "width:420px;max-width:calc(100vw - 40px);background:var(--dsw-alias-bg-layer-2,#171a21);border:1px solid var(--dsw-alias-border-l2,#2a2f3a);border-radius:12px;padding:24px;color:var(--dsw-alias-label-primary,#e6e6e6);font-family:system-ui,sans-serif;font-size:14px;box-shadow:0 12px 40px rgba(0,0,0,.45)";
  var title = document.createElement("div");
  title.textContent = "建议开启两步验证";
  title.style.cssText = "font-size:16px;font-weight:700;margin-bottom:10px";
  var body = document.createElement("div");
  body.textContent = "为增强账号安全，建议在【设置】→【用户管理】中添加登录因子：TOTP 动态码令牌（Google Authenticator / Microsoft Authenticator 等）或通行密钥（指纹 / 面容 / 设备 PIN）。也可以永久忽略此提醒。";
  body.style.cssText = "color:var(--dsw-alias-label-secondary,#aab2c3);line-height:22px;margin-bottom:18px";
  var row = document.createElement("div");
  row.style.cssText = "display:flex;gap:10px;justify-content:flex-end";
  function close() {
    try {
      overlay.remove();
    } catch (e) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
  }
  var later = document.createElement("button");
  later.textContent = "稍后再说";
  later.style.cssText = "padding:8px 14px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit";
  later.addEventListener("click", close);
  var ignore = document.createElement("button");
  ignore.textContent = "永久忽略";
  ignore.style.cssText = "padding:8px 14px;border-radius:7px;border:0;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);cursor:pointer;font:inherit";
  ignore.addEventListener("click", function() {
    rpc("totpIgnore", { ignore: true }).catch(function() {
    });
    close();
  });
  row.appendChild(later);
  row.appendChild(ignore);
  card.appendChild(title);
  card.appendChild(body);
  card.appendChild(row);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  try {
    sessionStorage.setItem("dshua-totp-reminded", "1");
  } catch (e) {
  }
}
exports.name = "dsh-ui-auth";
var localeTick = [];
function notifyLocaleChange() {
  localeTick.slice().forEach(function(listener) {
    listener();
  });
}
var t = function(key, params) {
  return message(normalizeLocale(typeof document !== "undefined" ? document.documentElement.lang : "zh"), key, params);
};
var activeLocale = "zh";
var localeRef;
var TRANSLATED_ATTRS = ["placeholder", "aria-label", "title"];
var textOriginals = /* @__PURE__ */ new WeakMap();
var attrOriginals = /* @__PURE__ */ new WeakMap();
function translateInside(root) {
  if (typeof document === "undefined" || typeof NodeFilter === "undefined") return;
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  var node = walker.nextNode();
  while (node !== null) {
    var original = textOriginals.get(node);
    if (original === void 0) {
      original = node.nodeValue ?? "";
      textOriginals.set(node, original);
    }
    var next = activeLocale === "en" ? translatePhrase("en", original) : original;
    if (node.nodeValue !== next) node.nodeValue = next;
    node = walker.nextNode();
  }
  var element = root;
  if (typeof element.querySelectorAll !== "function") return;
  var fields = element.querySelectorAll("[placeholder],[aria-label],[title]");
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var store = attrOriginals.get(field) ?? {};
    for (var j = 0; j < TRANSLATED_ATTRS.length; j++) {
      var name = TRANSLATED_ATTRS[j];
      if (typeof field.getAttribute !== "function" || !field.hasAttribute(name)) continue;
      if (store[name] === void 0) store[name] = field.getAttribute(name) ?? "";
      var value = activeLocale === "en" ? translatePhrase("en", store[name]) : store[name];
      if (field.getAttribute(name) !== value) field.setAttribute(name, value);
    }
    attrOriginals.set(field, store);
  }
}
function translateOurDom() {
  if (typeof document === "undefined") return;
  try {
    activeLocale = detectLocale();
  } catch (error) {
  }
  var roots = document.querySelectorAll(".dshua, [role=dialog]");
  for (var i = 0; i < roots.length; i++) translateInside(roots[i]);
}
function installLocaleObserver() {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  var attach = function() {
    if (document.body === null || document.body === void 0) {
      setTimeout(attach, 200);
      return;
    }
    new MutationObserver(function() {
      translateOurDom();
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    translateOurDom();
  };
  attach();
}
function detectLocale() {
  try {
    if (t("models.title") === message("en", "models.title")) return "en";
    if (t("models.title") === message("zh", "models.title")) return "zh";
  } catch (error) {
  }
  try {
    var snapshot = localeRef?.getSnapshot?.();
    var active = snapshot === void 0 || snapshot === null ? "" : String(snapshot.active ?? "");
    if (active !== "") return normalizeLocale(active);
  } catch (error) {
  }
  try {
    var tag = typeof document !== "undefined" ? document.documentElement.lang : "";
    if (tag !== "") return normalizeLocale(tag);
  } catch (error) {
  }
  return "zh";
}
function refreshLocale() {
  try {
    activeLocale = detectLocale();
    translateOurDom();
  } catch (error) {
  }
}
exports.inject = ["slots"];
exports.apply = function apply(ctx) {
  const localeService = ctx.get("locale");
  localeRef = localeService;
  const register = localeService?.register;
  const bind = localeService?.bind;
  const effect = ctx.effect;
  if (register !== void 0 && bind !== void 0 && effect !== void 0) {
    effect(function() {
      return register("dsh-ui-auth", dictionaries());
    });
    t = bind("dsh-ui-auth");
  }
  refreshLocale();
  installLocaleObserver();
  if (typeof ctx.on === "function") {
    ctx.on("locale/change", function() {
      refreshLocale();
      notifyLocaleChange();
    });
  }
  injectAuthCss();
  mountSettings(ctx, 0);
};
function mountSettings(ctx, attempt) {
  var slots = ctx.get("slots");
  if (slots === void 0) {
    if (attempt < 40) {
      setTimeout(function() {
        mountSettings(ctx, attempt + 1);
      }, 250);
      return;
    }
    console.error("[dsh-ui-auth] slots 服务不可用：设置面板「用户管理」未能注册");
    return;
  }
  slots.inject("settings.section", function() {
    return slots.register(
      { name: "settings.section", id: "auth-users", order: 30, label: function() {
        return "用户管理";
      } },
      function() {
        return React.createElement(AuthUsersPage);
      }
    );
  });
  rpc("me", {}).then(function(j) {
    if (j.me !== void 0 && j.me.role !== "admin") {
      slots.inject("settings.section", function() {
        return slots.register(
          { name: "settings.section", id: "models", order: 10, priority: -1, label: function() {
            return t("models.title");
          } },
          function() {
            return React.createElement(UserModelsPage);
          }
        );
      });
      dedupeSettingsNav("models.title");
    }
    if (j.me !== void 0 && j.me.role === "admin") {
      slots.inject("settings.section", function() {
        return slots.register(
          { name: "settings.section", id: "auth-shares", order: 31, label: function() {
            return t("shares.title");
          } },
          function() {
            return React.createElement(SharesPage);
          }
        );
      });
    }
    if (j.me !== void 0 && j.me.role !== "admin") {
      enforcePluginManagerReadOnly();
    }
    if (j.me !== void 0 && j.me.totpEnabled !== true && (j.me.passkeyCount || 0) === 0 && j.me.totpIgnore !== true) {
      setTimeout(showTotpReminder, 600);
    }
  }).catch(function(e) {
  });
}

    return module.exports
    })()

    /* 测试钩子：两半的 __* 全量合并（两套冒烟测试的唯一入口） */
    Object.assign(module.exports, __wallHalf, __bootHalf)

    /* 受管入口：ModuleLoader 只会调这一个 apply。
       壁纸半侧先起（它只碰 DOM + HTTP，不依赖 slots），坏了也不能影响开机动画；
       开机动画半侧其次，它的 inject: [slots] 是设置页要的契约；
       认证半侧最后起（用户管理 / 模型 / 分享管理三块设置页），失败只记日志。 */
    module.exports.apply = function (ctx) {
      try { __wallHalf.apply(ctx) } catch (e) {
        try { console.warn("[dsh-boot-suite] 聊天壁纸半侧启动失败，已跳过：", String((e && e.message) || e)) } catch (e2) { /* noop */ }
      }
      var __ret
      try { __ret = __bootHalf.apply(ctx) } catch (e) {
        try { console.warn("[dsh-boot-suite] 开机动画半侧启动失败：", String((e && e.stack) || e)) } catch (e2) { /* noop */ }
      }
      try { __authHalf.apply(ctx) } catch (e) {
        try { console.warn("[dsh-boot-suite] 认证半侧启动失败：", String((e && e.stack) || e)) } catch (e2) { /* noop */ }
      }
      return __ret
    }
    module.exports.inject = __bootHalf.inject

    return module.exports
  }
})
