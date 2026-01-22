const API_URL = "https://photo-caption-contest-pbuo.onrender.com";

/* أدوات مساعدة */
function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: "Bearer " + getToken(),
    "Content-Type": "application/json",
  };
}

function redirectToLogin() {
  window.location.href = "./login.html";
}

function getPhotoIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("photoId");
}

/* تحميل الصورة المختارة */
async function loadSelectedPhoto(photoId) {
  const res = await fetch(`${API_URL}/api/all-images`, {
    headers: authHeaders(),
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    redirectToLogin();
    return null;
  }

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  const photos = Array.isArray(data) ? data : data.images;

  return photos.find((p) => String(p.id) === String(photoId));
}

/* عرض الصورة */
function renderPhoto(photo) {
  const container = document.getElementById("photoContainer");
  container.innerHTML = "";

  if (!photo) {
    container.textContent = "الصورة غير موجودة.";
    return;
  }

  const img = document.createElement("img");
  img.src = API_URL + photo.imageUrl; // /uploads/images/...
  img.alt = "photo";

  container.appendChild(img);
}

/* إرسال التعليق */
async function submitCaption(photoId, caption) {
  const res = await fetch(`${API_URL}/api/add-caption/${photoId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ caption }),
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    redirectToLogin();
    return false;
  }

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return true;
}

/* التشغيل */
document.addEventListener("DOMContentLoaded", async () => {
  const photoId = getPhotoIdFromUrl();
  const message = document.getElementById("message");

  if (!photoId) {
    message.textContent = "photoId غير موجود في الرابط.";
    return;
  }

  try {
    const photo = await loadSelectedPhoto(photoId);
    renderPhoto(photo);
  } catch (err) {
    console.error(err);
    message.textContent = "فشل تحميل الصورة.";
  }

  const form = document.getElementById("captionForm");
  const input = document.getElementById("captionInput");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";

    const text = input.value.trim();
    if (!text) return;

    try {
      await submitCaption(photoId, text);
      input.value = "";
      message.textContent = "✅ تم إضافة التعليق بنجاح.";
    } catch (err) {
      console.error(err);
      message.textContent = "❌ فشل إضافة التعليق.";
    }
  });
});
