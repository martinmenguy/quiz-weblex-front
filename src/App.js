import { useState, useEffect, useRef } from "react";

const NAVY  = "#1B3A6B";
const TEAL  = "#4ECDC4";
const TEAL2 = "#3DBDB4";
const WHITE = "#FFFFFF";
const GRAD  = "linear-gradient(135deg,#1B3A6B 0%,#2A5298 60%,#4ECDC4 100%)";

const C = {
  bg:"#F5F7FA", surface:"#FFFFFF", border:"#E2E8F0", borderMed:"#CBD5E0",
  text:NAVY, muted:"#4A6280", faint:"#8FA3BC", accentFg:"#FFFFFF",
  sand:"#EBF4FF", sandDark:"#D6E8FF",
  green:"#1A5C38", greenBg:"#EBF5EE", greenBorder:"#A8D5B8",
  red:"#C0392B",   redBg:"#FEF2F2",   redBorder:"#FECACA",
  gold:"#92400E",  goldBg:"#FFFBEB",  goldBorder:"#FDE68A",
  teal:TEAL, tealBg:"#E6FAF9", tealBorder:"#9EEAE6",
};

const DOMAINS = [
  { id:"fiscal",      label:"Droit fiscal",      color:NAVY, bg:"#EBF4FF", border:"#BFD7FF" },
  { id:"social",      label:"Droit social",       color:NAVY, bg:"#E6FAF9", border:"#9EEAE6" },
  { id:"affaires",    label:"Droit des affaires", color:NAVY, bg:"#EBF4FF", border:"#BFD7FF" },
  { id:"patrimonial", label:"Droit patrimonial",  color:NAVY, bg:"#E6FAF9", border:"#9EEAE6" },
];

const DOMAIN_SCORES = { fiscal:72, social:58, affaires:65, patrimonial:40 };

const CABINET_SIZES = [
  { id:"xs", label:"— de 15 collaborateurs",  max:15       },
  { id:"sm", label:"— de 100 collaborateurs", max:100      },
  { id:"md", label:"— de 500 collaborateurs", max:500      },
  { id:"lg", label:"+ de 500 collaborateurs", max:Infinity },
];

const RESOURCES = {
  tva2024:         { type:"webinaire", label:"TVA — Actualité 2024",                 date:"Jan. 2025", url:"#", domain:"fiscal",      description:"Tour d'horizon complet de l'actualité TVA : taux, exonérations, jurisprudence récente et cas pratiques." },
  rgpdGuide:       { type:"support",   label:"Guide pratique RGPD",                  date:"Fév. 2025", url:"#", domain:"social",      description:"Les obligations sociales en entreprise : registre de traitement, DPO, droits des personnes, sanctions." },
  ebitdaPano:      { type:"panorama",  label:"Panorama indicateurs financiers",       date:"Déc. 2024", url:"#", domain:"affaires",    description:"Panorama des indicateurs financiers clés : EBITDA, EBE, résultat net, cash-flow." },
  paieActu:        { type:"webinaire", label:"Webinaire paie & RH — Loi Travail",    date:"Mars 2025", url:"#", domain:"social",      description:"Actualité paie & RH : obligations de conservation, bulletins dématérialisés, loi Travail." },
  bilanTuto:       { type:"support",   label:"Comprendre le bilan comptable",         date:"Nov. 2024", url:"#", domain:"affaires",    description:"Comprendre la structure d'un bilan comptable : actif, passif, équilibre et lecture pratique." },
  preavisRH:       { type:"panorama",  label:"Panorama droit social 2025",            date:"Fév. 2025", url:"#", domain:"social",      description:"Synthèse du droit social 2025 : préavis, rupture conventionnelle, période d'essai, licenciement." },
  csgActu:         { type:"webinaire", label:"Prélèvements sociaux — point d'étape", date:"Jan. 2025", url:"#", domain:"fiscal",      description:"Point d'étape sur les prélèvements sociaux : CSG, CRDS, taux applicables et assiettes de calcul." },
  successionGuide: { type:"support",   label:"Guide successions & donations",         date:"Oct. 2024", url:"#", domain:"patrimonial", description:"Les règles essentielles en matière de successions, donations et fiscalité du patrimoine." },
};

const TYPE_META = {
  webinaire: { color:NAVY, bg:"#EBF4FF", border:"#BFD7FF", icon:"▶", label:"Webinaire" },
  support:   { color:TEAL, bg:"#E6FAF9", border:"#9EEAE6", icon:"↓", label:"Support"   },
  panorama:  { color:NAVY, bg:"#EBF4FF", border:"#BFD7FF", icon:"◎", label:"Panorama"  },
};

