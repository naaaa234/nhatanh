const DATA_URL = "questions.json";
let data, section = "mc", index = 0, submitted = false;
const answers = { mc: {}, tf: {} };
// Đáp án tham khảo cho các câu có đủ nội dung để xác định chắc chắn.
// Những câu bị thiếu hình/sơ đồ hoặc phần phát biểu trong bản trích xuất sẽ không bị chấm đoán.
const answerKey = {
  mc: {1:"C",2:"A",3:"D",4:"D",5:"C",6:"B",7:"B",8:"B",9:"A",10:"D",11:"D",12:"B",13:"A",15:"C",16:"B",17:"C",18:"C",19:"A",20:"A",21:"A",22:"D",23:"B",24:"D",25:"C",26:"B",27:"B",29:"D",30:"D",31:"A",32:"D",33:"D",34:"B",35:"B",36:"C",37:"C",38:"B",40:"A",41:"A",42:"C",43:"B",44:"C",45:"C",46:"B",47:"C",48:"A",49:"D",51:"D",52:"D",53:"C",54:"A",55:"A",56:"A",57:"B",59:"C",60:"D",61:"D",62:"C",63:"C",64:"D",65:"D",66:"A",67:"D",68:"B",69:"A",70:"C",74:"C",75:"B",76:"D",77:"B",78:"B",79:"C",80:"C",81:"C",82:"C",84:"A",85:"B",86:"B",87:"C",88:"C",89:"D",90:"A",91:"A",92:"C"},
  tf: {
    1:{a:true,b:true,c:false,d:false},
    2:{a:true,b:true,c:true,d:false},
    4:{a:false,b:true,c:true,d:false},
    5:{a:false,b:false,c:true,d:false},
    7:{a:true,b:true,c:false,d:true},
    9:{a:true,b:true,c:true,d:false}
  }
};
const mcCorrect = q => answerKey.mc[q.number];
const tfCorrect = (q,key) => answerKey.tf[q.number]?.[key];
const isGradedTF = (q,key) => typeof tfCorrect(q,key) === "boolean";
const $ = id => document.getElementById(id);
const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const getItems = () => section === "mc" ? data.multipleChoice : data.trueFalse;
const answeredMC = () => Object.keys(answers.mc).length;
const answeredTF = () => Object.values(answers.tf).reduce((n, v) => n + Object.keys(v).length, 0);
function save(){ localStorage.setItem("hoa12-answers-v1", JSON.stringify(answers)); }
function load(){ try { const old=JSON.parse(localStorage.getItem("hoa12-answers-v1")||"null"); if(old){answers.mc=old.mc||{};answers.tf=old.tf||{};} } catch(e){} }
function render(){
  const items=getItems(); if(index<0)index=0;if(index>=items.length)index=items.length-1;
  const q=items[index]; const area=$("questionArea");
  if(section==="mc"){
    area.innerHTML=`<div class="q-header"><div class="q-number">${q.number}</div><div><div class="q-kind">Câu hỏi trắc nghiệm</div><h2 class="q-title">Câu ${q.number}</h2></div></div><div class="q-content">${escapeHtml(q.text)}</div>
      <div class="options">${(q.options||[]).map(o=>{
        const chosen=answers.mc[q.number]===o.key, key=mcCorrect(q), graded=!!key;
        const cls=submitted&&graded&&o.key===key?' correct-answer':(submitted&&graded&&chosen&&o.key!==key?' wrong-answer':'');
        return `<div class="option ${chosen?'selected':''}${cls}" data-answer="${escapeHtml(o.key)}"><span class="radio">${escapeHtml(o.key)}</span><span class="option-text">${escapeHtml(o.text)}${submitted&&graded&&o.key===key?' <strong class="feedback-label">✓ Đáp án đúng</strong>':(submitted&&graded&&chosen&&o.key!==key?' <strong class="feedback-label">✕ Bạn chọn sai</strong>':'')}</span></div>`;
      }).join("")}</div>
      ${q.note?`<div class="note">⚠️ ${escapeHtml(q.note)}</div>`:""}
      ${!(q.options||[]).length?`<div class="note">Câu này chưa trích xuất được lựa chọn đầy đủ từ file Word. Hãy đối chiếu đề gốc.</div>`:""}
      ${submitted&&mcCorrect(q)&&answers.mc[q.number]!==undefined?`<div class="grading-feedback ${answers.mc[q.number]===mcCorrect(q)?'feedback-correct':'feedback-wrong'}">${answers.mc[q.number]===mcCorrect(q)?'✓ Chính xác!':'✕ Chưa chính xác.'} Đáp án đúng: <strong>${mcCorrect(q)}</strong>.</div>`:(!mcCorrect(q)?`<div class="note">Câu này hiện chưa có đáp án chấm tự động vì bản đề trích xuất thiếu lựa chọn, sơ đồ hoặc phần phát biểu. Bạn vẫn có thể chọn đáp án để lưu bài.</div>`:'')}`;
    area.querySelectorAll(".option").forEach(el=>el.addEventListener("click",()=>{answers.mc[q.number]=el.dataset.answer;save();update();render();}));
  } else {
    area.innerHTML=`<div class="q-header"><div class="q-number">${q.number}</div><div><div class="q-kind">Phát biểu đúng / sai</div><h2 class="q-title">Câu ${q.number}</h2></div></div><div class="q-content">${escapeHtml(q.text)}</div><div class="tf-statements">${(q.statements||[]).map(s=>{const v=(answers.tf[q.number]||{})[s.key], key=tfCorrect(q,s.key), graded=isGradedTF(q,s.key);const correctValue=key?'Đúng':'Sai';return `<div class="tf-row"><div class="tf-statement"><strong>${s.key.toUpperCase()})</strong> ${escapeHtml(s.text)}</div><div class="tf-buttons"><button class="tf-choice ${v==='Đúng'?'selected true':''} ${submitted&&graded&&correctValue==='Đúng'?'correct-answer':''} ${submitted&&graded&&v==='Đúng'&&correctValue!=='Đúng'?'wrong-answer':''}" data-key="${s.key}" data-value="Đúng">✓ Đúng</button><button class="tf-choice ${v==='Sai'?'selected false':''} ${submitted&&graded&&correctValue==='Sai'?'correct-answer':''} ${submitted&&graded&&v==='Sai'&&correctValue!=='Sai'?'wrong-answer':''}" data-key="${s.key}" data-value="Sai">✕ Sai</button></div>${submitted&&v!==undefined&&graded?`<div class="grading-feedback ${v===correctValue?'feedback-correct':'feedback-wrong'}">${v===correctValue?'✓ Chính xác!':'✕ Chưa chính xác.'} Đáp án: <strong>${correctValue}</strong>.</div>`:(!graded?`<div class="muted">Ý này chưa có đáp án chấm tự động.</div>`:'')}</div>`}).join("")}</div>`;
    area.querySelectorAll(".tf-choice").forEach(el=>el.addEventListener("click",()=>{if(!answers.tf[q.number])answers.tf[q.number]={};answers.tf[q.number][el.dataset.key]=el.dataset.value;save();update();render();}));
  }
  $("positionText").textContent=`Câu ${index+1} / ${items.length}`;
  $("prevBtn").disabled=index===0;$("nextBtn").disabled=index===items.length-1;
  $("prevBtn").style.opacity=index===0?".45":"1";$("nextBtn").style.opacity=index===items.length-1?".45":"1";
  renderGrid();update();
}
function renderGrid(){
  const items=getItems();
  $("questionGrid").innerHTML=items.map((q,i)=>{
    const done=section==="mc"?answers.mc[q.number]!==undefined:Object.keys(answers.tf[q.number]||{}).length===(q.statements||[]).length;
    return `<button class="q-jump ${i===index?'active':''} ${done?'done':''}" data-index="${i}" title="Câu ${q.number}">${q.number}</button>`;
  }).join("");
  $("questionGrid").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{index=Number(b.dataset.index);render();}));
}
function update(){
  const totalMC=data.multipleChoice.length, totalTF=data.trueFalse.reduce((n,q)=>n+(q.statements||[]).length,0);
  const doneMC=answeredMC(), doneTF=answeredTF(), done=doneMC+doneTF, total=totalMC+totalTF;
  $("progressText").textContent=`Đã trả lời ${done} / ${total} ý`;
  $("progressPercent").textContent=`${Math.round(done/total*100)}%`;
  $("progressBar").style.width=`${done/total*100}%`;
  $("answeredCount").textContent=done;
  $("mcCount").textContent=`${doneMC} / ${totalMC}`;
  $("tfCount").textContent=`${doneTF} / ${totalTF} ý`;
}
function switchSection(s){section=s;index=0;document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.section===s));render();}
function showResults(){
  submitted = true;
  render();
  let mcGraded=0, mcRight=0, tfGraded=0, tfRight=0;
  data.multipleChoice.forEach(q=>{if(mcCorrect(q)){mcGraded++;if(answers.mc[q.number]===mcCorrect(q))mcRight++;}});
  data.trueFalse.forEach(q=>(q.statements||[]).forEach(st=>{if(isGradedTF(q,st.key)){tfGraded++;const v=(answers.tf[q.number]||{})[st.key];const expected=tfCorrect(q,st.key)?"Đúng":"Sai";if(v===expected)tfRight++;}}));
  const mcAnswered=answeredMC(), totalTF=data.trueFalse.reduce((n,q)=>n+(q.statements||[]).length,0), doneTF=answeredTF();
  const totalGraded=mcGraded+tfGraded, totalRight=mcRight+tfRight;
  const ungraded=(data.multipleChoice.length-mcGraded)+(totalTF-tfGraded);
  const missingMC=data.multipleChoice.filter(q=>answers.mc[q.number]===undefined).length;
  const percentage=totalGraded?Math.round(totalRight/totalGraded*100):0;
  $("resultBody").innerHTML=`<div class="result-score"><strong>${totalRight} / ${totalGraded}</strong><span>${percentage}% câu/ý được chấm đúng</span></div><div class="result-stat"><span>Trắc nghiệm đúng</span><strong>${mcRight} / ${mcGraded}</strong></div><div class="result-stat"><span>Ý đúng/sai đúng</span><strong>${tfRight} / ${tfGraded}</strong></div><div class="result-stat"><span>Trắc nghiệm đã chọn</span><strong>${mcAnswered} / ${data.multipleChoice.length}</strong></div><div class="result-stat"><span>Ý đúng/sai đã chọn</span><strong>${doneTF} / ${totalTF}</strong></div><div class="result-stat"><span>Câu trắc nghiệm còn trống</span><strong>${missingMC}</strong></div><div class="result-stat"><span>Câu/ý chưa có đáp án chấm tự động</span><strong>${ungraded}</strong></div><h3 class="result-detail-title">Kết quả từng câu</h3><div class="result-details">${data.multipleChoice.filter(q=>mcCorrect(q)).map(q=>{const chosen=answers.mc[q.number];const correct=chosen===mcCorrect(q);return `<div class="result-detail ${chosen===undefined?'result-unanswered':(correct?'result-correct':'result-wrong')}"><strong>Câu ${q.number}</strong><span>${chosen===undefined?'Chưa trả lời':(correct?'Đúng':'Sai')} · Bạn chọn: ${chosen===undefined?'—':escapeHtml(chosen)} · Đáp án: ${mcCorrect(q)}</span></div>`;}).join('')}${data.trueFalse.map(q=>(q.statements||[]).filter(st=>isGradedTF(q,st.key)).map(st=>{const chosen=(answers.tf[q.number]||{})[st.key];const expected=tfCorrect(q,st.key)?'Đúng':'Sai';const correct=chosen===expected;return `<div class="result-detail ${chosen===undefined?'result-unanswered':(correct?'result-correct':'result-wrong')}"><strong>Câu ${q.number} ${st.key.toUpperCase()})</strong><span>${chosen===undefined?'Chưa trả lời':(correct?'Đúng':'Sai')} · Bạn chọn: ${chosen===undefined?'—':chosen} · Đáp án: ${expected}</span></div>`;}).join('')).join('')}</div><p class="muted">Đây là đáp án tham khảo được bổ sung cho các câu/ý có đủ nội dung trong bản trích xuất. Các câu thiếu hình, sơ đồ hoặc phần phát biểu chưa được chấm để tránh báo sai.</p>`;
  $("resultModal").classList.remove("hidden");
}
$("prevBtn").addEventListener("click",()=>{if(index>0){index--;render();}});
$("nextBtn").addEventListener("click",()=>{if(index<getItems().length-1){index++;render();}});
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>switchSection(t.dataset.section)));
$("submitBtn").addEventListener("click",showResults);
$("closeModal").addEventListener("click",()=>$("resultModal").classList.add("hidden"));
$("continueBtn").addEventListener("click",()=>$("resultModal").classList.add("hidden"));
$("resultModal").addEventListener("click",e=>{if(e.target===$("resultModal"))$("resultModal").classList.add("hidden");});
$("resetBtn").addEventListener("click",()=>{if(confirm("Bạn có chắc muốn xóa toàn bộ đáp án đã khoanh?")){answers.mc={};answers.tf={};save();render();}});
fetch(DATA_URL).then(r=>{if(!r.ok)throw new Error("Không tải được questions.json");return r.json();}).then(d=>{data=d;load();render();}).catch(err=>{$("questionArea").innerHTML=`<div class="note">Không tải được dữ liệu câu hỏi. Hãy mở thư mục bằng Live Server trong VS Code, không mở trực tiếp file HTML. Chi tiết: ${escapeHtml(err.message)}</div>`;});