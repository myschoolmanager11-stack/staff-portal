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

// رابط Web App للتحميل JSON لقائمة التلاميذ
const studentsWebAppUrl = "https://script.google.com/macros/s/AKfycbzAf90OcdZ6HW72YjoCMLhPle6ubvvWdLL5GRMUGjZP3wAogNcQDkLt4W6dqYw33GcU/exec";

// رابط Web App لإضافة التلاميذ المحددين إلى Absented.CSV
const appendWebAppUrl = "https://script.google.com/macros/s/AKfycbw1V4DKL8TPE0jKoO7Fm-Q_BdDmc3B5-3qulrOrqJlTAX-wazSIOZelEL_FOWcj3tWj0A/exec";

let allStudents = [];

/* ===== القائمة ===== */
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

/* ===== اختيار عنصر القائمة ===== */
function handleItemClick(name) {
    document.getElementById("dropdownMenu").style.display = "none";
    selectedTitle.textContent = name;
    subTitle.textContent = name;

    if(name === "إرسال أسماء التلاميذ الغائبين حاليًا") {
        handleAbsentClick(); // فتح المودال للغياب
        return;
    }

    currentKey = "drive_" + name;
    const savedLink = localStorage.getItem(currentKey);

    if (savedLink) {
        loadFile(savedLink);
    } else {
        openModal(name);
    }
}

/* ===== مودال الرابط ===== */
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

/* ===== حفظ رابط ===== */
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

/* ===== عرض الملف ===== */
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

/* ===== أزرار المعاينة ===== */
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

/* ===== QR ===== */
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

/* ===== اتصل بنا ===== */
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

/* ===== نافذة الغياب ===== */
function handleAbsentClick() {
    document.getElementById("absentModal").style.display = "flex";
    loadStudents();
}

function closeAbsentModal() {
    document.getElementById("absentModal").style.display = "none";
}

// تحميل التلاميذ من Web App (JSON)
function loadStudents() {
    fetch(studentsWebAppUrl)
        .then(res => res.json())
        .then(data => {
            allStudents = data.students; // البيانات يجب أن تكون بالشكل {students: [{name:"", classe:""}, ...]}
            fillAbsentTable(allStudents);
        })
        .catch(err => alert("❌ فشل تحميل قائمة التلاميذ:\n" + err));
}

// ملء الجدول
function fillAbsentTable(students) {
    const tbody = document.querySelector("#absentTable tbody");
    tbody.innerHTML = "";
    students.forEach((s, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.classe}</td>
            <td><input type="checkbox" data-index="${idx}"></td>
        `;
        tbody.appendChild(row);
    });
}

// البحث الفوري
document.getElementById("absentSearch").addEventListener("input", function() {
    const query = this.value.toLowerCase();
    const filtered = allStudents.filter(s => s.name.toLowerCase().includes(query) || s.classe.toLowerCase().includes(query));
    fillAbsentTable(filtered);
});

// إرسال التلاميذ المحددين إلى Absented.CSV عبر Web App
function sendSelectedStudents() {
    const checkboxes = document.querySelectorAll("#absentTable tbody input[type=checkbox]:checked");
    const selected = Array.from(checkboxes).map(cb => {
        const idx = parseInt(cb.getAttribute("data-index"));
        return allStudents[idx];
    });

    if(selected.length === 0) {
        alert("لم يتم تحديد أي تلميذ");
        return;
    }

    fetch(appendWebAppUrl, {
        method: "POST",
        body: JSON.stringify({ students: selected }),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === "success") {
            alert("✅ تم إرسال التلاميذ بنجاح إلى الملف على Drive!");
        } else {
            alert("❌ حدث خطأ أثناء الإرسال:\n" + data.message);
        }
        closeAbsentModal();
    })
    .catch(err => alert("❌ فشل الاتصال بالسكريبت:\n" + err));
}
