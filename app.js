/* =========================
   المتغيرات العامة
========================= */
const institutionSelect = document.getElementById("institutionSelect");
const userTypeSelect = document.getElementById("userTypeSelect");
const loginModal = document.getElementById("loginModal");
const menuBtn = document.getElementById("menuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const authBlock = document.getElementById("authBlock");
const continueBtn = document.getElementById("continueBtn");
const loginBtn = document.getElementById("loginBtn");
const loginPassword = document.getElementById("loginPassword");
const loadingInstitutions = document.getElementById("loadingInstitutions");

let INSTITUTIONS = [];
let CURRENT_INSTITUTION = null;
let CURRENT_USER_TYPE = null;

/* =========================
   ملفات المؤسسة (محملة في الذاكرة)
========================= */
let FILES = {
    Employes: "",
    Students: "",
    NewAbsented: "",
    OldAbsented: "",
    Password: ""
};

/* =========================
   رابط Google Apps Script
========================= */
const DRIVE_API_URL =
"https://script.google.com/macros/s/AKfycbyZWTTH6vL-eG41clB1VS6lZe09OLe34KZSBzcInTRed4RnDDuSxgMX9fl0MIrDKVxeRg/exec";

/* =========================
   تحميل المؤسسات
========================= */
loadingInstitutions.style.display = "block";

fetch(DRIVE_API_URL)
    .then(r => r.json())
    .then(d => {

        INSTITUTIONS = d.institutions;

        institutionSelect.innerHTML =
            `<option value="">-- اختر المؤسسة --</option>`;

        d.institutions.forEach(inst => {
            const o = document.createElement("option");
            o.value = inst.name;
            o.textContent = "🏫 " + inst.name;
            institutionSelect.appendChild(o);
        });
    })
    .catch(() => {
        alert("❌ فشل تحميل قائمة المؤسسات");
    })
    .finally(() => {
        loadingInstitutions.style.display = "none";
    });

/* =========================
   اختيار المؤسسة
========================= */
institutionSelect.onchange = () => {

    CURRENT_INSTITUTION =
        INSTITUTIONS.find(i => i.name === institutionSelect.value) || null;

    if (!CURRENT_INSTITUTION || !CURRENT_INSTITUTION.files) return;

    // تحميل ملفات المؤسسة
    loadFile("Employes.txt", "Employes");
    loadFile("Students.txt", "Students");
    loadFile("NewAbsented.txt", "NewAbsented");
    loadFile("OldAbsented.txt", "OldAbsented");
    loadFile("Password.txt", "Password");
};

/* =========================
   تحميل ملف من Drive
========================= */
function loadFile(fileName, key) {

    const url =
        CURRENT_INSTITUTION.files[fileName.replace(".txt", "").toLowerCase()];

    if (!url) return;

    fetch(url)
        .then(r => r.text())
        .then(t => FILES[key] = t.trim())
        .catch(() => console.warn("⚠️ فشل تحميل الملف:", fileName));
}

/* =========================
   تغيير نوع المستخدم
========================= */
userTypeSelect.onchange = () => {

    authBlock.style.display = "none";
    continueBtn.style.display = "none";
    loginPassword.value = "";

    if (!institutionSelect.value) {
        alert("⚠️ الرجاء اختيار المؤسسة أولاً");
        userTypeSelect.value = "";
        return;
    }

    if (userTypeSelect.value === "parent") {
        continueBtn.style.display = "block";
    }

    if (["teacher", "consultation"].includes(userTypeSelect.value)) {
        authBlock.style.display = "block";
    }
};

/* =========================
   متابعة أولياء الأمر
========================= */
continueBtn.onclick = () => {
    openSession("parent");
};

/* =========================
   تسجيل دخول الأساتذة / الإشراف
========================= */
loginBtn.onclick = () => {

    if (!loginPassword.value) {
        alert("⚠️ الرجاء إدخال كلمة المرور");
        return;
    }

    // كلمة المرور الخاصة بالمؤسسة (من Drive)
    const VALID_PASSWORD = FILES.Password;

    if (!VALID_PASSWORD) {
        alert("❌ كلمة مرور المؤسسة غير متوفرة");
        return;
    }

    if (loginPassword.value !== VALID_PASSWORD) {
        alert("❌ كلمة المرور غير صحيحة");
        return;
    }

    openSession(userTypeSelect.value);
};

/* =========================
   فتح الجلسة
========================= */
function openSession(type) {

    CURRENT_USER_TYPE = type;

    loginModal.style.display = "none";
    menuBtn.disabled = false;
    dropdownMenu.style.display = "none";

    document.getElementById("welcomeText").innerHTML = `
        يُعتبر الفضاء الرقمي منصة نوعية ووسيلة تكنولوجية رقمية فعالة لتعزيز التواصل بين الإدارة وأعضاء الأسرة التربوية.<br>
        يمكنهم الاطلاع على الوثائق والملفات المختلفة بطريقة سهلة وسريعة، سواء عبر رابط مباشر أو مسح رمز QR.<br>
        الرجاء اختيار أحد العناصر من القائمة العلوية للمتابعة.
    `;

    fillMenu(type);
}

/* =========================
   تعبئة القائمة حسب النوع
========================= */
function fillMenu(type) {

    dropdownMenu.innerHTML = "";

    const MENUS = {
        parent: [
            "📘 سجل الغيابات",
            "📘 سجل المراسلات الإدارية",
            "🏫 جدول استقبال الأولياء",
            "📆 جدول التوقيت الأسبوعي للتلاميذ",
            "🗓️ رزنامة الفروض والاختبارات",
            "📄 استمارات ووثائق مختلفة للتلاميذ",
            "📢 إعلانات",
            "☎️ اتصل بنا",
            "🚪 تسجيل الخروج",
            "🗑️ مسح جميع الروابط المحفوظة"
        ],
        teacher: [
            "👥 القوائم الإسمية للتلاميذ",
            "📝 قوائم صب النقاط",
            "⏳ الغائبون قبل اليوم",
            "🚨 إرسال غيابات اليوم",
            "📅 جدول توقيت الأستاذ",
            "📆 جدول التوقيت الأسبوعي للتلاميذ",
            "🗓️ رزنامة الفروض والاختبارات",
            "📄 استمارات ووثائق مختلفة للاساتذة",
            "📢 إعلانات",
            "☎️ اتصل بنا",
            "🚪 تسجيل الخروج",
            "🗑️ مسح جميع الروابط المحفوظة"
        ],
        consultation: [
            "👥 القوائم الإسمية",
            "⏳ الغائبون قبل اليوم",
            "📍 متابعة غيابات اليوم",
            "📅 جدول توقيت الأستاذ",
            "📆 جدول التوقيت الأسبوعي للتلاميذ",
            "🗓️ رزنامة الفروض والاختبارات",
            "📄 استمارات ووثائق مختلفة للإشراف التربوي",
            "📢 إعلانات",
            "☎️ اتصل بنا",
            "🚪 تسجيل الخروج",
            "🗑️ مسح جميع الروابط المحفوظة"
        ]
    };

    MENUS[type].forEach(text => {

        const div = document.createElement("div");
        div.textContent = text;
        div.style.cursor = "pointer";

        if (text.includes("مسح")) {
            div.classList.add("menu-danger");
        }

        if (text.includes("تسجيل الخروج")) {
            div.onclick = logout;
        }

        dropdownMenu.appendChild(div);
    });
}

/* =========================
   تسجيل الخروج
========================= */
function logout() {

    dropdownMenu.innerHTML = "";
    dropdownMenu.style.display = "none";

    loginPassword.value = "";
    userTypeSelect.value = "";
    institutionSelect.value = "";

    CURRENT_INSTITUTION = null;
    CURRENT_USER_TYPE = null;

    menuBtn.disabled = true;
    loginModal.style.display = "flex";
}

/* =========================
   إظهار / إخفاء القائمة
========================= */
function toggleMenu() {

    if (menuBtn.disabled) return;

    dropdownMenu.style.display =
        dropdownMenu.style.display === "block"
            ? "none"
            : "block";
}
