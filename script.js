/* =========================================
   KAMPUS FUTSAL — script.js
   ========================================= */

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
  "08.00 - 09.00", "09.00 - 10.00", "10.00 - 11.00", "11.00 - 12.00",
  "13.00 - 14.00", "14.00 - 15.00", "15.00 - 16.00", "16.00 - 17.00",
  "17.00 - 18.00", "18.00 - 19.00", "19.00 - 20.00", "20.00 - 21.00",
  "21.00 - 22.00", "22.00 - 23.00"
];

const defaultBookings = [
  {
    code: "BKF-001",
    name: "Andi Pratama",
    whatsapp: "081234567890",
    fieldId: 1,
    fieldName: "Lapangan Kampus Futsal",
    date: getToday(),
    time: "17.00 - 18.00",
    duration: 1,
    total: 100000,
    status: "Dikonfirmasi",
    note: "Latihan rutin"
  },
  {
    code: "BKF-002",
    name: "Bima FC",
    whatsapp: "089876543210",
    fieldId: 1,
    fieldName: "Lapangan Kampus Futsal",
    date: getToday(),
    time: "19.00 - 20.00",
    duration: 1,
    total: 100000,
    status: "Menunggu Konfirmasi",
    note: "Friendly match"
  }
];

const maintenanceSlots = [
  { fieldId: 1, date: getToday(), time: "13.00 - 14.00" }
];

/* DOM refs */
const fieldGrid           = document.getElementById("fieldGrid");
const scheduleDate        = document.getElementById("scheduleDate");
const scheduleField       = document.getElementById("scheduleField");
const slotGrid            = document.getElementById("slotGrid");
const checkScheduleBtn    = document.getElementById("checkScheduleBtn");
const bookingForm         = document.getElementById("bookingForm");
const bookingField        = document.getElementById("bookingField");
const bookingDate         = document.getElementById("bookingDate");
const startTime           = document.getElementById("startTime");
const duration            = document.getElementById("duration");
const totalPrice          = document.getElementById("totalPrice");
const summaryCard         = document.getElementById("summaryCard");
const historyTable        = document.getElementById("historyTable");
const adminTable          = document.getElementById("adminTable");
const adminTotalBooking   = document.getElementById("adminTotalBooking");
const adminWaitingBooking = document.getElementById("adminWaitingBooking");
const adminConfirmedBooking = document.getElementById("adminConfirmedBooking");
const adminRevenue        = document.getElementById("adminRevenue");
const statTotalBooking    = document.getElementById("statTotalBooking");
const menuToggle          = document.getElementById("menuToggle");
const navMenu             = document.getElementById("navMenu");
const modal               = document.getElementById("modal");
const modalOverlay        = document.getElementById("modalOverlay");
const modalClose          = document.getElementById("modalClose");
const modalBody           = document.getElementById("modalBody");
const navbar              = document.getElementById("navbar");

let bookings = loadBookings();

/* ===================== INIT ===================== */
document.addEventListener("DOMContentLoaded", () => {
  setupHeroDate();
  setupDefaultDates();
  renderFields();
  populateSelects();
  renderSchedule();
  renderHistory();
  renderAdmin();
  updateTotalPrice();
});

/* ===================== NAVBAR ===================== */
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

// Navbar shadow on scroll
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});

/* ===================== SCHEDULE EVENTS ===================== */
checkScheduleBtn.addEventListener("click", renderSchedule);
scheduleDate.addEventListener("change", renderSchedule);
scheduleField.addEventListener("change", renderSchedule);

/* ===================== BOOKING EVENTS ===================== */
bookingField.addEventListener("change", () => { syncAvailableStartTimes(); updateTotalPrice(); });
bookingDate.addEventListener("change", () => { syncAvailableStartTimes(); updateTotalPrice(); });
duration.addEventListener("change", updateTotalPrice);
startTime.addEventListener("change", updateTotalPrice);
bookingForm.addEventListener("submit", handleBookingSubmit);

/* ===================== MODAL EVENTS ===================== */
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ===================== HELPERS ===================== */
function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
}

