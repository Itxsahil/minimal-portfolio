import { EInkReader } from '@/components/eink/eink-reader';
import { einkFontVariables } from '@/components/eink/fonts';
import {
  DEFAULT_PROFILE,
  FONT_SIZE,
  PROFILES
} from '@/components/eink/profiles';

// Painted before first paint so a reader who left the mode on does not get a
// flash of the normal site on every article.
const noFlashScript = `(function(){try{
var seg=location.pathname.replace(/\\/+$/,'').split('/').filter(Boolean);
if(seg.length!==2||seg[0]!=='b')return;
var s=JSON.parse(localStorage.getItem('eink-reader')||'{}');
if(s.active!==true)return;
var P=${JSON.stringify(
  Object.fromEntries(
    PROFILES.map((p) => [p.id, { bg: p.bg, ink: p.ink }])
  )
)};
var p=P[s.profile]||P[${JSON.stringify(DEFAULT_PROFILE)}];
var n=typeof s.fontSize==='number'?Math.min(${FONT_SIZE.max},Math.max(${FONT_SIZE.min},s.fontSize)):${FONT_SIZE.default};
var r=document.documentElement;
r.setAttribute('data-eink','on');
r.setAttribute('data-eink-profile',P[s.profile]?s.profile:${JSON.stringify(DEFAULT_PROFILE)});
r.setAttribute('data-eink-dropcap',s.dropCap===true?'on':'off');
r.setAttribute('data-eink-amber',s.amber===false?'off':'on');
r.style.setProperty('--eink-bg',p.bg);
r.style.setProperty('--eink-ink',p.ink);
r.style.setProperty('--eink-size',n+'px');
}catch(e){}})();`;

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      <EInkReader fontClassName={einkFontVariables}>{children}</EInkReader>
    </>
  );
}
