
/* ===== DATA ===== */
const ADMIN_PIN = "123456";

const fields = [
  {
    id: 1,
    name: "Lapangan Kampus Futsal",
    price: 100000,
    status: "Aktif",
    image: "https://images.unsplash.com/photo-1624880357913-a8539238245b?auto=format&fit=crop&w=1000&q=80",
    facilities: ["🏠 Indoor", "🌿 Rumput Sintetis", "💡 Lampu Malam", "🪑 Ruang Tunggu"]
  }
];

const timeSlots = [
  "08.00 - 09.00","09.00 - 10.00","10.00 - 11.00","11.00 - 12.00",
  "13.00 - 14.00","14.00 - 15.00","15.00 - 16.00","16.00 - 17.00",
  "17.00 - 18.00","18.00 - 19.00","19.00 - 20.00","20.00 - 21.00",
  "21.00 - 22.00","22.00 - 23.00"
];

const defaultBookings = [
  {
    code:"BKF-001",name:"Andi Pratama",whatsapp:"081234567890",
    fieldId:1,fieldName:"Lapangan Kampus Futsal",
    date:getToday(),time:"17.00 - 18.00",duration:1,total:100000,
    status:"Dikonfirmasi",paymentStatus:"Belum Bayar",note:"Latihan rutin"
  },
  {
    code:"BKF-002",name:"Bima FC",whatsapp:"089876543210",
    fieldId:1,fieldName:"Lapangan Kampus Futsal",
    date:getToday(),time:"19.00 - 20.00",duration:1,total:100000,
    status:"Menunggu Konfirmasi",paymentStatus:"Belum Bayar",note:"Friendly match"
  }
];

const maintenanceSlots = [
  { fieldId:1, date:getToday(), time:"13.00 - 14.00" }
];

/* ===== STATUS ALUR =====
  Menunggu Konfirmasi  → admin belum approve
  Dikonfirmasi         → admin sudah approve, belum bayar
  Sudah Bayar          → user datang & bayar, admin tandai
  Selesai              → sesi selesai
  Dibatalkan           → dibatalkan
=============================== */

/* ===== DOM ===== */
const fieldGrid            = document.getElementById("fieldGrid");
const scheduleDate         = document.getElementById("scheduleDate");
const scheduleField        = document.getElementById("scheduleField");
const slotGrid             = document.getElementById("slotGrid");
const checkScheduleBtn     = document.getElementById("checkScheduleBtn");
const bookingForm          = document.getElementById("bookingForm");
const bookingField         = document.getElementById("bookingField");
const bookingDate          = document.getElementById("bookingDate");
const startTime            = document.getElementById("startTime");
const duration             = document.getElementById("duration");
const totalPrice           = document.getElementById("totalPrice");
const summaryCard          = document.getElementById("summaryCard");
const historyTable         = document.getElementById("historyTable");
const adminTable           = document.getElementById("adminTable");
const adminTotalBooking    = document.getElementById("adminTotalBooking");
const adminWaitingBooking  = document.getElementById("adminWaitingBooking");
const adminConfirmedBooking= document.getElementById("adminConfirmedBooking");
const adminPaidBooking     = document.getElementById("adminPaidBooking");
const adminDoneBooking     = document.getElementById("adminDoneBooking");
const adminRevenue         = document.getElementById("adminRevenue");
const statTotalBooking     = document.getElementById("statTotalBooking");
const menuToggle           = document.getElementById("menuToggle");
const navMenu              = document.getElementById("navMenu");
const navbar               = document.getElementById("navbar");
const modal                = document.getElementById("modal");
const modalOverlay         = document.getElementById("modalOverlay");
const modalClose           = document.getElementById("modalClose");
const modalBody            = document.getElementById("modalBody");
const adminLoginGate       = document.getElementById("adminLoginGate");
const adminDashboard       = document.getElementById("adminDashboard");
const adminPin             = document.getElementById("adminPin");
const loginBtn             = document.getElementById("loginBtn");
const loginError           = document.getElementById("loginError");
const logoutBtn            = document.getElementById("logoutBtn");
const filterStatus         = document.getElementById("filterStatus");
const filterDate           = document.getElementById("filterDate");
const resetFilterBtn       = document.getElementById("resetFilterBtn");

let bookings = loadBookings();
let adminLoggedIn = false;

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  setupHeroDate();
  setupDefaultDates();
  renderFields();
  populateSelects();
  renderSchedule();
  renderHistory();
  updateTotalPrice();
});