function setupHeroDate() {
  const heroDate = document.getElementById("heroDate");
  if (!heroDate) return;
  const now = new Date();
  const opts = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  heroDate.textContent = now.toLocaleDateString("id-ID", opts);
}

function setupDefaultDates() {
  const today = getToday();
  scheduleDate.value = today;
  scheduleDate.min = today;
  bookingDate.value = today;
  bookingDate.min = today;
}

function loadBookings() {
  const saved = localStorage.getItem("futsal_bookings_v2");
  if (saved) return JSON.parse(saved);
  localStorage.setItem("futsal_bookings_v2", JSON.stringify(defaultBookings));
  return defaultBookings;
}

function saveBookings() {
  localStorage.setItem("futsal_bookings_v2", JSON.stringify(bookings));
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(number);
}

/* ===================== FIELD RENDER ===================== */
function renderFields() {
  fieldGrid.innerHTML = "";
  fields.forEach(field => {
    const card = document.createElement("div");
    card.className = "field-card";
    card.innerHTML = `
      <div class="field-image" style="background-image:url('${field.image}')"></div>
      <div class="field-body">
        <div class="field-top">
          <div>
            <h3>${field.name}</h3>
            <span class="field-status">${field.status}</span>
          </div>
          <div>
            <p class="field-price">${formatRupiah(field.price)}</p>
            <p class="field-price-sub">per jam</p>
          </div>
        </div>
        <p class="field-desc">
          Lapangan futsal indoor yang dapat dipesan secara online.
          Pilih tanggal dan jam sesuai slot yang tersedia, tanpa perlu menghubungi admin.
        </p>
        <div class="facilities">
          ${field.facilities.map(f => `<span>${f}</span>`).join("")}
        </div>
        <button class="btn btn-primary" onclick="selectFieldForBooking(${field.id})">
          Pilih Lapangan →
        </button>
      </div>
    `;
    fieldGrid.appendChild(card);
  });
}

/* ===================== SELECTS ===================== */
function populateSelects() {
  scheduleField.innerHTML = "";
  bookingField.innerHTML = "";
  startTime.innerHTML = "";
  fields.forEach(f => {
    scheduleField.innerHTML += `<option value="${f.id}">${f.name}</option>`;
    bookingField.innerHTML += `<option value="${f.id}">${f.name}</option>`;
  });
  timeSlots.forEach(slot => {
    startTime.innerHTML += `<option value="${slot}">${slot}</option>`;
  });
  syncAvailableStartTimes();
}

