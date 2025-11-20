// Constants
const TIME_CONSTANTS = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,
};

const NOTIFICATION_DURATION = 3000;
const URGENT_TASK_THRESHOLD = 24; // hours
const URGENT_CHECK_INTERVAL = TIME_CONSTANTS.ONE_HOUR;

// Auth Elements
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const profileSection = document.getElementById("profileSection");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegisterLink = document.getElementById("showRegisterLink");
const showLoginLink = document.getElementById("showLoginLink");
const profileLink = document.getElementById("profileLink");
const logoutLink = document.getElementById("logoutLink");

// Menyimpan elemen DOM
const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const taskModal = document.getElementById("taskModal");
const confirmModal = document.getElementById("confirmModal");
const confirmClearModal = document.getElementById("confirmClearModal");
const modalTitle = document.getElementById("modalTitle");
const notification = document.getElementById("notification");
const viewToggleBtn = document.getElementById("viewToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const mainContent = document.getElementById("mainContent");
const aboutSection = document.getElementById("aboutSection");
const contactSection = document.getElementById("contactSection");
const homeLink = document.getElementById("homeLink");
const aboutLink = document.getElementById("aboutLink");
const contactLink = document.getElementById("contactLink");
const backBtn = document.getElementById("backBtn");
const backBtnContact = document.getElementById("backBtnContact");
const homepage = document.getElementById("homepage");
const taskListBtn = document.getElementById("taskListBtn");
const taskHistoryBtn = document.getElementById("taskHistoryBtn");
const historyContent = document.getElementById("historyContent");
const historyList = document.getElementById("historyList");
const historyStats = document.getElementById("historyStats");

// Inisialisasi variabel
let isGridView = false;
let darkMode = localStorage.getItem("darkMode") === "true";

// Fungsi debounce untuk search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Buat debounced version dari filterTasks
const debouncedFilterTasks = debounce(filterTasks, 300);

// Array untuk track semua interval countdown
let countdownIntervals = [];

// Inisialisasi aplikasi saat DOM siap
document.addEventListener("DOMContentLoaded", () => {

  migrateOldTasksData();

  // Check authentication first
  if (!checkAuth()) {
    return; // Stop execution if not logged in
  }

  // Set tanggal sekarang sebagai minimum untuk input deadline
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  document.getElementById("taskDeadline").min = formattedDateTime;

  // Terapkan dark mode jika diaktifkan
  if (darkMode) {
    document.body.classList.add("dark-mode");
    themeIcon.className = "fas fa-sun";
  }

  // Set tampilan grid/list
  isGridView = localStorage.getItem("gridView") === "true";
  if (isGridView) {
    taskList.classList.add("grid-view");
    viewToggleBtn.innerHTML = "<i class='fas fa-list'></i>";
  }

  // Muat tugas
  loadTasks();

  // Cek tugas yang mendesak
  checkUrgentTasks();

  // Handle hash di URL
  if (window.location.hash === "#tentang") {
    showAboutSection();
  } else if (window.location.hash === "#kontak") {
    showContactSection();
  } else if (window.location.hash === "#mainContent") {
    showMainContent();
  } else if (window.location.hash === "#historyContent") {
    showTaskHistory();
  }
});

// Handler navigasi
document.addEventListener("DOMContentLoaded", () => {
  // Handler navigasi
  homeLink.addEventListener("click", function (e) {
    e.preventDefault();
    showHomeSection();
  });

  aboutLink.addEventListener("click", function (e) {
    e.preventDefault();
    showAboutSection();
  });

  contactLink.addEventListener("click", function (e) {
    e.preventDefault();
    showContactSection();
  });

  backBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showHomeSection();
  });

  backBtnContact.addEventListener("click", function (e) {
    e.preventDefault();
    showHomeSection();
  });

  taskListBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showMainContent();
  });

  taskHistoryBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showTaskHistory();
  });

  // Handler submit form
  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    saveTask();
  });

  // Keyboard support untuk modal
  document.addEventListener("keydown", function (e) {
    // ESC untuk close modal
    if (e.key === "Escape") {
      if (taskModal.classList.contains("active")) {
        closeModal();
      }
      if (confirmModal.classList.contains("active")) {
        closeConfirmModal();
      }
      if (confirmClearModal.classList.contains("active")) {
        closeConfirmClearModal();
      }
    }
  });

  // Setelah semua event listener terpasang, baru jalankan init
  initializeApp();
});

