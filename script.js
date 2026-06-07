const fields = [
  {
    id: 1,
    name: "Lapangan Kampus Futsal",
    price: 100000,
    status: "Aktif",
    image: "https://images.unsplash.com/photo-1624880357913-a8539238245b?auto=format&fit=crop&w=1000&q=80",
    facilities: ["Indoor", "Rumput Sintetis", "Lampu Malam", "Ruang Tunggu"]
  }
];

const timeSlots = [
  "08.00 - 09.00",
  "09.00 - 10.00",
  "10.00 - 11.00",
  "11.00 - 12.00",
  "13.00 - 14.00",
  "14.00 - 15.00",
  "15.00 - 16.00",
  "16.00 - 17.00",
  "17.00 - 18.00",
  "18.00 - 19.00",
  "19.00 - 20.00",
  "20.00 - 21.00",
  "21.00 - 22.00",
  "22.00 - 23.00"
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
  {
    fieldId: 1,
    date: getToday(),
    time: "13.00 - 14.00"
  }
];

const fieldGrid = document.getElementById("fieldGrid");
const scheduleDate = document.getElementById("scheduleDate");
const scheduleField = document.getElementById("scheduleField");
const slotGrid = document.getElementById("slotGrid");
const checkScheduleBtn = document.getElementById("checkScheduleBtn");

const bookingForm = document.getElementById("bookingForm");
const bookingField = document.getElementById("bookingField");
const bookingDate = document.getElementById("bookingDate");
const startTime = document.getElementById("startTime");
const duration = document.getElementById("duration");
const totalPrice = document.getElementById("totalPrice");
const summaryCard = document.getElementById("summaryCard");

const historyTable = document.getElementById("historyTable");
const adminTable = document.getElementById("adminTable");

const adminTotalBooking = document.getElementById("adminTotalBooking");
const adminWaitingBooking = document.getElementById("adminWaitingBooking");
const adminConfirmedBooking = document.getElementById("adminConfirmedBooking");
const adminRevenue = document.getElementById("adminRevenue");
const statTotalBooking = document.getElementById("statTotalBooking");

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalBody = document.getElementById("modalBody");

let bookings = loadBookings();

document.addEventListener("DOMContentLoaded", () => {
  setupDefaultDates();
  renderFields();
  populateSelects();
  renderSchedule();
  renderHistory();
  renderAdmin();
  updateTotalPrice();
});

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("show");
});

document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("show");
  });
});

checkScheduleBtn.addEventListener("click", renderSchedule);
scheduleDate.addEventListener("change", renderSchedule);
scheduleField.addEventListener("change", renderSchedule);

bookingField.addEventListener("change", () => {
  syncAvailableStartTimes();
  updateTotalPrice();
});

bookingDate.addEventListener("change", () => {
  syncAvailableStartTimes();
  updateTotalPrice();
});

duration.addEventListener("change", updateTotalPrice);
startTime.addEventListener("change", updateTotalPrice);

bookingForm.addEventListener("submit", handleBookingSubmit);

modalClose.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function setupDefaultDates() {
  const today = getToday();

  scheduleDate.value = today;
  scheduleDate.min = today;

  bookingDate.value = today;
  bookingDate.min = today;
}

function loadBookings() {
  const savedBookings = localStorage.getItem("futsal_bookings_single");

  if (savedBookings) {
    return JSON.parse(savedBookings);
  }

  localStorage.setItem("futsal_bookings_single", JSON.stringify(defaultBookings));
  return defaultBookings;
}