function selectFieldForBooking(fieldId) {
  bookingField.value = fieldId;
  syncAvailableStartTimes();
  updateTotalPrice();
  document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

/* ===================== SLOT STATUS ===================== */
function getSlotStatus(fieldId, date, slot) {
  const isMaintenance = maintenanceSlots.some(
    m => m.fieldId === Number(fieldId) && m.date === date && m.time === slot
  );
  if (isMaintenance) return "Maintenance";

  const booking = bookings.find(
    b => b.fieldId === Number(fieldId) && b.date === date && b.time === slot && b.status !== "Dibatalkan"
  );
  if (!booking) return "Tersedia";
  return booking.status === "Dikonfirmasi" ? "Dibooking" : "Menunggu";
}

/* ===================== SCHEDULE RENDER ===================== */
function renderSchedule() {
  const selDate = scheduleDate.value;
  const selField = Number(scheduleField.value);
  slotGrid.innerHTML = "";

  timeSlots.forEach(slot => {
    const status = getSlotStatus(selField, selDate, slot);
    const disabled = status !== "Tersedia";

    const card = document.createElement("div");
    card.className = `slot-card${disabled ? " slot-card--disabled" : ""}`;

    const pillClass = {
      "Tersedia": "slot-available-pill",
      "Dibooking": "slot-booked-pill",
      "Menunggu": "slot-waiting-pill",
      "Maintenance": "slot-maintenance-pill"
    }[status] || "slot-available-pill";

    card.innerHTML = `
      <h4>${slot}</h4>
      <span class="slot-status-pill ${pillClass}">${status}</span>
    `;

    if (!disabled) {
      card.addEventListener("click", () => {
        bookingDate.value = selDate;
        bookingField.value = selField;
        syncAvailableStartTimes();
        startTime.value = slot;
        updateTotalPrice();
        document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      });
    }

    slotGrid.appendChild(card);
  });
}

/* ===================== SYNC TIMES ===================== */
function syncAvailableStartTimes() {
  const selField = Number(bookingField.value);
  const selDate = bookingDate.value;
  Array.from(startTime.options).forEach(opt => {
    opt.disabled = getSlotStatus(selField, selDate, opt.value) !== "Tersedia";
  });
}

/* ===================== PRICE ===================== */
function updateTotalPrice() {
  const selFieldId = Number(bookingField.value);
  const selField = fields.find(f => f.id === selFieldId);
  if (!selField) { totalPrice.textContent = formatRupiah(0); return; }
  totalPrice.textContent = formatRupiah(selField.price * Number(duration.value));
}

/* ===================== BOOKING SUBMIT ===================== */
function handleBookingSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("nama").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const selFieldId = Number(bookingField.value);
  const selField = fields.find(f => f.id === selFieldId);
  const date = bookingDate.value;
  const time = startTime.value;
  const selDuration = Number(duration.value);
  const note = document.getElementById("catatan").value.trim();

  if (!name || !whatsapp || !date || !time) {
    showModal(`
      <h3>Data belum lengkap</h3>
      <p>Mohon isi nama, nomor WhatsApp, tanggal, dan jam booking terlebih dahulu.</p>
    `);
    return;
  }

  const status = getSlotStatus(selFieldId, date, time);
  if (status !== "Tersedia") {
    showModal(`
      <h3>Slot tidak tersedia</h3>
      <p>Maaf, jadwal <b>${time}</b> pada tanggal <b>${formatDate(date)}</b> sudah tidak tersedia.</p>
    `);
    renderSchedule();
    syncAvailableStartTimes();
    return;
  }

  const code = generateBookingCode();
  const total = selField.price * selDuration;

  const newBooking = {
    code, name, whatsapp,
    fieldId: selFieldId,
    fieldName: selField.name,
    date, time,
    duration: selDuration,
    total,
    status: "Menunggu Konfirmasi",
    note
  };

  bookings.push(newBooking);
  saveBookings();

  renderSummary(newBooking);
  renderSchedule();
  renderHistory();
  renderAdmin();
  syncAvailableStartTimes();

  bookingForm.reset();
  setupDefaultDates();
  populateSelects();
  updateTotalPrice();

  showModal(`
    <h3>Booking Berhasil! 🎉</h3>
    <p>Kode booking kamu: <b>${code}</b></p>
    <p>Status: <b>Menunggu Konfirmasi</b></p>
    <p style="margin-top:10px;color:var(--muted);font-size:0.85rem;">
      Silakan tunggu konfirmasi dari admin. Terima kasih!
    </p>
  `);
}

function generateBookingCode() {
  return `BKF-${String(bookings.length + 1).padStart(3, "0")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

/* ===================== SUMMARY ===================== */
function renderSummary(booking) {
  summaryCard.innerHTML = `
    <p class="summary-header">Ringkasan Booking</p>
    ${summaryRow("Kode Booking", booking.code)}
    ${summaryRow("Nama", booking.name)}
    ${summaryRow("Lapangan", booking.fieldName)}
    ${summaryRow("Tanggal", formatDate(booking.date))}
    ${summaryRow("Jam", booking.time)}
    ${summaryRow("Durasi", `${booking.duration} Jam`)}
    ${summaryRow("Total", formatRupiah(booking.total))}
    ${summaryRow("Status", booking.status)}
    <p class="muted" style="margin-top:16px;font-size:0.82rem;line-height:1.5;">
      Pada versi backend, status ini akan terhubung ke database dan diperbarui secara otomatis.
    </p>
  `;
}

function summaryRow(label, value) {
  return `<div class="summary-item"><span>${label}</span><b>${value}</b></div>`;
}

/* ===================== HISTORY ===================== */
function renderHistory() {
  if (bookings.length === 0) {
    historyTable.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:32px;">Belum ada data booking.</td></tr>`;
    return;
  }
  historyTable.innerHTML = bookings.map(b => `
    <tr>
      <td><b>${b.code}</b></td>
      <td>${b.name}</td>
      <td>${b.fieldName}</td>
      <td>${formatDate(b.date)}</td>
      <td>${b.time}</td>
      <td>${getStatusBadge(b.status)}</td>
      <td><b>${formatRupiah(b.total)}</b></td>
    </tr>
  `).join("");
}