// Fungsi inisialisasi aplikasi
function initializeApp() {
  migrateOldTasksData();

  // Check authentication first
  if (!checkAuth()) {
    return; // Stop execution if not logged in
  }

  // Set tanggal sekarang sebagai minimum untuk input deadline
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  document.getElementById("taskDeadline").min = formattedDateTime;

  // Terapkan dark mode jika diaktifkan
  if (darkMode) {
    document.body.classList.add("dark-mode");
    themeIcon.className = "fas fa-sun";
  }

  // Set tampilan grid/list
  isGridView = localStorage.getItem("gridView") === "true";
  if (isGridView) {
    taskList.classList.add("grid-view");
    viewToggleBtn.innerHTML = "<i class='fas fa-list'></i>";
  }

  // Muat tugas
  loadTasks();

  // Cek tugas yang mendesak
  checkUrgentTasks();

  // Handle hash di URL
  if (window.location.hash === "#tentang") {
    showAboutSection();
  } else if (window.location.hash === "#kontak") {
    showContactSection();
  } else if (window.location.hash === "#mainContent") {
    showMainContent();
  } else if (window.location.hash === "#historyContent") {
    showTaskHistory();
  }
}

// Fungsi untuk menampilkan halaman beranda
function showHomeSection() {
  homepage.style.display = "flex";
  mainContent.style.display = "none";
  aboutSection.style.display = "none";
  contactSection.style.display = "none";
  historyContent.style.display = "none";
  profileSection.style.display = "none";
  window.scrollTo(0, 0);
  window.location.hash = "";

  // Update link navigasi aktif
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  homeLink.classList.add('active');
}

// Fungsi untuk menampilkan konten utama
function showMainContent() {
  homepage.style.display = "none";
  mainContent.style.display = "block";
  aboutSection.style.display = "none";
  contactSection.style.display = "none";
  historyContent.style.display = "none";
  profileSection.style.display = "none";
  window.scrollTo(0, 0);
  window.location.hash = "mainContent";

  // Update link navigasi aktif
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
}

// Fungsi untuk menampilkan riwayat tugas
function showTaskHistory() {
  homepage.style.display = "none";
  mainContent.style.display = "none";
  aboutSection.style.display = "none";
  contactSection.style.display = "none";
  historyContent.style.display = "block";
  profileSection.style.display = "none";
  window.scrollTo(0, 0);
  window.location.hash = "historyContent";

  // Update link navigasi aktif
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });

  // Muat tugas yang sudah selesai
  loadCompletedTasks();
}

// Fungsi untuk menampilkan section tentang
function showAboutSection() {
  homepage.style.display = "none";
  mainContent.style.display = "none";
  aboutSection.style.display = "block";
  contactSection.style.display = "none";
  historyContent.style.display = "none";
  profileSection.style.display = "none";
  window.scrollTo(0, 0);
  window.location.hash = "tentang";

  // Update link navigasi aktif
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  aboutLink.classList.add('active');
}

// Fungsi untuk menampilkan section kontak
function showContactSection() {
  homepage.style.display = "none";
  mainContent.style.display = "none";
  aboutSection.style.display = "none";
  contactSection.style.display = "block";
  historyContent.style.display = "none";
  profileSection.style.display = "none";
  window.scrollTo(0, 0);
  window.location.hash = "kontak";

  // Update link navigasi aktif
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  contactLink.classList.add('active');
}

