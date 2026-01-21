// js/login.js
 const API_URL = "https://photo-caption-contest-main.vercel.app/";
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
            // نتوقع أن يعود الخادم برمز JWT ومعلومات المستخدم
            const token = data.token;
            const user = data.user;
            // تخزين الرمز ومعلومات المستخدم في التخزين المحلي
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            // الانتقال إلى صفحة عرض الصور
            window.location.href = 'photos.html';
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
