const institutionSelect = document.getElementById("institutionSelect");
const userTypeSelect = document.getElementById("userTypeSelect");
const proceedBtn = document.getElementById("proceedBtn");
const usersBlock = document.getElementById("usersBlock");
const loginTableBody = document.querySelector("#loginTable tbody");
const loginPassword = document.getElementById("loginPassword");
const loginModal = document.getElementById("loginModal");
const menuBtn = document.getElementById("menuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

let CURRENT_USER_TYPE = null;
let selectedUser = null;

const DRIVE_API_URL = "https://script.google.com/macros/s/AKfycbyZWTTH6vL-eG41clB1VS6lZe09OLe34KZSBzcInTRed4RnDDuSxgMX9fl0MIrDKVxeRg/exec";

/* تحميل المؤسسات */
fetch(DRIVE_API_URL)
    .then(r => r.json())
    .then(d => {
        d.institutions.forEach(i => {
            const o = document.createElement("option");
            o.value = i.name;
            o.textContent = i.name;
            institutionSelect.appendChild(o);
        });
    });

/* التحكم في الواجهة */
function updateUI() {
    proceedBtn.disabled = !(institutionSelect.value && userTypeSelect.value);
    usersBlock.style.display =
        ["teacher","consultation"].includes(userTypeSelect.value)
        ? "block" : "none";
}
institutionSelect.onchange = updateUI;
userTypeSelect.onchange = () => {
    updateUI();
    if (usersBlock.style.display === "block") loadEmployees();
};

/* تحميل الموظفين */
function loadEmployees() {

    const EMPLOYES_URL =
        "https://raw.githubusercontent.com/USER/REPO/main/Employes.txt";

    fetch(EMPLOYES_URL)
        .then(res => {
            if (!res.ok) throw new Error("تعذر تحميل ملف الموظفين");
            return res.text();
        })
        .then(text => {

            loginTableBody.innerHTML = "";
            selectedUser = null;

            text
              .split("\n")
              .map(l => l.trim())
              .filter(l => l && l.includes(";"))
              .forEach(line => {

                const parts = line.split(";");

                if (parts.length < 2) return;

                const name = parts[0].trim();
                const year = parts[1].trim();

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${name}</td>
                    <td>—</td>
                `;

                tr.onclick = () => {
                    selectedUser = { name, year };
                    [...loginTableBody.children]
                        .forEach(r => r.classList.remove("selected"));
                    tr.classList.add("selected");
                };

                loginTableBody.appendChild(tr);
            });
        })
        .catch(err => {
            alert("❌ خطأ في تحميل بيانات الموظفين");
            console.error(err);
        });
}

/* تسجيل الدخول */
proceedBtn.onclick = () => {
    if (userTypeSelect.value === "parent") finishLogin("أولياء الأمر");
    else {
        if (!selectedUser) return alert("اختر المستخدم");
        if (loginPassword.value !== selectedUser.year)
            return alert("كلمة المرور غير صحيحة");
        finishLogin(selectedUser.name);
    }
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

