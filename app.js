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

// ===============================
// تحميل المؤسسات عند فتح الصفحة
// ===============================
fetch(DRIVE_API_URL)
  .then(r => r.json())
  .then(d => {
    INSTITUTIONS = d.institutions || [];
    if (INSTITUTIONS.length === 0) {
      alert("⚠️ لا توجد بيانات للمؤسسات. يرجى التحقق من Google Drive.");
      return;
    }

    INSTITUTIONS.forEach(i => {
      const o = document.createElement("option");
      o.value = i.folderId; 
      o.textContent = i.name;
      institutionSelect.appendChild(o);
    });

    // تعيين أول مؤسسة افتراضية
    institutionSelect.selectedIndex = 0;
    CURRENT_INSTITUTION = INSTITUTIONS[0];
    if (usersBlock.style.display === "block") loadEmployees();
  })
  .catch(err => {
    console.error("خطأ عند تحميل المؤسسات:", err);
    alert("❌ حدث خطأ أثناء تحميل بيانات المؤسسات من Google Drive.");
  });

// ===============================
// تحديث واجهة المستخدم
// ===============================
function updateUI() {
  proceedBtn.disabled = !(institutionSelect.value && userTypeSelect.value);
  usersBlock.style.display = ["teacher", "consultation"].includes(userTypeSelect.value) ? "block" : "none";
  if (usersBlock.style.display === "block") loadEmployees();
}

// ===============================
// تغيير المؤسسة عند اختيار جديدة
// ===============================
institutionSelect.onchange = () => {
  CURRENT_INSTITUTION = INSTITUTIONS.find(i => i.folderId === institutionSelect.value) || null;
  if (!CURRENT_INSTITUTION) return;

  if (!CURRENT_INSTITUTION.files || !CURRENT_INSTITUTION.files.employes) {
    console.warn(`⚠️ لم يتم العثور على ملف الموظفين في مؤسسة ${CURRENT_INSTITUTION.name}`);
    loginTableBody.innerHTML = ""; // تنظيف الجدول
  }

  updateUI();
};

// ===============================
// تغيير نوع المستخدم
// ===============================
userTypeSelect.onchange = updateUI;

// ===============================
// تحميل الموظفين
// ===============================
function loadEmployees() {
  loginTableBody.innerHTML = "";
  selectedUser = null;

  if (!CURRENT_INSTITUTION) return;

  const employesData = CURRENT_INSTITUTION.files?.employes?.content;
  if (!employesData) {
    console.warn(`⚠️ ملف الموظفين غير موجود أو فارغ في مؤسسة "${CURRENT_INSTITUTION.name}"`);
    return;
  }

  const lines = employesData.split(/\r?\n/);
  let validCount = 0;

  lines.forEach(line => {
    const parts = line.trim().split(";");
    if (parts.length < 2) return; // تجاهل الأسطر غير الصالحة

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
    validCount++;
  });

  if (validCount === 0) {
    console.warn(`⚠️ لا توجد بيانات موظفين صالحة في ملف "${CURRENT_INSTITUTION.files.employes?.name}"`);
  }
}

// ===============================
// تسجيل الدخول
// ===============================
proceedBtn.onclick = () => {
  if (userTypeSelect.value === "parent") {
    finishLogin("أولياء الأمر");
  } else {
    if (!selectedUser) return alert("⚠️ اختر المستخدم أولاً");
    if (loginPassword.value !== selectedUser.password) return alert("⚠️ كلمة المرور غير صحيحة");
    finishLogin(selectedUser.name);
  }
};

// ===============================
// إنهاء تسجيل الدخول
// ===============================
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

// ===============================
// القائمة المنسدلة
// ===============================
function toggleMenu() {
  dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
}
