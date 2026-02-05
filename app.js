/* =======================
   المتغيرات العامة
======================= */
const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewerContainer");
const viewerToolbar = document.getElementById("viewerToolbar");
const selectedTitle = document.getElementById("selectedTitle");
const subTitle = document.getElementById("subTitle");
const messageBox = document.getElementById("message");
const PORTAL_NAME = "بوابة الأساتذة والموظفين";

let currentKey = "";
let qrScanner = null;

// 🔹 متغيرات اختيار المؤسسة
let CURRENT_INSTITUTION = null;
let DRIVE_DATA = null;

// 🔹 رابط سكريبت Drive (يعيد JSON لجميع المؤسسات)
const DRIVE_API_URL = "https://script.google.com/macros/s/AKfycbyZWTTH6vL-eG41clB1VS6lZe09OLe34KZSBzcInTRed4RnDDuSxgMX9fl0MIrDKVxeRg/exec";

// 🔹 متغيرات التلاميذ
let allStudents = [];      // كل التلاميذ
let visibleStudents = [];  // التلاميذ المعروضون بعد البحث
let studentsWebAppUrl = null;  // رابط تحميل التلاميذ للمؤسسة المختارة
let appendWebAppUrl = null;    // رابط إرسال الغياب للمؤسسة المختارة

/* =======================
   تحميل بيانات Drive عند فتح الصفحة
======================= */
document.addEventListener("DOMContentLoaded", () => {
    loadDriveData();
});

function loadDriveData() {
    fetch(DRIVE_API_URL)
        .then(res => res.json())
        .then(data => {
            DRIVE_DATA = data;
            fillInstitutions(data.institutions);
            document.getElementById("institutionModal").style.display = "flex";
        })
        .catch(() => alert("فشل الاتصال بـ Google Drive"));
}

/* =======================
   ملء قائمة المؤسسات
======================= */
function fillInstitutions(list) {
    const select = document.getElementById("institutionSelect");
    select.innerHTML = "";
    list.forEach(inst => {
        const opt = document.createElement("option");
        opt.value = inst.folderId;
        opt.textContent = inst.name;
        select.appendChild(opt);
    });
}

/* =======================
   تأكيد اختيار المؤسسة
======================= */
function confirmInstitution() {
    const select = document.getElementById("institutionSelect");
    const folderId = select.value;
    const name = select.options[select.selectedIndex].text;

    CURRENT_INSTITUTION = DRIVE_DATA.institutions.find(i => i.folderId === folderId);
    localStorage.setItem("institution", JSON.stringify(CURRENT_INSTITUTION));

    document.getElementById("subTitle").textContent = "🏫 " + name;
    document.getElementById("institutionModal").style.display = "none";

    // 🔹 تحديث روابط التلاميذ بعد اختيار المؤسسة
    studentsWebAppUrl = CURRENT_INSTITUTION.files.students;
    appendWebAppUrl = CURRENT_INSTITUTION.files.students;

    loadAllDataFromDrive();
}

/* =======================
   تحميل جميع الملفات من Drive
======================= */
function loadAllDataFromDrive() {
    loadStudents(studentsWebAppUrl);
    loadEmployes(CURRENT_INSTITUTION.files.employes);
    loadNewAbsented(CURRENT_INSTITUTION.files.newAbsented);
    loadOldAbsented(CURRENT_INSTITUTION.files.oldAbsented);
}

/* =======================
   القائمة الجانبية
======================= */
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function handleItemClick(name) {
    toggleMenu();
    selectedTitle.textContent = name;
    subTitle.textContent = name;

    currentKey = "drive_" + name;
    const savedLink = localStorage.getItem(currentKey);
    if (savedLink) loadFile(savedLink);
    else openModal(name);
}

/* =======================
   نافذة الرابط
======================= */
function openModal(title) {
    modalTitle.textContent = "إدخال رابط: " + title;
    input.value = "";
    messageBox.textContent = "";
    document.getElementById("qr-reader").innerHTML = "";
    modal.style.display = "flex";
}

function closeModal() {
    stopQR();
    modal.style.display = "none";
}

function saveLink() {
    const link = input.value.trim();
    if (!link) {
        messageBox.textContent = "يرجى إدخال رابط صحيح";
        return;
    }
    localStorage.setItem(currentKey, link);
    closeModal();
    loadFile(link);
}

/* =======================
   عرض الملفات
======================= */
function toPreviewLink(link) {
    const match = link.match(/\/d\/([^/]+)/);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : link;
}

function loadFile(link) {
    viewer.innerHTML = "";
    viewerToolbar.style.display = "flex";
    const iframe = document.createElement("iframe");
    iframe.src = toPreviewLink(link);
    viewer.appendChild(iframe);
}

function editCurrentLink() {
    openModal("تعديل الرابط");
    input.value = localStorage.getItem(currentKey) || "";
}

function downloadCurrentFile() {
    const link = localStorage.getItem(currentKey);
    if (link) window.open(link, "_blank");
}

function deleteCurrentLink() {
    if (confirm("هل تريد حذف هذا الرابط؟")) {
        localStorage.removeItem(currentKey);
        viewer.innerHTML = "";
        viewerToolbar.style.display = "none";
    }
}

/* =======================
   QR
======================= */
function startQR() {
    const qrDiv = document.getElementById("qr-reader");
    qrDiv.innerHTML = "";
    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        text => {
            input.value = text;
            localStorage.setItem(currentKey, text);
            stopQR();
            closeModal();
            loadFile(text);
        }
    );
}

function stopQR() {
    if (qrScanner) {
        qrScanner.stop().catch(() => {});
        qrScanner = null;
    }
}

