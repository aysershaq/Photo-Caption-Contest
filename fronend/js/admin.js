// js/admin.js


const API_URL = "https://photo-caption-contest-pbuo.onrender.com/";
function setupUploadForm() {
  const form = document.getElementById("uploadForm");
  if (!form) return;

  const imageInput = document.getElementById("imageInput");
  const msg = document.getElementById("uploadMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const file = imageInput.files[0];
    if (!file) {
      msg.textContent = "اختر صورة أولاً";
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // ⚠️ الاسم لازم image

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/api/add-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        msg.textContent = data.message || "Uploading Image Failed";
        return;
      }

      msg.textContent = "✅  Successful Upload  ";
      form.reset();

    } catch (err) {
      console.error(err);
      msg.textContent = "حدث خطأ أثناء الرفع";
    }
  });
}

function requireAdmin() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "./login.html";
    return;
  }


  const payload = parseJwtPayload(token);
  if (!payload || payload.role !== "admin") {
    // مش أدمن
    window.location.href = "./photos.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  // بقية كود لوحة الإدارة…
});

function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );
    return payload; // يحتوي id, role, iat, exp
  } catch (e) {
    return null;
  }
}


function parseJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}


// التأكد من أن المستخدم لديه صلاحيات المشرف


const usersTableBody = document.getElementById('usersTableBody');
const adminErrorDiv = document.getElementById('adminError');
const currentUser = getCurrentUser();

