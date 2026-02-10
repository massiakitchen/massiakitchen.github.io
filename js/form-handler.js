// ==============================
// Form Handling & Validation
// ==============================

// Enhanced contact form handler


// showNotification is now defined in js/main.js to be globally accessible

// Form validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^01[0-2|5]{1}[0-9]{8}$/;
  return re.test(phone);
}

// Initialize form handlers
function initFormHandlers() {
  const contactForm = $('#leadForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleForm);
  }

  // Add real-time validation
  const phoneInput = $('#phone');
  if (phoneInput) {
    phoneInput.addEventListener('blur', function () {
      if (this.value && !validatePhone(this.value)) {
        this.style.borderColor = '#f44336';
      } else {
        this.style.borderColor = '';
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initFormHandlers();
});



// ==============================
// Enhanced Form Handling with Image Upload
// ==============================

let uploadedImages = [];

// Initialize enhanced form functionality
function initEnhancedForm() {
  initFileUpload();
  initFormValidation();
  initAutoSave();
}

// File upload functionality
function initFileUpload() {
  const fileInput = document.getElementById('attachment');
  const fileUploadLabel = document.querySelector('.file-upload-label');

  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop functionality
    fileUploadLabel.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadLabel.style.borderColor = 'var(--gold)';
      fileUploadLabel.style.background = 'rgba(212,175,55,0.1)';
    });

    fileUploadLabel.addEventListener('dragleave', () => {
      fileUploadLabel.style.borderColor = 'rgba(212,175,55,0.3)';
      fileUploadLabel.style.background = 'rgba(212,175,55,0.05)';
    });

    fileUploadLabel.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadLabel.style.borderColor = 'rgba(212,175,55,0.3)';
      fileUploadLabel.style.background = 'rgba(212,175,55,0.05)';

      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect({ target: fileInput });
      }
    });
  }
}

function handleFileSelect(event) {
  const files = event.target.files;
  const container = document.getElementById('imagePreviewContainer');

  if (!container) {
    const previewContainer = document.createElement('div');
    previewContainer.id = 'imagePreviewContainer';
    previewContainer.className = 'image-preview-container';
    event.target.parentNode.appendChild(previewContainer);
  }

  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const imageData = {
          name: file.name,
          data: e.target.result,
          type: file.type
        };

        uploadedImages.push(imageData);
        createImagePreview(imageData);
        updateFileUploadLabel();
      };

      reader.readAsDataURL(file);
    }
  });
}

function createImagePreview(imageData) {
  const container = document.getElementById('imagePreviewContainer');
  const preview = document.createElement('div');
  preview.className = 'image-preview';

  preview.innerHTML = `
    <img src="${imageData.data}" alt="${imageData.name}">
    <button type="button" class="remove-image" onclick="removeImage('${imageData.name}')">
      <i data-lucide="x"></i>
    </button>
  `;

  container.appendChild(preview);
}

function removeImage(fileName) {
  uploadedImages = uploadedImages.filter(img => img.name !== fileName);
  const container = document.getElementById('imagePreviewContainer');
  if (container) {
    container.innerHTML = '';
    uploadedImages.forEach(createImagePreview);
  }
  updateFileUploadLabel();
}

function updateFileUploadLabel() {
  const label = document.querySelector('.upload-text');
  if (label && uploadedImages.length > 0) {
    label.textContent = `${uploadedImages.length} صورة مرفوعة`;
  } else if (label) {
    label.textContent = 'اختر الصور أو اسحبها هنا';
  }
}

// Enhanced form validation
function initFormValidation() {
  const phoneInput = document.getElementById('phone');

  if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, '');

      if (value.startsWith('0')) {
        value = '+20' + value.substring(1);
      }

      if (value.startsWith('20')) {
        value = '+' + value;
      }

      e.target.value = value;

      // Real-time validation
      if (value.length > 0 && !validatePhone(value)) {
        e.target.style.borderColor = '#f44336';
      } else {
        e.target.style.borderColor = '';
      }
    });
  }
}

// Auto-save form data
function initAutoSave() {
  const form = document.getElementById('leadForm');
  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    input.addEventListener('input', debounce(saveFormData, 1000));
    input.addEventListener('change', debounce(saveFormData, 500));
  });

  // Load saved data
  loadFormData();
}

function saveFormData() {
  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    city: document.getElementById('city').value,
    service: document.getElementById('service').value,
    message: document.getElementById('message').value
  };

  localStorage.setItem('almassia_contact_form', JSON.stringify(formData));
}

function loadFormData() {
  const saved = localStorage.getItem('almassia_contact_form');
  if (saved) {
    const formData = JSON.parse(saved);

    Object.keys(formData).forEach(key => {
      const element = document.getElementById(key);
      if (element && formData[key]) {
        element.value = formData[key];
      }
    });
  }
}

function clearSavedFormData() {
  localStorage.removeItem('almassia_contact_form');
  uploadedImages = [];
  const previewContainer = document.getElementById('imagePreviewContainer');
  if (previewContainer) {
    previewContainer.innerHTML = '';
  }
  updateFileUploadLabel();
}

// Enhanced form handler with image support
async function handleForm(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  try {
    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'block';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const name = (formData.get('name') || '').trim();
    const phone = (formData.get('phone') || '').trim();
    const city = (formData.get('city') || '').trim();
    const service = (formData.get('service') || '').trim();
    const message = (formData.get('message') || '').trim();

    // Validation
    if (!name || !phone || !city || !service) {
      throw new Error('الرجاء إدخال جميع الحقول المطلوبة');
    }

    /*if (!validatePhone(phone)) {
      throw new Error('يرجى إدخال رقم هاتف مصري صحيح');
    }*/

    // Create WhatsApp message with images
    let whatsappMessage = `طلب جديد من موقع الماسية للمطابخ:\n\n`;
    whatsappMessage += `الاسم: ${name}\n`;
    whatsappMessage += `الهاتف: ${phone}\n`;
    whatsappMessage += `المدينة: ${city}\n`;
    whatsappMessage += `الخدمة: ${service}\n`;

    if (message) {
      whatsappMessage += `الوصف: ${message}\n`;
    }

    if (uploadedImages.length > 0) {
      whatsappMessage += `\nعدد الصور المرفوعة: ${uploadedImages.length}\n`;
    }

    whatsappMessage += `\nوقت الإرسال: ${new Date().toLocaleString('ar-EG')}`;

    // Encode message for WhatsApp
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/201092497811?text=${encodedMessage}`;

    // Open WhatsApp
    const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;

    // If there are images, show instructions
    if (uploadedImages.length > 0) {
      setTimeout(() => {
        showNotification(`تم إرسال النص! يرجى إرسال ${uploadedImages.length} صورة يدويًا على واتساب`, 'info', 8000);
      }, 1000);
    }

    // Reset form
    form.reset();
    clearSavedFormData();

    // Track successful submission
    trackEvent('contact', 'form_submit_success', service);

    showNotification('تم إرسال طلبك بنجاح! سيتم التواصل معك خلال 24 ساعة.', 'success');

  } catch (error) {
    console.error('Form handling error:', error);
    showNotification(error.message, 'error');
    trackEvent('contact', 'form_submit_error', error.message);
  } finally {
    // Reset button state
    btnText.style.display = 'block';
    btnLoading.style.display = 'none';
    submitBtn.disabled = false;
  }

  return false;
}

// Update form handlers initialization
function initFormHandlers() {
  const contactForm = $('#leadForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleForm);
    contactForm.addEventListener('reset', clearSavedFormData);
  }

  initEnhancedForm();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initFormHandlers();
});