/* ===== NAVBAR ===== */
menuToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("show");
  menuToggle.classList.toggle("open", open);
});
document.querySelectorAll(".nav-link, .nav-cta").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("show");
    menuToggle.classList.remove("open");
  });
});
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});

/* ===== SCHEDULE EVENTS ===== */
checkScheduleBtn.addEventListener("click", renderSchedule);
scheduleDate.addEventListener("change", renderSchedule);
scheduleField.addEventListener("change", renderSchedule);

/* ===== BOOKING EVENTS ===== */
bookingField.addEventListener("change", () => { syncAvailableStartTimes(); updateTotalPrice(); });
bookingDate.addEventListener("change",  () => { syncAvailableStartTimes(); updateTotalPrice(); });
duration.addEventListener("change", updateTotalPrice);
startTime.addEventListener("change", updateTotalPrice);
bookingForm.addEventListener("submit", handleBookingSubmit);

/* ===== ADMIN LOGIN ===== */
loginBtn.addEventListener("click", handleLogin);
adminPin.addEventListener("keydown", e => { if (e.key === "Enter") handleLogin(); });
logoutBtn.addEventListener("click", handleLogout);
filterStatus.addEventListener("change", renderAdmin);
filterDate.addEventListener("change", renderAdmin);
resetFilterBtn.addEventListener("click", () => {
  filterStatus.value = "semua";
  filterDate.value = "";
  renderAdmin();
});

function handleLogin() {
  const pin = adminPin.value.trim();
  if (pin === ADMIN_PIN) {
    adminLoggedIn = true;
    loginError.textContent = "";
    adminPin.value = "";
    adminLoginGate.classList.add("hidden");
    adminDashboard.classList.remove("hidden");
    renderAdmin();
  } else {
    loginError.textContent = "PIN salah. Coba lagi.";
    adminPin.value = "";
    adminPin.focus();
  }
}

function handleLogout() {
  adminLoggedIn = false;
  adminDashboard.classList.add("hidden");
  adminLoginGate.classList.remove("hidden");
}

/* ===== MODAL ===== */
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ===== HELPERS ===== */
function getToday() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}

function setupHeroDate() {
  const el = document.getElementById("heroDate");
  if (!el) return;
  el.textContent = new Date().toLocaleDateString("id-ID", { weekday:"long",day:"numeric",month:"long",year:"numeric" });
}

function setupDefaultDates() {
  const today = getToday();
  scheduleDate.value = today; scheduleDate.min = today;
  bookingDate.value  = today; bookingDate.min  = today;
}

function loadBookings() {
  const saved = localStorage.getItem("futsal_bookings_v3");
  if (saved) return JSON.parse(saved);
  localStorage.setItem("futsal_bookings_v3", JSON.stringify(defaultBookings));
  return JSON.parse(JSON.stringify(defaultBookings));
}

function saveBookings() {
  localStorage.setItem("futsal_bookings_v3", JSON.stringify(bookings));
}

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
}

/* ===== RENDER FIELDS ===== */
function renderFields() {
  fieldGrid.innerHTML = "";
  fields.forEach(f => {
    const card = document.createElement("div");
    card.className = "field-card";
    card.innerHTML = `
      <div class="field-image" style="background-image:url('${f.image}')"></div>
      <div class="field-body">
        <div class="field-top">
          <div>
            <h3>${f.name}</h3>
            <span class="field-status">${f.status}</span>
          </div>
          <div>
            <p class="field-price">${formatRupiah(f.price)}</p>
            <p class="field-price-sub">per jam</p>
          </div>
        </div>
        <p class="field-desc">Lapangan futsal indoor yang dapat dipesan secara online. Pilih tanggal dan jam yang tersedia, kemudian bayar langsung di tempat saat tiba.</p>
        <div class="facilities">${f.facilities.map(i=>`<span>${i}</span>`).join("")}</div>
        <button class="btn btn-primary" onclick="selectFieldForBooking(${f.id})">Pilih Lapangan →</button>
      </div>`;
    fieldGrid.appendChild(card);
  });
}

/* ===== SELECTS ===== */
function populateSelects() {
  scheduleField.innerHTML = ""; bookingField.innerHTML = ""; startTime.innerHTML = "";
  fields.forEach(f => {
    scheduleField.innerHTML += `<option value="${f.id}">${f.name}</option>`;
    bookingField.innerHTML  += `<option value="${f.id}">${f.name}</option>`;
  });
  timeSlots.forEach(s => { startTime.innerHTML += `<option value="${s}">${s}</option>`; });
  syncAvailableStartTimes();
}

