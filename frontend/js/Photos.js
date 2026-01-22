// js/photos.js
 const API_URL = "https://photo-caption-contest-pbuo.onrender.com";
console.log("photos.js loaded");
let photosCache = [];

// التأكد من أنّ المستخدم مسجّل الدخول
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

const user = JSON.parse(localStorage.getItem("user") || "null");
if (user?.role === "admin") {
  document.querySelector("#dashboardBtn")?.classList.remove("hidden");
}

async function checkLoggedIn() {
  const token = localStorage.getItem("token");

  // لو لا يوجد توكن → رجوع لصفحة اللوجين
  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  try {
    // نضرب endpoint محمي فعلاً
    const res = await fetch("http://localhost:3000/api/all-images", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // لو التوكن غير صالح
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "./login.html";
    }

    // لو 200 → كل شيء تمام، لا نفعل شيئًا

  } catch (err) {
    // أي خطأ غير متوقع → نرجع للّوجين
    window.location.href = "./login.html";
  }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
  window.location.href = "./login.html";
}
async function getCaptionVoteStats(captionId) {
    
  const res = await fetch(`${API_URL}/api/captions/${captionId}`, {
    method: "GET",
    headers: authHeaders(), // لازم فيها Authorization
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to fetch vote stats (${res.status}): ${msg}`);
  }

  return res.json(); // مثال: { votesCount: 5, hasVoted: true }
}


const photosContainer = document.getElementById('photosContainer');

// دالة مساعدة لإنشاء عناصر DOM للتعليق مع زر التصويت
function createCaptionElement(caption) {

    console.log("my caption",caption)

    console.log("caption.id", caption.id, "caption.userId", caption.userId, "currentUser", getCurrentUser());
console.log("caption keys:", Object.keys(caption));
console.log("caption full:", caption);
  const captionDiv = document.createElement("div");
  captionDiv.className =
    "mt-2 flex items-center justify-between bg-gray-100 p-2 rounded gap-2";

  // نص التعليق
  const textSpan = document.createElement("span");
  textSpan.textContent = caption.caption || caption.text || "(نص التعليق)";
  textSpan.className = "text-sm text-gray-800 flex-1";

  // عدد الأصوات
  const votesSpan = document.createElement("span");
  const getVotesCount = () => (caption.votes ?? caption.votesCount ?? 0);
  const setVotesCount = (n) => {
    console.log("my n",n)
    // تمنع سالب بالخطأ
    const safe = Math.max(0, Number(n) || 0);
    console.log("may safe",safe)
    caption.votes = safe;
    caption.votesCount = safe;
    votesSpan.textContent = `Votes: ${safe}`;
  };
  votesSpan.className = "ml-4 text-sm text-gray-600 whitespace-nowrap";
  setVotesCount(getVotesCount());
    //  setVotesCount(get)
  // زر التصويت
  const voteBtn = document.createElement("button");
  voteBtn.className =
    "bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm whitespace-nowrap";

  // زر إلغاء التصويت
  const unvoteBtn = document.createElement("button");
  unvoteBtn.className =
    "bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm whitespace-nowrap";
  unvoteBtn.textContent = " Cancel Vote";

  // دالة لتحديث شكل الأزرار حسب hasVoted
  const renderButtons = () => {
    if (caption.hasVoted) {
      voteBtn.textContent = " Voted";
      voteBtn.disabled = true;
      voteBtn.className =
        "bg-gray-400 text-white px-2 py-1 rounded text-sm cursor-not-allowed whitespace-nowrap";

      unvoteBtn.disabled = false;
      unvoteBtn.className =
        "bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm whitespace-nowrap";
      unvoteBtn.style.display = "inline-block";
    } else {
      voteBtn.textContent = "Vote";
      voteBtn.disabled = false;
      voteBtn.className =
        "bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm whitespace-nowrap";

      unvoteBtn.style.display = "none";
    }
  };

  // POST vote
  voteBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_URL}/api/add-vote/${caption.id}`, {
        method: "POST",
        headers: authHeaders(),
      });

      if (res.status === 409) {
        // يعني صوّت مسبقًا
        caption.hasVoted = true;
        renderButtons();
         try {
    const stats = await getCaptionVoteStats(caption.id);
    if (typeof stats.votesCount === "number") setVotesCount(stats.votesCount);
    if (typeof stats.hasVoted === "boolean") caption.hasVoted = stats.hasVoted;
    renderButtons();
    syncVoteStats();
  } catch (e) {
    console.error("vote stats error:", e);
  }
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        alert(`Voting failed  (${res.status}). ${msg}`);
        return;
      }

      // نجاح: حدّث UI
      caption.hasVoted = true;
      setVotesCount(getVotesCount() + 1);
      renderButtons();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إرسال التصويت.");
    }
  });

  // DELETE unvote
  unvoteBtn.addEventListener("click", async () => {
    try {
      // ✅ هذا هو المسار المقترح في الباك: delete-vote/:captionId
      const res = await fetch(`${API_URL}/api/delete-vote/${caption.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      // لو الباك عندك يرجع 404 أو 409 حسب تصميمك، تعامل معهم برسالة
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        alert(`فشل إلغاء التصويت (${res.status}). ${msg}`);
        return;
      }

      // نجاح: حدّث UI
      caption.hasVoted = false;
      setVotesCount(getVotesCount() - 1);
      renderButtons();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إلغاء التصويت.");
    }
  });

  // تركيب العناصر
  captionDiv.appendChild(textSpan);
  captionDiv.appendChild(votesSpan);
  captionDiv.appendChild(voteBtn);
  captionDiv.appendChild(unvoteBtn);

  renderButtons();
  const currentUser = getCurrentUser();
  console.log("owner candidates:", {
  userId: caption.userId,
  user_id: caption.user_id,
  ownerId: caption.ownerId,
  createdBy: caption.createdBy,
  authorId: caption.authorId,
  User: caption.User,
  user: caption.user,
  keys: Object.keys(caption),
});

// زر حذف التعليق
const currentUserId = Number(currentUser?.id ?? currentUser?.userId ?? currentUser?.sub);
// const captionOwnerId = Number(
//   caption.userId ??
//   caption.user_id ??
//   caption.userid ??
//   caption.userID ??
//   caption.UserId ??
//   caption.ownerId ??
//   caption.owner_id ??
//   caption.user?.id ??
//   caption.User?.id
// );
const captionOwnerId = Number(caption.userId);

//   console.log({ currentUser, currentUserId, captionOwnerId, caption });

const canDelete =
  !!currentUser &&
  (currentUser.role === "admin" ||
    currentUserId === captionOwnerId);

if (canDelete) {
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className =
    "bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 ml-2";

  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Are You Sure")) return;

    try {
      const res = await fetch(`${API_URL}/api/delete-caption/${caption.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        alert(`فشل حذف التعليق (${res.status}) ${msg}`);
        return;
      }

      captionDiv.remove();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف التعليق");
    }
  });

  captionDiv.appendChild(deleteBtn);
}
  return captionDiv;
}