function saveBookings() {
  localStorage.setItem("futsal_bookings_single", JSON.stringify(bookings));
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

function renderFields() {
  fieldGrid.innerHTML = "";

  fields.forEach((field) => {
    const card = document.createElement("div");
    card.className = "field-card";

    card.innerHTML = `
      <div class="field-image" style="background-image: url('${field.image}')"></div>

      <div class="field-body">
        <div class="field-top">
          <div>
            <h3>${field.name}</h3>
            <p class="muted">Status: ${field.status}</p>
          </div>

          <p class="field-price">${formatRupiah(field.price)}/jam</p>
        </div>

        <p class="muted">
          Lapangan futsal indoor yang dapat dipesan secara online melalui sistem.
          Pelanggan dapat memilih tanggal dan jam sesuai slot yang tersedia.
        </p>

        <div class="facilities">
          ${field.facilities.map((item) => `<span>${item}</span>`).join("")}
        </div>

        <button class="btn btn-primary" onclick="selectFieldForBooking(${field.id})">
          Pilih Lapangan
        </button>
      </div>
    `;

    fieldGrid.appendChild(card);
  });
}

function populateSelects() {
  scheduleField.innerHTML = "";
  bookingField.innerHTML = "";
  startTime.innerHTML = "";

  fields.forEach((field) => {
    scheduleField.innerHTML += `<option value="${field.id}">${field.name}</option>`;
    bookingField.innerHTML += `<option value="${field.id}">${field.name}</option>`;
  });

  timeSlots.forEach((slot) => {
    startTime.innerHTML += `<option value="${slot}">${slot}</option>`;
  });

  syncAvailableStartTimes();
}

function selectFieldForBooking(fieldId) {
  bookingField.value = fieldId;

  syncAvailableStartTimes();
  updateTotalPrice();

  document.getElementById("booking").scrollIntoView({
    behavior: "smooth"
  });
}

function getSlotStatus(fieldId, date, slot) {
  const isMaintenance = maintenanceSlots.some((item) => {
    return (
      item.fieldId === Number(fieldId) &&
      item.date === date &&
      item.time === slot
    );
  });

  if (isMaintenance) {
    return "Maintenance";
  }

  const booking = bookings.find((item) => {
    return (
      item.fieldId === Number(fieldId) &&
      item.date === date &&
      item.time === slot &&
      item.status !== "Dibatalkan"
    );
  });

  if (!booking) {
    return "Tersedia";
  }

  if (booking.status === "Dikonfirmasi") {
    return "Dibooking";
  }

  return "Menunggu";
}

function renderSchedule() {
  const selectedDate = scheduleDate.value;
  const selectedField = Number(scheduleField.value);

  slotGrid.innerHTML = "";

  timeSlots.forEach((slot) => {
    const status = getSlotStatus(selectedField, selectedDate, slot);
    const card = document.createElement("div");

    const isDisabled = status !== "Tersedia";
    card.className = `slot-card ${isDisabled ? "disabled" : ""}`;

    let statusClass = "slot-available";

    if (status === "Dibooking") {
      statusClass = "slot-booked";
    }

    if (status === "Menunggu") {
      statusClass = "slot-waiting";
    }

    if (status === "Maintenance") {
      statusClass = "slot-maintenance";
    }

    card.innerHTML = `
      <h4>${slot}</h4>
      <p class="slot-status ${statusClass}">${status}</p>
    `;

    if (!isDisabled) {
      card.addEventListener("click", () => {
        bookingDate.value = selectedDate;
        bookingField.value = selectedField;
        startTime.value = slot;

        syncAvailableStartTimes();
        updateTotalPrice();

        document.getElementById("booking").scrollIntoView({
          behavior: "smooth"
        });
      });
    }

    slotGrid.appendChild(card);
  });
}

function syncAvailableStartTimes() {
  const selectedField = Number(bookingField.value);
  const selectedDate = bookingDate.value;

  Array.from(startTime.options).forEach((option) => {
    const status = getSlotStatus(selectedField, selectedDate, option.value);
    option.disabled = status !== "Tersedia";
  });
}

function updateTotalPrice() {
  const selectedFieldId = Number(bookingField.value);
  const selectedField = fields.find((field) => field.id === selectedFieldId);

  if (!selectedField) {
    totalPrice.textContent = formatRupiah(0);
    return;
  }

  const selectedDuration = Number(duration.value);
  const total = selectedField.price * selectedDuration;

  totalPrice.textContent = formatRupiah(total);
}

function handleBookingSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("nama").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const selectedFieldId = Number(bookingField.value);
  const selectedField = fields.find((field) => field.id === selectedFieldId);
  const date = bookingDate.value;
  const time = startTime.value;
  const selectedDuration = Number(duration.value);
  const note = document.getElementById("catatan").value.trim();

  if (!name || !whatsapp || !date || !time) {
    showModal(`
      <h3>Data belum lengkap</h3>
      <p>Mohon isi nama, nomor WhatsApp, tanggal, dan jam booking terlebih dahulu.</p>
    `);
    return;
  }

  const status = getSlotStatus(selectedFieldId, date, time);

  if (status !== "Tersedia") {
    showModal(`
      <h3>Slot tidak tersedia</h3>
      <p>Maaf, jadwal <b>${time}</b> pada tanggal <b>${date}</b> sudah tidak tersedia.</p>
    `);

    renderSchedule();
    syncAvailableStartTimes();
    return;
  }

  const bookingCode = generateBookingCode();
  const total = selectedField.price * selectedDuration;

  const newBooking = {
    code: bookingCode,
    name,
    whatsapp,
    fieldId: selectedFieldId,
    fieldName: selectedField.name,
    date,
    time,
    duration: selectedDuration,
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
    <h3>Booking Berhasil Dikirim</h3>
    <p>Kode booking kamu adalah <b>${bookingCode}</b>.</p>
    <p>Status saat ini: <b>Menunggu Konfirmasi</b>.</p>
  `);
}

function generateBookingCode() {
  const number = bookings.length + 1;
  return `BKF-${String(number).padStart(3, "0")}`;
}

function renderSummary(booking) {
  summaryCard.innerHTML = `
    <h3>Ringkasan Booking</h3>

    <div class="summary-item">
      <span>Kode Booking</span>
      <b>${booking.code}</b>
    </div>

    <div class="summary-item">
      <span>Nama</span>
      <b>${booking.name}</b>
    </div>

    <div class="summary-item">
      <span>Lapangan</span>
      <b>${booking.fieldName}</b>
    </div>

    <div class="summary-item">
      <span>Tanggal</span>
      <b>${booking.date}</b>
    </div>

    <div class="summary-item">
      <span>Jam</span>
      <b>${booking.time}</b>
    </div>

    <div class="summary-item">
      <span>Durasi</span>
      <b>${booking.duration} Jam</b>
    </div>

    <div class="summary-item">
      <span>Total</span>
      <b>${formatRupiah(booking.total)}</b>
    </div>

    <div class="summary-item">
      <span>Status</span>
      <b>${booking.status}</b>
    </div>

    <p class="muted" style="margin-top: 18px;">
      Silakan tunggu konfirmasi admin. Pada versi backend, status ini akan terhubung ke database.
    </p>
  `;
}

function renderHistory() {
  historyTable.innerHTML = "";

  if (bookings.length === 0) {
    historyTable.innerHTML = `
      <tr>
        <td colspan="7">Belum ada data booking.</td>
      </tr>
    `;
    return;
  }

  bookings.forEach((booking) => {
    historyTable.innerHTML += `
      <tr>
        <td>${booking.code}</td>
        <td>${booking.name}</td>
        <td>${booking.fieldName}</td>
        <td>${booking.date}</td>
        <td>${booking.time}</td>
        <td>${getStatusBadge(booking.status)}</td>
        <td>${formatRupiah(booking.total)}</td>
      </tr>
    `;
  });
}

function renderAdmin() {
  adminTable.innerHTML = "";

  const waiting = bookings.filter((booking) => {
    return booking.status === "Menunggu Konfirmasi";
  }).length;

  const confirmed = bookings.filter((booking) => {
    return booking.status === "Dikonfirmasi";
  }).length;

  const revenue = bookings
    .filter((booking) => booking.status === "Dikonfirmasi")
    .reduce((sum, booking) => sum + booking.total, 0);

  adminTotalBooking.textContent = bookings.length;
  adminWaitingBooking.textContent = waiting;
  adminConfirmedBooking.textContent = confirmed;
  adminRevenue.textContent = formatRupiah(revenue);
  statTotalBooking.textContent = bookings.length;

  if (bookings.length === 0) {
    adminTable.innerHTML = `
      <tr>
        <td colspan="7">Belum ada data booking.</td>
      </tr>
    `;
    return;
  }

  bookings.forEach((booking) => {
    adminTable.innerHTML += `
      <tr>
        <td>${booking.code}</td>
        <td>${booking.name}</td>
        <td>${booking.fieldName}</td>
        <td>${booking.date}</td>
        <td>${booking.time}</td>
        <td>${getStatusBadge(booking.status)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-small btn-primary" onclick="confirmBooking('${booking.code}')">
              Konfirmasi
            </button>

            <button class="btn btn-small btn-danger" onclick="cancelBooking('${booking.code}')">
              Batalkan
            </button>

            <button class="btn btn-small btn-secondary" onclick="showBookingDetail('${booking.code}')">
              Detail
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

function getStatusBadge(status) {
  let className = "status-waiting";

  if (status === "Dikonfirmasi") {
    className = "status-confirmed";
  }

  if (status === "Dibatalkan") {
    className = "status-canceled";
  }

  return `<span class="status-pill ${className}">${status}</span>`;
}

function confirmBooking(code) {
  const booking = bookings.find((item) => item.code === code);

  if (!booking) return;

  booking.status = "Dikonfirmasi";
  saveBookings();

  renderSchedule();
  renderHistory();
  renderAdmin();

  showModal(`
    <h3>Booking Dikonfirmasi</h3>
    <p>Booking dengan kode <b>${code}</b> berhasil dikonfirmasi.</p>
  `);
}

function cancelBooking(code) {
  const booking = bookings.find((item) => item.code === code);

  if (!booking) return;

  booking.status = "Dibatalkan";
  saveBookings();

  renderSchedule();
  renderHistory();
  renderAdmin();

  showModal(`
    <h3>Booking Dibatalkan</h3>
    <p>Booking dengan kode <b>${code}</b> berhasil dibatalkan.</p>
  `);
}

function showBookingDetail(code) {
  const booking = bookings.find((item) => item.code === code);

  if (!booking) return;

  showModal(`
    <h3>Detail Booking</h3>

    <div class="summary-item">
      <span>Kode</span>
      <b>${booking.code}</b>
    </div>

    <div class="summary-item">
      <span>Nama</span>
      <b>${booking.name}</b>
    </div>

    <div class="summary-item">
      <span>WhatsApp</span>
      <b>${booking.whatsapp}</b>
    </div>

    <div class="summary-item">
      <span>Lapangan</span>
      <b>${booking.fieldName}</b>
    </div>

    <div class="summary-item">
      <span>Tanggal</span>
      <b>${booking.date}</b>
    </div>

    <div class="summary-item">
      <span>Jam</span>
      <b>${booking.time}</b>
    </div>

    <div class="summary-item">
      <span>Total</span>
      <b>${formatRupiah(booking.total)}</b>
    </div>

    <div class="summary-item">
      <span>Status</span>
      <b>${booking.status}</b>
    </div>

    <p class="muted" style="margin-top: 16px;">
      Catatan: ${booking.note || "-"}
    </p>
  `);
}

function showModal(content) {
  modalBody.innerHTML = content;
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}