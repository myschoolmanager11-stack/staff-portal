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