// Fungsi untuk memuat tugas yang sudah selesai
function loadCompletedTasks() {
  const tasks = getTasksFromStorage();
  const completedTasks = tasks.filter(task => task.completed);

  // Kosongkan daftar riwayat
  historyList.innerHTML = "";

  // Update statistik
  updateHistoryStats(completedTasks);

  // Cek jika tidak ada tugas selesai
  if (completedTasks.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "history-empty";
    emptyState.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <h3>Tidak ada riwayat tugas</h3>
          <p>Belum ada tugas yang diselesaikan. Selesaikan beberapa tugas untuk melihat riwayat di sini.</p>
        `;
    historyList.appendChild(emptyState);
    return;
  }

  // Urutkan berdasarkan tanggal selesai (terbaru dulu)
  completedTasks.sort((a, b) => {
    if (a.completedAt && b.completedAt) {
      return new Date(b.completedAt) - new Date(a.completedAt);
    }
    return 0;
  });

  // Tampilkan tugas yang sudah selesai
  completedTasks.forEach((task, index) => {
    createHistoryCard(task, index);
  });
}

// Fungsi untuk memperbarui statistik riwayat
function updateHistoryStats(completedTasks) {
  // Kosongkan statistik yang ada
  historyStats.innerHTML = "";

  // Total tugas selesai
  const totalCard = document.createElement("div");
  totalCard.className = "stat-card";
  totalCard.innerHTML = `
        <div class="stat-value">${completedTasks.length}</div>
        <div class="stat-label">Total Tugas Selesai</div>
      `;
  historyStats.appendChild(totalCard);

  // Tugas selesai berdasarkan kategori
  const categories = {
    academic: { name: "Akademik", count: 0, icon: "fas fa-book" },
    project: { name: "Proyek", count: 0, icon: "fas fa-project-diagram" },
    exam: { name: "Ujian", count: 0, icon: "fas fa-pen-alt" },
    other: { name: "Lainnya", count: 0, icon: "fas fa-sticky-note" }
  };

  completedTasks.forEach(task => {
    if (categories[task.category]) {
      categories[task.category].count++;
    }
  });

  // Buat kartu untuk setiap kategori
  for (const [key, category] of Object.entries(categories)) {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `
          <div class="stat-value">${category.count}</div>
          <div class="stat-label">${category.name}</div>
          <i class="${category.icon}"></i>
        `;
    historyStats.appendChild(card);
  }
}

// Fungsi untuk membuat kartu riwayat
function createHistoryCard(task, index) {
  const card = document.createElement("div");
  card.className = "task-card";

  // Set warna border berdasarkan kategori
  if (task.category === "exam") {
    card.style.borderLeftColor = "var(--danger-color)";
  } else if (task.category === "project") {
    card.style.borderLeftColor = "var(--warning-color)";
  } else {
    card.style.borderLeftColor = "var(--accent-color)";
  }

  // Set opacity untuk tugas selesai
  card.style.opacity = "0.7";

  // Badge status
  const status = document.createElement("div");
  status.className = "countdown";
  status.style.backgroundColor = "var(--info-color)";
  status.textContent = "Selesai";
  card.appendChild(status);

  // Nama mata kuliah
  if (task.course) {
    const courseName = document.createElement("div");
    courseName.className = "course-name";
    courseName.textContent = task.course;
    card.appendChild(courseName);
  }

  // Judul tugas
  const title = document.createElement("h3");
  title.textContent = task.title;
  title.style.textDecoration = "line-through";
  card.appendChild(title);

  // Detail tugas
  const details = document.createElement("div");
  details.className = "task-details";

  // Tambahkan deskripsi jika ada
  if (task.description && task.description.trim() !== "") {
    const desc = document.createElement("p");
    desc.textContent = task.description;
    details.appendChild(desc);
  }

  // Metadata tugas
  const categoryMeta = document.createElement("div");
  categoryMeta.className = "task-meta";

  const categoryIcon = getCategoryIcon(task.category);
  categoryMeta.innerHTML = `<i class="${categoryIcon}"></i> ${getCategoryName(task.category)}`;
  details.appendChild(categoryMeta);

  // Info deadline
  const deadlineMeta = document.createElement("div");
  deadlineMeta.className = "task-meta";

  const deadlineDate = new Date(task.deadline);
  const formattedDate = deadlineDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  deadlineMeta.innerHTML = `<i class="fas fa-calendar-alt"></i> ${formattedDate}`;
  details.appendChild(deadlineMeta);

  // Tanggal selesai
  if (task.completedAt) {
    const completedDate = new Date(task.completedAt);
    const completedFormatted = completedDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const completedMeta = document.createElement("div");
    completedMeta.className = "completed-date";
    completedMeta.innerHTML = `<i class="fas fa-check-circle"></i> Diselesaikan: ${completedFormatted}`;
    details.appendChild(completedMeta);
  }

  card.appendChild(details);

  // Aksi tugas (hanya hapus untuk riwayat)
  const actions = document.createElement("div");
  actions.className = "task-actions";

  // Tombol hapus
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "task-btn task-btn-delete";
  deleteBtn.innerHTML = `<i class="fas fa-trash"></i> Hapus`;
  deleteBtn.onclick = () => openConfirmModal(index);
  actions.appendChild(deleteBtn);

  card.appendChild(actions);

  historyList.appendChild(card);
}

// Fungsi untuk menghapus riwayat tugas
function clearCompletedTasks() {
  openConfirmClearModal();
}

// Fungsi untuk membuka modal konfirmasi hapus riwayat
function openConfirmClearModal() {
  confirmClearModal.classList.add("active");
}

// Fungsi untuk menutup modal konfirmasi hapus riwayat
function closeConfirmClearModal() {
  confirmClearModal.classList.remove("active");
}

// Fungsi untuk mengonfirmasi hapus riwayat
function confirmClearHistory() {
  const tasks = getTasksFromStorage();
  const incompleteTasks = tasks.filter(task => !task.completed);
  saveTasksToStorage(incompleteTasks);
  loadCompletedTasks();
  closeConfirmClearModal();
  showNotification("Semua riwayat tugas berhasil dihapus!", "success");
}

// Fungsi untuk membuka modal tambah tugas
function openAddTaskModal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  document.getElementById("taskIndex").value = -1;
  document.getElementById("taskCourse").value = "";
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDesc").value = "";
  document.getElementById("taskDeadline").value = formattedDateTime;
  document.getElementById("taskCategory").value = "academic";

  modalTitle.textContent = "Tambah Tugas Baru";
  openModal();
}

// Fungsi untuk membuka modal edit tugas
function openEditTaskModal(index) {
  const tasks = getTasksFromStorage();
  const task = tasks[index];

  document.getElementById("taskIndex").value = index;
  document.getElementById("taskCourse").value = task.course || "";
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDesc").value = task.description || "";

  // Format deadline untuk input datetime-local
  const deadline = new Date(task.deadline);
  const year = deadline.getFullYear();
  const month = String(deadline.getMonth() + 1).padStart(2, '0');
  const day = String(deadline.getDate()).padStart(2, '0');
  const hours = String(deadline.getHours()).padStart(2, '0');
  const minutes = String(deadline.getMinutes()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  document.getElementById("taskDeadline").value = formattedDateTime;
  document.getElementById("taskCategory").value = task.category || "academic";

  modalTitle.textContent = "Edit Tugas";
  openModal();
}

// Fungsi untuk membuka modal
function openModal() {
  taskModal.classList.add("active");
  document.getElementById("taskCourse").focus();
}

// Fungsi untuk menutup modal
function closeModal() {
  taskModal.classList.remove("active");
}

// Fungsi untuk membuka modal konfirmasi
function openConfirmModal(index) {
  document.getElementById("deleteTaskIndex").value = index;
  confirmModal.classList.add("active");
}

// Fungsi untuk menutup modal konfirmasi
function closeConfirmModal() {
  confirmModal.classList.remove("active");
}

// Fungsi untuk mengonfirmasi penghapusan
function confirmDelete() {
  const index = document.getElementById("deleteTaskIndex").value;
  deleteTask(index);
  closeConfirmModal();
}

// Fungsi untuk menyimpan tugas
function saveTask() {
  const index = parseInt(document.getElementById("taskIndex").value);
  const course = document.getElementById("taskCourse").value.trim();
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDesc").value.trim();
  const deadlineStr = document.getElementById("taskDeadline").value;
  const category = document.getElementById("taskCategory").value;

  if (!course || !title || !deadlineStr) {
    showNotification("Mata kuliah, judul dan deadline harus diisi!", "error");
    return;
  }

  try {
    const deadline = new Date(deadlineStr);
    const now = new Date();

    // Validasi: deadline tidak boleh di masa lalu
    if (deadline <= now) {
      showNotification("Deadline tidak boleh di masa lalu!", "error");
      return;
    }

    const deadlineISO = deadline.toISOString();
    const newTask = {
      course,
      title,
      description,
      deadline: deadlineISO,
      category,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const tasks = getTasksFromStorage();

    if (index === -1) {
      // Tambah tugas baru
      tasks.push(newTask);
      showNotification("Tugas berhasil ditambahkan!", "success");
    } else {
      // Update tugas yang ada
      newTask.createdAt = tasks[index].createdAt; // Pertahankan tanggal pembuatan
      newTask.completed = tasks[index].completed; // Pertahankan status selesai
      newTask.completedAt = tasks[index].completedAt; // Pertahankan tanggal selesai
      tasks[index] = newTask;
      showNotification("Tugas berhasil diperbarui!", "success");
    }

    saveTasksToStorage(tasks);
    loadTasks();
    closeModal();
  } catch (error) {
    showNotification("Format tanggal tidak valid!", "error");
  }
}

// Fungsi untuk menghapus tugas
function deleteTask(index) {
  const tasks = getTasksFromStorage();
  tasks.splice(index, 1);
  saveTasksToStorage(tasks);
  loadTasks();

  // Jika dalam tampilan riwayat, muat ulang juga
  if (historyContent.style.display === "block") {
    loadCompletedTasks();
  }

  showNotification("Tugas berhasil dihapus!", "info");
}

// Fungsi untuk toggle status selesai tugas
function toggleTaskCompletion(index) {
  const tasks = getTasksFromStorage();
  tasks[index].completed = !tasks[index].completed;

  // Set tanggal selesai jika ditandai sebagai selesai
  if (tasks[index].completed && !tasks[index].completedAt) {
    tasks[index].completedAt = new Date().toISOString();
  }

  saveTasksToStorage(tasks);
  loadTasks();

  const status = tasks[index].completed ? "diselesaikan" : "dibuka kembali";
  showNotification(`Tugas telah ${status}!`, "success");
}

// Fungsi untuk mendapatkan tugas dari localStorage
// Fungsi untuk mendapatkan tugas dari localStorage
function getTasksFromStorage() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    // Gunakan key unik per user berdasarkan email
    const userTasksKey = `tasks_${currentUser.email}`;
    const data = localStorage.getItem(userTasksKey);

    if (!data) return [];

    const tasks = JSON.parse(data);

    // Validasi data
    if (!Array.isArray(tasks)) {
      console.error("Data tasks bukan array, reset ke array kosong");
      return [];
    }

    return tasks;
  } catch (error) {
    console.error("Error membaca tasks dari localStorage:", error);

    // Coba recovery dari backup
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return [];

      const userTasksKey = `tasks_${currentUser.email}`;
      const backup = sessionStorage.getItem(`${userTasksKey}_backup`);

      if (backup) {
        const backupTasks = JSON.parse(backup);
        if (Array.isArray(backupTasks)) {
          localStorage.setItem(userTasksKey, backup);
          showNotification("Data dipulihkan dari backup!", "warning");
          return backupTasks;
        }
      }
    } catch (backupError) {
      console.error("Error recovery backup:", backupError);
    }

    return [];
  }
}

// Fungsi untuk menyimpan tugas ke localStorage
// Fungsi untuk menyimpan tugas ke localStorage
function saveTasksToStorage(tasks) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error("Tidak ada user yang login");
      return false;
    }

    // Validasi data sebelum save
    if (!Array.isArray(tasks)) {
      console.error("Tidak bisa save: data bukan array");
      return false;
    }

    // Gunakan key unik per user
    const userTasksKey = `tasks_${currentUser.email}`;
    const jsonString = JSON.stringify(tasks);

    localStorage.setItem(userTasksKey, jsonString);

    // Backup otomatis ke sessionStorage
    sessionStorage.setItem(`${userTasksKey}_backup`, jsonString);

    return true;
  } catch (error) {
    console.error("Error menyimpan tasks:", error);

    // Cek apakah localStorage penuh
    if (error.name === 'QuotaExceededError') {
      showNotification("Penyimpanan penuh! Hapus beberapa tugas lama.", "error");
    } else {
      showNotification("Gagal menyimpan data!", "error");
    }

    return false;
  }
}

// Fungsi untuk memfilter tugas
function filterTasks() {
  loadTasks();
}

// Fungsi untuk memuat tugas
function loadTasks() {
  // TAMBAHKAN INI DI BARIS PERTAMA
  clearAllCountdownIntervals(); // Clear intervals lama sebelum render ulang

  const tasks = getTasksFromStorage();
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const sortBy = document.getElementById("sortBy").value;

  // Filter tugas
  let filteredTasks = tasks.filter(task => {
    // Filter berdasarkan pencarian
    const matchesSearch = task.title.toLowerCase().includes(searchInput) ||
      (task.description && task.description.toLowerCase().includes(searchInput)) ||
      (task.course && task.course.toLowerCase().includes(searchInput));

    return matchesSearch && !task.completed;
  });

  // Urutkan tugas
  filteredTasks.sort((a, b) => {
    if (sortBy === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortBy === "name") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "course") {
      return (a.course || "").localeCompare(b.course || "");
    }
    return 0;
  });

  // Kosongkan daftar tugas
  taskList.innerHTML = "";

  // Cek jika tidak ada tugas
  if (filteredTasks.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
          <i class="fas fa-clipboard-list"></i>
          <h3>Tidak ada tugas</h3>
          <p>${tasks.length === 0 ? 'Tambahkan tugas baru untuk memulai.' : 'Tidak ditemukan tugas yang sesuai dengan filter saat ini.'}</p>
          <button class="btn" onclick="openAddTaskModal()">
            <i class="fas fa-plus"></i> Tambah Tugas Baru
          </button>
        `;
    taskList.appendChild(emptyState);
    return;
  }

  // Tampilkan tugas yang difilter
  filteredTasks.forEach((task, index) => {
    const taskIndex = tasks.indexOf(task); // Dapatkan index sebenarnya di array asli
    createTaskCard(task, taskIndex);
  });
}

