// عناصر DOM
const institutionSelect = document.getElementById("institutionSelect");
const userTypeSelect = document.getElementById("userTypeSelect");
const loginModal = document.getElementById("loginModal");
const menuBtn = document.getElementById("menuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const selectedTitle = document.getElementById("selectedTitle");
const welcomeText = document.getElementById("welcomeText");

// بيانات المؤسسة والمستخدم
let CURRENT_INSTITUTION = null;
let CURRENT_USER_TYPE = null;

// نموذج بيانات المؤسسات (يمكن جلبها من API لاحقًا)
const institutions = [
    "المؤسسة الأولى",
    "المؤسسة الثانية",
    "المؤسسة الثالثة"
];

// عند تحميل الصفحة، ملء قائمة المؤسسات
window.addEventListener("DOMContentLoaded", () => {
    institutions.forEach(inst => {
        const opt = document.createElement("option");
        opt.value = inst;
        opt.textContent = inst;
        institutionSelect.appendChild(opt);
    });
});

// دالة تسجيل الدخول
function confirmLogin() {
    const inst = institutionSelect.value;
    const userType = userTypeSelect.value;

    if(!inst || !userType){
        alert("الرجاء اختيار المؤسسة ونوع المستخدم");
        return;
    }

    CURRENT_INSTITUTION = inst;
    CURRENT_USER_TYPE = userType;

    // تحديث العنوان والعبارات حسب نوع المستخدم
    updatePortalTexts(userType, inst);

    // تفعيل زر القائمة
    menuBtn.disabled = false;

    // إخفاء نافذة الدخول
    loginModal.style.display = "none";

    // ملء عناصر القائمة حسب نوع المستخدم
    fillMenu(userType);
}

// دالة تحديث النصوص
function updatePortalTexts(userType, institution){
    let title = "🌐 فضاء الخدمات";
    let welcome = "";

    switch(userType){
        case "teacher":
            title = "🌐 فضاء خدمات الأساتذة";
            welcome = "يُمكن للأساتذة الاطلاع على الوثائق والقوائم والملفات المختلفة بسهولة وسرعة.";
            break;
        case "parent":
            title = "🌐 فضاء أولياء الأمور";
            welcome = "يمكن لأولياء الأمور متابعة الغيابات والرزنامة والوثائق الخاصة بأبنائهم.";
            break;
        case "consultation":
            title = "🌐 فضاء الإستشارة";
            welcome = "يمكن لموظفي الإستشارة الاطلاع على قوائم الغيابات والخدمات المختلفة.";
            break;
        case "secretariat":
            title = "🌐 فضاء الأمانة";
            welcome = "يمكن للأمانة الاطلاع على القوائم الأساسية والتواصل الإداري.";
            break;
        case "counselor":
            title = "🌐 فضاء مستشار التوجيه المدرسي";
            welcome = "يمكن للمستشار الاطلاع على المعلومات الأساسية للطلاب والخدمات.";
            break;
        case "clubs":
            title = "🌐 فضاء النوادي المدرسية";
            welcome = "يمكن إدارة النوادي والأنشطة المدرسية بسهولة.";
            break;
    }

    selectedTitle.textContent = title;
    welcomeText.textContent = welcome;
}

// دالة ملء القائمة حسب نوع المستخدم
function fillMenu(userType){
    dropdownMenu.innerHTML = ""; // تنظيف القائمة

    const menuItems = {
        teacher: [
            "📋 القوائم الإسمية للتلاميذ",
            "📊 قوائم صب النقاط للأستاذ",
            "📅 قائمة التلاميذ الغائبين قبل اليوم",
            "📤 إرسال أسماء التلاميذ الغائبين حاليًا",
            "🧑‍🏫 جدول خدمات الأستاذ",
            "🕒 جدول التوقيت الأسبوعي للتلاميذ",
            "📁 استمارات ووثائق مختلفة",
            "📧 تواصل إداري"
        ],
        parent: [
            "📋 سجل الغيابات والمراسلات",
            "👨‍👩‍👧 جدول استقبال الأولياء",
            "📝 رزنامة الفروض والاختبارات",
            "🕒 جدول التوقيت الأسبوعي",
            "📁 استمارات ووثائق مختلفة",
            "📧 تواصل إداري"
        ],
        consultation: [
            "📋 القوائم الإسمية للتلاميذ",
            "📊 قائمة الأساتذة الغائبين",
            "📅 قائمة التلاميذ الغائبين قبل اليوم",
            "📤 قائمة التلاميذ الغائبين لنهار اليوم",
            "🧑‍🏫 جدول خدمات مشرفي التربية",
            "🕒 جدول التوقيت الأسبوعي للتلاميذ",
            "📁 استمارات ووثائق مختلفة",
            "📧 تواصل إداري"
        ],
        secretariat: [
            "📋 القوائم الإسمية للتلاميذ",
            "📧 تواصل إداري"
        ],
        counselor: [
            "📋 القوائم الإسمية للتلاميذ",
            "📧 تواصل إداري"
        ],
        clubs: [
            "📋 القوائم الإسمية للتلاميذ",
            "📧 تواصل إداري"
        ]
    };

    const items = menuItems[userType] || [];
    items.forEach(text => {
        const div = document.createElement("div");
        div.textContent = text;
        div.onclick = () => handleItemClick(text);
        dropdownMenu.appendChild(div);
    });
}

// تفعيل القائمة المنسدلة
function toggleMenu(){
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
}

// عرض العنصر عند الضغط
function handleItemClick(name){
    alert("تم اختيار: " + name);
}

// ===== عناصر DOM =====
const institutionSelect = document.getElementById("institutionSelect");
const userTypeSelect = document.getElementById("userTypeSelect");
const proceedBtn = document.getElementById("proceedBtn");

const loginTableModal = document.getElementById("loginTableModal");
const loginTableBody = document.querySelector("#loginTable tbody");
const loginPassword = document.getElementById("loginPassword");
const loginConfirmBtn = document.getElementById("loginConfirmBtn");

let selectedUserType = "";
let loginData = []; // لتخزين بيانات الموظفين أو التلاميذ حسب النوع
let selectedUser = null;

// ===== تفعيل زر المتابعة عند اختيار المؤسسة والنوع =====
institutionSelect.addEventListener("change", checkProceedEnable);
userTypeSelect.addEventListener("change", checkProceedEnable);

function checkProceedEnable() {
    selectedUserType = userTypeSelect.value;
    proceedBtn.disabled = !(institutionSelect.value && selectedUserType);
}

// ===== عند الضغط على زر متابعة =====
proceedBtn.addEventListener("click", () => {
    if (!selectedUserType) return;

    // تحميل البيانات حسب النوع
    if (selectedUserType === "teacher" || selectedUserType === "consultation") {
        loadEmployees();
    } else if (selectedUserType === "parent") {
        loadStudents();
    } else {
        // الأمانة أو نوادي مؤقتاً
        alert("تم تسجيل الدخول كمستخدم من الفئة: " + selectedUserType);
        document.getElementById("dropdownMenu").disabled = false;
        loginSelectModal.style.display = "none";
    }
});

// ===== تحميل ملف الموظفين =====
function loadEmployees() {
    fetch("Employes.txt")
        .then(res => res.text())
        .then(text => {
            const lines = text.split("\n");
            loginData = lines.map(line => {
                const [name, dob, profession, subject] = line.split(";");
                return { name, dob, profession, subject };
            }).filter(u => u.profession === "أستاذ التعليم المتوسط" || u.profession === "أستاذ التعليم الثانوي");
            showLoginTable(loginData, "subject");
        });
}

// ===== تحميل ملف التلاميذ =====
function loadStudents() {
    fetch("Students.txt")
        .then(res => res.text())
        .then(text => {
            const lines = text.split("\n");
            loginData = lines.map(line => {
                const [name, dob, classe] = line.split(";");
                return { name, dob, classe };
            });
            showLoginTable(loginData, "classe");
        });
}

// ===== عرض البيانات في الجدول =====
function showLoginTable(data, columnField) {
    loginTableBody.innerHTML = "";
    data.forEach((d, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${d.name}</td>
            <td>${d[columnField]}</td>
        `;
        row.addEventListener("click", () => {
            selectedUser = d;
            // تمييز الصف المحدد بصريًا
            [...loginTableBody.querySelectorAll("tr")].forEach(r => r.style.background = "");
            row.style.background = "#cce5ff";
        });
        loginTableBody.appendChild(row);
    });

    loginTableModal.style.display = "flex";
}

// ===== التحقق من كلمة المرور والدخول =====
loginConfirmBtn.addEventListener("click", () => {
    if (!selectedUser) {
        alert("اختر المستخدم من الجدول");
        return;
    }

    // كلمة المرور هي السنة من تاريخ الميلاد
    const year = selectedUser.dob.split("-")[2];
    if (loginPassword.value === year) {
        alert("✅ تم تسجيل الدخول بنجاح: " + selectedUser.name);
        loginTableModal.style.display = "none";
        loginSelectModal.style.display = "none";
        loadDropdownMenuForUserType(selectedUserType);
        document.getElementById("selectedTitle").textContent = "🌐 فضاء " + selectedUserType;
    } else {
        alert("❌ كلمة المرور غير صحيحة");
    }
});

// ===== ملء القائمة حسب نوع المستخدم =====
function loadDropdownMenuForUserType(type) {
    const menu = document.getElementById("dropdownMenu");
    menu.innerHTML = ""; // مسح العناصر السابقة

    if (type === "teacher") {
        menu.innerHTML = `
            <div onclick="handleItemClick('القوائم الإسمية للتلاميذ')">📋 القوائم الإسمية للتلاميذ</div>
            <div onclick="handleItemClick('قوائم صب النقاط للأستاذ')">📊 قوائم صب النقاط</div>
            <div onclick="handleItemClick('قائمة التلاميذ الغائبين قبل اليوم')">📅 قائمة التلاميذ الغائبين قبل اليوم</div>
            <div onclick="handleAbsentClick()">📤 إرسال أسماء التلاميذ الغائبين حاليًا</div>
        `;
    } else if (type === "parent") {
        menu.innerHTML = `
            <div onclick="handleItemClick('سجل الغيابات والمراسلات')">📋 سجل الغيابات والمراسلات</div>
            <div onclick="handleItemClick('جدول استقبال الأولياء')">👨‍👩‍👧 جدول استقبال الأولياء</div>
        `;
    } else if (type === "consultation") {
        menu.innerHTML = `
            <div onclick="handleItemClick('القوائم الإسمية للتلاميذ')">📋 القوائم الإسمية للتلاميذ</div>
            <div onclick="handleItemClick('قائمة الأساتذة الغائبين')">📊 قائمة الأساتذة الغائبين</div>
        `;
    } else {
        menu.innerHTML = `<div class="menu-contact">📧 تواصل إداري</div>`;
    }

    // تفعيل القائمة بعد تسجيل الدخول
    menu.style.display = "none";
    document.querySelector(".menu-btn").disabled = false;
}
