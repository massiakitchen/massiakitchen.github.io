// ==============================
// Form Handling & Validation (ES module)
// ==============================

import { $, debounce, showNotification, trackEvent } from './main.js';

// Enhanced contact form handler

// Form validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  if (typeof phone !== 'string') return false;
  const normalized = phone.replace(/[\s-]/g, '');
  // Accept local (01[0125]...) and international (+20...) Egyptian formats.
  // The auto-formatter below converts local numbers to +20..., so both must pass.
  return /^(?:\+20|0)1[0125][0-9]{8}$/.test(normalized);
}





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

  if (!fileInput) return;

  fileInput.addEventListener('change', handleFileSelect);

  // Drag and drop functionality (label may be absent on some pages)
  if (!fileUploadLabel) return;

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

    const droppedFiles = e.dataTransfer ? e.dataTransfer.files : null;
    if (droppedFiles && droppedFiles.length > 0) {
      try {
        if (typeof DataTransfer !== 'undefined') {
          const dt = new DataTransfer();
          Array.from(droppedFiles).forEach((file) => dt.items.add(file));
          fileInput.files = dt.files;
        } else {
          fileInput.files = droppedFiles;
        }
      } catch (err) {
        console.warn('Could not assign dropped files to input:', err);
      }
      handleFileSelect({ target: fileInput });
    }
  });
}

function handleFileSelect(event) {
  const files = event && event.target ? event.target.files : null;
  if (!files || files.length === 0) return;

  let container = document.getElementById('imagePreviewContainer');

  if (!container) {
    if (!event.target.parentNode) return;
    const previewContainer = document.createElement('div');
    previewContainer.id = 'imagePreviewContainer';
    previewContainer.className = 'image-preview-container';
    event.target.parentNode.appendChild(previewContainer);
    container = previewContainer;
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
  if (!container || !imageData) return;
  const preview = document.createElement('div');
  preview.className = 'image-preview';

  const img = document.createElement('img');
  img.src = imageData.data;
  img.alt = imageData.name;
  preview.appendChild(img);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'remove-image';
  button.setAttribute('aria-label', 'إزالة الصورة');
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', 'x');
  button.appendChild(icon);
  button.addEventListener('click', () => removeImage(imageData.name));
  preview.appendChild(button);

  container.appendChild(preview);
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
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
  if (!form) return;
  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    input.addEventListener('input', debounce(saveFormData, 1000));
    input.addEventListener('change', debounce(saveFormData, 500));
  });

  // Load saved data
  loadFormData();
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function saveFormData() {
  const formData = {
    name: getInputValue('name'),
    phone: getInputValue('phone'),
    city: getInputValue('city'),
    service: getInputValue('service'),
    message: getInputValue('message')
  };

  try {
    localStorage.setItem('almassia_contact_form', JSON.stringify(formData));
  } catch (err) {
    console.warn('Could not auto-save form data:', err);
  }
}

function loadFormData() {
  let saved = null;
  try {
    saved = localStorage.getItem('almassia_contact_form');
  } catch (err) {
    console.warn('Could not read saved form data:', err);
    return;
  }
  if (saved) {
    let formData = null;
    try {
      formData = JSON.parse(saved);
    } catch (err) {
      console.warn('Could not parse saved form data:', err);
      return;
    }
    if (!formData || typeof formData !== 'object') return;

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
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const form = (e && e.target) || document.getElementById('leadForm');
  if (!form) return false;
  const submitBtn = form.querySelector ? form.querySelector('.btn-submit') : null;
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnLoading = submitBtn ? submitBtn.querySelector('.btn-loading') : null;

  try {
    // Show loading state
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'block';
    if (submitBtn) submitBtn.disabled = true;

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

    if (!validatePhone(phone)) {
      throw new Error('يرجى إدخال رقم هاتف مصري صحيح');
    }

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
    if (btnText) btnText.style.display = 'block';
    if (btnLoading) btnLoading.style.display = 'none';
    if (submitBtn) submitBtn.disabled = false;
  }

  return false;
}

// Update form handlers initialization
function initFormHandlers() {
  const contactForm = $('#leadForm');
  if (contactForm) {
    // Single submission path: inline onsubmit="return handleForm(event)" (see window.handleForm below).
    // No programmatic 'submit' listener here to avoid double submission.
    contactForm.addEventListener('reset', clearSavedFormData);
  }

  initEnhancedForm();
}

// Inline handlers need globals (ES modules are not global by default)
window.handleForm = handleForm;
window.removeImage = removeImage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initFormHandlers();
});