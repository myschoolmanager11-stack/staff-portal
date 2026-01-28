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

/* ===== القائمة ===== */
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

/* ===== اختيار عنصر ===== */
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

/* ===== نافذة الرابط ===== */
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

/* ===== حفظ ===== */
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

// بيانات تجريبية للتلاميذ (ستستبدل لاحقًا بالبيانات الحقيقية)
const students = [
    { name: "أحمد محمد", class: "1A" },
    { name: "سارة علي", class: "2B" },
    { name: "يوسف كريم", class: "1C" },
    { name: "ليلى سمير", class: "2A" }
];

function handleItemClick(name) {
    document.getElementById("dropdownMenu").style.display = "none";

    if (name === 'إرسال أسماء التلاميذ الغائبين حاليًا') {
        openAbsentModal();
        return;
    }

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

// فتح نافذة الغائبين
function openAbsentModal() {
    populateAbsentTable();
    document.getElementById("absentModal").style.display = "flex";
}

// إغلاق النافذة
function closeAbsentModal() {
    document.getElementById("absentModal").style.display = "none";
}

// تعبئة الجدول بالتلاميذ
function populateAbsentTable() {
    const tbody = document.querySelector("#absentTable tbody");
    tbody.innerHTML = "";

    students.forEach((s, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.class}</td>
            <td><input type="checkbox" data-index="${index}"></td>
        `;
        tbody.appendChild(row);
    });
}

// تصفية التلاميذ في البحث
function filterAbsentList() {
    const filter = document.getElementById("absentSearch").value.toLowerCase();
    const rows = document.querySelectorAll("#absentTable tbody tr");

    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const cls = row.cells[1].textContent.toLowerCase();
        row.style.display = (name.includes(filter) || cls.includes(filter)) ? "" : "none";
    });
}

// إرسال التلاميذ المختارين (سيتم استكمال طريقة الإرسال لاحقًا)
function sendAbsentList() {
    const checkboxes = document.querySelectorAll("#absentTable tbody input[type=checkbox]");
    const selected = [];

    checkboxes.forEach(cb => {
        if (cb.checked) {
            const index = cb.dataset.index;
            selected.push(students[index]);
        }
    });

    if (selected.length === 0) {
        alert("يرجى تحديد تلاميذ على الأقل");
        return;
    }

    console.log("التلاميذ المختارون للإرسال:", selected);

    // هنا سنضع لاحقًا كود إرسال البيانات إلى مجلد على Drive
    alert("سيتم إرسال قائمة التلاميذ المختارين لاحقًا.");
    closeAbsentModal();
}
