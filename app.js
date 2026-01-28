/*************************************************
 * المتغيرات العامة
 *************************************************/
const PORTAL_NAME = "بوابة الأساتذة والموظفين";

// رابط Web App (Google Apps Script)
const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbzAf90OcdZ6HW72YjoCMLhPle6ubvvWdLL5GRMUGjZP3wAogNcQDkLt4W6dqYw33GcU/exec";

/*************************************************
 * عناصر الواجهة العامة
 *************************************************/
const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewerContainer");
const viewerToolbar = document.getElementById("viewerToolbar");
const selectedTitle = document.getElementById("selectedTitle");
const subTitle = document.getElementById("subTitle");
const messageBox = document.getElementById("message");

let currentKey = "";
let qrScanner = null;

/*************************************************
 * القائمة
 *************************************************/
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

/*************************************************
 * اختيار عنصر
 *************************************************/
function handleItemClick(name) {
    document.getElementById("dropdownMenu").style.display = "none";

    currentKey = "drive_" + name;
    selectedTitle.textContent = name;
    subTitle.textContent = name;

    const savedLink = localStorage.getItem(currentKey);
    if (savedLink) {
        loadFile(savedLink);
    } else {
        openModal(name);
    }
}

/*************************************************
 * نافذة الرابط
 *************************************************/
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

/*************************************************
 * حفظ الرابط
 *************************************************/
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

/*************************************************
 * عرض الملفات
 *************************************************/
function toPreviewLink(link) {
    const match = link.match(/\/d\/([^/]+)/);
    if (!match) return link;
    return `https://drive.google.com/file/d/${match[1]}/preview`;
}

function loadFile(link) {
    viewer.innerHTML = "";
    viewerToolbar.style.display = "flex";

    const iframe = document.createElement("iframe");
    iframe.src = toPreviewLink(link);
    viewer.appendChild(iframe);
}

/*************************************************
 * أزرار المعاينة
 *************************************************/
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
        selectedTitle.textContent = "تم حذف الملف";
        subTitle.textContent = "";
    }
}

/*************************************************
 * QR Code
 *************************************************/
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

/*************************************************
 * مسح كل الروابط
 *************************************************/
function clearAllLinks() {
    document.getElementById("dropdownMenu").style.display = "none";
    if (confirm("⚠️ هل تريد مسح جميع الروابط المحفوظة؟")) {
        localStorage.clear();
        location.reload();
    }
}

/*************************************************
 * اتصل بنا
 *************************************************/
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

/*************************************************
 * نافذة الغياب
 *************************************************/
let allStudents = [];

// فتح نافذة الغياب
function handleAbsentClick() {
    document.getElementById("absentModal").style.display = "flex";
    loadStudents();
}

// إغلاقها
function closeAbsentModal() {
    document.getElementById("absentModal").style.display = "none";
}

// تحميل قائمة التلاميذ عبر Web App
function loadStudents() {
    fetch(WEB_APP_URL)
        .then(res => res.text())
        .then(csv => {
            allStudents = parseCSV(csv);
            fillAbsentTable(allStudents);
        })
        .catch(err => alert("❌ فشل تحميل قائمة التلاميذ:\n" + err));
}

// تحويل CSV
function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(";");
        if (parts.length >= 2) {
            result.push({
                name: parts[0].trim(),
                classe: parts[1].trim()
            });
        }
    }
    return result;
}

// ملء الجدول
function fillAbsentTable(students) {
    const tbody = document.querySelector("#absentTable tbody");
    tbody.innerHTML = "";

    students.forEach((s, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${s.name}</td>
            <td>${s.classe}</td>
            <td><input type="checkbox" data-index="${idx}"></td>
        `;
        tbody.appendChild(tr);
    });
}

// البحث
document.getElementById("absentSearch").addEventListener("input", function () {
    const q = this.value.toLowerCase();
    fillAbsentTable(
        allStudents.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.classe.toLowerCase().includes(q)
        )
    );
});

// إرسال الغائبين
function sendSelectedStudents() {
    const checked = document.querySelectorAll(
        "#absentTable tbody input[type=checkbox]:checked"
    );

    if (checked.length === 0) {
        alert("لم يتم تحديد أي تلميذ");
        return;
    }

    const selected = Array.from(checked).map(cb => {
        return allStudents[parseInt(cb.dataset.index)];
    });

    fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: selected })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("✅ تم إرسال الغائبين بنجاح");
            closeAbsentModal();
        } else {
            alert("❌ خطأ:\n" + data.message);
        }
    })
    .catch(err => alert("❌ فشل الاتصال:\n" + err));
}