// Fungsi untuk membuat kartu tugas
function createTaskCard(task, index) {
  const card = document.createElement("div");
  card.className = "task-card";

  // Set warna border berdasarkan kategori
  if (task.category === "exam") {
    card.style.borderLeftColor = "var(--danger-color)";
  } else if (task.category === "project") {
    card.style.borderLeftColor = "var(--warning-color)";
  } else {
    card.style.borderLeftColor = "var(--accent-color)";
  }

  // Set opacity untuk tugas selesai
  if (task.completed) {
    card.style.opacity = "0.7";
  }

  // Buat elemen countdown
  const countdown = document.createElement("div");
  countdown.className = "countdown";
  countdown.id = `countdown-${index}`;
  card.appendChild(countdown);

  // Nama mata kuliah
  if (task.course) {
    const courseName = document.createElement("div");
    courseName.className = "course-name";
    courseName.textContent = task.course;
    card.appendChild(courseName);
  }

  // Judul tugas
  const title = document.createElement("h3");
  title.textContent = task.title;
  if (task.completed) {
    title.style.textDecoration = "line-through";
  }
  card.appendChild(title);

  // Detail tugas
  const details = document.createElement("div");
  details.className = "task-details";

  // Tambahkan deskripsi jika ada
  if (task.description && task.description.trim() !== "") {
    const desc = document.createElement("p");
    desc.textContent = task.description;
    details.appendChild(desc);
  }

  // Buat progress bar
  const progressContainer = document.createElement("div");
  progressContainer.className = "progress-container";

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressContainer.appendChild(progressBar);
  details.appendChild(progressContainer);

  // Update lebar progress bar berdasarkan waktu tersisa
  updateProgressBar(progressBar, task.deadline, task.completed, task.createdAt);

  // Metadata tugas
  const categoryMeta = document.createElement("div");
  categoryMeta.className = "task-meta";

  const categoryIcon = getCategoryIcon(task.category);
  categoryMeta.innerHTML = `<i class="${categoryIcon}"></i> ${getCategoryName(task.category)}`;
  details.appendChild(categoryMeta);

  // Info deadline
  const deadlineMeta = document.createElement("div");
  deadlineMeta.className = "task-meta";

  const deadlineDate = new Date(task.deadline);
  const formattedDate = deadlineDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  deadlineMeta.innerHTML = `<i class="fas fa-calendar-alt"></i> ${formattedDate}`;
  details.appendChild(deadlineMeta);

  card.appendChild(details);

  // Aksi tugas
  const actions = document.createElement("div");
  actions.className = "task-actions";

  // Tombol selesai/belum selesai
  const completeBtn = document.createElement("button");
  completeBtn.className = "task-btn task-btn-complete";
  completeBtn.innerHTML = task.completed ?
    `<i class="fas fa-redo"></i> Buka Kembali` :
    `<i class="fas fa-check"></i> Selesaikan`;
  completeBtn.onclick = () => toggleTaskCompletion(index);
  actions.appendChild(completeBtn);

  // Tombol edit
  const editBtn = document.createElement("button");
  editBtn.className = "task-btn task-btn-edit";
  editBtn.innerHTML = `<i class="fas fa-edit"></i> Edit`;
  editBtn.onclick = () => openEditTaskModal(index);
  actions.appendChild(editBtn);

  // Tombol hapus
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "task-btn task-btn-delete";
  deleteBtn.innerHTML = `<i class="fas fa-trash"></i> Hapus`;
  deleteBtn.onclick = () => openConfirmModal(index);

  actions.appendChild(deleteBtn);

  card.appendChild(actions);

  taskList.appendChild(card);

  // Mulai countdown
  updateCountdown(index, task.deadline, task.completed);
}

