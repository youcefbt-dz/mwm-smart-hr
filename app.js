/* MWM Smart HR — client-side application layer
   Keeps the supplied page layouts intact and connects them through one local data store. */
(() => {
  'use strict';
  const STORE_KEY = 'mwm-smart-hr.data.v1';
  const ROUTES = {
    home: 'home.html', positions: 'positions.html.html', 'job-card': 'job-card.html.html',
    requirements: 'requirements.html.html', risks: 'risks.html.html', candidates: 'candidates.html.html',
    criteria: 'criteria.html', matching: 'matching.html', decision: 'decision.html', reports: 'reports.html', settings: 'settings.html'
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const makeSeedState = () => {
    const positions = [
      {id:'p1',title:'مساعد إداري',department:'الموارد البشرية',count:2,status:'شاغر',date:'2025-04-10',notes:'دعم أعمال مصلحة الموارد البشرية وتحديث البيانات.',details:{title:'مساعد إداري في الموارد البشرية',manager:'مسؤول مصلحة الموارد البشرية',workplace:'المقر الرئيسي للشركة',contract:'عقد عمل دائم',description:'دعم أعمال مصلحة الموارد البشرية من خلال تنظيم الملفات، تحديث البيانات، والمساهمة في إعداد التقارير الإدارية.'}},
      {id:'p2',title:'محاسب',department:'المالية والمحاسبة',count:1,status:'قيد التوظيف',date:'2025-04-08',notes:'متابعة القيود والمستندات المالية.',details:{title:'محاسب',manager:'مدير المالية',workplace:'المقر الرئيسي للشركة',contract:'عقد عمل دائم',description:'إعداد القيود ومتابعة السجلات والتقارير المالية.'}},
      {id:'p3',title:'مسؤول أرشيف',department:'الإدارة العامة',count:1,status:'مغلق',date:'2025-04-05',notes:'',details:{title:'مسؤول أرشيف',manager:'مدير الإدارة العامة',workplace:'المقر الرئيسي للشركة',contract:'عقد عمل دائم',description:'حفظ الوثائق وتصنيفها وضمان سهولة استرجاعها.'}},
      {id:'p4',title:'مطور برمجيات',department:'الإعلام الآلي',count:1,status:'شاغر',date:'2025-04-01',notes:'',details:{title:'مطور برمجيات',manager:'مسؤول الإعلام الآلي',workplace:'المقر الرئيسي للشركة',contract:'عقد عمل دائم',description:'تطوير تطبيقات المؤسسة واختبارها وصيانتها.'}},
      {id:'p5',title:'مكلف بالتوظيف',department:'الموارد البشرية',count:1,status:'قيد التوظيف',date:'2025-03-28',notes:'',details:{title:'مكلف بالتوظيف',manager:'مسؤول مصلحة الموارد البشرية',workplace:'المقر الرئيسي للشركة',contract:'عقد عمل دائم',description:'تنسيق عمليات الاستقطاب والفرز والمقابلات.'}},
      {id:'p6',title:'مسؤول الجودة',department:'الجودة',count:1,status:'مغلق',date:'2025-03-20',notes:'',details:{title:'مسؤول الجودة',manager:'مدير الجودة',workplace:'المقر الرئيسي للشركة',contract:'عقد عمل دائم',description:'متابعة إجراءات الجودة والتوثيق والتحسين المستمر.'}},
      {id:'p7',title:'تقني صيانة',department:'الصيانة',count:2,status:'شاغر',date:'2025-03-15',notes:'',details:{title:'تقني صيانة',manager:'مسؤول الصيانة',workplace:'مقر الشركة',contract:'عقد عمل دائم',description:'تنفيذ أعمال الصيانة الدورية ومعالجة الأعطال.'}},
      {id:'p8',title:'أخصائي تسويق',department:'التسويق',count:1,status:'شاغر',date:'2025-03-10',notes:'',details:{title:'أخصائي تسويق',manager:'مدير التسويق',workplace:'المقر الرئيسي للشركة',contract:'عقد عمل دائم',description:'تنفيذ الحملات التسويقية وتحليل نتائجها.'}}
    ];
    const candidates = [
      {id:'c1',name:'سارة بوزيان',positionId:'p1',education:'ليسانس في إدارة الموارد البشرية',field:'إدارة الموارد البشرية',experienceYears:1,skills:['Excel','تنظيم الملفات','التواصل'],status:'أكملت المقابلة',interviewScore:90,qualificationScore:85,experienceScore:70,skillsScore:84,image:'assets/images/sara-profile.jpg',applicationDate:'2026-10-20'},
      {id:'c2',name:'أحمد بن يوسف',positionId:'p1',education:'ليسانس في علوم التسيير',field:'علوم التسيير',experienceYears:2,skills:['Excel','إعداد التقارير','التخطيط'],status:'قيد المراجعة',interviewScore:76,qualificationScore:78,experienceScore:90,skillsScore:82,applicationDate:'2026-10-18'},
      {id:'c3',name:'ياسمين قادري',positionId:'p5',education:'ماستر في إدارة الموارد البشرية',field:'إدارة الموارد البشرية',experienceYears:3,skills:['التواصل','المقابلات','تنظيم الملفات'],status:'موعد مقابلة محدد',interviewScore:88,qualificationScore:94,experienceScore:95,skillsScore:91,applicationDate:'2026-10-16'},
      {id:'c4',name:'نور الهدى صالح',positionId:'p5',education:'ليسانس في علوم التسيير',field:'علوم التسيير',experienceYears:2,skills:['التواصل','تنظيم الملفات'],status:'طلب جديد',interviewScore:0,qualificationScore:78,experienceScore:85,skillsScore:68,applicationDate:'2026-10-14'},
      {id:'c5',name:'مروان بن عيسى',positionId:'p1',education:'ليسانس في إدارة الأعمال',field:'إدارة الأعمال',experienceYears:1,skills:['Excel','تنظيم الملفات'],status:'مغلق',interviewScore:58,qualificationScore:73,experienceScore:70,skillsScore:70,applicationDate:'2026-10-12'},
      {id:'c6',name:'هبة عياش',positionId:'p1',education:'ماستر في إدارة الموارد البشرية',field:'إدارة الموارد البشرية',experienceYears:2,skills:['التواصل','إعداد التقارير'],status:'أكملت المقابلة',interviewScore:86,qualificationScore:94,experienceScore:85,skillsScore:78,applicationDate:'2026-10-11'}
    ];
    const requirements = {};
    positions.forEach(p => requirements[p.id] = {degree:'ليسانس',specialty:p.department==='الموارد البشرية'?'إدارة الموارد البشرية':p.department==='المالية والمحاسبة'?'المحاسبة':'علوم التسيير',experience:1,skills:['Excel','تنظيم الملفات','إعداد التقارير'],professionalSkills:['الدقة','التنظيم','احترام السرية'],behavioralSkills:['التواصل','العمل الجماعي'],notes:'يفضل أن يكون المرشح حاصلاً على شهادة معترف بها'});
    const risks = {};
    positions.forEach(p => risks[p.id] = p.id==='p1' ? [
      {id:'r1',type:'مخاطر إدارية',description:'حدوث أخطاء في إدخال البيانات أو تنظيم الملفات.',level:'متوسط'},
      {id:'r2',type:'مخاطر تتعلق بالسرية',description:'الوصول غير المصرح به إلى بيانات الموظفين.',level:'مرتفع'},
      {id:'r3',type:'مخاطر قانونية',description:'عدم الالتزام بالتشريعات والتنظيمات الخاصة بالموارد البشرية.',level:'متوسط'},
      {id:'r4',type:'مخاطر مهنية ونفسية',description:'ضغط العمل وتعدد المهام وضيق الأجل.',level:'متوسط'},
      {id:'r5',type:'مخاطر صحية',description:'الإجهاد البصري بسبب العمل الطويل على الحاسوب.',level:'منخفض'},
      {id:'r6',type:'مخاطر مادية',description:'تلف أو فقدان الوثائق الورقية أو الإلكترونية.',level:'متوسط'}
    ] : []);
    const conditions = {};
    positions.forEach(p => conditions[p.id] = {workplace:'مقر الشركة (مكتب)',environment:'مكتبية',schedule:'دوام كامل',start:'08:30',end:'16:30',overtime:false,mobility:'ضمن مقر الشركة',supervision:'يعمل تحت إشراف مسؤول المصلحة',equipment:'حاسوب، طابعة، هاتف داخلي، برامج مكتب (Excel, Word)',prevention:'• الالتزام بإجراءات حماية المعلومات والسرية.\n• مراجعة البيانات قبل حفظها للتخلص من الأخطاء الإدارية.\n• توفير بيئة عمل مريحة وأخذ فترات راحة.\n• استخدام نسخ احتياطية للبيانات والوثائق.'});
    return {version:1,positions,candidates,requirements,risks,conditions,criteria:{qualification:30,experience:25,skills:25,interview:20},decisions:{},selectedPositionId:'p1',selectedCandidateId:'c1',profile:{name:'أحمد بن علي',role:'مدير الموارد البشرية',organization:'MWM Smart HR'}};
  };
  function getState() {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (!stored) { const fresh = makeSeedState(); localStorage.setItem(STORE_KEY, JSON.stringify(fresh)); return fresh; }
      const parsed = JSON.parse(stored);
      const base = makeSeedState();
      return {...base,...parsed, positions:Array.isArray(parsed.positions)?parsed.positions:base.positions, candidates:Array.isArray(parsed.candidates)?parsed.candidates:base.candidates};
    } catch (e) { return makeSeedState(); }
  }
  let state = getState();
  let currentPage = 'home';
  let editingPositionId = null;
  const saveState = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch(e) { toast('تعذر حفظ البيانات في هذا المتصفح.'); } };
  const getPosition = id => state.positions.find(p => p.id === id) || state.positions[0];
  const getCandidate = id => state.candidates.find(c => c.id === id) || state.candidates[0];
  const getSelectedPosition = () => getPosition(state.selectedPositionId);
  const getSelectedCandidate = () => getCandidate(state.selectedCandidateId);
  const jobName = p => p?.details?.title || `${p?.title || ''} في ${p?.department || ''}`;
  const dateText = d => d ? String(d).replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, '$1/$2/$3') : '—';
  function toast(message, type='ok') {
    let node = $('#mwm-toast');
    if (!node) { node = document.createElement('div'); node.id='mwm-toast'; document.body.appendChild(node); }
    node.className = `mwm-toast ${type==='error'?'error':''}`; node.textContent = message; node.classList.add('show');
    clearTimeout(node._timer); node._timer = setTimeout(() => node.classList.remove('show'), 2800);
  }
  function addAppStyles() {
    if ($('#mwm-app-runtime-styles')) return;
    const style = document.createElement('style'); style.id='mwm-app-runtime-styles'; style.textContent = `
      .mwm-toast{position:fixed;z-index:4000;bottom:24px;left:24px;padding:12px 18px;background:#0d6b5c;color:#fff;border-radius:8px;box-shadow:0 8px 28px #102b251c;opacity:0;transform:translateY(8px);pointer-events:none;transition:.2s;font-size:14px}.mwm-toast.show{opacity:1;transform:translateY(0)}.mwm-toast.error{background:#a83d3d}
      .mwm-modal-backdrop{position:fixed;inset:0;background:#0b2924aa;z-index:3000;display:flex;align-items:center;justify-content:center;padding:18px}.mwm-modal{width:min(620px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 20px 70px #0b292433}.mwm-modal h2{color:#0d3e37;margin:0 0 18px;font-size:21px}.mwm-modal form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.mwm-modal label{display:block;font-size:13px;color:#53615f;margin-bottom:6px}.mwm-modal input,.mwm-modal select,.mwm-modal textarea{width:100%;padding:10px;border:1px solid #dbe4e2;border-radius:7px;font:inherit;color:#243a36;background:#fff}.mwm-modal .full{grid-column:1/-1}.mwm-modal-actions{display:flex;gap:10px;justify-content:flex-start;margin-top:18px}.mwm-modal-actions button{border:0;border-radius:7px;padding:10px 18px;cursor:pointer;font:inherit}.mwm-modal-actions .primary{color:#fff;background:#0d6b5c}.mwm-modal-actions .secondary{background:#f0f4f3;color:#23413c}
      .mwm-empty{padding:28px;text-align:center;color:#84918e;background:#fbfcfc;border:1px dashed #dbe5e3;border-radius:8px}.mwm-table-action{border:0;background:transparent;cursor:pointer;color:#47716a;margin:0 4px}.mwm-table-action:hover{color:#0d6b5c}.mwm-toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:16px 0}.mwm-primary-btn{border:0;border-radius:7px;background:#0d6b5c;color:white;padding:10px 16px;font:inherit;cursor:pointer}.mwm-quiet-btn{border:1px solid #dce5e2;border-radius:7px;background:#fff;color:#28534b;padding:9px 14px;font:inherit;cursor:pointer}
      @media(max-width:700px){.mwm-modal form{grid-template-columns:1fr}.mwm-modal .full{grid-column:auto}.mwm-toast{left:12px;right:12px;bottom:12px;text-align:center}}
    `; document.head.appendChild(style);
  }
  function setMenuActive(pageName) {
    $$('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    $$('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    const matching = $$('.sidebar-menu a').find(a => (a.getAttribute('onclick') || '').includes(`'${pageName}'`));
    if (matching) { matching.classList.add('active'); const li=matching.closest('li'); if(li) li.classList.add('active'); const parent=li?.parentElement?.closest('li'); if(parent) parent.classList.add('active'); }
  }
  async function loadPage(pageName, options={}) {
    if (!ROUTES[pageName]) pageName='home';
    currentPage=pageName;
    if (!options.skipHistory && location.hash !== `#${pageName}`) history.pushState({pageName}, '', `#${pageName}`);
    const area=$('#main-content-area'); if (!area) return;
    closeSidebarSafe();
    area.innerHTML='<div style="text-align:center;margin-top:90px;color:#0d6b5c"><i class="fa-solid fa-spinner fa-spin" style="font-size:36px"></i><p style="margin-top:14px;color:#7c8a87">جارٍ فتح القسم...</p></div>';
    try {
      const response=await fetch(ROUTES[pageName], {cache:'no-store'});
      if (!response.ok) throw new Error('HTTP '+response.status);
      area.innerHTML=await response.text();
      setMenuActive(pageName);
      initializePage(pageName);
    } catch(err) {
      area.innerHTML=`<div class="mwm-empty"><i class="fa-solid fa-triangle-exclamation" style="font-size:28px;margin-bottom:12px"></i><h2>تعذر فتح القسم</h2><p>تأكد من تشغيل المشروع بواسطة start.py وعدم فتح الملفات مباشرة من القرص.</p><button class="mwm-primary-btn" onclick="loadPage('home')" style="margin-top:16px">العودة إلى لوحة التحكم</button></div>`;
    }
  }
  window.loadPage = loadPage;
  function closeSidebarSafe(){ const sidebar=$('#sidebar'),overlay=$('#overlay'); sidebar?.classList.remove('open'); overlay?.classList.remove('active'); }
  window.toggleSidebar = function(){ $('#sidebar')?.classList.add('open'); $('#overlay')?.classList.add('active'); };
  window.closeSidebar = closeSidebarSafe;
  window.toggleSubmenu = function(id, element){ const node=document.getElementById(id); node?.classList.toggle('open'); element?.querySelector('.arrow')?.classList.toggle('rotate'); };

  function initializePage(page) {
    state=getState();
    const sessionName=sessionStorage.getItem('mwmDemoName');
    if(sessionName&&state.profile?.name==='أحمد بن علي'&&sessionName!=='أحمد بن علي'){state.profile.name=sessionName;saveState();}
    const profileName=state.profile?.name || sessionName || 'أحمد بن علي';
    const profileTitle=state.profile?.role || 'مدير الموارد البشرية';
    const headerName=$('.profile-info h4'); if(headerName) headerName.textContent=profileName;
    const headerRole=$('.profile-info p'); if(headerRole) headerRole.textContent=profileTitle;
    switch(page){
      case 'home': renderHome(); break;
      case 'positions': editingPositionId=null; renderPositions(); break;
      case 'job-card': fillJobCard(); break;
      case 'requirements': fillRequirements(); break;
      case 'risks': fillRisks(); break;
      case 'candidates': renderCandidates(); break;
      case 'criteria': renderCriteria(); break;
      case 'matching': renderMatching(); break;
      case 'decision': renderDecision(); break;
      case 'reports': renderReports(); break;
      case 'settings': renderSettings(); break;
    }
  }
  function statusClass(status){ return status==='شاغر'?'status-green':status==='قيد التوظيف'?'status-orange':'status-grey'; }
  function renderPositions(){
    const tbody=$('.table-container tbody'); if(!tbody)return;
    tbody.innerHTML=state.positions.map((p,i)=>`<tr data-position-row="${esc(p.id)}"><td>${i+1}</td><td>${esc(p.title)}</td><td>${esc(p.department)}</td><td>${esc(p.count)}</td><td><span class="status-badge ${statusClass(p.status)}">${esc(p.status)}</span></td><td>${esc(dateText(p.date))}</td><td class="action-btns"><button class="btn-view" data-action="view-position" data-id="${esc(p.id)}" title="عرض"><i class="fa-regular fa-eye"></i></button><button class="btn-edit" data-action="edit-position" data-id="${esc(p.id)}" title="تعديل"><i class="fa-solid fa-pen"></i></button><button class="btn-delete" data-action="delete-position" data-id="${esc(p.id)}" title="حذف"><i class="fa-regular fa-trash-can"></i></button></td></tr>`).join('') || `<tr><td colspan="7"><div class="mwm-empty">لا توجد مناصب بعد. أضف أول منصب من النموذج.</div></td></tr>`;
    const counts={total:state.positions.length,vacant:state.positions.filter(p=>p.status==='شاغر').length,recruit:state.positions.filter(p=>p.status==='قيد التوظيف').length,closed:state.positions.filter(p=>p.status==='مغلق').length};
    const statSpans=$$('.stats-grid .stat-card .stat-info span'); [counts.total,counts.vacant,counts.recruit,counts.closed].forEach((n,i)=>{if(statSpans[i])statSpans[i].textContent=n;});
    const pager=$('.pagination-wrapper span'); if(pager)pager.textContent=`عرض ${state.positions.length?1:0} - ${state.positions.length} من ${state.positions.length}`;
    const form=$('.side-column form'); if(form){form.dataset.positionForm='true'; resetPositionForm();}
    bindPositionFilters();
  }
  function resetPositionForm(p=null){
    const form=$('.side-column form'); if(!form)return;
    const fields=$$('input,select,textarea',form); if(fields.length<6)return;
    const departments=[...new Set([...state.positions.map(x=>x.department), 'الموارد البشرية','المالية والمحاسبة','الإدارة العامة','الإعلام الآلي','الجودة','الصيانة','التسويق'])];
    fields[1].innerHTML='<option value="" disabled>اختر المصلحة...</option>'+departments.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('');
    fields[0].value=p?.title||''; fields[1].value=p?.department||''; fields[2].value=p?.count||1; fields[3].value=p?.status||'شاغر'; fields[4].value=p?.date||today(); fields[5].value=p?.notes||'';
    const h2=$('.side-column .form-header h2'); if(h2)h2.textContent=p?'تعديل منصب وظيفي':'إضافة / تعديل منصب وظيفي';
  }
  function bindPositionFilters(){
    const container=$('.positions-page'); if(!container)return;
    const search=$('.filters-bar input',container); const selects=$$('.filters-bar select',container);
    if(selects[0])selects[0].innerHTML='<option value="all">المصلحة: الكل</option>'+[...new Set(state.positions.map(p=>p.department))].map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('');
    if(selects[1])selects[1].innerHTML='<option value="all">حالة المنصب: الكل</option>'+['شاغر','قيد التوظيف','مغلق'].map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    const apply=()=>{ const q=(search?.value||'').trim().toLowerCase(); const dept=selects[0]?.value||'all'; const status=selects[1]?.value||'all'; $$('[data-position-row]',container).forEach(row=>{const id=row.dataset.positionRow,p=getPosition(id);row.hidden=!!((q&&!`${p.title} ${p.department}`.toLowerCase().includes(q))||(dept!=='all'&&p.department!==dept)||(status!=='all'&&p.status!==status));});};
    search?.addEventListener('input',apply); selects.forEach(s=>s.addEventListener('change',apply));
  }
  function fillJobCard(){
    const p=getSelectedPosition(); if(!p)return;
    const title=jobName(p);
    const header=$('.job-header-card .job-title-area h2'); if(header)header.textContent=title;
    const meta=$$('.job-header-card .job-meta span'); if(meta.length>=4){meta[0].innerHTML=`<i class="fa-solid fa-building"></i> المصلحة: ${esc(p.department)}`;meta[1].innerHTML=`<i class="fa-solid fa-users"></i> عدد المناصب المطلوبة: ${esc(p.count)}`;meta[2].textContent=`المسؤول: ${p.details?.manager||'مسؤول المصلحة'}`;meta[3].innerHTML=`الحالة: <span class="status-badge-light">${esc(p.status)}</span>`;}
    const form=$('.job-card-page .form-section form'); if(form){const f=$$('input,select,textarea',form);const d=p.details||{};if(f[0])f[0].value=d.title||title;if(f[1])f[1].innerHTML=[...new Set([p.department,...state.positions.map(x=>x.department),'الموارد البشرية','المالية والمحاسبة','الإدارة العامة','الإعلام الآلي','الجودة','الصيانة','التسويق'])].map(d=>`<option>${esc(d)}</option>`).join('');if(f[2])f[2].value=p.count;if(f[3])f[3].innerHTML=`<option>${esc(d.manager||'مسؤول المصلحة')}</option><option>مدير الموارد البشرية</option><option>المدير العام</option>`;if(f[4])f[4].value=d.workplace||'المقر الرئيسي للشركة';if(f[5])f[5].value=d.contract||'عقد عمل دائم';if(f[6])f[6].value=d.description||p.notes||'';if(f[7])f[7].value=p.date||today();}
    $$('.tab-item').forEach((tab,i)=>{tab.dataset.route=['job-card','job-card','risks','requirements','criteria'][i]||'criteria';tab.style.cursor='pointer';});
  }
  function fillRequirements(){
    const p=getSelectedPosition(), r=state.requirements[p.id]||{}; if(!p)return;
    const h=$('.req-job-title-area h2');if(h)h.textContent=jobName(p);
    const meta=$$('.req-job-meta > span');if(meta.length>=3){meta[0].textContent=`${p.id.slice(1)} - المصلحة: ${p.department}`;meta[1].textContent=`عدد المناصب المطلوبة: ${p.count}`;meta[2].innerHTML=`الحالة: <span class="req-status-badge-light">${esc(p.status)}</span>`;}
    syncRequirementSummary(p,r);
    showRequirementsTab(Number($('.requirements-page')?.dataset.reqTab||0));
  }
  function syncRequirementSummary(p=getSelectedPosition(),r=state.requirements[p.id]||{}){
    const summaries=$$('.req-summary-item .req-summary-text p');if(summaries.length){summaries[0].textContent=`${r.degree||'ليسانس'} في ${r.specialty||p.department}`;summaries[1].textContent=`${r.experience??1} سنة ${Number(r.experience??1)===0?'(اختيارية)':'على الأقل'}`;summaries[2].textContent=(r.skills||['Excel','تنظيم الملفات','إعداد التقارير']).join('، ');summaries[3].textContent=(r.professionalSkills||['الدقة','التنظيم','احترام السرية']).join('، ');summaries[4].textContent=(r.behavioralSkills||['التواصل','العمل الجماعي']).join('، ');summaries[5].textContent=r.notes||'إجادة استخدام الحاسوب';}
  }
  function showRequirementsTab(index){
    const page=$('.requirements-page');if(!page)return;const p=getSelectedPosition(),r=state.requirements[p.id]||{};const idx=Math.max(0,Math.min(5,index));page.dataset.reqTab=String(idx);
    const tabs=$$('.req-tab-item',page);tabs.forEach((tab,i)=>tab.classList.toggle('active',i===idx));
    const title=$('.req-section-title',page),subtitle=$('.req-section-subtitle',page),importanceTitle=$('.req-importance-box h4',page),importanceText=$('.req-importance-box p',page),area=$('.req-form-area',page);
    const configs=[
      {title:'المؤهلات العلمية',sub:'تحديد الشهادة والتخصص المطلوبين لشغل المنصب.',tip:'أهمية المؤهلات العلمية',desc:'تساهم المؤهلات العلمية في تزويد المترشح بالمعرفة الأساسية اللازمة لفهم طبيعة العمل في المؤسسة.',html:`<form><div class="req-form-group"><label>الشهادة المطلوبة <span>*</span></label><select class="req-form-control" data-field="degree">${['ليسانس','ماستر','دكتوراه','تقني سامي'].map(x=>`<option ${x===(r.degree||'ليسانس')?'selected':''}>${x}</option>`).join('')}</select></div><div class="req-form-group"><label>التخصص المطلوب <span>*</span></label><select class="req-form-control" data-field="specialty">${[r.specialty||p.department,'إدارة الموارد البشرية','علوم التسيير','علوم اقتصادية','المحاسبة','إدارة الأعمال','الإعلام الآلي'].filter((x,i,a)=>a.indexOf(x)===i).map(x=>`<option ${x===(r.specialty||p.department)?'selected':''}>${esc(x)}</option>`).join('')}</select></div><div class="req-form-group"><label>ملاحظات إضافية</label><div class="req-textarea-wrapper"><textarea class="req-form-control" rows="4" maxlength="500" data-field="notes" placeholder="يفضل أن يكون المرشح حاصلاً على شهادة معترف بها">${esc(r.notes||'')}</textarea><span class="req-char-count">${(r.notes||'').length}/500</span></div></div><div class="req-info-box-bottom"><i class="fa-solid fa-circle-info"></i> يمكنك تحديث المؤهلات وسيؤثر ذلك في ملف المنصب ومعايير المطابقة.</div></form>`},
      {title:'الخبرة المهنية',sub:'حدد الحد الأدنى للخبرة المهنية المطلوبة لهذا المنصب.',tip:'أهمية الخبرة المهنية',desc:'تساعد الخبرة على تقدير جاهزية المرشح للتعامل مع مهام المنصب ومسؤولياته.',html:`<form><div class="req-form-group"><label>سنوات الخبرة المطلوبة</label><input type="number" min="0" max="40" class="req-form-control" data-field="experience" value="${Number(r.experience??1)}"></div><div class="req-form-group"><label>طبيعة الخبرة</label><select class="req-form-control" data-field="experienceType"><option ${!r.experienceType||r.experienceType==='اختيارية'?'selected':''}>اختيارية</option><option ${r.experienceType==='إلزامية'?'selected':''}>إلزامية</option></select></div><div class="req-form-group"><label>ملاحظات حول الخبرة</label><textarea rows="4" class="req-form-control" data-field="experienceNotes" maxlength="500">${esc(r.experienceNotes||'')}</textarea></div></form>`},
      {title:'المهارات التقنية',sub:'حدد المهارات الفنية والأدوات التي يجب أن يتقنها المرشح.',tip:'أهمية المهارات التقنية',desc:'توضح المهارات الأساسية التي سيستخدمها المرشح في تنفيذ المهام اليومية بكفاءة.',html:`<form><div class="req-form-group"><label>المهارات المطلوبة</label><textarea rows="5" class="req-form-control" data-field="skills" maxlength="500" placeholder="Excel، إعداد التقارير، تنظيم الملفات">${esc((r.skills||['Excel','تنظيم الملفات','إعداد التقارير']).join('، '))}</textarea></div><div class="req-form-group"><label>الأدوات والبرامج</label><input class="req-form-control" data-field="tools" value="${esc(r.tools||'Excel، Word، البريد الإلكتروني')}"></div></form>`},
      {title:'الكفاءات المهنية',sub:'حدد سلوكيات الأداء والاحترافية المطلوبة في العمل.',tip:'أهمية الكفاءات المهنية',desc:'تساعد الكفاءات المهنية على ضمان الدقة والتنظيم وجودة الإنجاز واحترام الإجراءات.',html:`<form><div class="req-form-group"><label>الكفاءات المهنية</label><textarea rows="5" class="req-form-control" data-field="professionalSkills" maxlength="500">${esc((r.professionalSkills||['الدقة','التنظيم','احترام السرية']).join('، '))}</textarea></div></form>`},
      {title:'الكفاءات السلوكية',sub:'حدد المهارات الشخصية التي تدعم التعاون والنجاح في بيئة العمل.',tip:'أهمية الكفاءات السلوكية',desc:'توفر هذه المعايير صورة عن قدرة المرشح على التواصل والتعاون والتكيف مع الفريق.',html:`<form><div class="req-form-group"><label>الكفاءات السلوكية</label><textarea rows="5" class="req-form-control" data-field="behavioralSkills" maxlength="500">${esc((r.behavioralSkills||['التواصل','العمل الجماعي']).join('، '))}</textarea></div></form>`},
      {title:'متطلبات خاصة',sub:'أضف الشروط الأخرى أو الترتيبات اللازمة لشغل المنصب.',tip:'أهمية المتطلبات الخاصة',desc:'توثيق الشروط الخاصة يضمن وضوح التوقعات لدى المرشحين والمدير المسؤول.',html:`<form><div class="req-form-group"><label>متطلبات إضافية</label><textarea rows="6" class="req-form-control" data-field="notes" maxlength="500" placeholder="إجادة استخدام الحاسوب، القدرة على الحفاظ على السرية...">${esc(r.notes||'')}</textarea><span class="req-char-count">${(r.notes||'').length}/500</span></div></form>`}
    ];
    const c=configs[idx];if(title)title.innerHTML=`<i class="fa-solid fa-${['graduation-cap','briefcase','gears','id-badge','heart','file-lines'][idx]}"></i> ${c.title}`;if(subtitle)subtitle.textContent=c.sub;if(importanceTitle)importanceTitle.textContent=c.tip;if(importanceText)importanceText.textContent=c.desc;if(area)area.innerHTML=c.html;
  }
  function fillRisks(){
    const p=getSelectedPosition(), risks=state.risks[p.id]||[], c=state.conditions[p.id]||{};if(!p)return;
    const h=$('.risks-job-title-area h2');if(h)h.textContent=jobName(p);
    const meta=$$('.risks-job-meta > span');if(meta.length>=4){meta[0].textContent=`${p.id.slice(1)} - المصلحة: ${p.department}`;meta[1].textContent=`عدد المناصب المطلوبة: ${p.count}`;meta[2].textContent=`نوع العقد: ${p.details?.contract||'دائم'}`;meta[3].innerHTML=`الحالة: <span class="risks-status-badge-light">${esc(p.status)}</span>`;}
    const form=$('.conditions-section form');if(form){const sels=$$('select',form),times=$$('input[type="time"]',form),radios=$$('input[type="radio"]',form);[c.workplace,c.environment,c.schedule,c.mobility,c.supervision,c.equipment].forEach((v,i)=>{if(sels[i]&&v)sels[i].value=v;});if(times[0])times[0].value=c.start||'08:30';if(times[1])times[1].value=c.end||'16:30';radios.forEach(r=>r.checked=(r.id==='overtime-yes')===!!c.overtime);}
    const tbody=$('.risk-table tbody');if(tbody)tbody.innerHTML=risks.map(r=>`<tr data-risk-id="${esc(r.id)}"><td><span class="risk-icon"><i class="fa-solid fa-triangle-exclamation"></i></span> ${esc(r.type)}</td><td>${esc(r.description)}</td><td><span class="risk-badge ${r.level==='مرتفع'?'badge-high':r.level==='منخفض'?'badge-low':'badge-medium'}">${esc(r.level)}</span></td><td class="risk-actions"><button data-action="edit-risk" data-id="${esc(r.id)}" title="تعديل"><i class="fa-regular fa-pen-to-square"></i></button><button class="delete" data-action="delete-risk" data-id="${esc(r.id)}" title="حذف"><i class="fa-regular fa-trash-can"></i></button></td></tr>`).join('')||'<tr><td colspan="4">لا توجد مخاطر مسجلة لهذا المنصب.</td></tr>';
    const prevention=$('.prevention-textarea-wrapper textarea');if(prevention)prevention.value=c.prevention||'';
    const count=$('.prevention-char-count');if(count&&prevention)count.textContent=`${prevention.value.length}/500`;
  }
  function renderCandidates(){
    const tbody=$('.cand-table tbody');if(!tbody)return;
    const candidates=state.candidates;
    tbody.innerHTML=candidates.map((c,i)=>{const p=getPosition(c.positionId);return `<tr data-candidate-row="${esc(c.id)}"><td>${i+1}</td><td><div class="candidate-name-cell">${c.image?`<img src="${esc(c.image)}" alt="" class="mwm-candidate-photo">`:`<div class="candidate-avatar">${esc(c.name.slice(0,1))}</div>`} ${esc(c.name)}</div></td><td>${esc(jobName(p))}</td><td>${esc(c.education)}</td><td>${esc(expText(c.experienceYears))}</td><td>${esc(c.skills.join('، '))}</td><td><span class="cand-badge ${candidateStatusClass(c.status)}">${esc(c.status)}</span></td><td><div class="cand-actions"><button class="btn-view-file" data-action="view-candidate" data-id="${esc(c.id)}"><i class="fa-regular fa-eye"></i> عرض الملف</button>${c.cvData?`<button class="btn-print" data-action="download-candidate-cv" data-id="${esc(c.id)}" title="تنزيل السيرة الذاتية"><i class="fa-regular fa-file-pdf"></i></button>`:''}<button class="btn-print" data-action="print-candidate" data-id="${esc(c.id)}"><i class="fa-solid fa-print"></i></button></div></td></tr>`}).join('')||'<tr><td colspan="8"><div class="mwm-empty">لا يوجد مرشحون حتى الآن.</div></td></tr>';
    if(!$('#mwm-candidate-image-style')){const s=document.createElement('style');s.id='mwm-candidate-image-style';s.textContent='.mwm-candidate-photo{width:34px;height:34px;object-fit:cover;border-radius:50%;vertical-align:middle;margin-left:7px;border:1px solid #d8e5e2}';document.head.appendChild(s);}
    const count=$('.cand-pagination span');if(count)count.textContent=`عرض ${candidates.length?1:0} - ${candidates.length} من ${candidates.length}`;
    const selects=$$('.cand-top-filters select');if(selects[0])selects[0].innerHTML='<option value="all">المنصب المطلوب: الكل</option>'+state.positions.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');if(selects[1])selects[1].innerHTML='<option value="all">حالة الطلب: الكل</option>'+['طلب جديد','قيد المراجعة','أكملت المقابلة','موعد مقابلة محدد','مقبول','مرفوض','مغلق','منسحب'].map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');const quick=$('.cand-sidebar-filter .filter-select-full');if(quick)quick.innerHTML='<option value="all">الكل</option>'+state.positions.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');
    bindCandidateFilters();
  }
  function candidateStatusClass(s){ return s==='أكملت المقابلة'?'badge-completed':s==='قيد المراجعة'?'badge-review':s==='موعد مقابلة محدد'?'badge-scheduled':s==='مقبول'?'badge-completed':s==='مرفوض'||s==='مغلق'||s==='منسحب'?'badge-closed':'badge-new'; }
  function expText(n){return n===0?'دون خبرة':n===1?'سنة واحدة':`${n} سنوات`;}
  function bindCandidateFilters(){
    const container=$('.cand-page');if(!container)return;
    const search=$('.cand-search-input input',container), selects=$$('.cand-top-filters select',container), applyBtn=$('.btn-apply-filter',container),quickPos=$('.cand-sidebar-filter .filter-select-full',container),statusChecks=$$('.checkbox-list input',container);
    const allCheck=statusChecks[0],specificChecks=statusChecks.slice(1);
    statusChecks.forEach((check,i)=>check.addEventListener('change',()=>{if(i===0&&check.checked)specificChecks.forEach(x=>x.checked=false);else if(i>0&&check.checked&&allCheck)allCheck.checked=false;else if(i>0&&specificChecks.every(x=>!x.checked)&&allCheck)allCheck.checked=true;}));
    const apply=()=>{const q=(search?.value||'').toLowerCase().trim(),pos=selects[0]?.value||'all',status=selects[1]?.value||'all',quick=quickPos?.value||'all';const selectedStatuses=(allCheck?.checked||specificChecks.every(x=>!x.checked))?[]:specificChecks.filter(x=>x.checked).map(x=>x.closest('label')?.textContent.trim()).filter(Boolean);$$('[data-candidate-row]',container).forEach(row=>{const c=getCandidate(row.dataset.candidateRow);row.hidden=!!((q&&!`${c.name} ${c.education} ${c.skills.join(' ')}`.toLowerCase().includes(q))||(pos!=='all'&&c.positionId!==pos)||(quick!=='all'&&c.positionId!==quick)||(status!=='all'&&c.status!==status)||(selectedStatuses.length&&!selectedStatuses.some(x=>c.status.includes(x.replace('أكملت المقابلة الافتراضية','أكملت المقابلة')))));});};
    search?.addEventListener('input',apply);selects.forEach(s=>s.addEventListener('change',apply));quickPos?.addEventListener('change',apply);specificChecks.forEach(c=>c.addEventListener('change',apply));allCheck?.addEventListener('change',apply);applyBtn?.addEventListener('click',apply);
  }
  function overallScore(c){const w=state.criteria;return Math.round((Number(c.qualificationScore||0)*w.qualification+Number(c.experienceScore||0)*w.experience+Number(c.skillsScore||0)*w.skills+Number(c.interviewScore||0)*w.interview)/100);}
  function renderHome(){
    const host=$('.page-container'); if(!host)return;
    const totalPos=state.positions.length, vacant=state.positions.filter(p=>p.status==='شاغر').length, totalCand=state.candidates.length, pending=state.candidates.filter(c=>['طلب جديد','قيد المراجعة','موعد مقابلة محدد'].includes(c.status)).length;
    host.innerHTML=`<section class="mwm-home-page" dir="rtl"><div class="mwm-welcome"><div><p>MWM SMART HR / مساحة العمل</p><h1>لوحة التحكم</h1><span>كل مراحل التوظيف في مكان واحد، من تعريف المنصب إلى قرار المدير.</span></div><div class="mwm-welcome-mark"><i class="fa-solid fa-seedling"></i></div></div><div class="mwm-home-stats"><article><span>المناصب المسجلة</span><strong>${totalPos}</strong><small>منصب في قاعدة البيانات</small><i class="fa-solid fa-briefcase"></i></article><article><span>المناصب الشاغرة</span><strong>${vacant}</strong><small>جاهزة لاستقبال المرشحين</small><i class="fa-solid fa-user-plus"></i></article><article><span>المرشحون</span><strong>${totalCand}</strong><small>ملف مرشح مسجل</small><i class="fa-solid fa-users"></i></article><article><span>طلبات قيد المتابعة</span><strong>${pending}</strong><small>تحتاج إلى مراجعة أو قرار</small><i class="fa-solid fa-list-check"></i></article></div><div class="mwm-home-columns"><section class="mwm-home-panel"><header><div><h2>مسار التوظيف</h2><p>تنقّل بين خطوات العملية مع الاحتفاظ ببيانات المنصب نفسه.</p></div></header><div class="mwm-workflow"><button data-route="positions"><span>01</span><b>تعريف المنصب</b><small>المعلومات الأساسية</small></button><button data-route="requirements"><span>02</span><b>المتطلبات</b><small>المؤهلات والمهارات</small></button><button data-route="risks"><span>03</span><b>المخاطر والظروف</b><small>متطلبات بيئة العمل</small></button><button data-route="matching"><span>04</span><b>المطابقة الذكية</b><small>ترتيب المرشحين</small></button><button data-route="decision"><span>05</span><b>اتخاذ القرار</b><small>القرار النهائي للمدير</small></button></div></section><section class="mwm-home-panel"><header><div><h2>آخر ملفات المرشحين</h2><p>انتقل مباشرة إلى مراجعة الملف أو القرار.</p></div><button class="mwm-link-btn" data-route="candidates">عرض جميع المرشحين <i class="fa-solid fa-arrow-left"></i></button></header><div class="mwm-home-candidates">${state.candidates.slice(0,4).map(c=>`<button class="mwm-home-candidate" data-action="view-candidate" data-id="${esc(c.id)}"><span class="mwm-mini-avatar">${c.image?`<img src="${esc(c.image)}" alt="">`:esc(c.name.slice(0,1))}</span><span><b>${esc(c.name)}</b><small>${esc(jobName(getPosition(c.positionId)))}</small></span><strong>${overallScore(c)}%</strong></button>`).join('')}</div></section></div><section class="mwm-home-footer"><div><i class="fa-regular fa-circle-check"></i><span><b>البيانات محفوظة محليًا</b><small>التعديلات تنتقل بين الأقسام داخل هذا المتصفح تلقائيًا.</small></span></div><button class="mwm-primary-btn" data-route="positions">إدارة المناصب <i class="fa-solid fa-arrow-left"></i></button></section></section>`;
    addHomeStyles();
  }
  function addHomeStyles(){if($('#mwm-home-style'))return;const s=document.createElement('style');s.id='mwm-home-style';s.textContent=`.mwm-home-page{display:flex;flex-direction:column;gap:20px;color:#243d38}.mwm-welcome{border:1px solid #dcece8;border-radius:12px;min-height:128px;padding:24px 28px;background:linear-gradient(110deg,#edf8f5,#f9fcfb);display:flex;align-items:center;justify-content:space-between}.mwm-welcome p{font-size:11px;letter-spacing:1.2px;color:#56857b;margin-bottom:8px}.mwm-welcome h1{font-size:25px;color:#0d4b44;margin-bottom:8px}.mwm-welcome span{font-size:14px;color:#55736d}.mwm-welcome-mark{width:72px;height:72px;background:#d9efea;color:#0d6b5c;border-radius:50%;display:grid;place-items:center;font-size:32px}.mwm-home-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.mwm-home-stats article{position:relative;border:1px solid #e0e8e6;border-radius:10px;background:#fff;padding:18px;min-height:126px;display:flex;flex-direction:column;gap:6px}.mwm-home-stats article>span{font-size:13px;color:#74847f}.mwm-home-stats strong{font-size:29px;color:#0d4b44;font-weight:700}.mwm-home-stats small{font-size:11px;color:#93a19d}.mwm-home-stats i{position:absolute;left:18px;top:20px;color:#b9dcd4;font-size:22px}.mwm-home-columns{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}.mwm-home-panel{background:white;border:1px solid #e1e9e7;border-radius:10px;padding:20px;min-width:0}.mwm-home-panel header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px}.mwm-home-panel h2{font-size:18px;color:#164e45;margin-bottom:6px}.mwm-home-panel header p{font-size:12px;color:#82918d}.mwm-workflow{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mwm-workflow button{border:1px solid #e1eae7;border-radius:8px;background:#fff;display:grid;grid-template-columns:36px 1fr;column-gap:10px;text-align:right;align-items:center;padding:13px;cursor:pointer;color:#25463f}.mwm-workflow button:hover,.mwm-home-candidate:hover{background:#f4faf8;border-color:#b8dcd4}.mwm-workflow button span{grid-row:span 2;width:34px;height:34px;background:#e3f3ef;color:#0d6b5c;border-radius:7px;display:grid;place-items:center;font-size:12px}.mwm-workflow b{font-size:13px}.mwm-workflow small{font-size:11px;color:#8b9895;margin-top:4px}.mwm-link-btn{border:0;background:none;color:#0d6b5c;font:inherit;font-size:12px;cursor:pointer}.mwm-home-candidates{display:flex;flex-direction:column;gap:4px}.mwm-home-candidate{display:flex;gap:10px;align-items:center;width:100%;border:1px solid transparent;background:white;text-align:right;padding:10px 8px;border-radius:7px;cursor:pointer;color:#26443e}.mwm-mini-avatar{width:38px;height:38px;overflow:hidden;border-radius:50%;background:#e5f2ef;color:#0d6b5c;display:grid;place-items:center;flex-shrink:0}.mwm-mini-avatar img{width:100%;height:100%;object-fit:cover}.mwm-home-candidate>span:nth-child(2){display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}.mwm-home-candidate b{font-size:13px}.mwm-home-candidate small{font-size:11px;color:#7b8d87;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mwm-home-candidate>strong{color:#0d8174;font-size:14px}.mwm-home-footer{border:1px solid #dfeae7;background:#f7fbfa;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px}.mwm-home-footer>div{display:flex;align-items:center;gap:12px;color:#0c7568}.mwm-home-footer>div span{display:flex;flex-direction:column;gap:5px}.mwm-home-footer b{font-size:13px}.mwm-home-footer small{font-size:12px;color:#7b8d87}@media(max-width:1100px){.mwm-home-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.mwm-home-columns{grid-template-columns:1fr}}@media(max-width:600px){.mwm-welcome{padding:18px}.mwm-welcome-mark{display:none}.mwm-home-stats{gap:8px}.mwm-home-stats article{padding:12px;min-height:112px}.mwm-workflow{grid-template-columns:1fr}.mwm-home-footer{align-items:flex-start;flex-direction:column}}`;document.head.appendChild(s);}
  function renderDecision(){
    const c=getSelectedCandidate();
    const decisionGrid=$('.decision-grid');
    if(!c){if(decisionGrid)decisionGrid.innerHTML='<div class="mwm-empty">لا توجد ملفات مرشحين بعد. أضف مرشحًا من قسم إدارة المرشحين ثم عد إلى هذه الصفحة.</div>';return;}
    const p=getPosition(c.positionId);if(!p){if(decisionGrid)decisionGrid.innerHTML='<div class="mwm-empty">لا يوجد منصب مرتبط بهذا المرشح. اختر منصبًا من ملف المرشح أولًا.</div>';return;}
    const d=state.decisions[c.id]||{};
    const byId=id=>document.getElementById(id);
    const name=byId('decision-candidate-name');if(name)name.textContent=c.name;const candidateStatus=byId('decision-candidate-status');if(candidateStatus)candidateStatus.textContent=c.status;
    const qualification=byId('decision-qualification');if(qualification)qualification.textContent=`${c.education}`;
    const exp=byId('decision-experience');if(exp)exp.textContent=expText(c.experienceYears);
    const skills=byId('decision-skills');if(skills)skills.textContent=c.skills.join('، ');
    const posTitle=byId('decision-position-title');if(posTitle)posTitle.textContent=jobName(p);
    const department=byId('decision-department');if(department)department.textContent=p.department;
    const contract=byId('decision-contract');if(contract)contract.textContent=p.details?.contract||'عقد عمل دائم';
    const posStatus=byId('decision-position-status');if(posStatus)posStatus.textContent=p.status;
    const req=state.requirements[p.id]||{};
    const reqDegree=byId('decision-required-degree');if(reqDegree)reqDegree.textContent=`${req.degree||'ليسانس'} في ${req.specialty||p.department}`;
    const reqExperience=byId('decision-required-experience');if(reqExperience)reqExperience.textContent=`${req.experience??1} سنة ${Number(req.experience??1)===0?'(اختياري)':'على الأقل'}`;
    const reqSkills=byId('decision-required-skills');if(reqSkills)reqSkills.textContent=(req.skills||['Excel','التنظيم','إعداد التقارير']).join('، ');
    const jobDept=byId('decision-job-dept');if(jobDept)jobDept.textContent=p.department;
    const jobCount=byId('decision-job-count');if(jobCount)jobCount.textContent=p.count;
    const jobExp=byId('decision-job-exp');if(jobExp)jobExp.textContent=`${req.experience??1} سنة`;
    const jobNotes=byId('decision-job-notes');if(jobNotes)jobNotes.textContent=req.notes||'إجادة استخدام الحاسوب';
    const reco=byId('decision-recommendation-text');if(reco)reco.textContent=overallScore(c)>=85?'تظهر البيانات توافقًا مرتفعًا مع متطلبات المنصب؛ راجع المقابلة والملاحظات قبل اعتماد القرار.':overallScore(c)>=70?'الملف مناسب مبدئيًا، ويُنصح بمراجعة نقاط القوة والفجوات قبل اعتماد القرار.':'تظهر البيانات فجوات في بعض المعايير؛ راجع المؤهلات والخبرة المطلوبة قبل اعتماد القرار.';
    const img=byId('decision-photo');if(img){if(c.image){img.src=c.image;img.style.display='block';const av=byId('decision-avatar');if(av)av.style.display='none';}else{img.style.display='none';const av=byId('decision-avatar');if(av){av.style.display='grid';av.textContent=c.name.slice(0,1);}}}
    const q=Number(c.qualificationScore||0),e=Number(c.experienceScore||0),i=Number(c.interviewScore||0),s=Number(c.skillsScore||0);
    [['decision-q-score',q],['decision-e-score',e],['decision-i-score',i],['decision-s-score',s]].forEach(([id,n])=>{const el=byId(id);if(el)el.textContent=`${n}%`;});
    [['decision-q-ring',q,'#168b82'],['decision-e-ring',e,'#5b91d8'],['decision-i-ring',i,'#9580d1'],['decision-s-ring',s,'#daa54a']].forEach(([id,n,color])=>{const el=byId(id);if(el)el.style.background=`conic-gradient(${color} ${Math.max(0,Math.min(100,n))}%, #e8efed 0)`;});
    const score=byId('decision-overall-score');if(score)score.textContent=`${overallScore(c)}%`;
    const note=byId('decision-note');if(note)note.value=d.notes||'';
    const chosen=d.value;$$('[data-decision]', document).forEach(b=>{b.classList.toggle('selected',b.dataset.decision===chosen);});
    const status=byId('decision-record-status');if(status)status.textContent=chosen?`آخر قرار محفوظ: ${chosen}`:'لم يُحفظ قرار نهائي بعد';
    const switchCandidate=byId('decision-candidate-switch');if(switchCandidate)switchCandidate.innerHTML=state.candidates.map(x=>`<option value="${esc(x.id)}" ${x.id===c.id?'selected':''}>${esc(x.name)} — ${esc(jobName(getPosition(x.positionId)))}</option>`).join('');
  }
  function renderMatching(){
    const host=$('#matching-table-body');if(!host)return;
    const list=state.candidates.map(c=>({...c,score:overallScore(c)})).sort((a,b)=>b.score-a.score);
    host.innerHTML=list.map((c,i)=>`<tr><td>${i+1}</td><td><div class="mwm-candidate-cell"><span>${c.image?`<img src="${esc(c.image)}" alt="">`:esc(c.name.slice(0,1))}</span><b>${esc(c.name)}</b></div></td><td>${esc(jobName(getPosition(c.positionId)))}</td><td><div class="mwm-match-score"><span style="width:${c.score}%"></span></div><b class="mwm-score-label">${c.score}%</b></td><td>${esc(c.status)}</td><td><button class="mwm-primary-btn" data-action="view-candidate" data-id="${esc(c.id)}">مراجعة القرار</button></td></tr>`).join('')||'<tr><td colspan="6">لا توجد ملفات مرشحين.</td></tr>';
    const posSelect=$('#matching-position');if(posSelect){posSelect.innerHTML='<option value="all">كل المناصب</option>'+state.positions.map(p=>`<option value="${esc(p.id)}">${esc(p.title)} — ${esc(p.department)}</option>`).join('');posSelect.value='all';posSelect.onchange=()=>{if(posSelect.value!=='all'){state.selectedPositionId=posSelect.value;saveState();}filterMatching();};}
    filterMatching();
  }
  function filterMatching(){const pos=$('#matching-position')?.value||'all',min=Number($('#matching-min-score')?.value||0),status=$('#matching-status')?.value||'all';$$('#matching-table-body tr').forEach(row=>{const button=$('[data-action="view-candidate"]',row);if(!button)return;const c=getCandidate(button.dataset.id);row.hidden=!!((pos!=='all'&&c.positionId!==pos)||(overallScore(c)<min)||(status!=='all'&&c.status!==status));});const out=$('#matching-min-label');if(out)out.textContent=`${min}% فأكثر`;}
  function renderCriteria(){
    const host=$('#criteria-fields');if(!host)return;const labels={qualification:'المؤهلات العلمية',experience:'الخبرة المهنية',skills:'المهارات التقنية',interview:'نتائج المقابلة والمحاكاة'};
    host.innerHTML=Object.entries(labels).map(([key,label])=>`<label class="mwm-criteria-row"><span><b>${label}</b><small>وزن هذا المعيار في النتيجة النهائية</small></span><input type="number" min="0" max="100" name="${key}" value="${state.criteria[key]}"><strong>%</strong></label>`).join('');
    updateCriteriaSum();
  }
  function updateCriteriaSum(){const values=$$('#criteria-fields input').map(x=>Number(x.value||0));const total=values.reduce((a,b)=>a+b,0);const el=$('#criteria-total');if(el){el.textContent=`${total}%`;el.classList.toggle('invalid',total!==100);}const msg=$('#criteria-message');if(msg)msg.textContent=total===100?'مجموع الأوزان صحيح.':'يجب أن يكون مجموع الأوزان 100% قبل الحفظ.';}
  function renderReports(){
    const host=$('#reports-content');if(!host)return;const total=state.candidates.length,accepted=state.candidates.filter(c=>c.status==='مقبول').length,rejected=state.candidates.filter(c=>['مرفوض','مغلق'].includes(c.status)).length,interviews=state.candidates.filter(c=>['أكملت المقابلة','موعد مقابلة محدد'].includes(c.status)).length;
    host.innerHTML=`<div class="mwm-report-stats"><article><span>إجمالي الملفات</span><strong>${total}</strong></article><article><span>مرشحون مقبولون</span><strong>${accepted}</strong></article><article><span>مقابلات مكتملة / مجدولة</span><strong>${interviews}</strong></article><article><span>ملفات مغلقة / مرفوضة</span><strong>${rejected}</strong></article></div><div class="mwm-report-grid"><section class="mwm-panel"><h2>توزيع حالة المرشحين</h2><div class="mwm-report-bars">${[['طلب جديد',state.candidates.filter(c=>c.status==='طلب جديد').length],['قيد المراجعة',state.candidates.filter(c=>c.status==='قيد المراجعة').length],['المقابلة',interviews],['مقبول',accepted],['مغلق / مرفوض',rejected]].map(([label,n])=>`<div><span>${label}</span><div><i style="width:${total?Math.max(2,n/total*100):0}%"></i></div><b>${n}</b></div>`).join('')}</div></section><section class="mwm-panel"><h2>أفضل نتائج المطابقة</h2><div class="mwm-report-list">${state.candidates.map(c=>({...c,score:overallScore(c)})).sort((a,b)=>b.score-a.score).slice(0,5).map(c=>`<div><span>${esc(c.name)}<small>${esc(jobName(getPosition(c.positionId)))}</small></span><b>${c.score}%</b></div>`).join('')}</div></section></div><section class="mwm-panel mwm-report-decisions"><h2>سجل القرارات الإدارية</h2><table><thead><tr><th>المرشح</th><th>المنصب</th><th>نتيجة المطابقة</th><th>القرار</th><th>التاريخ</th><th>ملاحظات</th></tr></thead><tbody>${Object.keys(state.decisions).filter(id=>state.candidates.some(c=>c.id===id)&&state.decisions[id].value).map(id=>{const c=getCandidate(id),d=state.decisions[id];return `<tr><td>${esc(c.name)}</td><td>${esc(jobName(getPosition(c.positionId)))}</td><td>${overallScore(c)}%</td><td>${esc(d.value)}</td><td>${esc(dateText(d.date))}</td><td>${esc(d.notes||'—')}</td></tr>`}).join('')||'<tr><td colspan="6" class="mwm-empty">لا توجد قرارات محفوظة بعد. استخدم صفحة اتخاذ القرار لتسجيل القرار الأول.</td></tr>'}</tbody></table></section>`;
  }
  function renderSettings(){const f=$('#settings-form');if(!f)return;f.elements.name.value=state.profile?.name||'';f.elements.role.value=state.profile?.role||'مدير الموارد البشرية';f.elements.organization.value=state.profile?.organization||'MWM Smart HR';const status=$('#settings-storage-status');if(status)status.textContent=`${state.positions.length} مناصب · ${state.candidates.length} مرشحين · آخر حفظ محلي عند تعديل البيانات`}

  // Delegated events remain active after an HTML fragment is injected.
  document.addEventListener('click', event => {
    const route=event.target.closest('[data-route]');if(route){event.preventDefault();loadPage(route.dataset.route);return;}
    const action=event.target.closest('[data-action]');if(action){event.preventDefault();handleAction(action);return;}
    const decision=event.target.closest('[data-decision]');if(decision){event.preventDefault();$$('[data-decision]').forEach(b=>b.classList.remove('selected'));decision.classList.add('selected');const status=$('#decision-record-status');if(status)status.textContent=`الاختيار الحالي: ${decision.dataset.decision} — اضغط «تأكيد القرار» للحفظ`;return;}
    const tab=event.target.closest('.tab-item');if(tab?.dataset.route){loadPage(tab.dataset.route);return;}
    if(event.target.closest('.btn-add-new')){editingPositionId=null;resetPositionForm();$('.side-column')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    if(event.target.closest('.btn-cancel')){editingPositionId=null;resetPositionForm();return;}
    if(event.target.closest('.btn-add-candidate')){openCandidateModal();return;}
    if(event.target.closest('.btn-learn-more')){loadPage('matching');return;}
    if(event.target.closest('.btn-back')){if(currentPage==='job-card')saveJobCard(false);loadPage('positions');return;}
    if(event.target.closest('.req-btn-back')){saveRequirements(false);loadPage('job-card');return;}
    if(event.target.closest('.risks-btn-back')){saveConditions(false);loadPage('requirements');return;}
    if(event.target.closest('.btn-edit-data')){ $('.job-card-page .form-section')?.scrollIntoView({behavior:'smooth',block:'start'});toast('يمكنك تعديل الحقول ثم الضغط على حفظ كمسودة.');return; }
    if(event.target.closest('.req-btn-edit-data')){ $('.req-form-area')?.scrollIntoView({behavior:'smooth',block:'center'});toast('تُحفظ تعديلات المتطلبات تلقائيًا.');return; }
    if(event.target.closest('.risks-btn-edit-data')){ $('.conditions-section')?.scrollIntoView({behavior:'smooth',block:'center'});toast('تُحفظ تغييرات ظروف العمل تلقائيًا.');return; }
    if(event.target.closest('.btn-draft')){if(currentPage==='job-card')saveJobCard();else if(currentPage==='risks')saveConditions();else if(currentPage==='requirements')saveRequirements();return;}
    if(event.target.closest('.btn-next')){if(currentPage==='job-card'){saveJobCard(false);loadPage('requirements');}else if(currentPage==='risks'){saveConditions(false);loadPage('criteria');}else if(currentPage==='requirements'){saveRequirements(false);loadPage('risks');}return;}
    const reqTab=event.target.closest('.req-tab-item');if(reqTab){const tabs=$$('.req-tab-item');const idx=tabs.indexOf(reqTab);saveRequirements(false);showRequirementsTab(Math.max(0,idx));return;}
    const riskTab=event.target.closest('.risks-tab-item');if(riskTab){const tabs=$$('.risks-tab-item');const idx=tabs.indexOf(riskTab);const routes=['requirements','requirements','requirements','requirements','requirements','criteria','risks'];loadPage(routes[idx]||'risks');return;}
    if(event.target.closest('.btn-add-risk')){addRisk();return;}
    if(event.target.closest('#criteria-save')){saveCriteria();return;}
    if(event.target.closest('#reports-export')){exportCandidatesCsv();return;}
    if(event.target.closest('#settings-export')){downloadBackup();return;}
    if(event.target.closest('#settings-reset')){resetData();return;}
  });
  document.addEventListener('submit', event => {
    const form=event.target;
    if(form.matches('[data-position-form], .side-column form')){event.preventDefault();savePositionForm(form);return;}
    if(form.id==='mwm-candidate-form'){event.preventDefault();saveCandidateForm(form);return;}
    if(form.id==='settings-form'){event.preventDefault();saveSettings(form);return;}
  });
  document.addEventListener('change', event => {
    if(currentPage==='requirements'&&event.target.closest('.req-form-area'))saveRequirements(false);
    if(currentPage==='risks'&&event.target.closest('.conditions-section'))saveConditions(false);
    if(currentPage==='job-card'&&event.target.closest('.job-card-page .form-section'))saveJobCard(false);
    if(event.target.id==='decision-candidate-switch'){state.selectedCandidateId=event.target.value;const c=getCandidate(event.target.value);state.selectedPositionId=c.positionId;saveState();renderDecision();}
    if(event.target.id==='settings-import'&&event.target.files?.[0]){const file=event.target.files[0];const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(String(reader.result));if(!Array.isArray(parsed.positions)||!parsed.positions.length||!Array.isArray(parsed.candidates))throw new Error('invalid');state={...makeSeedState(),...parsed};saveState();loadPage('home');toast('تم استيراد النسخة الاحتياطية بنجاح.');}catch(_){toast('ملف النسخة الاحتياطية غير صالح.','error');}};reader.readAsText(file);event.target.value='';}
    if(event.target.closest('#criteria-fields'))updateCriteriaSum();
    if(event.target.id==='matching-position'||event.target.id==='matching-status')filterMatching();
  });
  document.addEventListener('input', event => {
    if(currentPage==='requirements'&&event.target.matches('.req-form-area textarea')){const out=$('.req-char-count');if(out)out.textContent=`${event.target.value.length}/500`;saveRequirements(false);}
    if(currentPage==='risks'&&event.target.matches('.prevention-textarea-wrapper textarea')){const out=$('.prevention-char-count');if(out)out.textContent=`${event.target.value.length}/500`;saveConditions(false);}
    if(event.target.closest('#criteria-fields'))updateCriteriaSum();
    if(event.target.id==='matching-min-score')filterMatching();
    if(event.target.matches('.search-container input'))filterCurrentTable(event.target.value);
  });
  function handleAction(el){const id=el.dataset.id,action=el.dataset.action;
    if(action==='download-candidate-cv'){const c=getCandidate(id);if(!c?.cvData){toast('لا توجد سيرة ذاتية مرفقة بهذا الملف.','error');return;}const a=document.createElement('a');a.href=c.cvData;a.download=c.cvName||`cv-${c.name||'candidate'}.pdf`;document.body.appendChild(a);a.click();a.remove();return;}
    if(action==='confirm-decision'){const selected=$('.decision-option.selected');if(!selected){toast('اختر القرار أولًا قبل تأكيده.','error');return;}saveDecision(selected.dataset.decision);return;}
    if(action==='view-position'||action==='edit-position'){state.selectedPositionId=id;saveState();if(action==='view-position')loadPage('job-card');else{editingPositionId=id;resetPositionForm(getPosition(id));$('.side-column')?.scrollIntoView({behavior:'smooth',block:'center'});}return;}
    if(action==='delete-position'){const p=getPosition(id);const linked=state.candidates.filter(c=>c.positionId===id).length;if(linked){toast(`لا يمكن حذف هذا المنصب لأنه مرتبط بـ ${linked} ملف/ملفات مرشحين. غيّر ارتباط الملفات أولًا.`,'error');return;}if(!confirm(`حذف المنصب «${p.title}»؟`))return;state.positions=state.positions.filter(x=>x.id!==id);if(!state.positions.length){state=makeSeedState();}if(state.selectedPositionId===id)state.selectedPositionId=state.positions[0].id;saveState();renderPositions();toast('تم حذف المنصب.');return;}
    if(action==='view-candidate'){state.selectedCandidateId=id;state.selectedPositionId=getCandidate(id).positionId;saveState();loadPage('decision');return;}
    if(action==='print-candidate'){state.selectedCandidateId=id;state.selectedPositionId=getCandidate(id).positionId;saveState();loadPage('decision').then(()=>setTimeout(()=>window.print(),300));return;}
    if(action==='delete-risk'){const p=getSelectedPosition();state.risks[p.id]=(state.risks[p.id]||[]).filter(r=>r.id!==id);saveState();fillRisks();toast('تم حذف الخطر.');return;}
    if(action==='edit-risk'){const p=getSelectedPosition(),r=(state.risks[p.id]||[]).find(x=>x.id===id);if(!r)return;const type=prompt('نوع الخطر:',r.type);if(type===null)return;const description=prompt('وصف الخطر:',r.description);if(description===null)return;const level=prompt('مستوى الخطورة (منخفض / متوسط / مرتفع):',r.level);if(level===null)return;r.type=type.trim()||r.type;r.description=description.trim()||r.description;r.level=['منخفض','متوسط','مرتفع'].includes(level.trim())?level.trim():'متوسط';saveState();fillRisks();toast('تم تحديث الخطر.');return;}
  }
  function savePositionForm(form){const fields=$$('input,select,textarea',form);const [title,department,count,status,date,notes]=fields;if(!title?.value.trim()||!department?.value){toast('أكمل اسم المنصب والمصلحة أولًا.','error');return;}let p=editingPositionId?getPosition(editingPositionId):null;if(!p){p={id:`p${Date.now()}`,details:{},date:today()};state.positions.unshift(p);}const previousTitle=p.title,previousDepartment=p.department,previousDetailTitle=p.details?.title;p.title=title.value.trim();p.department=department.value;p.count=Math.max(1,Number(count.value||1));p.status=status.value;p.date=date.value||today();p.notes=notes.value.trim();p.details=p.details||{};if(!previousDetailTitle||previousDetailTitle===`${previousTitle} في ${previousDepartment}`||previousDetailTitle===previousTitle)p.details.title=`${p.title} في ${p.department}`;if(!state.requirements[p.id])state.requirements[p.id]={degree:'ليسانس',specialty:p.department,experience:1,skills:['Excel','إعداد التقارير'],professionalSkills:['الدقة','التنظيم'],behavioralSkills:['التواصل','العمل الجماعي'],notes:''};if(!state.risks[p.id])state.risks[p.id]=[];if(!state.conditions[p.id])state.conditions[p.id]={workplace:'مقر الشركة (مكتب)',environment:'مكتبية',schedule:'دوام كامل',start:'08:30',end:'16:30',overtime:false,mobility:'ضمن مقر الشركة',supervision:'يعمل تحت إشراف مسؤول المصلحة',equipment:'حاسوب، طابعة',prevention:''};state.selectedPositionId=p.id;editingPositionId=null;saveState();renderPositions();toast('تم حفظ المنصب، وأصبحت بياناته متاحة في بقية الأقسام.');}
  function saveJobCard(showToast=true){const p=getSelectedPosition(),form=$('.job-card-page .form-section form');if(!p||!form)return;const f=$$('input,select,textarea',form);p.details={...(p.details||{}),title:f[0]?.value.trim()||p.title,manager:f[3]?.value||'',workplace:f[4]?.value||'',contract:f[5]?.value||'',description:f[6]?.value||''};p.title=(p.details.title||p.title).replace(/ في .*$/,'').trim()||p.title;p.department=(f[1]?.value||p.department).replace(/^مصلحة /,'');p.count=Math.max(1,Number(f[2]?.value||p.count));p.date=f[7]?.value||p.date;saveState();if(showToast)toast('تم حفظ بطاقة الوظيفة.');}
  function saveRequirements(showToast=true){
    const p=getSelectedPosition();if(!p)return;const r=state.requirements[p.id]||{};const idx=Number($('.requirements-page')?.dataset.reqTab||0);const fields=$$('.req-form-area [data-field]');
    const field=name=>fields.find(f=>f.dataset.field===name);
    const split=value=>String(value||'').split(/[،,\n]/).map(x=>x.trim()).filter(Boolean);
    if(idx===0){r.degree=field('degree')?.value||r.degree||'ليسانس';r.specialty=field('specialty')?.value||r.specialty||p.department;r.notes=field('notes')?.value||'';}
    if(idx===1){r.experience=Math.max(0,Number(field('experience')?.value||0));r.experienceType=field('experienceType')?.value||'اختيارية';r.experienceNotes=field('experienceNotes')?.value||'';}
    if(idx===2){r.skills=split(field('skills')?.value);r.tools=field('tools')?.value||'';}
    if(idx===3)r.professionalSkills=split(field('professionalSkills')?.value);
    if(idx===4)r.behavioralSkills=split(field('behavioralSkills')?.value);
    if(idx===5)r.notes=field('notes')?.value||'';
    r.degree=r.degree||'ليسانس';r.specialty=r.specialty||p.department;r.experience=Number(r.experience??1);r.skills=r.skills||['Excel','تنظيم الملفات','إعداد التقارير'];r.professionalSkills=r.professionalSkills||['الدقة','التنظيم','احترام السرية'];r.behavioralSkills=r.behavioralSkills||['التواصل','العمل الجماعي'];state.requirements[p.id]=r;saveState();syncRequirementSummary(p,r);const ta=$('.req-form-area textarea[data-field="notes"]');const count=$('.req-char-count');if(ta&&count)count.textContent=`${ta.value.length}/500`;if(showToast)toast('تم حفظ متطلبات المنصب.');
  }
  function saveConditions(showToast=true){const p=getSelectedPosition(),form=$('.conditions-section form');if(!p||!form)return;const f=$$('select,input',form);const c=state.conditions[p.id]||{};c.workplace=f[0]?.value||c.workplace;c.environment=f[1]?.value||c.environment;c.schedule=f[2]?.value||c.schedule;c.start=f.find(x=>x.type==='time')?.value||c.start;c.end=f.filter(x=>x.type==='time')[1]?.value||c.end;const overtime=f.find(x=>x.type==='radio'&&x.checked);c.overtime=overtime?.id==='overtime-yes'||overtime?.value==='yes';const selects=$$('select',form);c.mobility=selects[3]?.value||c.mobility;c.supervision=selects[4]?.value||c.supervision;c.equipment=selects[5]?.value||c.equipment;c.prevention=$('.prevention-textarea-wrapper textarea')?.value||c.prevention||'';state.conditions[p.id]=c;saveState();if(showToast)toast('تم حفظ ظروف العمل والوقاية.');}
  function saveCriteria(){const fields=$$('#criteria-fields input'),next={};fields.forEach(f=>next[f.name]=Math.max(0,Math.min(100,Number(f.value||0))));if(Object.values(next).reduce((a,b)=>a+b,0)!==100){toast('مجموع الأوزان يجب أن يساوي 100%.','error');return;}state.criteria=next;saveState();if(currentPage==='matching')renderMatching();else renderCriteria();toast('تم حفظ أوزان التقييم وتحديث نتائج المطابقة.');}
  function saveDecision(value){const c=getSelectedCandidate();if(!c)return;const notes=$('#decision-note')?.value||'';state.decisions[c.id]={value,notes,date:today()};if(value==='قبول المترشح')c.status='مقبول';else if(value==='رفض المترشح')c.status='مرفوض';else c.status='موعد مقابلة محدد';saveState();renderDecision();toast('تم حفظ القرار وربطه بملف المرشح والتقارير.');}
  function addRisk(){const type=prompt('نوع الخطر:','مخاطر مهنية');if(!type)return;const description=prompt('وصف الخطر:','اكتب وصفًا مختصرًا للخطر');if(!description)return;const level=prompt('مستوى الخطورة: منخفض، متوسط، مرتفع','متوسط')||'متوسط';const p=getSelectedPosition();state.risks[p.id]=state.risks[p.id]||[];state.risks[p.id].push({id:`r${Date.now()}`,type:type.trim(),description:description.trim(),level:['منخفض','متوسط','مرتفع'].includes(level.trim())?level.trim():'متوسط'});saveState();fillRisks();toast('تمت إضافة الخطر إلى سجل المنصب.');}
  function openCandidateModal(candidate=null){const old=$('#mwm-modal-backdrop');old?.remove();const html=`<div class="mwm-modal-backdrop" id="mwm-modal-backdrop"><section class="mwm-modal" dir="rtl" role="dialog" aria-modal="true"><h2>${candidate?'تعديل ملف المرشح':'إضافة مرشح جديد'}</h2><form id="mwm-candidate-form"><div><label>الاسم الكامل *</label><input name="name" required value="${esc(candidate?.name||'')}"></div><div><label>المنصب المطلوب *</label><select name="positionId" required>${state.positions.map(p=>`<option value="${esc(p.id)}" ${(candidate?.positionId||state.selectedPositionId)===p.id?'selected':''}>${esc(p.title)} — ${esc(p.department)}</option>`).join('')}</select></div><div><label>المؤهل العلمي *</label><input name="education" required value="${esc(candidate?.education||'')}"></div><div><label>سنوات الخبرة</label><input name="experienceYears" type="number" min="0" max="50" value="${Number(candidate?.experienceYears||0)}"></div><div class="full"><label>المهارات (افصل بينها بفاصلة)</label><input name="skills" value="${esc((candidate?.skills||[]).join('، '))}"></div><div><label>حالة الطلب</label><select name="status">${['طلب جديد','قيد المراجعة','أكملت المقابلة','موعد مقابلة محدد','مقبول','مرفوض','مغلق','منسحب'].map(s=>`<option ${(candidate?.status||'طلب جديد')===s?'selected':''}>${s}</option>`).join('')}</select></div><div><label>نتيجة المقابلة / المحاكاة</label><input name="interviewScore" type="number" min="0" max="100" value="${Number(candidate?.interviewScore||0)}"></div><div class="mwm-modal-actions full"><button class="primary" type="submit">حفظ الملف</button><button class="secondary" type="button" data-action="close-modal">إلغاء</button></div><input type="hidden" name="candidateId" value="${esc(candidate?.id||'')}"></form></section></div>`;document.body.insertAdjacentHTML('beforeend',html);}
  function saveCandidateForm(form){const data=new FormData(form),id=data.get('candidateId');let c=id?getCandidate(id):null;if(!c){c={id:`c${Date.now()}`,qualificationScore:75,experienceScore:50,skillsScore:65,interviewScore:0,applicationDate:today()};state.candidates.unshift(c);}c.name=String(data.get('name')||'').trim();c.positionId=String(data.get('positionId'));c.education=String(data.get('education')||'').trim();c.field=c.education.replace(/^(ليسانس|ماستر|دكتوراه|تقني سامي) في /,'');c.experienceYears=Math.max(0,Number(data.get('experienceYears')||0));c.skills=String(data.get('skills')||'').split(/[،,]/).map(s=>s.trim()).filter(Boolean);c.status=String(data.get('status')||'طلب جديد');c.interviewScore=Math.max(0,Math.min(100,Number(data.get('interviewScore')||0)));c.experienceScore=Math.min(100,50+c.experienceYears*15);c.qualificationScore=/ماستر|دكتوراه/.test(c.education)?92:/ليسانس/.test(c.education)?78:65;c.skillsScore=Math.min(100,55+c.skills.length*10);state.selectedCandidateId=c.id;state.selectedPositionId=c.positionId;saveState();$('#mwm-modal-backdrop')?.remove();if(currentPage==='candidates')renderCandidates();toast('تم حفظ الملف وربطه بالمنصب المحدد.');}
  function saveSettings(form){state.profile={name:form.elements.name.value.trim()||'مدير الموارد البشرية',role:form.elements.role.value.trim()||'مدير الموارد البشرية',organization:form.elements.organization.value.trim()||'MWM Smart HR'};saveState();const h=$('.profile-info h4');if(h)h.textContent=state.profile.name;const r=$('.profile-info p');if(r)r.textContent=state.profile.role;toast('تم حفظ إعدادات مساحة العمل.');}
  function exportCandidatesCsv(){const rows=[['الاسم','المنصب','المؤهل','الخبرة','المهارات','الحالة','نتيجة المطابقة'],...state.candidates.map(c=>[c.name,jobName(getPosition(c.positionId)),c.education,expText(c.experienceYears),c.skills.join('، '),c.status,overallScore(c)+'%'])];const csv='\ufeff'+rows.map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');downloadBlob(csv,'mwm-smart-hr-candidates.csv','text/csv;charset=utf-8;');}
  function downloadBackup(){downloadBlob(JSON.stringify(state,null,2),'mwm-smart-hr-backup.json','application/json');}
  function downloadBlob(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}
  function resetData(){if(!confirm('سيتم استعادة بيانات العرض الأولية وحذف تعديلات هذا المتصفح. هل تريد المتابعة؟'))return;state=makeSeedState();saveState();loadPage('home');toast('تمت استعادة بيانات العرض الأولية.');}
  function filterCurrentTable(q){const query=q.toLowerCase().trim();const rows=$$('#main-content-area tbody tr');rows.forEach(row=>{if(row.dataset.positionRow||row.dataset.candidateRow){row.hidden=!!(query&&!row.textContent.toLowerCase().includes(query));}});}

  document.addEventListener('click', event => { if(event.target.closest('[data-action="close-modal"]'))$('#mwm-modal-backdrop')?.remove(); });
  window.addEventListener('popstate',()=>{const page=location.hash.slice(1)||'home';loadPage(page,{skipHistory:true});});
  document.addEventListener('DOMContentLoaded',()=>{
    addAppStyles();
    if(!sessionStorage.getItem('mwmDemoLoggedIn')){location.replace('login.html');return;}
    state=getState();
    const page=location.hash.slice(1);loadPage(ROUTES[page]?page:'home',{skipHistory:true});
  });
})();