/* =======================
   مسح جميع الروابط
======================= */
function clearAllLinks() {
    toggleMenu();
    if (confirm("⚠️ هل تريد مسح جميع الروابط المحفوظة؟")) {
        localStorage.clear();
        location.reload();
    }
}

/* =======================
   نافذة الغياب
======================= */
function handleAbsentClick() {
    document.getElementById("absentModal").style.display = "flex";

    // استعادة القيم من localStorage
    const savedTeacher = localStorage.getItem("teacherName") || "";
    const savedSubject = localStorage.getItem("subjectName") || "";
    document.getElementById("teacherName").value = savedTeacher;
    document.getElementById("subjectName").value = savedSubject;

    loadStudents();
}

function closeAbsentModal() {
    document.getElementById("absentModal").style.display = "none";
}

function showLoading() { document.getElementById("loadingText").style.display = "block"; }
function hideLoading() { document.getElementById("loadingText").style.display = "none"; }

/* =======================
   تحميل التلاميذ
======================= */
function loadStudents(url) {
    if (!url) return alert("يرجى اختيار المؤسسة أولًا");
    showLoading();
    fetch(url)
        .then(res => res.json())
        .then(data => {
            allStudents = data.students || [];
            visibleStudents = [...allStudents];
            fillClasseFilter(allStudents);
            fillAbsentTable(visibleStudents);
        })
        .catch(err => { alert("فشل تحميل القائمة"); console.error(err); })
        .finally(hideLoading);
}

function fillClasseFilter(students) {
    const sel = document.getElementById("classeFilter");
    sel.innerHTML = `<option value="">كل الأقسام</option>`;
    [...new Set(students.map(s => s.classe))].forEach(c => {
        const o = document.createElement("option");
        o.value = c;
        o.textContent = c;
        sel.appendChild(o);
    });
}

function fillAbsentTable(students) {
    const tbody = document.querySelector("#absentTable tbody");
    tbody.innerHTML = "";
    students.forEach((s, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.classe}</td>
            <td><input type="checkbox" data-id="${i}"></td>
        `;
        tbody.appendChild(row);
    });
}

/* =======================
   البحث والفلترة
======================= */
document.getElementById("absentSearch").addEventListener("input", function () {
    const q = this.value.toLowerCase();
    visibleStudents = allStudents.filter(s =>
        s.name.toLowerCase().includes(q) || s.classe.toLowerCase().includes(q)
    );
    fillAbsentTable(visibleStudents);
});

document.getElementById("classeFilter").addEventListener("change", function () {
    visibleStudents = this.value
        ? allStudents.filter(s => s.classe === this.value)
        : [...allStudents];
    fillAbsentTable(visibleStudents);
});

/* =======================
   إرسال الغائبين
======================= */
function sendSelectedStudents() {
    const teacher = document.getElementById("teacherName").value.trim();
    const subject = document.getElementById("subjectName").value.trim();
    const classe = document.getElementById("classeFilter").value || "";
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    const key = `lastSent_${teacher}_${subject}_${classe}`;
    const lastHour = localStorage.getItem(key);

    if (lastHour === hour) {
        if (!confirm("⚠️ تم إرسال هذه القائمة في هذه الساعة بالفعل. هل تريد الإرسال مرة أخرى؟")) return;
    }

    const checked = document.querySelectorAll("#absentTable tbody input[type=checkbox]:checked");
    const selected = Array.from(checked).map(cb => visibleStudents[parseInt(cb.dataset.id)]);
    if (!selected.length) return alert("لم يتم تحديد أي تلميذ");

    / 🔹 إضافة تاريخ اليوم بصيغة يوم.شهر.سنة
const today = new Date();
const day = String(today.getDate()).padStart(2, "0");
const month = String(today.getMonth() + 1).padStart(2, "0"); // الأشهر تبدأ من 0
const year = today.getFullYear();
const dateStr = `${day}.${month}.${year}`;

// 🔹 إعداد نص الغائبين
let textList = `${dateStr}\n========================================\n`;
textList += `الأستاذ: ${teacher}  مادة ${subject}  ${hour}` + (classe ? "  / " + classe : "") + "\n\n";
textList += selected.map(s => `${s.name} ; ${s.classe}`).join("\n");

    fetch(appendWebAppUrl + "?action=addAbsent&list=" + encodeURIComponent(textList))
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert("✅ تم إرسال القائمة بنجاح");
                localStorage.setItem(key, hour);
                localStorage.setItem("teacherName", teacher);
                localStorage.setItem("subjectName", subject);
            } else alert("❌ خطأ أثناء الإرسال: " + (data.message || ""));
            closeAbsentModal();
        })
        .catch(err => { alert("❌ فشل الاتصال بالسيرفر"); console.error(err); });
}

/* =======================
   اتصل بنا
======================= */
function openContactModal() {
    document.getElementById("contactModal").style.display = "flex";
    contactEmail.value = "";
    contactPhone.value = "";
    contactMessage.value = "";
}

function closeContactModal() { document.getElementById("contactModal").style.display = "none"; }

function sendContactMessage() {
    const email = contactEmail.value.trim();
    const phone = contactPhone.value.trim();
    const message = contactMessage.value.trim();
    if (!email || !message) return alert("يرجى إدخال البريد الإلكتروني ومضمون الرسالة");

    const subject = `رسالة من ${PORTAL_NAME}`;
    const body =
        `البريد الإلكتروني: ${email}\n` +
        `رقم الهاتف: ${phone || "غير مدخل"}\n\n` +
        `مضمون الرسالة:\n${message}`;

    const gmailLink = "https://mail.google.com/mail/?view=cm&fs=1" +
        "&to=myschoolmanager11@gmail.com" +
        "&su=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

    window.open(gmailLink, "_blank");
    setTimeout(closeContactModal, 500);
}