const ACTIVE_Q = [
  { id:1,  text:"Quel est le taux de TVA standard en France ?",                                                        domain:"fiscal",      options:["18 %","19,6 %","20 %","21 %"],                                                                                        answer:2, points:10, explanation:"Le taux standard de TVA est de 20 % depuis le 1er janvier 2014.", resources:["tva2024"],         optionNotes:["N'a jamais existé en France.","Ancien taux jusqu'en 2013.","✓ Taux actuel.","Taux belge."] },
  { id:2,  text:"Quel impôt finance principalement la Sécurité sociale ?",                                              domain:"fiscal",      options:["IR","IS","CSG","TVA"],                                                                                                 answer:2, points:10, explanation:"La CSG est le premier prélèvement obligatoire français en volume.", resources:["csgActu"],         optionNotes:["Finance le budget de l'État.","Finance le budget de l'État.","✓ Créée en 1991.","Finance l'État et partiellement la Sécu."] },
  { id:3,  text:"Durée légale de conservation des bulletins de salaire ?",                                              domain:"social",      options:["3 ans","5 ans","Durée illimitée","10 ans"],                                                                            answer:2, points:10, explanation:"Depuis la loi Travail de 2016, conservation sans limitation de durée.", resources:["paieActu"],        optionNotes:["Délai de prescription.","Délai pour documents comptables.","✓ Illimitée depuis la loi El Khomri.","Certains documents fiscaux."] },
  { id:4,  text:"Quel est le délai légal de préavis pour un cadre en CDI ?",                                            domain:"social",      options:["1 mois","2 mois","3 mois","6 mois"],                                                                                   answer:2, points:10, explanation:"Le préavis légal pour un cadre en CDI est de 3 mois.", resources:["preavisRH"],       optionNotes:["Non-cadres avec moins de 2 ans.","Agents de maîtrise.","✓ Délai légal pour les cadres.","Possible contractuellement, pas légal."] },
  { id:5,  text:"De quoi est composé un bilan comptable ?",                                                             domain:"affaires",    options:["Charges et produits","Actif et passif","Recettes et dépenses","Capital et emprunts"],                                    answer:1, points:10, explanation:"Le bilan présente l'actif (ce que possède l'entreprise) et le passif (ce qu'elle doit).", resources:["bilanTuto"],       optionNotes:["= compte de résultat.","✓ Structure du bilan.","= trésorerie.","= composantes du passif uniquement."] },
  { id:6,  text:"Que signifie l'acronyme EBITDA ?",                                                                     domain:"affaires",    options:["Excédent Brut Indicatif","Earnings Before Interest, Taxes, Depreciation and Amortization","Estimation du Bénéfice","Aucune"], answer:1, points:10, explanation:"L'EBITDA mesure la performance opérationnelle avant financement, fiscalité et amortissements.", resources:["ebitdaPano"], optionNotes:["Traduction inventée.","✓ Définition exacte. En français : EBE.","Paraphrase incorrecte.","La bonne réponse est B."] },
  { id:7,  text:"Quel est le délai de prescription de l'action en paiement des salaires ?",                             domain:"social",      options:["1 an","2 ans","3 ans","5 ans"],                                                                                        answer:2, points:10, explanation:"L'action en paiement des salaires se prescrit par 3 ans (art. L3245-1 du Code du travail).", resources:["preavisRH"],  optionNotes:["Trop court.","Certains litiges commerciaux.","✓ Art. L3245-1 du Code du travail.","Prescription de droit commun."] },
  { id:8,  text:"Quelle réglementation encadre la protection des données personnelles en Europe ?",                     domain:"fiscal",      options:["CCPA","RGPD","HIPAA","SOX"],                                                                                           answer:1, points:10, explanation:"Le RGPD est entré en vigueur le 25 mai 2018.", resources:["rgpdGuide"],       optionNotes:["Loi californienne.","✓ Règlement européen depuis mai 2018.","Loi américaine santé.","Gouvernance financière US."] },
  { id:9,  text:"En droit des affaires, que désigne la notion de 'capital social' ?",                                   domain:"affaires",    options:["Les bénéfices de la société","Les apports des associés à la création","La valeur boursière de l'entreprise","Le chiffre d'affaires annuel"], answer:1, points:10, explanation:"Le capital social représente l'ensemble des apports réalisés par les associés lors de la constitution.", resources:["bilanTuto"], optionNotes:["Ce sont les résultats, pas le capital.","✓ Apports des associés à la création.","Valeur de marché, distincte du capital.","Indicateur d'activité."] },
  { id:10, text:"En droit patrimonial, quel est l'abattement fiscal applicable entre parents et enfants pour une donation ?", domain:"patrimonial", options:["50 000 €","80 000 €","100 000 €","150 000 €"], answer:2, points:10, explanation:"L'abattement entre parents et enfants est de 100 000 € par parent et par enfant, renouvelable tous les 15 ans.", resources:["successionGuide"], optionNotes:["Montant insuffisant.","Abattement grands-parents/petits-enfants.","✓ 100 000 € par parent/enfant, tous les 15 ans.","Abattement inexistant à ce niveau."] },
];

const MAX_PTS = 100;

const ALL_PLAYERS = [
  { name:"Sophie Martin",   co:"Nexia Paris",   coIdx:0, initials:"SM", cabinetSize:"sm" },
  { name:"Thomas Lebrun",   co:"EY France",     coIdx:1, initials:"TL", cabinetSize:"lg" },
  { name:"Camille Dupont",  co:"KPMG Lyon",     coIdx:2, initials:"CD", cabinetSize:"md" },
  { name:"Marc Fontaine",   co:"Nexia Paris",   coIdx:0, initials:"MF", cabinetSize:"sm" },
  { name:"Julie Bernard",   co:"Deloitte",      coIdx:3, initials:"JB", cabinetSize:"lg" },
  { name:"Antoine Roux",    co:"EY France",     coIdx:1, initials:"AR", cabinetSize:"lg" },
  { name:"Léa Moreau",      co:"KPMG Lyon",     coIdx:2, initials:"LM", cabinetSize:"md" },
  { name:"Pierre Duval",    co:"Cab. Duval",    coIdx:3, initials:"PD", cabinetSize:"xs" },
  { name:"Emma Blanchard",  co:"BDO France",    coIdx:4, initials:"EB", cabinetSize:"md" },
  { name:"Lucas Girard",    co:"Cab. Duval",    coIdx:3, initials:"LG", cabinetSize:"xs" },
];

const QUIZ_SCORES  = { "S.12":[90,80,100,70,90,60,80,100,70,60], "S.11":[80,70,90,60,80,50,70,80,90,50], "S.10":[70,90,80,80,60,90,60,70,60,80], "S.9":[100,60,70,90,70,80,50,60,80,70], "S.8":[80,80,60,100,50,70,90,80,50,90], "S.7":[60,100,80,70,60,80,50,90,70,80] };
const QUIZ_TIMES   = [42,55,38,61,44,70,88,35,67,78];
const QUIZ_CORRECT = [9,8,10,7,9,6,8,10,7,6];

function buildQuizRanking(week, sz) {
  var sc = QUIZ_SCORES[week] || QUIZ_SCORES["S.12"];
  var pl = sz && sz !== "all" ? ALL_PLAYERS.filter(function(p){ return p.cabinetSize === sz; }) : ALL_PLAYERS;
  return pl
    .map(function(p){ var i = ALL_PLAYERS.indexOf(p); return Object.assign({}, p, { score:sc[i], time:QUIZ_TIMES[i], correct:QUIZ_CORRECT[i] }); })
    .sort(function(a,b){ return b.correct !== a.correct ? b.correct - a.correct : a.time - b.time; })
    .map(function(p,i){ return Object.assign({}, p, { rank:i+1 }); });
}

function buildPeriodRanking(weeks, sz) {
  var pl = sz && sz !== "all" ? ALL_PLAYERS.filter(function(p){ return p.cabinetSize === sz; }) : ALL_PLAYERS;
  return pl
    .map(function(p){ var i = ALL_PLAYERS.indexOf(p); var tot = weeks.reduce(function(a,w){ return a + (QUIZ_SCORES[w] ? QUIZ_SCORES[w][i] : 0); }, 0); return Object.assign({}, p, { score:tot, played:weeks.length, correct:QUIZ_CORRECT[i]*weeks.length }); })
    .sort(function(a,b){ return b.score - a.score || b.correct - a.correct; })
    .map(function(p,i){ return Object.assign({}, p, { rank:i+1 }); });
}

const coColors = [NAVY, "#2A5298", "#1A7A74", "#2C4770", "#1B5E56"];
const coLight  = ["#EBF4FF","#EBF0FA","#E6FAF9","#E8EFF8","#E6F5F3"];
const fmt      = function(t){ return String(Math.floor(t/60)).padStart(2,"0") + ":" + String(t%60).padStart(2,"0"); };
const domainOf = function(id){ return DOMAINS.find(function(d){ return d.id === id; }) || DOMAINS[0]; };

const css = `
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.fu{animation:fadeUp 0.3s ease both}
.rh:hover{background:#F0F7FF !important}
.ob:hover:not(:disabled){border-color:#1B3A6B !important;background:#EBF4FF !important}
.nb:hover{background:#EBF4FF !important}
`;

// ── ATOMS ─────────────────────────────────────────────────────────────────