// Fungsi untuk memperbarui progress bar
// Fungsi untuk memperbarui progress bar
function updateProgressBar(progressBar, deadlineStr, completed, createdAt) {
  const deadline = new Date(deadlineStr).getTime();
  const now = new Date().getTime();
  const diff = deadline - now;

  if (completed) {
    progressBar.style.width = "100%";
    progressBar.style.background = "var(--info-color)";
    return;
  }

  if (diff <= 0) {
    progressBar.style.width = "100%";
    progressBar.style.background = "var(--danger-color)";
    return;
  }

  // Hitung persentase berdasarkan waktu tersisa (bukan waktu berlalu)
  // Semakin dekat deadline, semakin penuh bar-nya
  const daysLeft = diff / TIME_CONSTANTS.ONE_DAY;

  let percentage;
  if (daysLeft > 7) {
    // Lebih dari 7 hari: 0-30% (bar masih sedikit)
    percentage = Math.min(30, 30 - ((daysLeft - 7) / 7) * 10);
  } else if (daysLeft > 3) {
    // 3-7 hari: 30-60% (bar medium)
    percentage = 30 + ((7 - daysLeft) / 4) * 30;
  } else if (daysLeft > 1) {
    // 1-3 hari: 60-85% (bar hampir penuh)
    percentage = 60 + ((3 - daysLeft) / 2) * 25;
  } else {
    // Kurang dari 1 hari: 85-100% (bar penuh, bahaya!)
    percentage = 85 + (Math.max(0, (1 - daysLeft)) * 15);
  }

  percentage = Math.min(100, Math.max(0, percentage));
  progressBar.style.width = `${percentage}%`;

  // Ubah warna berdasarkan persentase
  if (percentage > 85) {
    progressBar.style.background = "linear-gradient(135deg, #EF476F 0%, #F97316 100%)"; // Merah - Bahaya!
  } else if (percentage > 60) {
    progressBar.style.background = "linear-gradient(135deg, #FFD166 0%, #F97316 100%)"; // Kuning - Warning
  } else if (percentage > 30) {
    progressBar.style.background = "linear-gradient(135deg, #118AB2 0%, #06D6A0 100%)"; // Biru - Cukup Aman
  } else {
    progressBar.style.background = "var(--primary-gradient)"; // Hijau/Ungu - Sangat Aman
  }
}