function selectFieldForBooking(fieldId) {
  bookingField.value = fieldId;
  syncAvailableStartTimes(); updateTotalPrice();
  document.getElementById("booking").scrollIntoView({ behavior:"smooth" });
}

/* ===== SLOT STATUS ===== */
function getSlotStatus(fieldId, date, slot) {
  if (maintenanceSlots.some(m => m.fieldId===Number(fieldId) && m.date===date && m.time===slot))
    return "Maintenance";

  const b = bookings.find(b =>
    b.fieldId===Number(fieldId) && b.date===date && b.time===slot && b.status!=="Dibatalkan"
  );
  if (!b) return "Tersedia";
  if (b.status === "Selesai") return "Selesai";
  if (b.status === "Dikonfirmasi" || b.status === "Sudah Bayar") return "Dibooking";
  return "Menunggu";
}

/* ===== RENDER SCHEDULE ===== */
function renderSchedule() {
  const selDate  = scheduleDate.value;
  const selField = Number(scheduleField.value);
  slotGrid.innerHTML = "";

  timeSlots.forEach(slot => {
    const status   = getSlotStatus(selField, selDate, slot);
    const disabled = status !== "Tersedia";
    const card = document.createElement("div");
    card.className = `slot-card${disabled ? " slot-card--disabled" : ""}`;

    const pillMap = {
      "Tersedia":    "slot-available-pill",
      "Dibooking":   "slot-booked-pill",
      "Menunggu":    "slot-waiting-pill",
      "Selesai":     "slot-done-pill",
      "Maintenance": "slot-maintenance-pill"
    };

    card.innerHTML = `<h4>${slot}</h4><span class="slot-status-pill ${pillMap[status]||"slot-available-pill"}">${status}</span>`;

    if (!disabled) {
      card.addEventListener("click", () => {
        bookingDate.value = selDate; bookingField.value = selField;
        syncAvailableStartTimes(); startTime.value = slot; updateTotalPrice();
        document.getElementById("booking").scrollIntoView({ behavior:"smooth" });
      });
    }
    slotGrid.appendChild(card);
  });
}

/* ===== SYNC START TIMES ===== */
function syncAvailableStartTimes() {
  const selField = Number(bookingField.value);
  const selDate  = bookingDate.value;
  Array.from(startTime.options).forEach(opt => {
    opt.disabled = getSlotStatus(selField, selDate, opt.value) !== "Tersedia";
  });
  // Auto-select first available
  const firstAvail = Array.from(startTime.options).find(o => !o.disabled);
  if (firstAvail) startTime.value = firstAvail.value;
}

/* ===== PRICE ===== */
function updateTotalPrice() {
  const f = fields.find(f => f.id === Number(bookingField.value));
  totalPrice.textContent = formatRupiah(f ? f.price * Number(duration.value) : 0);
}

/* ===== BOOKING SUBMIT ===== */
function handleBookingSubmit(e) {
  e.preventDefault();
  const name     = document.getElementById("nama").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const selFId   = Number(bookingField.value);
  const selF     = fields.find(f => f.id === selFId);
  const date     = bookingDate.value;
  const time     = startTime.value;
  const dur      = Number(duration.value);
  const note     = document.getElementById("catatan").value.trim();

  if (!name || !whatsapp || !date || !time) {
    showModal(`<h3>Data belum lengkap</h3><p>Mohon isi semua field yang wajib diisi.</p>`);
    return;
  }
  if (!whatsapp.match(/^[0-9]{9,14}$/)) {
    showModal(`<h3>Nomor tidak valid</h3><p>Masukkan nomor WhatsApp yang benar (9–14 digit angka).</p>`);
    return;
  }

  if (getSlotStatus(selFId, date, time) !== "Tersedia") {
    showModal(`<h3>Slot tidak tersedia</h3><p>Jadwal <b>${time}</b> pada <b>${formatDate(date)}</b> sudah tidak tersedia. Silakan pilih jam lain.</p>`);
    renderSchedule(); syncAvailableStartTimes();
    return;
  }

  const code = generateCode();
  const total = selF.price * dur;

  const newB = { code, name, whatsapp, fieldId:selFId, fieldName:selF.name, date, time, duration:dur, total, status:"Menunggu Konfirmasi", paymentStatus:"Belum Bayar", note };
  bookings.push(newB);
  saveBookings();

  renderSummary(newB);
  renderSchedule();
  renderHistory();
  if (adminLoggedIn) renderAdmin();
  syncAvailableStartTimes();

  bookingForm.reset();
  setupDefaultDates();
  populateSelects();
  updateTotalPrice();

  showModal(`
    <h3>Booking Berhasil! 🎉</h3>
    <p>Kode booking kamu: <b>${code}</b></p>
    <p>Status: <b>Menunggu Konfirmasi</b></p>
    <p style="margin-top:10px;color:var(--muted);font-size:.84rem;line-height:1.6;">
      Admin akan mengkonfirmasi booking kamu. Setelah dikonfirmasi, datanglah ke lapangan dan tunjukkan kode booking untuk melakukan pembayaran.
    </p>
  `);
}

