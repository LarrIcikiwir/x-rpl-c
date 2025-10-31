// === Data kelas (siswa) ===
// Hilfayanti dan "qken octa" dihilangkan sesuai permintaan.
const students = [
  "ALIA","ASHILA RAMADHANI","ASRAF LAUMARA","ATHAILLA GUMILANG ZAMAN",
  "AULIA HAK","AUREL ANUGRAH","AZRIEL AKBAR","DILLA NUR AULIA","FEBRIYADI SAFAR",
  "FELIN FITRIANI","HASNI YANTI","IMEL SAFITRI","JOHARLIN","L. ALQILANO REZKY SANJAYA",
  "LAODE MUHAMAD ALKAF","MUH. HUZDAIFSYAH AL-FAUZHAN","MUH. RAFA PRATAMA R.",
  "MUHAMAD SAHRUL RAZAK","MUHAMMAD ABIB","MUHAMMAD AZHAR SONDENG","MUHAMMAD FADLI",
  "MUHAMMAD FAHRI RAMADHAN","MUHAMMAD NAZZAR JUNAEDI","MUHAMMAD PATIR",
  "MUHAMMAD RENOLD PRASETYA","NIAR LA ZIMU","NUR ANNISA","PILAR REHAN S.T",
  "RADLINA PURNAMA NINGSIH","RENO FEBRYAN","SABRI","SITTI HIJRAH",
  "SULTAN MUH. NUR AL FATH","ZULFADHLY ALIF ISKANDAR"
];

// === Jadwal mapel (sesuai gambar awal, ringkasan) ===
const schedule = {
  Senin: ["Dasar-Dasar Program","IPAS","Istirahat","Bahasa Indonesia"],
  Selasa: ["Informatika","Sejarah","Istirahat","Matematika"],
  Rabu: ["Dasar Program Keahlian","PJOK","Istirahat","Bahasa Inggris"],
  Kamis: ["Mulok","PPKN","Dasar Program Keahlian","Istirahat","Dasar Program"],
  Jumat: ["Seni Budaya","Agama","Istirahat","IPAS"]
};

// === Utility localStorage keys ===
const KEY_ATTEND = "kelas_attendance_v1";
const KEY_TRANSACTIONS = "kelas_transactions_v1";
const KEY_ROTATION = "kelas_rotation_v1"; // simpan indeks rotasi per hari

// === Render UI ===
function byId(id){return document.getElementById(id)}
const attendanceListEl = byId("attendance-list");
const saveAttendanceBtn = byId("save-attendance");
const clearAttendanceBtn = byId("clear-attendance");
const attendanceMsg = byId("attendance-msg");
const piketWeekday = byId("piket-weekday");
const generatePiketBtn = byId("generate-piket");
const piketListEl = byId("piket-list");
const kasStudent = byId("kas-student");
const kasAmount = byId("kas-amount");
const kasNote = byId("kas-note");
const addTxBtn = byId("add-transaction");
const balancesEl = byId("balances");
const transactionsEl = byId("transactions");
const scheduleEl = byId("schedule");

// load saved attendance or default (all absent)
let attendance = loadAttendance();
let transactions = loadTransactions();
let rotation = loadRotation();

// build attendance checklist
function renderAttendance(){
  attendanceListEl.innerHTML = "";
  students.forEach((s, idx) => {
    const div = document.createElement("div");
    div.className = "item";
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.id = "att-" + idx;
    chk.checked = !!attendance[s];
    chk.addEventListener("change", e => {
      attendance[s] = e.target.checked;
    });
    const label = document.createElement("label");
    label.htmlFor = chk.id;
    label.innerText = s;
    div.appendChild(chk);
    div.appendChild(label);
    attendanceListEl.appendChild(div);
  });
}

// save & clear
saveAttendanceBtn.addEventListener("click", () => {
  localStorage.setItem(KEY_ATTEND, JSON.stringify(attendance));
  attendanceMsg.innerText = "Absensi tersimpan.";
  setTimeout(()=> attendanceMsg.innerText="", 2500);
});
clearAttendanceBtn.addEventListener("click", () => {
  attendance = {};
  localStorage.removeItem(KEY_ATTEND);
  renderAttendance();
});