// دالة لإنشاء عنصر عرض الصورة مع التعليقات
function createPhotoCard(photo) {
    const cardDiv = document.createElement('div');
    cardDiv.className = "bg-white rounded shadow-md m-4 p-4 max-w-lg w-full";
       
    // إضافة الصورة
    const imgEl = document.createElement('img');
    console.log("photo.imageData",photo.url)
    // مسار الصورة: نتوقع وجود photo.imageUrl أو photo.filename
    // إذا كان API يوفر مسار الملف أو اسم الصورة
    if (photo.imageData) {
        imgEl.src = `${API_URL}${photo.url}`;
    } else if (photo.filename) {
        imgEl.src = `${API_URL}${photo.filename}/file`;
    } else if (photo.url) {
        imgEl.src = `${API_URL}${photo.url}`;
    }
    imgEl.alt = "Photo of Contest";
    imgEl.className = "w-full mb-3 rounded";
    cardDiv.appendChild(imgEl);

    // عنوان أو اسم الصورة (إن وجد)
    if (photo.title) {
        const titleEl = document.createElement('h2');
        titleEl.textContent = photo.title;
        titleEl.className = "text-lg font-semibold mb-2";
        cardDiv.appendChild(titleEl);
    }

    // قائمة التعليقات
    const captionsContainer = document.createElement('div');
    captionsContainer.className = "mt-2";
    // إذا لم توجد تعليقات
    if (!photo.captions || photo.captions.length === 0) {
        const noCap = document.createElement('p');
        noCap.textContent = "No Captions Yet   .";
        noCap.className = "text-gray-600";
        captionsContainer.appendChild(noCap);
    } else {
        // إنشاء عنصر لكل تعليق
       photo.captions.forEach((caption) => {
  // توحيد اسم النص لأن DB عندك غالبًا ترجع text
  const normalizedCaption = {
    ...caption,
    caption: caption.caption ?? caption.text ?? caption.content ?? ""
  }
  console.log("Normalized caption",normalizedCaption)
const capEl = createCaptionElement(normalizedCaption);
  captionsContainer.appendChild(capEl);
});
    }
    cardDiv.appendChild(captionsContainer);

    // رابط لإضافة تعليق جديد لهذه الصورة
    const addLink = document.createElement('a');
    addLink.href = `add_caption.html?photoId=${photo.id}`;
    addLink.textContent = " Add Caption";
    addLink.className = "text-blue-600 hover:underline text-sm mt-3 inline-block";
    cardDiv.appendChild(addLink);

    return cardDiv;
}

