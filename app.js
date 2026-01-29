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
    "https://script.google.com/macros/s/AKfycbzPfR162O1e2RD_5YRJTySOUHnR1PYhrhs3EpwmkQq4fQM8CBlwOUMO4o24d1GHQTQdNQ/exec";

const appendWebAppUrl =
    "https://script.google.com/macros/s/AKfycbzPfR162O1e2RD_5YRJTySOUHnR1PYhrhs3EpwmkQq4fQM8CBlwOUMO4o24d1GHQTQdNQ/exec";

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

/* =======================
   تحميل التلاميذ من TXT
======================= */
function loadStudents() {
    fetch(studentsWebAppUrl + "?action=students")
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success") {
                throw data.message;
            }

            // تحويل كل سطر "أحمد محمد;1A" إلى كائن {name, classe}
            allStudents = (data.students || []).map(item => {
                const parts = item.split(";");
                return {
                    name: parts[0] ? parts[0].trim() : "",
                    classe: parts[1] ? parts[1].trim() : ""
                };
            });

            visibleStudents = [...allStudents];
            fillAbsentTable(visibleStudents);
        })
        .catch(err => {
            alert("❌ فشل تحميل قائمة التلاميذ");
            console.error(err);
        });
}

/* =======================
   ملء الجدول
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
   البحث
======================= */
document.getElementById("absentSearch").addEventListener("input", function () {
    const q = this.value.toLowerCase();
    visibleStudents = allStudents.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.classe.toLowerCase().includes(q)
    );
    fillAbsentTable(visibleStudents);
});

/* =======================
   إرسال الغائبين
======================= */
function sendSelectedStudents() {
    const checked = document.querySelectorAll(
        "#absentTable tbody input[type=checkbox]:checked"
    );

    const selected = Array.from(checked).map(cb => {
        return visibleStudents[parseInt(cb.dataset.id)];
    });

    if (selected.length === 0) {
        alert("لم يتم تحديد أي تلميذ");
        return;
    }

    // تحويل القائمة إلى نص TXT "الاسم | القسم"
    const textList = selected
        .map(s => `${s.name} | ${s.classe}`)
        .join("\n");

    const url =
        appendWebAppUrl +
        "?action=addAbsent&list=" +
        encodeURIComponent(textList);

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert("✅ تم إرسال القائمة بنجاح");
            } else {
                alert("❌ خطأ أثناء الإرسال");
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
