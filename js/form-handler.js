// ==============================
// Form Handling & Validation (ES module)
// ==============================

import { $, debounce, showNotification, trackEvent, normalizeEgyptPhone, isValidEgyptPhone } from './main.js';

// Enhanced contact form handler

// Local alias kept for readability; single source of truth lives in main.js.
function validatePhone(phone) {
  return isValidEgyptPhone(phone);
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

const MAX_UPLOAD_IMAGES = 3;
const MAX_IMAGE_DIMENSION = 1280;

// Downscale an image file in the browser to max 1280px (longest side),
// returning a JPEG data URL (quality 0.8) for lightweight storage.
function downscaleImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    reader.onload = function (e) {
      const img = new Image();
      img.onerror = () => reject(new Error('تعذر قراءة الصورة'));
      img.onload = function () {
        let { width, height } = img;
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
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

  const remaining = MAX_UPLOAD_IMAGES - uploadedImages.length;
  if (remaining <= 0) {
    showNotification(`الحد الأقصى ${MAX_UPLOAD_IMAGES} صور فقط`, 'error');
    event.target.value = '';
    return;
  }

  const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
  if (newFiles.length === 0) {
    event.target.value = '';
    return;
  }

  if (newFiles.length > remaining) {
    showNotification(`الحد الأقصى ${MAX_UPLOAD_IMAGES} صور فقط — تم إضافة أول ${remaining} صور`, 'info');
  }

  newFiles.slice(0, remaining).forEach(file => {
    downscaleImage(file).then(dataUrl => {
      if (uploadedImages.length >= MAX_UPLOAD_IMAGES) return;
      const imageData = {
        name: file.name,
        data: dataUrl,
        type: 'image/jpeg'
      };

      uploadedImages.push(imageData);
      createImagePreview(imageData);
      updateFileUploadLabel();
    }).catch(err => {
      console.warn('Could not process image:', file.name, err);
      showNotification(`تعذر معالجة الصورة: ${file.name}`, 'error');
    });
  });

  event.target.value = '';
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
    // Format only on blur — never rewrite while typing so the caret stays put.
    phoneInput.addEventListener('blur', function (e) {
      const normalized = normalizeEgyptPhone(e.target.value.trim());
      if (normalized) {
        e.target.value = normalized;
      }
      e.target.style.borderColor = e.target.value && !isValidEgyptPhone(e.target.value)
        ? '#f44336'
        : '';
    });

    phoneInput.addEventListener('input', function (e) {
      // Real-time validation hint only; do not modify the value here.
      if (e.target.value.length > 0 && !isValidEgyptPhone(e.target.value)) {
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

    // NOTE: the manual-attach reminder is shown BEFORE submit under the
    // upload field (WhatsApp links cannot carry images), so no toast here.

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