// جلب البيانات من API وعرض الصور
async function loadPhotosAndCaptions() {
  try {
    photosContainer.innerHTML = "";

    const res = await fetch(`${API_URL}/api/all-images`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error("فشل في جلب الصور");
        
    const imagesPayload = await res.json();
    
    const photos = Array.isArray(imagesPayload) ? imagesPayload : imagesPayload.images;

    for (const photo of photos) {
      const capRes = await fetch(`${API_URL}/api/image/${photo.id}/captions`, {
        headers: authHeaders(),
        cache: "no-store",
      });

      if (capRes.ok) {
        const capData = await capRes.json();

        // ✅ بما أن السيرفر يرجع {captions:[...]}
        photo.captions = Array.isArray(capData) ? capData : (capData.captions || []);
      } else {
        photo.captions = [];
      }

      const photoCard = createPhotoCard(photo);
      photosContainer.appendChild(photoCard);
    }
    photosCache = photos;

  } catch (err) {
    console.error(err);
    photosContainer.textContent = "حدث خطأ في تحميل الصور.";
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

function showAdminLinkIfAdmin() {
 const btn = document.getElementById("dashboardBtn");
  if (!btn) return;

  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role === "admin") {
      btn.classList.remove("hidden");
    }
  } catch (e) {
    console.error("Invalid token");
  }
}
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
function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }

}

function getVotesNumber(caption) {
  // يدعم أكثر من شكل
  if (typeof caption.votes === "number") return caption.votes;
  if (typeof caption.votesCount === "number") return caption.votesCount;
  if (Array.isArray(caption.votes)) return caption.votes.length; // لو votes مصفوفة
  if (Array.isArray(caption.Votes)) return caption.Votes.length;
  return 0;
}

function getCaptionText(caption) {
  return caption.text ?? caption.caption ?? "(without caption)";
}

function buildImageSrc(photo) {
  if (photo.url) return `${API_URL}${photo.url}`;
  if (photo.filename) return `${API_URL}/images/${photo.filename}`;
  if (photo.url) return `${API_URL}/${photo.url}`;
  return "";
}

function computeWinnersPerImage(photos, topN, minVotes = 2) {
  const groups = [];

  for (const photo of photos) {
    const caps = Array.isArray(photo.captions) ? photo.captions : [];

    const winners = caps
      .map((cap) => ({
        captionId: cap.id,
        text: getCaptionText(cap),
        votes: Number(getVotesNumber(cap)) || 0,
      }))
      .filter((x) => x.votes >= minVotes)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, topN)
      .map((item, idx) => ({ ...item, rank: idx + 1 })); // ✅ rank يبدأ من 1 لكل صورة

    if (winners.length) {
      groups.push({
        photoId: photo.id,
        photoSrc: buildImageSrc(photo),
        winners,
      });
    }
  }

  return groups;
}
function renderWinners(groups) {
  const panel = document.getElementById("winnersPanel");
  if (!panel) return;

  if (!groups || groups.length === 0) {
    panel.className = "mt-4 bg-white rounded shadow p-4";
    panel.innerHTML = `<p class="text-gray-600">لا يوجد فائزون (لا توجد أصوات كافية).</p>`;
    panel.classList.remove("hidden");
    return;
  }

  panel.className = "mt-4 space-y-6";
  panel.innerHTML = groups
    .map((g) => `
      <div class="bg-white rounded shadow p-4">
        ${g.photoSrc ? `<img src="${g.photoSrc}" class="w-full h-56 object-cover rounded mb-3" alt="winner photo">` : ""}

        <div class="space-y-2">
          ${g.winners
            .map(
              (w) => `
                <div class="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span class="font-semibold">#${w.rank}</span>
                  <span class="flex-1 mx-3">${w.text}</span>
                  <span class="text-sm text-gray-700">الأصوات: <b>${w.votes}</b></span>
                </div>
              `
            )
            .join("")}
        </div>

        <a class="text-indigo-600 text-sm hover:underline inline-block mt-3"
           href="add_caption.html?photoId=${g.photoId}">
          فتح الصورة
        </a>
      </div>
    `)
    .join("");

  panel.classList.remove("hidden");
}


function setupWinnersUI() {
  const btn = document.getElementById("showWinnersBtn");
  const select = document.getElementById("winnersCount");
  if (!btn || !select) return;

  btn.addEventListener("click", async () => {
    const topN = Number(select.value || 3);

    // ✅ حدث البيانات أولاً (حتى تكون counts صحيحة)
    await loadPhotosAndCaptions();

    const groups = computeWinnersPerImage(photosCache, topN, 2);
    renderWinners(groups);
  });
}
async function syncVoteStats() {
  try {
    const stats = await getCaptionVoteStats(caption.id);

    if (typeof stats.votesCount === "number") setVotesCount(stats.votesCount);
    if (typeof stats.hasVoted === "boolean") caption.hasVoted = stats.hasVoted;

    renderButtons();
  } catch (e) {
    console.error("syncVoteStats error:", e);
  }
}
// تحميل الصور والتعليقات عند فتح الصفحة
// loadPhotosAndCaptions();
document.addEventListener("DOMContentLoaded", async () => {
  await checkLoggedIn();
    showAdminLinkIfAdmin();
  await loadPhotosAndCaptions();
   setupWinnersUI();
  setupLogout()

});