// تحميل قائمة المستخدمين وعرضها في الجدول
async function loadUsers() {
    adminErrorDiv.textContent = "";
    usersTableBody.innerHTML = ""; // تفريغ الجدول
    try {
        const res = await fetch(`${API_URL}/api/allUsers`, {
            headers: authHeaders()
        });
        if (!res.ok) {
            throw new Error('فشل في جلب المستخدمين');
        }
        const users = await res.json();
          const Users = Array.isArray(users) ? users : users.users;

    if (!Array.isArray(Users)) {
      console.error("Unexpected users response:", users);
      return;
    }
        Users.forEach(user => {
            const tr = document.createElement('tr');
            // اسم المستخدم
            const nameTd = document.createElement('td');
            nameTd.textContent = user.username || user.name || "";
            nameTd.className = "py-2 px-4 border-b";
            // البريد الإلكتروني
            const emailTd = document.createElement('td');
            emailTd.textContent = user.email || "";
            emailTd.className = "py-2 px-4 border-b";
            // الدور الحالي
            const roleTd = document.createElement('td');
            roleTd.textContent = (user.role === 'admin') ? 'Admin' : 'User';
            roleTd.className = "py-2 px-4 border-b";
            // عمود الإجراء
            const actionTd = document.createElement('td');
            actionTd.className = "py-2 px-4 border-b text-center";
            if (user.id !== currentUser.id) {
                const button = document.createElement('button');
                if (user.role === 'admin') {
                    button.textContent = 'Cancel Admin Authorization';
                    button.className = 'bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm';
                    button.dataset.newRole = 'user';
                } else {
                    button.textContent = 'Promote To Admin';
                    button.className = 'bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm';
                    button.dataset.newRole = 'admin';
                }
                // تعيين معرّف المستخدم للزر
                button.dataset.userId = user.id;
                // الحدث عند الضغط على زر تغيير الدور
                button.addEventListener('click', () => {
                    changeUserRole(button.dataset.userId, button.dataset.newRole);
                });
                const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-900 text-sm ml-2";
  delBtn.addEventListener("click", () => deleteUser(user.id));

                  
                  actionTd.appendChild(delBtn);
                actionTd.appendChild(button);
            } else {
                // المستخدم الحالي - لا زر
                actionTd.textContent = '—';
            }

            tr.appendChild(nameTd);
            tr.appendChild(emailTd);
            tr.appendChild(roleTd);
            tr.appendChild(actionTd);
            usersTableBody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        adminErrorDiv.textContent = "حدث خطأ أثناء تحميل المستخدمين.";
    }
}



// ✅ عدّل هذا المسار حسب Route الحقيقي عندك في الباك
// أمثلة شائعة:
// 1) /api/images/:id
// 2) /api/image/:id
// 3) /api/delete-image/:id
const DELETE_ENDPOINT = (id) => `${API_URL}/api/image/${id}`;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function redirectToLogin() {
  window.location.href = "./login.html";
}

/**
 * حذف صورة من السيرفر + إزالة الكارد من الواجهة
 */
async function deleteImage(imageId, cardEl) {
  const token = getToken();
  if (!token) {
    alert("You need to be signed in ");
    return redirectToLogin();
  }

  const ok = confirm("Are you sure");
  if (!ok) return;

  try {
    const res = await fetch(DELETE_ENDPOINT(imageId), {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (res.status === 401) {
      alert("انتهت الجلسة أو غير مصرح. سجّل الدخول مرة أخرى.");
      localStorage.removeItem("token");
      return redirectToLogin();
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Delete failed (${res.status})`);
    }

    // ✅ نجاح: احذف الكارد من الصفحة
    if (cardEl) cardEl.remove();
    alert("   Photo Deleted Successfully.");
  } catch (err) {
    console.error(err);
    alert("  Error Occuared .");
  }
}

/**
 * (اختياري) تحميل الصور وعرضها في لوحة الإدارة مع زر حذف
 * تحتاج عنصر في admin.html مثل: <div id="adminPhotos"></div>
 */
async function loadAdminImages() {
  const container = document.getElementById("adminPhotos");
  if (!container) return;

  const token = getToken();
  if (!token) return redirectToLogin();
console.log("token:", localStorage.getItem("token"));

  try {
    const res = await fetch(`${API_URL}/api/all-images`, {
      headers: authHeaders(),
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      return redirectToLogin();
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Failed to load images");
    }

    const data = await res.json();
    // يدعم الحالتين: API يرجع Array مباشرة أو { images: [...] }
    const images = Array.isArray(data) ? data : data.images;

    container.innerHTML = "";

    if (!Array.isArray(images) || images.length === 0) {
      container.textContent = "No Photos Yetا  .";
      return;
    }

    for (const img of images) {
      const card = document.createElement("div");
      card.className = "bg-white rounded shadow p-4 mb-4";

      const imageEl = document.createElement("img");
      // يدعم عندك: imageUrl أو url أو filename
      if (img.imageUrl) imageEl.src = `${API_URL}${img.imageUrl}`;
      else if (img.url) imageEl.src = `${API_URL}${img.url}`;
      else if (img.filename) imageEl.src = `${API_URL}/images/${img.filename}`;

      imageEl.alt = img.alt || "image";
      imageEl.className = "w-full rounded mb-3";
      card.appendChild(imageEl);

      const meta = document.createElement("div");
      meta.className = "text-sm text-gray-600 mb-2";
      meta.textContent = `ID: ${img.id}`;
      card.appendChild(meta);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700";
      delBtn.addEventListener("click", () => deleteImage(img.id, card));
      card.appendChild(delBtn);

      container.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    container.textContent = " Error Occuared   .";
  }
}

// تغيير دور مستخدم وإعادة تحميل القائمة
async function changeUserRole(userId, newRole) {
    try {
        const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
            method: 'PATCH',
            headers:authHeaders(),
            body: JSON.stringify({ role: newRole })
        });
        if (res.ok) {
            // إعادة تحميل قائمة المستخدمين لعرض التحديثات
            loadUsers();
        } else {
            alert("لم يتم تحديث الدور. تأكد من الصلاحيات وحاول مرة أخرى.");
        }
    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء تغيير دور المستخدم.");
    }
}
async function deleteUser(userId) {
  const ok = confirm("Are you Sure?");
  if (!ok) return;

  try {
    const res = await fetch(`${API_URL}/api/user/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      alert(`فشل حذف المستخدم (${res.status}) ${msg}`);
      return;
    }

    // إعادة تحميل القائمة بعد الحذف
    await loadUsers();
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء حذف المستخدم.");
  }
}


// تحميل المستخدمين عند فتح الصفحة



function setupLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    // الخروج الحقيقي مع JWT
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "./login.html";
  });
}

document.addEventListener("DOMContentLoaded",  async () => {
    requireAdmin();

  setupLogout();

  await loadUsers();
  await loadAdminImages();

  // لو عندك فورم رفع
  setupUploadForm();
});