// generate piket: rotasi per hari, pick 6 from present
generatePiketBtn.addEventListener("click", () => {
  const day = piketWeekday.value;
  const present = students.filter(s => attendance[s]);
  const needed = 6;
  let selected = [];

  if(present.length === 0){
    piketListEl.innerHTML = "<li>Tidak ada yang hadir hari ini.</li>";
    return;
  }

  // use rotation index to pick sequentially through present list
  if(!rotation[day]) rotation[day] = 0;
  let start = rotation[day] % present.length;
  for(let i=0; i<Math.min(needed, present.length); i++){
    selected.push( present[(start + i) % present.length] );
  }
  // advance rotation for next generation (so it rotates each time)
  rotation[day] = (start + Math.min(needed, present.length)) % Math.max(1,present.length);
  saveRotation();

  // render
  piketListEl.innerHTML = "";
  selected.forEach(name=>{
    const li = document.createElement("li");
    li.innerText = name;
    piketListEl.appendChild(li);
  });
});

// === Kas: balances & transactions ===
function populateKasStudents(){
  kasStudent.innerHTML = "";
  students.forEach(s=>{
    const opt = document.createElement("option");
    opt.value = s;
    opt.innerText = s;
    kasStudent.appendChild(opt);
  });
}

function addTransaction(student, amount, note){
  const tx = {
    id: Date.now(),
    student,
    amount: Number(amount),
    note: note || "",
    date: new Date().toISOString()
  };
  transactions.unshift(tx); // newest first
  localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(transactions));
  renderTransactions();
  renderBalances();
}

addTxBtn.addEventListener("click", ()=>{
  const student = kasStudent.value;
  const amount = kasAmount.value;
  const note = kasNote.value;
  if(!student || !amount){ alert("Pilih siswa dan masukkan jumlah."); return; }
  addTransaction(student, amount, note);
  kasAmount.value = ""; kasNote.value = "";
});

// compute balances
function computeBalances(){
  const bal = {};
  students.forEach(s=> bal[s]=0);
  transactions.forEach(tx => {
    if(bal[tx.student] !== undefined) bal[tx.student] += Number(tx.amount);
  });
  return bal;
}

function renderBalances(){
  const bal = computeBalances();
  balancesEl.innerHTML = "";
  students.forEach(s => {
    const div = document.createElement("div");
    div.className = "balance-card";
    div.innerHTML = `<strong>${s}</strong><div>Saldo: Rp ${formatNumber(bal[s])}</div>`;
    balancesEl.appendChild(div);
  });
}

function renderTransactions(){
  transactionsEl.innerHTML = "";
  if(transactions.length === 0){
    transactionsEl.innerHTML = "<div class='muted'>Belum ada transaksi.</div>";
    return;
  }
  transactions.forEach(tx=>{
    const d = new Date(tx.date);
    const txEl = document.createElement("div");
    txEl.className = "tx";
    txEl.innerHTML = `<div><strong>${tx.student}</strong><div style="font-size:12px;color:#666">${tx.note || ""}</div></div>
                      <div style="text-align:right"><div>${tx.amount >=0? "+" : ""}${tx.amount}</div><div style="font-size:12px;color:#666">${d.toLocaleString()}</div></div>`;
    transactionsEl.appendChild(txEl);
  });
}

// === Jadwal render ===
function renderSchedule(){
  scheduleEl.innerHTML = "";
  Object.keys(schedule).forEach(day=>{
    const box = document.createElement("div");
    box.className = "day";
    const h = document.createElement("h4");
    h.innerText = day;
    box.appendChild(h);
    const ul = document.createElement("ul");
    schedule[day].forEach(sub => {
      const li = document.createElement("li");
      li.innerText = sub;
      ul.appendChild(li);
    });
    box.appendChild(ul);
    scheduleEl.appendChild(box);
  });
}

// === Helpers & storage ===
function loadAttendance(){
  try {
    const raw = localStorage.getItem(KEY_ATTEND);
    return raw ? JSON.parse(raw) : {};
  } catch(e){ return {}; }
}
function loadTransactions(){
  try {
    const raw = localStorage.getItem(KEY_TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}
function loadRotation(){
  try {
    const raw = localStorage.getItem(KEY_ROTATION);
    return raw ? JSON.parse(raw) : {};
  } catch(e){ return {}; }
}
function saveRotation(){
  localStorage.setItem(KEY_ROTATION, JSON.stringify(rotation));
}
function formatNumber(n){
  return Number(n).toLocaleString('id-ID');
}

// === Init ===
function init(){
  renderAttendance();
  populateKasStudents();
  renderBalances();
  renderTransactions();
  renderSchedule();
  // restore piket list as empty initially
  piketListEl.innerHTML = "<li>Pilih hari lalu klik Generate Piket.</li>";
}
init();