// Fungsi untuk mendapatkan ikon kategori
function getCategoryIcon(category) {
  switch (category) {
    case "academic": return "fas fa-book";
    case "project": return "fas fa-project-diagram";
    case "exam": return "fas fa-pen-alt";
    default: return "fas fa-sticky-note";
  }
}

// Fungsi untuk mendapatkan nama kategori
function getCategoryName(category) {
  switch (category) {
    case "academic": return "Akademik";
    case "project": return "Proyek";
    case "exam": return "Ujian";
    default: return "Lainnya";
  }
}

// Fungsi untuk memperbarui countdown
function updateCountdown(index, deadlineStr, completed) {
  const countdownEl = document.getElementById("countdown-" + index);
  if (!countdownEl) return;

  const deadline = new Date(deadlineStr).getTime();

  // Fungsi untuk memperbarui countdown
  const updateTimer = () => {
    const now = new Date().getTime();
    const diff = deadline - now;

    if (completed) {
      countdownEl.textContent = "Selesai";
      countdownEl.style.backgroundColor = "var(--info-color)";
      return;
    }

    if (diff <= 0) {
      countdownEl.textContent = "Terlambat!";
      countdownEl.style.backgroundColor = "var(--danger-color)";
      countdownEl.classList.add("pulse");
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownEl.textContent = days > 0 ?
      `${days}h ${hours}j` :
      `${hours}j ${minutes}m ${seconds}d`;

    // Ubah warna berdasarkan waktu tersisa
    if (days <= 1) {
      countdownEl.style.backgroundColor = "var(--danger-color)";
    } else if (days <= 3) {
      countdownEl.style.backgroundColor = "var(--warning-color)";
    } else if (days <= 7) {
      countdownEl.style.backgroundColor = "var(--info-color)";
    } else {
      countdownEl.style.backgroundColor = "var(--accent-color)";
    }
  };

  // Perbarui segera
  updateTimer();

  // Perbarui setiap detik
  const intervalId = setInterval(updateTimer, 1000);

  // TAMBAHKAN: Simpan interval ID ke array tracker
  countdownIntervals.push(intervalId);
}

// Fungsi untuk clear semua countdown intervals
function clearAllCountdownIntervals() {
  countdownIntervals.forEach(intervalId => clearInterval(intervalId));
  countdownIntervals = [];
}

// Fungsi untuk toggle tampilan grid/list
function toggleView() {
  isGridView = !isGridView;
  localStorage.setItem("gridView", isGridView);

  if (isGridView) {
    taskList.classList.add("grid-view");
    viewToggleBtn.innerHTML = "<i class='fas fa-list'></i>";
  } else {
    taskList.classList.remove("grid-view");
    viewToggleBtn.innerHTML = "<i class='fas fa-th-large'></i>";
  }
}

// Fungsi untuk toggle dark mode
function toggleDarkMode() {
  darkMode = !darkMode;
  localStorage.setItem("darkMode", darkMode);

  if (darkMode) {
    document.body.classList.add("dark-mode");
    themeIcon.className = "fas fa-sun";
  } else {
    document.body.classList.remove("dark-mode");
    themeIcon.className = "fas fa-moon";
  }
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = "info") {
  const notificationEl = document.getElementById("notification");
  const messageEl = document.getElementById("notificationMessage");
  const iconEl = notificationEl.querySelector(".notification-icon i");

  // Set pesan
  messageEl.textContent = message;

  // Hapus semua kelas type
  notificationEl.classList.remove("notification-success", "notification-error", "notification-info", "notification-warning");

  // Set ikon dan type
  if (type === "success") {
    iconEl.className = "fas fa-check-circle";
    notificationEl.classList.add("notification-success");
  } else if (type === "error") {
    iconEl.className = "fas fa-exclamation-circle";
    notificationEl.classList.add("notification-error");
  } else if (type === "warning") {
    iconEl.className = "fas fa-exclamation-triangle";
    notificationEl.classList.add("notification-warning");
  } else {
    iconEl.className = "fas fa-info-circle";
    notificationEl.classList.add("notification-info");
  }

  // Tampilkan notifikasi
  notificationEl.classList.add("show");

  // Sembunyikan otomatis setelah 3 detik
  setTimeout(() => {
    closeNotification();
  }, NOTIFICATION_DURATION);
}

// Fungsi untuk menutup notifikasi
function closeNotification() {
  const notificationEl = document.getElementById("notification");
  notificationEl.classList.remove("show");
}

// Fungsi untuk memeriksa tugas yang mendesak
function checkUrgentTasks() {
  const tasks = getTasksFromStorage();
  const now = new Date().getTime();

  // Cari tugas mendesak (kurang dari 24 jam)
  const urgentTasks = tasks.filter(task => {
    if (task.completed) return false;

    const deadline = new Date(task.deadline).getTime();
    const diff = deadline - now;
    const hoursLeft = diff / (1000 * 60 * 60);

    return hoursLeft > 0 && hoursLeft < URGENT_TASK_THRESHOLD;
  });

  if (urgentTasks.length > 0) {
    // Tampilkan notifikasi untuk tugas mendesak
    const message = urgentTasks.length === 1 ?
      `Tugas "${urgentTasks[0].title}" akan berakhir dalam kurang dari 24 jam!` :
      `${urgentTasks.length} tugas akan berakhir dalam kurang dari 24 jam!`;

    showNotification(message, "warning");
  }

  // Periksa lagi setelah satu jam
  setTimeout(checkUrgentTasks, URGENT_CHECK_INTERVAL);
}

// Fungsi untuk migrasi data lama ke format baru (hanya dijalankan sekali)
function migrateOldTasksData() {
  const migrationDone = localStorage.getItem("tasks_migration_done");
  if (migrationDone) return; // Sudah pernah migrasi

  const oldTasks = localStorage.getItem("tasks");
  if (oldTasks) {
    // Hapus data lama yang global
    localStorage.removeItem("tasks");
    localStorage.removeItem("tasks_backup");

    console.log("Data tugas lama telah dihapus untuk sistem multi-user");
  }

  // Tandai migrasi sudah selesai
  localStorage.setItem("tasks_migration_done", "true");
}

// AUTH FUNCTIONS

// Check if user is logged in
function checkAuth() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showLoginPage();
    return false;
  }
  hideLoginPage();
  return true;
}