function generateCode() {
  return `BKF-${String(bookings.length+1).padStart(3,"0")}`;
}

/* ===== SUMMARY ===== */
function renderSummary(b) {
  summaryCard.innerHTML = `
    <p class="summary-header">Ringkasan Booking</p>
    ${row("Kode Booking", b.code)}
    ${row("Nama", b.name)}
    ${row("Lapangan", b.fieldName)}
    ${row("Tanggal", formatDate(b.date))}
    ${row("Jam", b.time)}
    ${row("Durasi", b.duration+" Jam")}
    ${row("Total", formatRupiah(b.total))}
    ${row("Pembayaran", "Di Tempat")}
    ${row("Status", b.status)}
    <p class="muted" style="margin-top:14px;font-size:.82rem;line-height:1.55;">
      Tunjukkan kode booking ini kepada petugas saat tiba di lapangan.
    </p>
  `;
}

function row(label, value) {
  return `<div class="summary-item"><span>${label}</span><b>${value}</b></div>`;
}

/* ===== HISTORY ===== */
function renderHistory() {
  statTotalBooking.textContent = bookings.length;
  if (bookings.length === 0) {
    historyTable.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:32px;">Belum ada data booking.</td></tr>`;
    return;
  }
  historyTable.innerHTML = [...bookings].reverse().map(b => `
    <tr>
      <td><b>${b.code}</b></td>
      <td>${b.name}</td>
      <td>${b.fieldName}</td>
      <td>${formatDate(b.date)}</td>
      <td>${b.time}</td>
      <td>${b.duration} Jam</td>
      <td>${getStatusBadge(b.status)}</td>
      <td>${getPaymentBadge(b.paymentStatus)}</td>
      <td><b>${formatRupiah(b.total)}</b></td>
    </tr>
  `).join("");
}

/* ===== ADMIN ===== */
function renderAdmin() {
  // Stats
  const total     = bookings.length;
  const waiting   = bookings.filter(b => b.status==="Menunggu Konfirmasi").length;
  const confirmed = bookings.filter(b => b.status==="Dikonfirmasi").length;
  const paid      = bookings.filter(b => b.status==="Sudah Bayar").length;
  const done      = bookings.filter(b => b.status==="Selesai").length;
  const revenue   = bookings.filter(b => b.status==="Selesai").reduce((s,b)=>s+b.total,0);

  adminTotalBooking.textContent     = total;
  adminWaitingBooking.textContent   = waiting;
  adminConfirmedBooking.textContent = confirmed;
  adminPaidBooking.textContent      = paid;
  adminDoneBooking.textContent      = done;
  adminRevenue.textContent          = formatRupiah(revenue);

  // Filter
  const fStatus = filterStatus.value;
  const fDate   = filterDate.value;
  let filtered = [...bookings].reverse();
  if (fStatus !== "semua") filtered = filtered.filter(b => b.status === fStatus);
  if (fDate) filtered = filtered.filter(b => b.date === fDate);

  if (filtered.length === 0) {
    adminTable.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:32px;">Tidak ada data yang sesuai filter.</td></tr>`;
    return;
  }

  adminTable.innerHTML = filtered.map(b => `
    <tr>
      <td><b>${b.code}</b></td>
      <td>${b.name}</td>
      <td>${b.fieldName}</td>
      <td>${formatDate(b.date)}</td>
      <td>${b.time}</td>
      <td><b>${formatRupiah(b.total)}</b></td>
      <td>${getStatusBadge(b.status)}</td>
      <td>${getPaymentBadge(b.paymentStatus)}</td>
      <td><div class="action-buttons">${getActionButtons(b)}</div></td>
    </tr>
  `).join("");
}

