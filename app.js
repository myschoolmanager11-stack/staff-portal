const institutionSelect = document.getElementById("institutionSelect");
const userTypeSelect = document.getElementById("userTypeSelect");
const proceedBtn = document.getElementById("proceedBtn");
const usersBlock = document.getElementById("usersBlock");
const loginTableBody = document.querySelector("#loginTable tbody");
const loginPassword = document.getElementById("loginPassword");
const loginModal = document.getElementById("loginModal");
const menuBtn = document.getElementById("menuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

let INSTITUTIONS = [];
let CURRENT_INSTITUTION = null;
let selectedUser = null;

const DRIVE_API_URL =
"https://script.google.com/macros/s/AKfycbyZWTTH6vL-eG41clB1VS6lZe09OLe34KZSBzcInTRed4RnDDuSxgMX9fl0MIrDKVxeRg/exec";

/* تحميل المؤسسات */
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

/* التحكم في الواجهة */
function updateUI() {
    proceedBtn.disabled = !(institutionSelect.value && userTypeSelect.value);

    usersBlock.style.display =
        ["teacher", "consultation"].includes(userTypeSelect.value)
        ? "block" : "none";
}

institutionSelect.onchange = () => {
    CURRENT_INSTITUTION =
        INSTITUTIONS.find(i => i.name === institutionSelect.value) || null;

    updateUI();

    if (usersBlock.style.display === "block") {
        loadEmployees();
    }
};

userTypeSelect.onchange = () => {
    updateUI();
    if (usersBlock.style.display === "block") loadEmployees();
};

/* تحميل الموظفين حسب المؤسسة */
function loadEmployees() {

    loginTableBody.innerHTML = "";
    selectedUser = null;

    // ✅ هنا بالضبط يوضع الكود
    const data = CURRENT_INSTITUTION?.files?.employes?.content;

    if (!data) {
        alert(`⚠️ ملف الموظفين غير موجود أو فارغ في مؤسسة "${CURRENT_INSTITUTION?.name}"`);
        return;
    }

    data.split("\n")
        .map(l => l.trim())
        .filter(l => l && l.includes(";"))
        .forEach(line => {

            const parts = line.split(";");

            const name = parts[0].trim();
            const pass = parts[1].trim();

            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${name}</td><td>—</td>`;

            tr.onclick = () => {
                selectedUser = { name, pass };
                [...loginTableBody.children]
                    .forEach(r => r.classList.remove("selected"));
                tr.classList.add("selected");
            };

            loginTableBody.appendChild(tr);
        });

    if (loginTableBody.children.length === 0) {
        alert("⚠️ الملف موجود لكن لا يحتوي على بيانات صالحة");
    }
}


/* تسجيل الدخول */
proceedBtn.onclick = () => {

    if (userTypeSelect.value === "parent") {
        finishLogin("ولي الأمر");
        return;
    }

    if (!selectedUser)
        return alert("⚠️ اختر المستخدم");

    if (loginPassword.value !== selectedUser.pass)
        return alert("❌ كلمة المرور غير صحيحة");

    finishLogin(selectedUser.name);
};

function finishLogin(name) {
    loginModal.style.display = "none";
    menuBtn.disabled = false;
    alert("مرحبًا " + name);
}

/* القائمة */
function toggleMenu() {
    dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
}



