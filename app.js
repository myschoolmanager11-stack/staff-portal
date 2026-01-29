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

/* =======================
   روابط Google Apps Script
======================= */
const studentsWebAppUrl =
    "https://script.google.com/macros/s/AKfycbx5d5cS3Kr-sQZS-iMd8LtArz-Q2nbkZxqZn-Bl6xpMf_RZSNsI2RHKoaHPQk5KEYW_5w/exec";

const appendWebAppUrl = studentsWebAppUrl;

let allStudents = [];      // كل التلاميذ
let visibleStudents = [];  // التلاميذ المعروضون بعد البحث

/* =======================
   القائمة
======================= */
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function handleItemClick(name) {
    document.getElementById("dropdownMenu").style.display = "none";
    selectedTitle.textContent = name;
    subTitle.textContent = name;

    currentKey = "drive_" + name;
    const savedLink = localStorage.getItem(currentKey);

    if (savedLink) {
        loadFile(savedLink);
    } else {
        openModal(name);
    }
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
    if (!match) return link;
    return "https://drive.google.com/file/d/" + match[1] + "/preview";
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

/* ===== مسح الكل ===== */
function clearAllLinks() {
    document.getElementById("dropdownMenu").style.display = "none";
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
    loadStudents();
}

function closeAbsentModal() {
    document.getElementById("absentModal").style.display = "none";
}

function showLoading() {
    document.getElementById("loadingText").style.display = "block";
}

function hideLoading() {
    document.getElementById("loadingText").style.display = "none";
}

/* =======================
   تحميل التلاميذ من Apps Script
======================= */
function loadStudents() {
    showLoading();
   
    fetch(studentsWebAppUrl + "?action=getStudents")
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success") {
                throw new Error(data.message || "خطأ غير معروف");
            }

            allStudents = data.students || []; // الآن بيانات جاهزة {name, classe}
            visibleStudents = [...allStudents];
            fillClasseFilter(allStudents);
            fillAbsentTable(visibleStudents);
           
             })
        .catch(err => {
            alert("فشل تحميل القائمة");
            console.error(err);
        })
        .finally(hideLoading);
}

/* تعبئة الأقسام */
function fillClasseFilter(students) {
    const sel = document.getElementById("classeFilter");
    sel.innerHTML = `<option value="">📚 كل الأقسام</option>`;
    [...new Set(students.map(s => s.classe))].forEach(c => {
        const o = document.createElement("option");
        o.value = c;
        o.textContent = c;
        sel.appendChild(o);
    });
}

/* =======================
   ملء جدول الغياب
======================= */
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
   البحث في قائمة التلاميذ
======================= */
document.getElementById("absentSearch").addEventListener("input", function () {
    const q = this.value.toLowerCase();
    visibleStudents = allStudents.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.classe.toLowerCase().includes(q)
    );
    fillAbsentTable(visibleStudents);
});

/* فلترة القسم */
document.getElementById("classeFilter").addEventListener("change", function () {
    if (this.value === "") {
        showLoading();
        setTimeout(() => {
            visibleStudents = [...allStudents];
            fillAbsentTable(visibleStudents);
            hideLoading();
        }, 300);
    } else {
        visibleStudents = allStudents.filter(s => s.classe === this.value);
        fillAbsentTable(visibleStudents);
    }
});

/* تحديث */
function reloadStudents() {
    loadStudents();
}

/* =======================
   إرسال الغائبين
======================= */
function sendSelectedStudents() {
    const teacher = document.getElementById("teacherName").value.trim();
    const subject = document.getElementById("subjectName").value.trim();
    const classe = document.getElementById("classeFilter").value || ""; // القسم المختار
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0"); // ساعة:دقيقة

    // مفتاح لتسجيل آخر إرسال لكل أستاذ/مادة
    const key = `lastSent_${teacher}_${subject}_${classe}`;
    const lastHour = localStorage.getItem(key);

    if (lastHour === hour) {
        if (!confirm("⚠️ لقد تم إرسال قائمة هذا الأستاذ والمادة في هذه الساعة بالفعل. هل تريد الإرسال مرة أخرى؟")) {
            return;
        }
    }

    const checked = document.querySelectorAll("#absentTable tbody input[type=checkbox]:checked");
    const selected = Array.from(checked).map(cb => visibleStudents[parseInt(cb.dataset.id)]);

    if (selected.length === 0) {
        alert("لم يتم تحديد أي تلميذ");
        return;
    }

    // سطر فارغ قبل الفاصل لتحسين الشكل
    let textList = "\n========================================\n";

    // معلومات الأستاذ + المادة + الساعة + القسم
    textList += `الأستاذ: ${teacher}  مادة ${subject}  ${hour}` + (classe ? "  / " + classe : "") + "\n\n";

    // قائمة التلاميذ بدون القسم والساعة
    textList += selected.map(s => `${s.name} ; ${s.classe}`).join("\n");

    // إرسال البيانات
    fetch(appendWebAppUrl + "?action=addAbsent&list=" + encodeURIComponent(textList))
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert("✅ تم إرسال القائمة بنجاح");
                localStorage.setItem(key, hour); // تسجيل آخر إرسال
                // حفظ القيم لتعبئة المرة القادمة
                localStorage.setItem("teacherName", teacher);
                localStorage.setItem("subjectName", subject);
            } else {
                alert("❌ خطأ أثناء الإرسال: " + (data.message || ""));
            }
            closeAbsentModal();
        })
        .catch(err => {
            alert("❌ فشل الاتصال بالسيرفر");
            console.error(err);
        });
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

function closeContactModal() {
    document.getElementById("contactModal").style.display = "none";
}

function sendContactMessage() {
    const email = contactEmail.value.trim();
    const phone = contactPhone.value.trim();
    const message = contactMessage.value.trim();

    if (!email || !message) {
        alert("يرجى إدخال البريد الإلكتروني ومضمون الرسالة");
        return;
    }

    const subject = `رسالة من ${PORTAL_NAME}`;
    const body =
        `البريد الإلكتروني: ${email}\n` +
        `رقم الهاتف: ${phone || "غير مدخل"}\n\n` +
        `مضمون الرسالة:\n${message}`;

    const gmailLink =
        "https://mail.google.com/mail/?view=cm&fs=1" +
        "&to=myschoolmanager11@gmail.com" +
        "&su=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

    window.open(gmailLink, "_blank");
    setTimeout(closeContactModal, 500);
}

function handleAbsentClick() {
    document.getElementById("absentModal").style.display = "flex";

    // استعادة القيم من localStorage
    const savedTeacher = localStorage.getItem("teacherName") || "";
    const savedSubject = localStorage.getItem("subjectName") || "";

    document.getElementById("teacherName").value = savedTeacher;
    document.getElementById("subjectName").value = savedSubject;

    loadStudents();
}