function getActionButtons(b) {
  const btns = [];

  if (b.status === "Menunggu Konfirmasi") {
    btns.push(`<button class="btn btn-sm btn-success" onclick="confirmBooking('${b.code}')">✓ Konfirmasi</button>`);
    btns.push(`<button class="btn btn-sm btn-danger" onclick="cancelBooking('${b.code}')">✕ Batalkan</button>`);
  }

  if (b.status === "Dikonfirmasi") {
    btns.push(`<button class="btn btn-sm btn-warning" onclick="markPaid('${b.code}')">💵 Tandai Bayar</button>`);
    btns.push(`<button class="btn btn-sm btn-danger" onclick="cancelBooking('${b.code}')">✕ Batalkan</button>`);
  }

  if (b.status === "Sudah Bayar") {
    btns.push(`<button class="btn btn-sm btn-primary" onclick="markDone('${b.code}')">🏁 Selesai</button>`);
  }

  btns.push(`<button class="btn btn-sm btn-secondary" onclick="showDetail('${b.code}')">Detail</button>`);
  return btns.join("");
}

/* ===== STATUS BADGES ===== */
function getStatusBadge(status) {
  const map = {
    "Menunggu Konfirmasi": "status-waiting",
    "Dikonfirmasi":        "status-confirmed",
    "Sudah Bayar":         "status-paid",
    "Selesai":             "status-done",
    "Dibatalkan":          "status-canceled"
  };
  return `<span class="status-pill ${map[status]||"status-waiting"}">${status}</span>`;
}

function getPaymentBadge(payStatus) {
  const map = {
    "Belum Bayar": ["rgba(220,38,38,.08)", "var(--danger)"],
    "Sudah Bayar": ["rgba(22,163,74,.1)",  "var(--success)"],
  };
  const [bg, color] = map[payStatus] || map["Belum Bayar"];
  return `<span class="status-pill" style="background:${bg};color:${color}">${payStatus||"Belum Bayar"}</span>`;
}

/* ===== ADMIN ACTIONS ===== */
function confirmBooking(code) {
  const b = bookings.find(b => b.code===code); if(!b) return;
  b.status = "Dikonfirmasi";
  saveBookings(); renderSchedule(); renderHistory(); renderAdmin();
  showModal(`<h3>Booking Dikonfirmasi ✅</h3><p>Booking <b>${code}</b> telah dikonfirmasi.</p><p style="font-size:.85rem;color:var(--muted);margin-top:6px;">Pelanggan dapat datang ke lapangan dan melakukan pembayaran di tempat.</p>`);
}

function cancelBooking(code) {
  const b = bookings.find(b => b.code===code); if(!b) return;
  b.status = "Dibatalkan";
  saveBookings(); renderSchedule(); renderHistory(); renderAdmin();
  showModal(`<h3>Booking Dibatalkan</h3><p>Booking <b>${code}</b> telah dibatalkan.</p>`);
}

function markPaid(code) {
  const b = bookings.find(b => b.code===code); if(!b) return;
  b.status = "Sudah Bayar";
  b.paymentStatus = "Sudah Bayar";
  saveBookings(); renderSchedule(); renderHistory(); renderAdmin();
  showModal(`<h3>Pembayaran Diterima 💵</h3><p>Booking <b>${code}</b> telah ditandai sebagai <b>Sudah Bayar</b>.</p>`);
}

function markDone(code) {
  const b = bookings.find(b => b.code===code); if(!b) return;
  b.status = "Selesai";
  saveBookings(); renderSchedule(); renderHistory(); renderAdmin();
  showModal(`<h3>Sesi Selesai 🏁</h3><p>Booking <b>${code}</b> telah selesai. Terima kasih!</p>`);
}

function showDetail(code) {
  const b = bookings.find(b => b.code===code); if(!b) return;
  showModal(`
    <h3>Detail Booking</h3>
    ${row("Kode", b.code)}
    ${row("Nama", b.name)}
    ${row("WhatsApp", b.whatsapp)}
    ${row("Lapangan", b.fieldName)}
    ${row("Tanggal", formatDate(b.date))}
    ${row("Jam", b.time)}
    ${row("Durasi", b.duration+" Jam")}
    ${row("Total", formatRupiah(b.total))}
    ${row("Status Booking", b.status)}
    ${row("Status Bayar", b.paymentStatus||"Belum Bayar")}
    <p class="muted" style="margin-top:14px;font-size:.85rem;">Catatan: ${b.note||"—"}</p>
  `);
}

/* ===== MODAL ===== */
function showModal(content) {
  modalBody.innerHTML = content;
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("show");
  document.body.style.overflow = "";
}
