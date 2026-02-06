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

const userSelectBlock = document.getElementById("userSelectBlock");
const userSearch = document.getElementById("userSearch");
const userList = document.getElementById("userList");
const readQRBtn = document.getElementById("readQRBtn");

let INSTITUTIONS = [];
let CURRENT_INSTITUTION = null;
let CURRENT_USER_TYPE = null;
let EMPLOYES = [];
let SELECTED_USER = "";

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
async function loadInstitutions() {
    loadingInstitutions.style.display = "block";
    institutionSelect.innerHTML = `<option value="">-- جارٍ التحميل --</option>`;
    try {
        const res = await fetch(DRIVE_API_URL);
        const data = await res.json();

        INSTITUTIONS = data.institutions || [];

        institutionSelect.innerHTML = `<option value="">-- اختر المؤسسة --</option>`;
        INSTITUTIONS.forEach(inst => {
            const o = document.createElement("option");
            o.value = inst.name;
            o.textContent = "🏫 " + inst.name;
            institutionSelect.appendChild(o);
        });

    } catch (err) {
        console.error(err);
        alert("❌ فشل تحميل قائمة المؤسسات");
        institutionSelect.innerHTML = `<option value="">❌ فشل التحميل</option>`;
    } finally {
        loadingInstitutions.style.display = "none";
    }
}
loadInstitutions();

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

    // كلمة المرور: تحقق إذا كان الرابط موجود
    if (CURRENT_INSTITUTION.files.password) {
        loadFile("Password.txt", "Password");
    } else {
        FILES.Password = ""; // لا توجد كلمة مرور
    }
};

institutionSelect.onchange = () => {
    CURRENT_INSTITUTION = INSTITUTIONS.find(i => i.name === institutionSelect.value) || null;

    if (!CURRENT_INSTITUTION || !CURRENT_INSTITUTION.files) return;

    // تجربة تحميل الموظفين فقط
    testLoadEmployes();
};

/* =========================
   تسجيل الدخول الأساتذة / الإشراف
========================= */
loginBtn.onclick = () => {

    if (!SELECTED_USER) {
        alert("⚠️ الرجاء اختيار اسمك من القائمة");
        return;
    }

    if (FILES.Password) {
        if (!loginPassword.value) {
            alert("⚠️ الرجاء إدخال كلمة المرور أو مسح QR");
            return;
        }

        const passwords = FILES.Password.split("\n").map(x => x.trim()).filter(x => x);

        if (passwords.includes(loginPassword.value)) {
            openSession(userTypeSelect.value);
        } else {
            alert("❌ كلمة المرور غير صحيحة");
        }
    } else {
        // إذا لم توجد كلمة مرور، السماح بالدخول مباشرة
        openSession(userTypeSelect.value);
    }
};

/* =========================
   تغيير نوع المستخدم
========================= */
userTypeSelect.onchange = () => {

    authBlock.style.display = "none";
    continueBtn.style.display = "none";
    userSelectBlock.style.display = "none";
    readQRBtn.style.display = "none";
    loginPassword.value = "";
    SELECTED_USER = "";

    if (!institutionSelect.value) {
        alert("⚠️ الرجاء اختيار المؤسسة أولاً");
        userTypeSelect.value = "";
        return;
    }

    if (userTypeSelect.value === "parent") {
        continueBtn.style.display = "block";
        return;
    }

    if (["teacher", "consultation"].includes(userTypeSelect.value)) {
        authBlock.style.display = "block";
        userSelectBlock.style.display = "block";
        readQRBtn.style.display = "inline-block";

        // ملء قائمة الموظفين
        if (FILES.Employes) {
            EMPLOYES = FILES.Employes.split("\n").map(x => x.trim()).filter(x => x);
            renderUserList(EMPLOYES);
        } else {
            EMPLOYES = [];
            userList.innerHTML = "<div style='color:red;padding:5px;'>⚠️ لا توجد أسماء موظفين.</div>";
        }
    }
};

