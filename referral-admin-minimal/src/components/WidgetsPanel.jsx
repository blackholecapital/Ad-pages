import React, { useMemo, useState } from 'react'
import '../styles/Card.css'
import '../styles/WidgetsPanel.css'
import WidgetA from './widgets/WidgetA.jsx'
import WidgetB from './widgets/WidgetB.jsx'
import WidgetC from './widgets/WidgetC.jsx'

export default function WidgetsPanel(){
  const [style, setStyle] = useState('A')
  const Embed = useMemo(()=> style==='A'?<WidgetA/>: style==='B'?<WidgetB/>:<WidgetC/>, [style])
  const iframeCode = `<iframe src="https://YOURDOMAIN/widget-${style.toLowerCase()}" style="width:100%;max-width:520px;height:260px;border:0;"></iframe>`
  return (
    <div className="mm-wGrid">
      <div className="mm-card"><div className="mm-cardInner">
        <div className="mm-subhdr"><div className="mm-subhdrLeft"><div className="mm-star">*** EMBED WIDGET STYLES (x3) ***</div><div className="mm-rule"/></div><div className="mm-label">SELECT</div></div>
        <div className="mm-wPick">
          <button className={style==='A'?'mm-pill mm-pillOn':'mm-pill'} onClick={()=>setStyle('A')}>STYLE A</button>
          <button className={style==='B'?'mm-pill mm-pillOn':'mm-pill'} onClick={()=>setStyle('B')}>STYLE B</button>
          <button className={style==='C'?'mm-pill mm-pillOn':'mm-pill'} onClick={()=>setStyle('C')}>STYLE C</button>
        </div>
        <div className="mm-wPreview">{Embed}</div>
      </div></div>

      <div className="mm-card"><div className="mm-cardInner">
        <div className="mm-subhdr"><div className="mm-subhdrLeft"><div className="mm-star">*** EMBED SNIPPET (IFRAME) ***</div><div className="mm-rule"/></div><div className="mm-label">B2B DROP-IN</div></div>
        <div className="mm-label">Snippet</div>
        <textarea className="mm-textarea" value={iframeCode} readOnly />
        <div className="mm-hint mm-top10">Replace <span className="mm-mono">YOURDOMAIN</span> with your Cloudflare Pages domain.</div>
      </div></div>
    </div>
  )
}