/* ===================== ADMIN ===================== */
function renderAdmin() {
  const waiting   = bookings.filter(b => b.status === "Menunggu Konfirmasi").length;
  const confirmed = bookings.filter(b => b.status === "Dikonfirmasi").length;
  const revenue   = bookings.filter(b => b.status === "Dikonfirmasi").reduce((s, b) => s + b.total, 0);

  adminTotalBooking.textContent = bookings.length;
  adminWaitingBooking.textContent = waiting;
  adminConfirmedBooking.textContent = confirmed;
  adminRevenue.textContent = formatRupiah(revenue);
  statTotalBooking.textContent = bookings.length;

  if (bookings.length === 0) {
    adminTable.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:32px;">Belum ada data booking.</td></tr>`;
    return;
  }

  adminTable.innerHTML = bookings.map(b => `
    <tr>
      <td><b>${b.code}</b></td>
      <td>${b.name}</td>
      <td>${b.fieldName}</td>
      <td>${formatDate(b.date)}</td>
      <td>${b.time}</td>
      <td>${getStatusBadge(b.status)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-primary" onclick="confirmBooking('${b.code}')">Konfirmasi</button>
          <button class="btn btn-sm btn-danger" onclick="cancelBooking('${b.code}')">Batalkan</button>
          <button class="btn btn-sm btn-secondary" onclick="showBookingDetail('${b.code}')">Detail</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function getStatusBadge(status) {
  const cls = {
    "Menunggu Konfirmasi": "status-waiting",
    "Dikonfirmasi": "status-confirmed",
    "Dibatalkan": "status-canceled"
  }[status] || "status-waiting";
  return `<span class="status-pill ${cls}">${status}</span>`;
}

/* ===================== ADMIN ACTIONS ===================== */
function confirmBooking(code) {
  const b = bookings.find(b => b.code === code);
  if (!b) return;
  b.status = "Dikonfirmasi";
  saveBookings();
  renderSchedule(); renderHistory(); renderAdmin();
  showModal(`<h3>Booking Dikonfirmasi ✅</h3><p>Booking <b>${code}</b> berhasil dikonfirmasi.</p>`);
}

function cancelBooking(code) {
  const b = bookings.find(b => b.code === code);
  if (!b) return;
  b.status = "Dibatalkan";
  saveBookings();
  renderSchedule(); renderHistory(); renderAdmin();
  showModal(`<h3>Booking Dibatalkan</h3><p>Booking <b>${code}</b> telah dibatalkan.</p>`);
}

function showBookingDetail(code) {
  const b = bookings.find(b => b.code === code);
  if (!b) return;
  showModal(`
    <h3>Detail Booking</h3>
    ${summaryRow("Kode", b.code)}
    ${summaryRow("Nama", b.name)}
    ${summaryRow("WhatsApp", b.whatsapp)}
    ${summaryRow("Lapangan", b.fieldName)}
    ${summaryRow("Tanggal", formatDate(b.date))}
    ${summaryRow("Jam", b.time)}
    ${summaryRow("Total", formatRupiah(b.total))}
    ${summaryRow("Status", b.status)}
    <p class="muted" style="margin-top:14px;font-size:0.85rem;">Catatan: ${b.note || "—"}</p>
  `);
}

/* ===================== MODAL ===================== */
function showModal(content) {
  modalBody.innerHTML = content;
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("show");
  document.body.style.overflow = "";
}
