let CURRENT_INSTITUTION = null;
let selectedUser = null;
let INSTITUTIONS = [];

const institutionSelect = document.getElementById("institutionSelect");
const userTypeSelect = document.getElementById("userTypeSelect");
const proceedBtn = document.getElementById("proceedBtn");
const usersBlock = document.getElementById("usersBlock");
const loginTableBody = document.querySelector("#loginTable tbody");
const loginPassword = document.getElementById("loginPassword");
const loginModal = document.getElementById("loginModal");
const menuBtn = document.getElementById("menuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

const DRIVE_API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

// تحميل المؤسسات عند فتح الصفحة
fetch(DRIVE_API_URL)
  .then(r => r.json())
  .then(d => {
    INSTITUTIONS = d.institutions;
    INSTITUTIONS.forEach(i => {
      const o = document.createElement("option");
      o.value = i.folderId; // نستخدم folderId لتمييز المؤسسات
      o.textContent = i.name;
      institutionSelect.appendChild(o);
    });
  });

// تحديث واجهة المستخدم
function updateUI() {
  proceedBtn.disabled = !(institutionSelect.value && userTypeSelect.value);
  usersBlock.style.display = ["teacher","consultation"].includes(userTypeSelect.value) ? "block" : "none";
}

institutionSelect.onchange = () => {
  CURRENT_INSTITUTION = INSTITUTIONS.find(i => i.folderId === institutionSelect.value) || null;
  updateUI();
};

userTypeSelect.onchange = () => {
  updateUI();
  if (usersBlock.style.display === "block") loadEmployees();
};

// تحميل الموظفين من JSON مباشرة
function loadEmployees() {
  if (!CURRENT_INSTITUTION || !CURRENT_INSTITUTION.files.employes) {
    alert("❌ خطأ: لم يتم العثور على بيانات الموظفين");
    return;
  }

  loginTableBody.innerHTML = "";
  selectedUser = null;

  const lines = CURRENT_INSTITUTION.files.employes.content.split("\n");
  lines.forEach(line => {
    const parts = line.trim().split(";");
    if (parts.length < 2) return;

    const name = parts[0].trim();
    const password = parts[1].trim();

    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${name}</td><td>—</td>`; // عمود كلمة المرور مخفي

    tr.onclick = () => {
      selectedUser = { name, password };
      [...loginTableBody.children].forEach(r => r.classList.remove("selected"));
      tr.classList.add("selected");
    };

    loginTableBody.appendChild(tr);
  });
}

// تسجيل الدخول
proceedBtn.onclick = () => {
  if (userTypeSelect.value === "parent") finishLogin("أولياء الأمر");
  else {
    if (!selectedUser) return alert("اختر المستخدم");
    if (loginPassword.value !== selectedUser.password) return alert("كلمة المرور غير صحيحة");
    finishLogin(selectedUser.name);
  }
};

function finishLogin(name) {
  loginModal.style.display = "none";
  menuBtn.disabled = false;

  document.getElementById("selectedTitle").textContent = "🌐 فضاء خدمات الأساتذة";
  document.getElementById("welcomeText").innerHTML = `
    يُعتبر الفضاء الرقمي منصة نوعية ووسيلة تكنولوجية رقمية فعالة لتعزيز التواصل بين الإدارة والأساتذة وأولياء الأمور.<br>
    يمكنهم الاطلاع على الوثائق والملفات المختلفة بطريقة سهلة وسريعة، سواء عبر رابط مباشر أو مسح رمز QR.<br>
    الرجاء اختيار أحد العناصر من القائمة العلوية للمتابعة.
  `;
}

// القائمة
function toggleMenu() {
  dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
}