function Chip(p) {
  return <span style={Object.assign({ fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", padding:"4px 10px", borderRadius:20, background:p.bg||C.sand, color:p.color||C.muted, border:"1px solid "+(p.border||C.border) }, p.style||{})}>{p.children}</span>;
}

function Avatar(p) {
  var s = p.size || 32;
  return <div style={{ width:s, height:s, borderRadius:"50%", background:coLight[p.idx%5], border:"2px solid "+coColors[p.idx%5]+"50", display:"flex", alignItems:"center", justifyContent:"center", fontSize:Math.round(s*.33), fontWeight:700, color:coColors[p.idx%5], flexShrink:0 }}>{p.initials}</div>;
}

function Bar(p) {
  var h = p.h || 4;
  return <div style={{ flex:1, height:h, borderRadius:h, background:"#E2E8F0", overflow:"hidden" }}><div style={{ height:"100%", borderRadius:h, background:p.color||TEAL, width:Math.round(p.value/p.max*100)+"%", transition:"width 0.7s ease" }}/></div>;
}

function DTag(p) {
  var d = domainOf(p.id);
  return <Chip color={d.color} bg={d.bg} border={d.border}>{d.label}</Chip>;
}

function TealBtn(p) {
  return <button onClick={p.onClick} disabled={p.disabled} style={Object.assign({ padding:"11px 28px", borderRadius:30, border:"none", background:TEAL, color:WHITE, fontSize:14, fontWeight:700, cursor:p.disabled?"not-allowed":"pointer", letterSpacing:"0.02em", transition:"opacity .2s", opacity:p.disabled?.6:1 }, p.style||{})}>{p.children}</button>;
}

function ResLinks(p) {
  var keys = p.keys || [];
  if(!keys.length) return null;
  return (
    <div style={{ marginBottom:16 }}>
      <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:C.faint, margin:"0 0 8px" }}>Ressources associées</p>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {keys.map(function(k){
          var r = RESOURCES[k]; if(!r) return null;
          var tm = TYPE_META[r.type];
          return (
            <a key={k} href={r.url} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:10, background:tm.bg, border:"1px solid "+tm.border, textDecoration:"none" }}>
              <span style={{ fontSize:14, fontWeight:700, color:tm.color, width:20, textAlign:"center", flexShrink:0 }}>{tm.icon}</span>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:13, fontWeight:700, color:tm.color, display:"block" }}>{r.label}</span>
                <span style={{ fontSize:11, color:C.faint }}>{tm.label} · {r.date}</span>
              </div>
              <span style={{ fontSize:18, color:tm.color, opacity:.6 }}>→</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ExplCard(p) {
  var openSt = useState(false); var isOpen = openSt[0]; var setOpen = openSt[1];
  var q = p.question, ua = p.userAnswer, correct = q.answer;
  return (
    <div style={{ marginTop:14, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden", boxShadow:"0 2px 8px rgba(27,58,107,.06)" }} className="fu">
      <button onClick={function(){ setOpen(function(v){ return !v; }); }}
        style={{ width:"100%", padding:"13px 18px", background:C.sand, border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, fontWeight:700, color:NAVY }}>Fiche explicative</span>
          <DTag id={q.domain}/>
        </div>
        <span style={{ fontSize:18, color:TEAL, fontWeight:700, transform:isOpen?"rotate(90deg)":"none", transition:"transform .2s", display:"inline-block" }}>›</span>
      </button>
      {isOpen && (
        <div style={{ padding:"18px 20px", background:WHITE }} className="fu">
          <p style={{ fontSize:14, lineHeight:1.7, color:NAVY, margin:"0 0 16px", borderLeft:"3px solid "+TEAL, paddingLeft:14 }}>{q.explanation}</p>
          <ResLinks keys={q.resources||[]}/>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:C.faint, margin:"0 0 10px" }}>Analyse des options</p>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {q.options.map(function(opt,i){
              var isOk = i===correct, isUser = i===ua;
              return (
                <div key={i} style={{ padding:"11px 14px", borderRadius:8, background:isOk?C.greenBg:isUser&&!isOk?C.redBg:C.bg, border:"1px solid "+(isOk?C.greenBorder:isUser&&!isOk?C.redBorder:C.border) }}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <span style={{ fontSize:12, fontWeight:700, color:isOk?C.green:isUser&&!isOk?C.red:C.faint, minWidth:18, marginTop:1 }}>{String.fromCharCode(65+i)}</span>
                    <div>
                      <span style={{ fontSize:13, fontWeight:isOk?700:400, color:isOk?C.green:NAVY, display:"block", marginBottom:3 }}>{opt}</span>
                      <span style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{q.optionNotes[i]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── QUIZ ──────────────────────────────────────────────────────────────────

function QuizScreen(p) {
  var phaseSt  = useState("intro"); var phase   = phaseSt[0];   var setPhase   = phaseSt[1];
  var qIdxSt   = useState(0);       var qIdx    = qIdxSt[0];    var setQIdx    = qIdxSt[1];
  var selSt    = useState(null);    var sel     = selSt[0];     var setSel     = selSt[1];
  var revSt    = useState(false);   var rev     = revSt[0];     var setRev     = revSt[1];
  var scoreSt  = useState(0);       var score   = scoreSt[0];   var setScore   = scoreSt[1];
  var elSt     = useState(0);       var elapsed = elSt[0];      var setElapsed = elSt[1];
  var ansSt    = useState([]);      var answers = ansSt[0];     var setAnswers = ansSt[1];
  var timer = useRef(null);

  useEffect(function(){
    if(phase === "playing") timer.current = setInterval(function(){ setElapsed(function(e){ return e+1; }); }, 1000);
    return function(){ clearInterval(timer.current); };
  }, [phase]);

  var q = ACTIVE_Q[qIdx], total = ACTIVE_Q.length;
  var correctCount = answers.filter(function(a){ return a.correct; }).length;

  function pick(i){
    if(rev) return;
    setSel(i); setRev(true);
    var ok = i === q.answer;
    if(ok) setScore(function(s){ return s + q.points; });
    setAnswers(function(a){ return a.concat([{ correct:ok, points:ok?q.points:0, selected:i }]); });
  }
  function next(){
    if(qIdx+1 < total){ setQIdx(function(n){ return n+1; }); setSel(null); setRev(false); }
    else{ clearInterval(timer.current); setPhase("result"); }
  }

  if(phase === "intro") return (
    <div style={{ maxWidth:620, margin:"0 auto", padding:"60px 24px" }} className="fu">
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ display:"inline-flex", gap:8, marginBottom:20 }}>
          <Chip color={C.green} bg={C.greenBg} border={C.greenBorder}>Semaine 12</Chip>
          <Chip>17 mars 2025</Chip>
        </div>
        <h1 style={{ fontSize:38, fontWeight:800, fontStyle:"italic", color:NAVY, margin:"0 0 14px", lineHeight:1.15 }}>Quiz<br/>hebdomadaire</h1>
        <p style={{ fontSize:16, color:C.muted, margin:"0 auto", maxWidth:440, lineHeight:1.6 }}>
          Testez vos connaissances en droit et en chiffre — <strong style={{ color:TEAL }}>10 questions, 100 points</strong>.
        </p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:32 }}>
        {[["10","Questions","par quiz"],["100","Points","maximum"],["Départage","Bonnes rép. + temps","en cas d'égalité"]].map(function(it){
          return <div key={it[0]} style={{ background:WHITE, border:"1px solid "+C.border, borderRadius:14, padding:"20px 16px", textAlign:"center", boxShadow:"0 2px 12px rgba(27,58,107,.06)" }}>
            <div style={{ fontSize:it[0]==="Départage"?15:30, fontWeight:800, color:NAVY, marginBottom:4, lineHeight:1.1 }}>{it[0]}</div>
            <div style={{ fontSize:13, fontWeight:600, color:TEAL, marginBottom:4 }}>{it[1]}</div>
            <div style={{ fontSize:11, color:C.faint }}>{it[2]}</div>
          </div>;
        })}
      </div>
      <div style={{ background:WHITE, border:"1px solid "+C.border, borderRadius:14, padding:"18px 22px", marginBottom:24, boxShadow:"0 2px 12px rgba(27,58,107,.06)" }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:C.faint, margin:"0 0 12px" }}>Thématiques du quiz</p>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {DOMAINS.map(function(d){ return <Chip key={d.id} color={d.color} bg={d.bg} border={d.border}>{d.label}</Chip>; })}
        </div>
      </div>
      <div style={{ background:WHITE, border:"1px solid "+C.border, borderRadius:14, padding:"18px 22px", marginBottom:32, boxShadow:"0 2px 12px rgba(27,58,107,.06)" }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:C.faint, margin:"0 0 6px" }}>Règle de départage</p>
        <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, margin:0 }}>En cas d'égalité de score, le classement est déterminé par le nombre de bonnes réponses, puis par le temps total de réponse.</p>
      </div>
      <div style={{ textAlign:"center" }}>
        <TealBtn onClick={function(){ setPhase("playing"); }}>Commencer le quiz →</TealBtn>
      </div>
    </div>
  );

  if(phase === "result"){
    var pct = Math.round(score/MAX_PTS*100);
    var cCount = answers.filter(function(a){ return a.correct; }).length;
    var lbl = pct===100?"Score parfait !":pct>=80?"Excellente performance":pct>=60?"Bon résultat":"Vous pouvez faire mieux";
    return (
      <div style={{ maxWidth:660, margin:"0 auto", padding:"48px 24px" }} className="fu">
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Chip color={C.green} bg={C.greenBg} border={C.greenBorder} style={{ marginBottom:14 }}>Résultats · Semaine 12</Chip>
          <h2 style={{ fontSize:32, fontWeight:800, fontStyle:"italic", color:NAVY, margin:"8px 0 4px" }}>{lbl}</h2>
          <p style={{ color:C.muted, fontSize:14, margin:0 }}>Terminé en {fmt(elapsed)}</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:C.border, borderRadius:14, overflow:"hidden", marginBottom:28, boxShadow:"0 2px 12px rgba(27,58,107,.06)" }}>
          {[["Score",score+"/"+MAX_PTS],["Bonnes rép.",cCount+"/"+total],["Temps",fmt(elapsed)],["Réussite",pct+" %"]].map(function(it){
            return <div key={it[0]} style={{ background:WHITE, padding:"18px 16px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:NAVY }}>{it[1]}</div>
              <div style={{ fontSize:11, color:C.faint, marginTop:4, letterSpacing:"0.05em", textTransform:"uppercase" }}>{it[0]}</div>
            </div>;
          })}
        </div>
        <div style={{ padding:"14px 18px", borderRadius:10, background:C.tealBg, border:"1px solid "+C.tealBorder, marginBottom:28, fontSize:13, color:C.muted }}>
          <strong style={{ color:NAVY }}>Règle de départage : </strong>
          {cCount} bonnes réponses · {fmt(elapsed)} — En cas d'égalité, les bonnes réponses priment, puis le temps départage.
        </div>
        <p style={{ fontSize:14, fontWeight:700, color:NAVY, margin:"0 0 14px" }}>Revue des questions</p>
        {ACTIVE_Q.map(function(question,i){
          var a = answers[i]; if(!a) return null;
          return (
            <div key={i} style={{ marginBottom:12, background:WHITE, border:"1px solid "+C.border, borderRadius:12, padding:"16px 18px", boxShadow:"0 1px 4px rgba(27,58,107,.05)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ flex:1, paddingRight:12 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:C.faint, marginRight:8, letterSpacing:"0.06em" }}>Q{i+1}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:NAVY }}>{question.text}</span>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <Chip color={a.correct?C.green:C.red} bg={a.correct?C.greenBg:C.redBg} border={a.correct?C.greenBorder:C.redBorder}>{a.correct?"Correct":"Incorrect"}</Chip>
                  <Chip color={C.gold} bg={C.goldBg} border={C.goldBorder}>+{a.points}</Chip>
                </div>
              </div>
              <ExplCard question={question} userAnswer={a.selected}/>
            </div>
          );
        })}
        <div style={{ textAlign:"center", paddingTop:20 }}>
          <TealBtn onClick={p.onDone}>Voir le classement →</TealBtn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"36px 24px" }} className="fu">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:12, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:C.faint }}>Question {qIdx+1} / {total}</span>
          <DTag id={q.domain}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontFamily:"ui-monospace,monospace", fontSize:15, fontWeight:700, color:NAVY }}>{fmt(elapsed)}</span>
          <Chip color={C.gold} bg={C.goldBg} border={C.goldBorder}>{q.points} pts</Chip>
        </div>
      </div>
      <div style={{ height:5, background:C.border, borderRadius:3, marginBottom:6 }}>
        <div style={{ height:"100%", borderRadius:3, background:GRAD, width:(qIdx/total*100)+"%", transition:"width 0.5s ease" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.faint, marginBottom:24 }}>
        <span>{correctCount} bonne{correctCount!==1?"s":""} réponse{correctCount!==1?"s":""}</span>
        <span>{score} pts</span>
      </div>
      <p style={{ fontSize:20, fontWeight:700, lineHeight:1.5, color:NAVY, margin:"0 0 24px" }}>{q.text}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {q.options.map(function(opt,i){
          var isSel = sel===i, isOk = i===q.answer;
          var bg=WHITE, bdr=C.border, color=NAVY, wt=400;
          if(isSel&&!rev){ bg=C.sand; bdr=NAVY; wt=600; }
          if(rev&&isOk){ bg=C.greenBg; bdr=C.green; color=C.green; wt=700; }
          if(rev&&isSel&&!isOk){ bg=C.redBg; bdr=C.red; color=C.red; }
          return (
            <button key={i} className="ob" disabled={rev} onClick={function(){ pick(i); }}
              style={{ width:"100%", padding:"14px 18px", borderRadius:10, border:"2px solid "+bdr, background:bg, color:color, cursor:rev?"default":"pointer", textAlign:"left", fontSize:14, fontWeight:wt, display:"flex", alignItems:"center", gap:14, transition:"all .18s", boxShadow:"0 1px 4px rgba(27,58,107,.06)" }}>
              <span style={{ width:28, height:28, borderRadius:"50%", background:rev&&isOk?C.green:rev&&isSel&&!isOk?C.red:isSel?NAVY:C.sand, color:isSel||(rev&&isOk)?"#fff":C.faint, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>
                {String.fromCharCode(65+i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {rev && (
        <div className="fu">
          <div style={{ marginTop:14, padding:"13px 18px", borderRadius:10, background:sel===q.answer?C.greenBg:C.redBg, border:"2px solid "+(sel===q.answer?C.greenBorder:C.redBorder) }}>
            <span style={{ fontSize:14, fontWeight:700, color:sel===q.answer?C.green:C.red }}>
              {sel===q.answer?"✓ Bonne réponse !":"✗ Incorrect — réponse attendue : "+q.options[q.answer]}
            </span>
          </div>
          <ExplCard question={q} userAnswer={sel}/>
          <div style={{ textAlign:"right", marginTop:16 }}>
            <TealBtn onClick={next} style={{ padding:"10px 24px", fontSize:13 }}>
              {qIdx+1<total?"Question suivante →":"Voir mes résultats →"}
            </TealBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────

function LeaderboardScreen() {
  var viewSt  = useState("quiz");    var view    = viewSt[0];    var setView    = viewSt[1];
  var scopeSt = useState("global"); var scope   = scopeSt[0];   var setScope   = scopeSt[1];
  var sizeSt  = useState("xs");     var selSize = sizeSt[0];    var setSelSize = sizeSt[1];
  var quizSt  = useState("S.12");   var selQuiz = quizSt[0];    var setSelQuiz = quizSt[1];
  var qtSt    = useState("T2");     var selQt   = qtSt[0];      var setSelQt   = qtSt[1];
  var liveSt  = useState(true);     var live    = liveSt[0];    var setLive    = liveSt[1];
  var dataSt  = useState(function(){ return buildQuizRanking("S.12", null); });
  var data    = dataSt[0]; var setData = dataSt[1];
  var tick    = useRef(null);
  var sf      = scope === "cabinet" ? selSize : null;

  useEffect(function(){
    clearInterval(tick.current);
    if(view !== "quiz" || !live) return;
    tick.current = setInterval(function(){
      setData(function(prev){
        var u = prev.map(function(p){ return Object.assign({}, p, { score:Math.min(MAX_PTS, p.score+(Math.random()>.9?10:0)) }); });
        return u.sort(function(a,b){ return b.correct!==a.correct ? b.correct-a.correct : a.time-b.time; }).map(function(p,i){ return Object.assign({}, p, { rank:i+1 }); });
      });
    }, 3500);
    return function(){ clearInterval(tick.current); };
  }, [view, live]);

  useEffect(function(){ setData(buildQuizRanking(selQuiz, sf)); }, [selQuiz, scope, selSize]);

  var QUARTERS = {
    "T1":{ label:"T1 — Jan · Fév · Mars", weeks:["S.7","S.8","S.9"] },
    "T2":{ label:"T2 — Avr · Mai · Juin", weeks:["S.10","S.11","S.12"] },
  };
  var QUIZ_LIST = ["S.12","S.11","S.10","S.9","S.8","S.7"];
  var ALL_WEEKS = ["S.7","S.8","S.9","S.10","S.11","S.12"];
  var qtData   = buildPeriodRanking(QUARTERS[selQt].weeks, sf);
  var yearData = buildPeriodRanking(ALL_WEEKS, sf);

  function Podium(pp){
    var d = pp.data;
    if(!d || !d.length) return <div style={{ textAlign:"center", padding:"32px", color:C.faint, fontSize:13 }}>Aucun participant dans cette catégorie</div>;
    return (
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:24 }}>
        {[d[1]||null, d[0]||null, d[2]||null].map(function(pl,idx){
          if(!pl) return <div key={idx}/>;
          var isFirst = pl.rank === 1;
          return (
            <div key={pl.initials} style={{ background:WHITE, border:"2px solid "+(isFirst?TEAL:C.border), borderRadius:16, padding:"24px 16px", textAlign:"center", position:"relative", marginTop:isFirst?0:20, boxShadow:isFirst?"0 4px 20px rgba(78,205,196,.2)":"0 2px 8px rgba(27,58,107,.06)" }}>
              {isFirst && <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:TEAL, color:WHITE, fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:20, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>1re place</div>}
              <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><Avatar initials={pl.initials} idx={pl.coIdx} size={44}/></div>
              <div style={{ fontSize:14, fontWeight:700, color:NAVY, marginBottom:2 }}>{pl.name}</div>
              <div style={{ fontSize:12, color:C.faint, marginBottom:14 }}>{pl.co}</div>
              <div style={{ fontSize:28, fontWeight:800, color:NAVY }}>{pl.score}</div>
              <div style={{ fontSize:12, color:TEAL, fontWeight:600, marginBottom:10 }}>{pp.sub(pl)}</div>
              <Chip color={NAVY} bg={C.sand} border={C.border}>{"#"+pl.rank}</Chip>
            </div>
          );
        })}
      </div>
    );
  }

  function Rows(pp){
    var d = pp.data; if(!d || d.length <= 3) return null;
    return (
      <div style={{ background:WHITE, border:"1px solid "+C.border, borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(27,58,107,.06)" }}>
        {d.slice(3).map(function(pl,i){
          return (
            <div key={pl.initials} className="rh" style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 20px", borderBottom:i<d.length-4?"1px solid "+C.border:"none", transition:"background .15s" }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.faint, minWidth:24, textAlign:"right" }}>{pl.rank}</span>
              <Avatar initials={pl.initials} idx={pl.coIdx} size={34}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:NAVY }}>{pl.name}</div>
                <div style={{ fontSize:11, color:C.faint }}>{pl.co}</div>
              </div>
              <Bar value={pl.score} max={pp.max} color={TEAL}/>
              <div style={{ textAlign:"right", minWidth:90 }}>
                <div style={{ fontSize:14, fontWeight:700, color:NAVY }}>{pl.score} pts</div>
                <div style={{ fontSize:11, color:C.faint }}>{pp.sub(pl)}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"48px 24px" }}>
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <h2 style={{ fontSize:30, fontWeight:800, fontStyle:"italic", color:NAVY, margin:"0 0 8px" }}>Classement</h2>
        <p style={{ fontSize:14, color:C.muted, margin:0 }}>Départage par bonnes réponses, puis par temps de réponse</p>
      </div>

      {/* SÉLECTEUR PÉRIODE */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:C.border, borderRadius:16, overflow:"hidden", marginBottom:24, boxShadow:"0 2px 12px rgba(27,58,107,.06)" }}>
        {[["quiz","Par quiz","Semaine par semaine"],["quarter","Par trimestre","Cumul sur 3 mois"],["year","Par année","Cumul annuel 2025"]].map(function(it){
          var active = view===it[0];
          return (
            <button key={it[0]} onClick={function(){ setView(it[0]); }}
              style={{ padding:"18px 12px", border:"none", cursor:"pointer", background:active?NAVY:WHITE, color:active?WHITE:C.muted, textAlign:"center", transition:"background .2s" }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{it[1]}</div>
              <div style={{ fontSize:11, opacity:.7 }}>{it[2]}</div>
            </button>
          );
        })}
      </div>

      {/* SÉLECTEUR SCOPE */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", gap:2, background:C.sand, padding:3, borderRadius:30 }}>
          {[["global","Tous les cabinets"],["cabinet","Par taille de cabinet"]].map(function(it){
            var active = scope===it[0];
            return (
              <button key={it[0]} onClick={function(){ setScope(it[0]); }}
                style={{ padding:"7px 18px", borderRadius:28, border:"none", cursor:"pointer", fontSize:12, fontWeight:active?700:400, background:active?NAVY:"transparent", color:active?WHITE:C.muted, transition:"all .2s" }}>
                {it[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* SÉLECTEUR TAILLE */}
      {scope === "cabinet" && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          {CABINET_SIZES.map(function(sz){
            var active = selSize===sz.id;
            return (
              <button key={sz.id} onClick={function(){ setSelSize(sz.id); }}
                style={{ padding:"8px 18px", borderRadius:30, border:"2px solid "+(active?TEAL:C.border), background:active?TEAL:WHITE, color:active?WHITE:C.muted, fontSize:12, fontWeight:active?700:400, cursor:"pointer", transition:"all .2s" }}>
                {sz.label}
              </button>
            );
          })}
        </div>
      )}

      {/* VUE QUIZ */}
      {view === "quiz" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", gap:2, background:C.sand, padding:3, borderRadius:30 }}>
              {QUIZ_LIST.map(function(q){
                var a = selQuiz===q;
                return <button key={q} onClick={function(){ setSelQuiz(q); setLive(q==="S.12"); }}
                  style={{ padding:"7px 16px", borderRadius:28, border:"none", cursor:"pointer", fontSize:13, fontWeight:a?700:400, background:a?NAVY:"transparent", color:a?WHITE:C.muted, transition:"all .2s" }}>{q}</button>;
              })}
            </div>
            {selQuiz === "S.12" && (
              <button onClick={function(){ setLive(function(v){ return !v; }); }}
                style={{ padding:"7px 18px", borderRadius:30, border:"2px solid "+(live?TEAL:C.border), background:live?C.tealBg:WHITE, color:live?TEAL:C.muted, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:live?TEAL:C.faint, display:"inline-block", animation:live?"pulse 1.5s infinite":"none" }}/>
                {live?"En direct":"Pause"}
              </button>
            )}
          </div>
          <Podium data={data} sub={function(pl){ return pl.correct+"/10 · "+pl.time+"s"; }}/>
          <Rows data={data} max={MAX_PTS} sub={function(pl){ return pl.correct+"/10 · "+pl.time+"s"; }}/>
        </div>
      )}

      {/* VUE TRIMESTRE */}
      {view === "quarter" && (
        <div>
          <div style={{ display:"flex", gap:2, background:C.sand, padding:3, borderRadius:30, marginBottom:16, width:"fit-content" }}>
            {["T1","T2"].map(function(k){
              var a = selQt===k;
              return <button key={k} onClick={function(){ setSelQt(k); }}
                style={{ padding:"8px 24px", borderRadius:28, border:"none", cursor:"pointer", fontSize:13, fontWeight:a?700:400, background:a?NAVY:"transparent", color:a?WHITE:C.muted, transition:"all .2s" }}>{k}</button>;
            })}
          </div>
          <div style={{ padding:"12px 18px", borderRadius:10, background:C.tealBg, border:"1px solid "+C.tealBorder, marginBottom:20, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, fontWeight:700, color:NAVY }}>{QUARTERS[selQt].label}</span>
            <span style={{ color:C.faint }}>·</span>
            {QUARTERS[selQt].weeks.map(function(w){ return <Chip key={w} color={NAVY} bg={WHITE} border={C.border}>{w}</Chip>; })}
          </div>
          <Podium data={qtData} sub={function(pl){ return pl.score+" pts · "+pl.played+" quiz"; }}/>
          <Rows data={qtData} max={QUARTERS[selQt].weeks.length*MAX_PTS} sub={function(pl){ return pl.played+" quiz joués"; }}/>
        </div>
      )}

      {/* VUE ANNUELLE */}
      {view === "year" && (
        <div>
          <div style={{ padding:"12px 18px", borderRadius:10, background:C.tealBg, border:"1px solid "+C.tealBorder, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
            <div>
              <span style={{ fontSize:14, fontWeight:700, color:NAVY }}>Année 2025</span>
              <span style={{ fontSize:13, color:C.muted, marginLeft:10 }}>{ALL_WEEKS.length} quiz · {ALL_WEEKS.length*MAX_PTS} pts maximum</span>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {ALL_WEEKS.map(function(w){ return <Chip key={w} color={NAVY} bg={WHITE} border={C.border}>{w}</Chip>; })}
            </div>
          </div>
          <Podium data={yearData} sub={function(pl){ return pl.score+" pts · "+pl.played+" quiz"; }}/>
          <Rows data={yearData} max={ALL_WEEKS.length*MAX_PTS} sub={function(pl){ return pl.played+" quiz joués"; }}/>
        </div>
      )}
    </div>
  );
}

// ── HISTORY ───────────────────────────────────────────────────────────────

function HistoryScreen() {
  var oqSt  = useState(null); var openQuiz = oqSt[0];  var setOpenQuiz = oqSt[1];
  var oqSt2 = useState(null); var openQ    = oqSt2[0]; var setOpenQ    = oqSt2[1];
  var HISTORY = [
    { id:"s12", week:12, date:"17 mars 2025", score:90, total:MAX_PTS, correct:9,  questions:ACTIVE_Q.slice(0,3) },
    { id:"s11", week:11, date:"10 mars 2025", score:80, total:MAX_PTS, correct:8,  questions:ACTIVE_Q.slice(3,5) },
    { id:"s10", week:10, date:"3 mars 2025",  score:70, total:MAX_PTS, correct:7,  questions:ACTIVE_Q.slice(5,7) },
  ];
  return (
    <div style={{ maxWidth:780, margin:"0 auto", padding:"48px 24px" }}>
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <h2 style={{ fontSize:30, fontWeight:800, fontStyle:"italic", color:NAVY, margin:"0 0 8px" }}>Historique</h2>
        <p style={{ color:C.muted, fontSize:14, margin:0 }}>Retrouvez tous vos quiz passés, questions et fiches explicatives</p>
      </div>
      {HISTORY.map(function(quiz){
        return (
          <div key={quiz.id} style={{ marginBottom:14, background:WHITE, border:"1px solid "+C.border, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 10px rgba(27,58,107,.06)" }}>
            <button onClick={function(){ setOpenQuiz(openQuiz===quiz.id?null:quiz.id); }}
              style={{ width:"100%", padding:"18px 22px", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:16, textAlign:"left" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:15, fontWeight:700, color:NAVY }}>Semaine {quiz.week}</span>
                  <Chip>{quiz.date}</Chip>
                  <Chip color={C.green} bg={C.greenBg} border={C.greenBorder}>{quiz.correct}/10 correctes</Chip>
                  <Chip color={C.gold} bg={C.goldBg} border={C.goldBorder}>{quiz.score}/100 pts</Chip>
                </div>
                <Bar value={quiz.score} max={quiz.total} color={TEAL} h={5}/>
              </div>
              <span style={{ fontSize:20, color:TEAL, fontWeight:700, transform:openQuiz===quiz.id?"rotate(90deg)":"none", transition:"transform .2s", display:"inline-block", flexShrink:0 }}>›</span>
            </button>
            {openQuiz===quiz.id && (
              <div style={{ borderTop:"1px solid "+C.border, padding:"16px 18px" }} className="fu">
                {quiz.questions.map(function(q,i){
                  var key = quiz.id+"-"+i;
                  return (
                    <div key={key} style={{ marginBottom:10, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden" }}>
                      <button onClick={function(){ setOpenQ(openQ===key?null:key); }}
                        style={{ width:"100%", padding:"13px 16px", background:openQ===key?C.sand:WHITE, border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", textAlign:"left", gap:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
                          <span style={{ fontSize:11, fontWeight:700, color:C.faint, letterSpacing:"0.06em", minWidth:22 }}>Q{i+1}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:NAVY, flex:1 }}>{q.text}</span>
                          <DTag id={q.domain}/>
                        </div>
                        <span style={{ fontSize:16, color:TEAL, fontWeight:700, transform:openQ===key?"rotate(90deg)":"none", transition:"transform .2s", flexShrink:0, display:"inline-block" }}>›</span>
                      </button>
                      {openQ===key && (
                        <div style={{ padding:"16px 18px", background:WHITE, borderTop:"1px solid "+C.border }} className="fu">
                          <div style={{ borderLeft:"3px solid "+TEAL, paddingLeft:14, marginBottom:16 }}>
                            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:C.faint, margin:"0 0 6px" }}>Explication</p>
                            <p style={{ fontSize:13, lineHeight:1.65, color:NAVY, margin:0 }}>{q.explanation}</p>
                          </div>
                          <ResLinks keys={q.resources||[]}/>
                          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:C.faint, margin:"0 0 10px" }}>Analyse des options</p>
                          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                            {q.options.map(function(opt,j){
                              var isOk = j===q.answer;
                              return (
                                <div key={j} style={{ padding:"11px 14px", borderRadius:8, background:isOk?C.greenBg:C.bg, border:"1px solid "+(isOk?C.greenBorder:C.border) }}>
                                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                                    <span style={{ fontSize:11, fontWeight:700, color:isOk?C.green:C.faint, minWidth:18, marginTop:1 }}>{String.fromCharCode(65+j)}</span>
                                    <div>
                                      <span style={{ fontSize:13, fontWeight:isOk?700:400, color:isOk?C.green:NAVY, display:"block", marginBottom:3 }}>{opt}</span>
                                      <span style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{q.optionNotes[j]}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── RESOURCES ─────────────────────────────────────────────────────────────

function ResourcesScreen() {
  var tfSt = useState("all"); var typeFilter = tfSt[0]; var setTypeFilter = tfSt[1];
  var srSt = useState("");    var search     = srSt[0]; var setSearch     = srSt[1];
  var allList = Object.keys(RESOURCES).map(function(k){ return Object.assign({ key:k }, RESOURCES[k]); });
  var filtered = allList.filter(function(r){
    var typeOk = typeFilter==="all" || r.type===typeFilter;
    var sq = search.toLowerCase();
    return typeOk && (!sq || r.label.toLowerCase().indexOf(sq)>-1 || r.description.toLowerCase().indexOf(sq)>-1);
  });
  var grouped = {};
  DOMAINS.forEach(function(d){ grouped[d.id] = []; });
  filtered.forEach(function(r){ if(grouped[r.domain]) grouped[r.domain].push(r); });
  var hasAny = DOMAINS.some(function(d){ return grouped[d.id] && grouped[d.id].length>0; });

  function RCard(r){
    var tm = TYPE_META[r.type];
    return (
      <a key={r.key} href={r.url} target="_blank" rel="noreferrer"
        style={{ display:"flex", flexDirection:"column", background:WHITE, border:"1px solid "+C.border, borderRadius:14, padding:"18px 20px", textDecoration:"none", boxShadow:"0 2px 8px rgba(27,58,107,.05)", transition:"box-shadow .2s" }}
        onMouseEnter={function(e){ e.currentTarget.style.boxShadow="0 4px 16px rgba(78,205,196,.2)"; e.currentTarget.style.borderColor=TEAL; }}
        onMouseLeave={function(e){ e.currentTarget.style.boxShadow="0 2px 8px rgba(27,58,107,.05)"; e.currentTarget.style.borderColor=C.border; }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <Chip color={tm.color} bg={tm.bg} border={tm.border}>{tm.icon+" "+tm.label}</Chip>
          <span style={{ fontSize:12, color:C.faint }}>{r.date}</span>
        </div>
        <p style={{ fontSize:14, fontWeight:700, color:NAVY, margin:"0 0 6px", lineHeight:1.4 }}>{r.label}</p>
        <p style={{ fontSize:12, color:C.muted, margin:"0 0 14px", lineHeight:1.6, flex:1 }}>{r.description}</p>
        <span style={{ fontSize:12, fontWeight:700, color:TEAL }}>Accéder au contenu →</span>
      </a>
    );
  }

  return (
    <div style={{ maxWidth:920, margin:"0 auto", padding:"48px 24px" }}>
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <h2 style={{ fontSize:30, fontWeight:800, fontStyle:"italic", color:NAVY, margin:"0 0 8px" }}>Ressources</h2>
        <p style={{ color:C.muted, fontSize:14, margin:0 }}>Tous les contenus produits par notre cabinet, organisés par domaine juridique</p>
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:28, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:C.faint, pointerEvents:"none" }}>⌕</span>
          <input value={search} onChange={function(e){ setSearch(e.target.value); }} placeholder="Rechercher un contenu…"
            style={{ width:"100%", padding:"10px 12px 10px 34px", borderRadius:30, border:"1px solid "+C.border, fontSize:13, color:NAVY, background:WHITE, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <div style={{ display:"flex", gap:2, background:C.sand, padding:3, borderRadius:30 }}>
          {[["all","Tous formats"],["webinaire","Webinaires"],["support","Supports"],["panorama","Panoramas"]].map(function(it){
            return <button key={it[0]} onClick={function(){ setTypeFilter(it[0]); }}
              style={{ padding:"8px 16px", borderRadius:28, border:"none", cursor:"pointer", fontSize:12, fontWeight:typeFilter===it[0]?700:400, background:typeFilter===it[0]?NAVY:"transparent", color:typeFilter===it[0]?WHITE:C.muted, transition:"all .2s" }}>{it[1]}</button>;
          })}
        </div>
      </div>
      {!hasAny && <div style={{ textAlign:"center", padding:"48px 0", color:C.faint }}><p style={{ fontSize:14, margin:0 }}>Aucune ressource pour ces filtres</p></div>}
      {DOMAINS.map(function(d){
        var items = grouped[d.id]; if(!items || !items.length) return null;
        return (
          <div key={d.id} style={{ marginBottom:40 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, paddingBottom:14, borderBottom:"2px solid "+C.border }}>
              <div style={{ width:5, height:28, borderRadius:3, background:TEAL, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:18, fontWeight:800, fontStyle:"italic", margin:0, color:NAVY }}>{d.label}</h3>
                <span style={{ fontSize:12, color:C.faint }}>{items.length} contenu{items.length>1?"s":""} disponible{items.length>1?"s":""}</span>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:14 }}>
              {items.map(function(r){ return RCard(r); })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────

function HomeScreen(p) {
  var top3 = buildQuizRanking("S.12", null).slice(0,3);
  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"48px 24px" }}>

      {/* HERO */}
      <div style={{ background:GRAD, borderRadius:20, padding:"40px 40px", marginBottom:32, color:WHITE, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"relative", zIndex:1 }}>
          <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", opacity:.7, margin:"0 0 10px" }}>Semaine 12 · 17 mars 2025</p>
          <h1 style={{ fontSize:34, fontWeight:800, fontStyle:"italic", margin:"0 0 10px", lineHeight:1.15 }}>Bonjour, Martin</h1>
          <p style={{ fontSize:15, opacity:.85, margin:"0 0 24px", lineHeight:1.6 }}>Votre quiz hebdomadaire est disponible.<br/>10 questions · 100 points · 4 thématiques juridiques.</p>
          {!p.done
            ? <TealBtn onClick={p.onPlay} style={{ background:WHITE, color:NAVY, boxShadow:"0 4px 16px rgba(0,0,0,.15)" }}>Commencer le quiz →</TealBtn>
            : <Chip color={C.green} bg={C.greenBg} border={C.greenBorder}>Quiz complété ✓</Chip>}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:C.border, borderRadius:16, overflow:"hidden", marginBottom:28, boxShadow:"0 2px 12px rgba(27,58,107,.06)" }}>
        {[["3e","Votre classement","sur 156 participants"],["90 pts","Cette semaine","9/10 bonnes réponses"],["Top 15 %","Votre cabinet","— de 100 collaborateurs"]].map(function(it){
          return <div key={it[0]} style={{ background:WHITE, padding:"20px 22px" }}>
            <div style={{ fontSize:24, fontWeight:800, color:NAVY }}>{it[0]}</div>
            <div style={{ fontSize:13, fontWeight:700, color:TEAL, marginTop:3 }}>{it[1]}</div>
            <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>{it[2]}</div>
          </div>;
        })}
      </div>

      {/* NIVEAU PAR DOMAINE */}
      <div style={{ background:WHITE, border:"1px solid "+C.border, borderRadius:16, overflow:"hidden", marginBottom:24, boxShadow:"0 2px 12px rgba(27,58,107,.06)" }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid "+C.border }}>
          <p style={{ fontSize:14, fontWeight:700, color:NAVY, margin:"0 0 2px", fontStyle:"italic" }}>Votre niveau par domaine</p>
          <p style={{ fontSize:12, color:C.faint, margin:0 }}>Basé sur vos derniers quiz</p>
        </div>
        <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
          {DOMAINS.map(function(d){
            var sc = DOMAIN_SCORES[d.id] || 0;
            var bc = sc>=70?C.green:sc>=50?C.gold:C.red;
            var lbl = sc<50?"À renforcer":sc<70?"Correct":"Maîtrisé";
            return (
              <div key={d.id}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Chip color={d.color} bg={d.bg} border={d.border}>{d.label}</Chip>
                    <span style={{ fontSize:12, color:C.faint }}>{lbl}</span>
                  </div>
                  <span style={{ fontSize:14, fontWeight:700, color:bc }}>{sc} %</span>
                </div>
                <div style={{ height:7, borderRadius:4, background:C.border, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:4, background:bc, width:sc+"%", transition:"width .7s ease" }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP 3 */}
      <div style={{ background:WHITE, border:"1px solid "+C.border, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(27,58,107,.06)" }}>
        <div style={{ padding:"16px 22px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:14, fontWeight:700, color:NAVY, fontStyle:"italic" }}>Top 3 · Semaine 12</span>
          <span style={{ fontSize:11, color:C.faint, letterSpacing:"0.05em", textTransform:"uppercase" }}>Bonnes rép. + temps</span>
        </div>
        {top3.map(function(pl,i){
          return (
            <div key={pl.initials} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 22px", borderBottom:i<2?"1px solid "+C.border:"none" }}>
              <span style={{ fontSize:14, fontWeight:700, color:TEAL, minWidth:20 }}>{pl.rank}</span>
              <Avatar initials={pl.initials} idx={pl.coIdx} size={36}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:NAVY }}>{pl.name}</div>
                <div style={{ fontSize:11, color:C.faint }}>{pl.co}</div>
              </div>
              <Bar value={pl.score} max={MAX_PTS} color={TEAL}/>
              <div style={{ textAlign:"right", minWidth:100 }}>
                <div style={{ fontSize:14, fontWeight:700, color:NAVY }}>{pl.score} pts</div>
                <div style={{ fontSize:11, color:C.faint }}>{pl.correct}/10 · {pl.time}s</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────

export default function App() {
  var screenSt = useState("home"); var screen = screenSt[0]; var setScreen = screenSt[1];
  var doneSt   = useState(false);  var done   = doneSt[0];   var setDone   = doneSt[1];
  var nav = [["home","Accueil"],["quiz","Quiz",!done],["leaderboard","Classement"],["history","Historique"],["resources","Ressources"]];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:NAVY, fontFamily:"-apple-system,'Inter',sans-serif" }}>
      <style>{css}</style>
      {/* NAVBAR */}
      <div style={{ background:NAVY, padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:58, position:"sticky", top:0, zIndex:100 }}>
        <span style={{ fontSize:16, fontWeight:800, fontStyle:"italic", color:WHITE, letterSpacing:"-0.3px" }}>
          Quiz<span style={{ color:TEAL }}>WebLex</span>
        </span>
        <div style={{ display:"flex", gap:2 }}>
          {nav.map(function(it){
            var id = it[0], label = it[1], badge = it[2];
            var active = screen===id;
            return (
              <button key={id} className="nb" onClick={function(){ setScreen(id); }}
                style={{ padding:"7px 16px", borderRadius:6, border:"none", cursor:"pointer", fontSize:13, fontWeight:active?700:400, background:active?TEAL:"transparent", color:active?WHITE:"rgba(255,255,255,.7)", display:"flex", alignItems:"center", gap:6, transition:"all .2s" }}>
                {label}
                {badge && <span style={{ width:7, height:7, borderRadius:"50%", background:TEAL, display:"inline-block", animation:"pulse 1.5s infinite" }}/>}
              </button>
            );
          })}
        </div>
        <div style={{ width:32, height:32, borderRadius:"50%", background:TEAL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:NAVY }}>MG</div>
      </div>

      {screen==="home"        && <HomeScreen onPlay={function(){ setScreen("quiz"); }} done={done}/>}
      {screen==="quiz"        && <QuizScreen onDone={function(){ setDone(true); setScreen("leaderboard"); }}/>}
      {screen==="leaderboard" && <LeaderboardScreen/>}
      {screen==="history"     && <HistoryScreen/>}
      {screen==="resources"   && <ResourcesScreen/>}
    </div>
  );
}
