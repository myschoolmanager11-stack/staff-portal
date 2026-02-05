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
    .then(data => {

        INSTITUTIONS = data.institutions;

        institutionSelect.innerHTML =
            `<option value="">-- اختر المؤسسة --</option>`;

        INSTITUTIONS.forEach(inst => {
            const opt = document.createElement("option");
            opt.value = inst.folderId;   // ❗ نربط بالـ folderId
            opt.textContent = inst.name;
            institutionSelect.appendChild(opt);
        });
    })
    .catch(err => {
        alert("❌ فشل تحميل المؤسسات");
        console.error(err);
    });

/* التحكم في الواجهة */
function updateUI() {
    proceedBtn.disabled = !(institutionSelect.value && userTypeSelect.value);

    usersBlock.style.display =
        ["teacher", "consultation"].includes(userTypeSelect.value)
        ? "block" : "none";
}

institutionSelect.onchange = () => {

    const folderId = institutionSelect.value;

    CURRENT_INSTITUTION =
        INSTITUTIONS.find(i => i.folderId === folderId) || null;

    updateUI();

    // تحميل الموظفين فقط إذا كان النوع أستاذ أو إشراف
    if (
        CURRENT_INSTITUTION &&
        ["teacher", "consultation"].includes(userTypeSelect.value)
    ) {
        loadEmployees();
    }
};

userTypeSelect.onchange = () => {
    updateUI();
    if (usersBlock.style.display === "block") loadEmployees();
};

/* تحميل الموظفين حسب المؤسسة */
function loadEmployees() {

    if (!CURRENT_INSTITUTION || !CURRENT_INSTITUTION.files.employes) {
        alert("❌ ملف الموظفين غير موجود لهذه المؤسسة");
        return;
    }

    fetch(CURRENT_INSTITUTION.files.employes)
        .then(res => {
            if (!res.ok) throw new Error("fetch failed");
            return res.text();
        })
        .then(text => {

            loginTableBody.innerHTML = "";
            selectedUser = null;

            text.split("\n")
                .map(line => line.trim())
                .filter(line => line && line.includes(";"))
                .forEach(line => {

                    // التقسيم الصحيح: اسم ; كلمة مرور
                    const parts = line.split(";");

                    if (parts.length < 2) return;

                    const fullName = parts[0].trim();
                    const password = parts[1].trim();

                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${fullName}</td>
                    `;

                    tr.onclick = () => {
                        selectedUser = {
                            name: fullName,
                            pass: password
                        };

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