// Get current user
function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

// Show login page
function showLoginPage() {
  loginSection.style.display = "flex";
  registerSection.style.display = "none";
  document.querySelector("header").style.display = "none";
  homepage.style.display = "none";
  mainContent.style.display = "none";
  aboutSection.style.display = "none";
  contactSection.style.display = "none";
  historyContent.style.display = "none";
  profileSection.style.display = "none";
}

// Hide login page
function hideLoginPage() {
  loginSection.style.display = "none";
  registerSection.style.display = "none";
  document.querySelector("header").style.display = "flex";
}

// Show register page
function showRegisterPage() {
  loginSection.style.display = "none";
  registerSection.style.display = "flex";
}

// Login handler
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    showNotification("Login berhasil! Selamat datang " + user.name, "success");
    
    setTimeout(() => {
      hideLoginPage();
      showHomeSection();
      initializeApp();
      loginForm.reset();
    }, 500);
    
  } else {
    showNotification("Email atau password salah!", "error");
  }
});

// Register handler
registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;

  if (password !== confirmPassword) {
    showNotification("Password tidak cocok!", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password minimal 6 karakter!", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.find(u => u.email === email)) {
    showNotification("Email sudah terdaftar!", "error");
    return;
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    joinedAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  showNotification("Registrasi berhasil! Silakan login.", "success");
  registerForm.reset();
  showLoginPage();
});

