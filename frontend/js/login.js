// js/login.js
 const API_URL = "https://photo-caption-contest-pbuo.onrender.com";
const loginForm = document.getElementById('loginForm');
const loginUserInput = document.getElementById('loginUser');
const loginPassInput = document.getElementById('loginPassword');
const messageDiv = document.getElementById('loginMessage');

// عرض رسالة نجاح التسجيل إذا تم التحويل من صفحة التسجيل
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('register') === 'success') {
    messageDiv.textContent = "تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.";
    messageDiv.className = "text-green-600 mb-3 text-center";
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = "";
    messageDiv.className = "mb-3 text-center";

    // التحقق من تعبئة الحقول
    if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
    }
    try {
        const credentials = {
            email: loginUserInput.value.trim(),
            password: loginPassInput.value,
          
        };
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (res.ok) {
            const data = await res.json();
            // خزّن معلومات المستخدم
             localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
                   id: data.user.id,
                  role: data.user.role,
                   username: data.user.username,
                     }));

            // نتوقع أن يعود الخادم برمز JWT ومعلومات المستخدم
           
            // تخزين الرمز ومعلومات المستخدم في التخزين المحلي
                         if (data.user.role === "admin") {
                         document.querySelector("#dashboardBtn")?.classList.remove("hidden");
}
            // الانتقال إلى صفحة عرض الصور
            window.location.href = 'Photos.html';
        } else {
            if (res.status === 401) {
                messageDiv.textContent = "بيانات تسجيل الدخول غير صحيحة.";
            } else {
                messageDiv.textContent = "تعذر تسجيل الدخول. حاول مرة أخرى.";
            }
            messageDiv.classList.add('text-red-600');
        }
    } catch (err) {
        console.error(err);
        messageDiv.textContent = "حدث خطأ في الاتصال بالخادم.";
        messageDiv.classList.add('text-red-600');
    }
});