/* =========================
   تحميل ملف من Drive
========================= */
async function loadFile(fileName, key) {
    const url = CURRENT_INSTITUTION.files[fileName.replace(".txt", "").toLowerCase()];
    if (!url) {
        FILES[key] = "";
        return;
    }
    try {
        const res = await fetch(url);
        const text = await res.text();
        FILES[key] = text.trim();
    } catch (err) {
        console.warn("⚠️ فشل تحميل الملف:", fileName);
        FILES[key] = "";
    }
}

/* =========================
   تغيير نوع المستخدم
========================= */
userTypeSelect.onchange = () => {

    authBlock.style.display = "none";
    continueBtn.style.display = "none";
    userSelectBlock.style.display = "none";
    readQRBtn.style.display = "none";
    loginPassword.value = "";
    SELECTED_USER = "";

    if (!institutionSelect.value) {
        alert("⚠️ الرجاء اختيار المؤسسة أولاً");
        userTypeSelect.value = "";
        return;
    }

    if (userTypeSelect.value === "parent") {
        continueBtn.style.display = "block";
        return;
    }

    if (["teacher", "consultation"].includes(userTypeSelect.value)) {
        authBlock.style.display = "block";
        userSelectBlock.style.display = "block";
        readQRBtn.style.display = "inline-block";

        EMPLOYES = FILES.Employes ? FILES.Employes.split("\n").map(x => x.trim()).filter(x => x) : [];
        renderUserList(EMPLOYES);
    }
};

/* =========================
   فلترة القائمة عند البحث
========================= */
userSearch.oninput = () => {
    const term = userSearch.value.trim().toLowerCase();
    const filtered = EMPLOYES.filter(name => name.toLowerCase().includes(term));
    renderUserList(filtered);
};

/* =========================
   عرض القائمة
========================= */
function renderUserList(list) {
    userList.innerHTML = "";
    list.forEach(name => {
        const div = document.createElement("div");
        div.textContent = name;
        div.onclick = () => {
            SELECTED_USER = name;
            userSearch.value = name;
            userList.innerHTML = "";
        };
        userList.appendChild(div);
    });
}

/* =========================
   زر قراءة QR
========================= */
readQRBtn.onclick = () => {
    alert("📷 QR reader غير مفعّل حاليا، ضع الكود هنا");
};

/* =========================
   متابعة أولياء الأمر
========================= */
continueBtn.onclick = () => {
    openSession("parent");
};

/* =========================
   تسجيل الدخول
========================= */
loginBtn.onclick = () => {

    if (!SELECTED_USER) {
        alert("⚠️ الرجاء اختيار اسمك من القائمة");
        return;
    }

    if (!loginPassword.value) {
        alert("⚠️ الرجاء إدخال كلمة المرور أو مسح QR");
        return;
    }

    const passwords = FILES.Password ? FILES.Password.split("\n").map(x => x.trim()).filter(x => x) : [];

    if (passwords.includes(loginPassword.value)) {
        openSession(userTypeSelect.value);
    } else {
        alert("❌ كلمة المرور غير صحيحة");
    }
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
        if (text.includes("مسح")) div.classList.add("menu-danger");
        if (text.includes("تسجيل الخروج")) div.onclick = logout;
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
    userSearch.value = "";
    SELECTED_USER = "";
    userTypeSelect.value = "";
    institutionSelect.value = "";

    CURRENT_INSTITUTION = null;
    CURRENT_USER_TYPE = null;
    EMPLOYES = [];

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


/* =========================
   اختبار تحميل قائمة الموظفين
========================= */
function testLoadEmployes() {
    if (!CURRENT_INSTITUTION || !CURRENT_INSTITUTION.files.employes) {
        console.warn("⚠️ الرابط غير موجود لقائمة الموظفين!");
        return;
    }

    fetch(CURRENT_INSTITUTION.files.employes)
        .then(response => {
            if (!response.ok) throw new Error("فشل تحميل الملف من الرابط");
            return response.text();
        })
        .then(text => {
            console.log("✅ الملف تم تحميله بنجاح!");
            console.log("محتوى الموظفين:\n", text);
            // وضعه في الذاكرة
            FILES.Employes = text.trim();
        })
        .catch(err => {
            console.error("❌ خطأ أثناء تحميل الملف:", err);
        });
}