// Show register link
showRegisterLink.addEventListener("click", function (e) {
  e.preventDefault();
  showRegisterPage();
});

// Show login link
showLoginLink.addEventListener("click", function (e) {
  e.preventDefault();
  showLoginPage();
});

// Logout handler
logoutLink.addEventListener("click", function (e) {
  e.preventDefault();

  if (confirm("Apakah Anda yakin ingin keluar?")) {
    localStorage.removeItem("currentUser");
    showNotification("Logout berhasil!", "info");
    
    // JANGAN reload, langsung redirect ke login
    setTimeout(() => {
      showLoginPage();
    }, 500);
  }
});

// Profile link handler
profileLink.addEventListener("click", function (e) {
  e.preventDefault();
  showProfileSection();
});

// Show profile section
function showProfileSection() {
  homepage.style.display = "none";
  mainContent.style.display = "none";
  aboutSection.style.display = "none";
  contactSection.style.display = "none";
  historyContent.style.display = "none";
  profileSection.style.display = "block";
  window.scrollTo(0, 0);
  window.location.hash = "profil";

  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  profileLink.classList.add('active');

  loadProfileData();
}

// Load profile data
function loadProfileData() {
  const user = getCurrentUser();
  if (!user) return;

  const tasks = getTasksFromStorage();
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("completedTasks").textContent = completedTasks;
  document.getElementById("pendingTasks").textContent = pendingTasks;

  document.getElementById("infoName").textContent = user.name;
  document.getElementById("infoEmail").textContent = user.email;

  const joinedDate = new Date(user.joinedAt);
  document.getElementById("infoJoined").textContent = joinedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Edit profile modal
function showEditProfileModal() {
  const user = getCurrentUser();
  document.getElementById("editName").value = user.name;
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editProfileModal").classList.add("active");
}

function closeEditProfileModal() {
  document.getElementById("editProfileModal").classList.remove("active");
}

document.getElementById("editProfileForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const user = getCurrentUser();
  const newName = document.getElementById("editName").value.trim();
  const newEmail = document.getElementById("editEmail").value.trim();

  user.name = newName;
  user.email = newEmail;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem("users", JSON.stringify(users));
  }

  localStorage.setItem("currentUser", JSON.stringify(user));

  showNotification("Profil berhasil diperbarui!", "success");
  closeEditProfileModal();
  loadProfileData();
});

// Change password modal
function showChangePasswordModal() {
  document.getElementById("changePasswordModal").classList.add("active");
}

function closeChangePasswordModal() {
  document.getElementById("changePasswordModal").classList.remove("active");
  document.getElementById("changePasswordForm").reset();
}

document.getElementById("changePasswordForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const user = getCurrentUser();
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword = document.getElementById("confirmNewPassword").value;

  if (user.password !== currentPassword) {
    showNotification("Password saat ini salah!", "error");
    return;
  }

  if (newPassword.length < 6) {
    showNotification("Password baru minimal 6 karakter!", "error");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showNotification("Konfirmasi password tidak cocok!", "error");
    return;
  }

  user.password = newPassword;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem("users", JSON.stringify(users));
  }

  localStorage.setItem("currentUser", JSON.stringify(user));

  showNotification("Password berhasil diubah!", "success");
  closeChangePasswordModal();
});
