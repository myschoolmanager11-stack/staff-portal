const institutionSelect = document.getElementById("institutionSelect");
const userTypeSelect = document.getElementById("userTypeSelect");
const proceedBtn = document.getElementById("proceedBtn");
const loginTableModal = document.getElementById("loginTableModal");
const loginTableBody = document.querySelector("#loginTable tbody");
const loginPassword = document.getElementById("loginPassword");
const loginConfirmBtn = document.getElementById("loginConfirmBtn");
const loginModal = document.getElementById("loginModal");
const menuBtn = document.getElementById("menuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const selectedTitle = document.getElementById("selectedTitle");

let CURRENT_INSTITUTION = null;
let CURRENT_USER_TYPE = null;
let DRIVE_DATA = null;
let loginData = [];
let selectedUser = null;

// 🔹 رابط سكريبت Drive
const DRIVE_API_URL = "https://script.google.com/macros/s/AKfycbyZWTTH6vL-eG41clB1VS6lZe09OLe34KZSBzcInTRed4RnDDuSxgMX9fl0MIrDKVxeRg/exec";

// جلب المؤسسات
window.addEventListener("DOMContentLoaded", () => {
    fetch(DRIVE_API_URL)
        .then(res => res.json())
        .then(data => {
            DRIVE_DATA = data.institutions;
            DRIVE_DATA.forEach(inst => {
                const opt = document.createElement("option");
                opt.value = inst.name;
                opt.textContent = inst.name;
                institutionSelect.appendChild(opt);
            });
        })
        .catch(err => alert("❌ خطأ أثناء جلب المؤسسات: " + err));
});

// تفعيل زر متابعة
function checkProceedEnable() {
    proceedBtn.disabled = !(institutionSelect.value && userTypeSelect.value);
}
institutionSelect.addEventListener("change", checkProceedEnable);
userTypeSelect.addEventListener("change", checkProceedEnable);

// متابعة
proceedBtn.addEventListener("click", () => {
    CURRENT_INSTITUTION = institutionSelect.value;
    CURRENT_USER_TYPE = userTypeSelect.value;

    if (["teacher", "consultation"].includes(CURRENT_USER_TYPE)) loadEmployees();
    else if (CURRENT_USER_TYPE === "parent") loadStudents();
    else { loginModal.style.display = "none"; menuBtn.disabled = false; loadDropdownMenuForUserType(CURRENT_USER_TYPE); }
});

// ===== تحميل الموظفين =====
function loadEmployees() {
    const institution = DRIVE_DATA.find(inst => inst.name === CURRENT_INSTITUTION);
    const employesFile = institution?.files.employes;
    if (!employesFile) { alert("❌ ملف الموظفين غير موجود"); return; }

    fetch(employesFile)
        .then(res => res.text())
        .then(text => {
            loginData = text.split("\n").map(line => {
                const [name, dob, profession, subject] = line.split(";");
                return { name, dob, profession, subject };
            }).filter(u => ["أستاذ التعليم المتوسط", "أستاذ التعليم الثانوي", "مشرف تربوي"].includes(u.profession));
            showLoginTable(loginData, "subject");
        });
}

// ===== تحميل التلاميذ =====
function loadStudents() {
    const institution = DRIVE_DATA.find(inst => inst.name === CURRENT_INSTITUTION);
    const studentsFile = institution?.files.students;
    if (!studentsFile) { alert("❌ ملف التلاميذ غير موجود"); return; }

    fetch(studentsFile)
        .then(res => res.text())
        .then(text => {
            loginData = text.split("\n").map(line => {
                const [name, dob, classe] = line.split(";");
                return { name, dob, classe };
            });
            showLoginTable(loginData, "classe");
        });
}

// ===== عرض الجدول =====
function showLoginTable(data, columnField) {
    loginTableBody.innerHTML = "";
    data.forEach(d => {
        const row = document.createElement("tr");
        let icon = "👤";
        if (CURRENT_USER_TYPE === "teacher") icon = "🧑‍🏫";
        else if (CURRENT_USER_TYPE === "consultation") icon = "🛡️";
        else if (CURRENT_USER_TYPE === "parent") icon = "👨‍👩‍👧";

        row.innerHTML = `<td><span class="login-icon">${icon}</span>${d.name}</td><td>${d[columnField]}</td>`;

        row.addEventListener("click", () => {
            selectedUser = d;
            [...loginTableBody.querySelectorAll("tr")].forEach(r => r.classList.remove("selected"));
            row.classList.add("selected");
        });

        loginTableBody.appendChild(row);
    });
    loginTableModal.style.display = "flex";
}

// التحقق من كلمة المرور
loginConfirmBtn.addEventListener("click", () => {
    if (!selectedUser) { alert("اختر المستخدم من الجدول"); return; }
    const year = selectedUser.dob.split("-")[2];
    if (loginPassword.value === year) {
        alert("✅ تم تسجيل الدخول بنجاح: " + selectedUser.name);
        loginTableModal.style.display = "none";
        loginModal.style.display = "none";
        loadDropdownMenuForUserType(CURRENT_USER_TYPE);
        selectedTitle.textContent = "🌐 فضاء " + CURRENT_USER_TYPE;
        menuBtn.disabled = false;
    } else alert("❌ كلمة المرور غير صحيحة");
});

// ملء القائمة الرئيسية
function loadDropdownMenuForUserType(type) {
    dropdownMenu.innerHTML = "";
    const items = {
        teacher: [["📋", "القوائم الإسمية للتلاميذ"], ["📊", "قوائم صب النقاط"], ["📅", "قائمة التلاميذ الغائبين قبل اليوم"], ["📤", "إرسال أسماء الغائبين"]],
        parent: [["📋", "سجل الغيابات والمراسلات"], ["👨‍👩‍👧", "جدول استقبال الأولياء"]],
        consultation: [["📋", "القوائم الإسمية للتلاميذ"], ["📊", "قائمة الأساتذة الغائبين"]]
    }[type] || [["📧", "تواصل إداري"]];

    items.forEach(([icon, text]) => {
        const div = document.createElement("div");
        div.innerHTML = `<span>${icon}</span> ${text}`;
        div.onclick = () => alert("تم اختيار: " + text);
        dropdownMenu.appendChild(div);
    });
    dropdownMenu.style.display = "none";
}

// تفعيل القائمة
function toggleMenu() { dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block"; }
