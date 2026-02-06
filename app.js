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

let INSTITUTIONS = [];
let CURRENT_INSTITUTION = null;

/* =========================
   رابط Google Apps Script
========================= */
const DRIVE_API_URL =
"https://script.google.com/macros/s/AKfycbyZWTTH6vL-eG41clB1VS6lZe09OLe34KZSBzcInTRed4RnDDuSxgMX9fl0MIrDKVxeRg/exec";

/* =========================
   تحميل المؤسسات
========================= */
fetch(DRIVE_API_URL)
  .then(r => r.json())
  .then(d => {
      INSTITUTIONS = d.institutions;

      d.institutions.forEach(inst => {
          const o = document.createElement("option");
          o.value = inst.name;
          o.textContent = inst.name;
          institutionSelect.appendChild(o);
      });
  });

/* =========================
   تغيير نوع المستخدم
========================= */
userTypeSelect.onchange = () => {

    authBlock.style.display = "none";
    continueBtn.style.display = "none";

    if (userTypeSelect.value === "parent") {
        // أولياء الأمر: دخول مباشر
        continueBtn.style.display = "block";
    }

    if (["teacher", "consultation"].includes(userTypeSelect.value)) {
        // أساتذة أو إشراف: كلمة مرور
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

    /* 🔐 آلية كلمة المرور
       - كلمة المرور تكون موحدة لكل مؤسسة
       - تُخزَّن لاحقًا في ملف Config أو Google Drive
       - هنا نضعها مؤقتًا ثابتة للاختبار
    */
    const VALID_PASSWORD = "1983";

    if (loginPassword.value !== VALID_PASSWORD) {
        alert("❌ كلمة المرور غير صحيحة");
        return;
    }

    openSession(userTypeSelect.value);
};

/* =========================
   فتح الجلسة حسب النوع
========================= */
function openSession(type) {

    loginModal.style.display = "none";
    menuBtn.disabled = false;

    document.getElementById("welcomeText").innerHTML = `
        يُعتبر الفضاء الرقمي منصة نوعية ووسيلة تكنولوجية رقمية فعالة لتعزيز التواصل بين الإدارة وأعضاء الأسرة التربوية.<br>
        يمكنهم الاطلاع على الوثائق والملفات المختلفة بطريقة سهلة وسريعة، سواء عبر رابط مباشر أو مسح رمز QR.<br>
        الرجاء اختيار أحد العناصر من القائمة العلوية للمتابعة.
    `;

    fillMenu(type);
}

/* =========================
   تعبئة القائمة
========================= */
function fillMenu(type) {

    dropdownMenu.innerHTML = "";

    const MENUS = {
        parent: [
            "📘 سجل الغيابات والمراسلات",
            "🏫 جدول استقبال الأولياء",
            "🗓️ رزنامة الفروض والاختبارات",
            "📅 جدول التوقيت الأسبوعي",
            "📄 استمارات ووثائق مختلفة",
            "☎️ اتصل بنا",
            "🚪 تسجيل الخروج",
            "🗑️ مسح جميع الروابط المحفوظة"
        ],
        teacher: [
            "👥 القوائم الإسمية للتلاميذ",
            "📝 قوائم صب النقاط",
            "📅 جدول توقيت الأستاذ",
            "📄 استمارات ووثائق",
            "☎️ اتصل بنا",
            "🚪 تسجيل الخروج",
            "🗑️ مسح جميع الروابط المحفوظة"
        ],
        consultation: [
            "👥 القوائم الإسمية للتلاميذ",
            "📊 متابعة الغيابات",
            "📄 استمارات ووثائق",
            "☎️ اتصل بنا",
            "🚪 تسجيل الخروج",
            "🗑️ مسح جميع الروابط المحفوظة"
        ]
    };

    MENUS[type].forEach(item => {
        const div = document.createElement("div");
        div.textContent = item;

        if (item.includes("مسح")) div.classList.add("danger");
        if (item.includes("تسجيل الخروج")) div.onclick = logout;

        dropdownMenu.appendChild(div);
    });
}

/* =========================
   تسجيل الخروج
========================= */
function logout() {

    dropdownMenu.innerHTML = "";
    loginPassword.value = "";
    userTypeSelect.value = "";
    menuBtn.disabled = true;

    loginModal.style.display = "flex";
}

/* =========================
   إظهار / إخفاء القائمة
========================= */
function toggleMenu() {
    dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
}
