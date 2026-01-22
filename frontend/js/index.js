// js/register.js


 const API_URL = "https://photo-caption-contest-pbuo.onrender.com";

// الحصول على عناصر النموذج والمكونات
const registerForm = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const errorDiv = document.getElementById('registerError');

// الاستماع لحدث إرسال النموذج
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // منع السلوك الافتراضي (عدم إعادة تحميل الصفحة)
    errorDiv.textContent = ""; // مسح رسائل الخطأ القديمة

    // التحقق من تعبئة الحقول المطلوبة
    if (!registerForm.checkValidity()) {
        // عرض رسالة المتصفح للحقول الفارغة أو غير الصحيحة
        registerForm.reportValidity();
        return;
    }
    // التحقق من تطابق كلمتي المرور
    if (passwordInput.value !== confirmInput.value) {
        errorDiv.textContent = "يجب أن تتطابق كلمتا المرور.";
        return;
    }
    
    try {
        // تجهيز بيانات التسجيل من الحقول
        const userData = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value
        };
        // إرسال طلب التسجيل إلى API
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        if (res.ok) {
            // في حال النجاح، الانتقال إلى صفحة تسجيل الدخول مع إشارة النجاح
            window.location.href = 'login.html?register=success';
        } else {
            // حدث خطأ في إنشاء الحساب
            if (res.status === 409) {
                // 409: يشير عادةً إلى تعارض (مثل اسم المستخدم أو البريد الإلكتروني موجود مسبقًا)
                errorDiv.textContent = "اسم المستخدم أو البريد الإلكتروني مستخدم من قبل.";
            } else {
                // أخطاء أخرى
                const errorData = await res.json().catch(() => ({}));
                // إذا عادت رسالة خطأ من الخادم، استخدمها، وإلا رسالة افتراضية
                errorDiv.textContent = errorData.message ? `خطأ: ${errorData.message}` : "حدث خطأ أثناء تسجيل الحساب. حاول مرة أخرى.";
            }
        }
    } catch (err) {
        console.error(err);
        errorDiv.textContent = "حدث خطأ غير متوقع. يرجى المحاولة لاحقًا.";
    }
});
