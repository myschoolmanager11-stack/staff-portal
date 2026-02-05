// 🔹 عناصر DOM
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
const welcomeText = document.getElementById("welcomeText");

let CURRENT_INSTITUTION = null;
let CURRENT_USER_TYPE = null;
let loginData = [];
let selectedUser = null;
let DRIVE_DATA = null; // كل بيانات المؤسسات

// 🔹 رابط سكريبت البوابة
const DRIVE_API_URL = "https://script.google.com/macros/s/AKfycbyZWTTH6vL-eG41clB1VS6lZe09OLe34KZSBzcInTRed4RnDDuSxgMX9fl0MIrDKVxeRg/exec";

// ===== جلب المؤسسات من البوابة =====
function loadInstitutions() {
    institutionSelect.innerHTML = '<option value="">🔹 اختر المؤسسة...</option>';
    fetch(DRIVE_API_URL)
        .then(res => {
            if (!res.ok) throw new Error("فشل تحميل البيانات من السيرفر");
            return res.json();
        })
        .then(data => {
            DRIVE_DATA = data.institutions; // حفظ المؤسسات
            DRIVE_DATA.forEach(inst => {
                const option = document.createElement("option");
                option.value = inst.folderId; // استخدام folderId كمعرف
                option.textContent = inst.name;
                institutionSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error("خطأ في جلب المؤسسات:", err);
            welcomeText.textContent = "❌ تعذر تحميل قائمة المؤسسات. تحقق من الاتصال بالإنترنت.";
        });
}

// ===== تمكين زر متابعة =====
function checkProceedEnable() {
    proceedBtn.disabled = !(institutionSelect.value && userTypeSelect.value);
}
institutionSelect.addEventListener("change", checkProceedEnable);
userTypeSelect.addEventListener("change", checkProceedEnable);

// ===== متابعة بعد اختيار المؤسسة ونوع المستخدم =====
proceedBtn.addEventListener("click", () => {
    CURRENT_INSTITUTION = DRIVE_DATA.find(inst => inst.folderId === institutionSelect.value);
    CURRENT_USER_TYPE = userTypeSelect.value;

    if (!CURRENT_INSTITUTION) {
        alert("❌ لم يتم تحديد المؤسسة بشكل صحيح.");
        return;
    }

    if (["teacher", "consultation"].includes(CURRENT_USER_TYPE)) loadEmployees();
    else if (CURRENT_USER_TYPE === "parent") loadStudents();
    else { loginModal.style.display = "none"; menuBtn.disabled = false; loadDropdownMenuForUserType(CURRENT_USER_TYPE); }
});

// ===== تحميل الموظفين =====
function loadEmployees() {
    if (!CURRENT_INSTITUTION.files.employes) {
        alert("❌ ملف الموظفين غير موجود لهذه المؤسسة.");
        return;
    }
    fetch(CURRENT_INSTITUTION.files.employes)
        .then(res => res.text())
        .then(text => {
            loginData = text.split("\n").map(line => {
                const [name, dob, profession, subject] = line.split(";");
                return { name, dob, profession, subject };
            }).filter(u => ["أستاذ التعليم المتوسط", "أستاذ التعليم الثانوي"].includes(u.profession));
            showLoginTable(loginData, "subject");
        });
}

// ===== تحميل التلاميذ =====
function loadStudents() {
    if (!CURRENT_INSTITUTION.files.students) {
        alert("❌ ملف التلاميذ غير موجود لهذه المؤسسة.");
        return;
    }
    fetch(CURRENT_INSTITUTION.files.students)
        .then(res => res.text())
        .then(text => {
            loginData = text.split("\n").map(line => {
                const [name, dob, classe] = line.split(";");
                return { name, dob, classe };
            });
            showLoginTable(loginData, "classe");
        });
}

// ===== عرض الجدول مع أيقونات =====
function showLoginTable(data, columnField) {
    loginTableBody.innerHTML = "";
    data.forEach(d => {
        const row = document.createElement("tr");
        let icon = "👤";
        if (CURRENT_USER_TYPE === "teacher") icon = "🧑‍🏫";
        else if (CURRENT_USER_TYPE === "consultation") icon = "🛡️";
        else if (CURRENT_USER_TYPE === "parent") icon = "👨‍👩‍👧";

        row.innerHTML = `
            <td><span class="login-icon">${icon}</span>${d.name}</td>
            <td>${d[columnField]}</td>
        `;

        row.addEventListener("click", () => {
            selectedUser = d;
            [...loginTableBody.querySelectorAll("tr")].forEach(r => r.classList.remove("selected"));
            row.classList.add("selected");
        });

        loginTableBody.appendChild(row);
    });
    loginTableModal.style.display = "flex";
}

// ===== التحقق من كلمة المرور =====
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

// ===== ملء القائمة مع أيقونات =====
function loadDropdownMenuForUserType(type) {
    dropdownMenu.innerHTML = "";
    const items = {
        teacher: [["📋", "القوائم الإسمية للتلاميذ"], ["📊", "قوائم صب النقاط"], ["📅", "قائمة التلاميذ الغائبين قبل اليوم"], ["📤", "إرسال أسماء التلاميذ الغائبين حاليًا"]],
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

// ===== تفعيل القائمة =====
function toggleMenu() { dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block"; }

// ===== تحميل المؤسسات عند فتح الصفحة =====
window.addEventListener("DOMContentLoaded", loadInstitutions);
