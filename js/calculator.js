// ==============================
// Cost Calculator Functions
// ==============================

// Price configurations - تم التحديث حسب متطلباتك
const PRICE_CONFIG = {
  base: {
    economy: 3000,  // MDF
    standard: 4000, // ألومنيوم
    premium: 5800   // HPL
  },
  drawer: {
    economy: 150,
    standard: 200,
    premium: 250
  },
  addon: {
    counter: 500,  // كونتر جوود وود لكل متر
    led: 200,      // إضاءة LED لكل متر
    handles: 100,  // مقابض بلت إن
    drawers: 300   // أدراج سحاب
  },
  appliance: {
    oven: 3000,
    cooktop: 1500,
    hood: 1200,
    fridge: 8000
  },
  installation: 2000,
  cabinet: {
    wall: 800,
    base: 1200
  }
};

// Cost Calculator Functions - تم التحديث
function updateCalculator() {
  const area = appState.calculatorData.area;
  const material = appState.calculatorData.material;
  const drawers = appState.calculatorData.drawers;
  const addons = appState.calculatorData.addons;
  const appliances = appState.calculatorData.appliances;

  // Calculate base cost
  const baseCost = PRICE_CONFIG.base[material] * area;

  // Calculate drawers cost
  const drawersCost = PRICE_CONFIG.drawer[material] * drawers;

  // Calculate addons cost (تضاف لكل متر)
  const addonsCost = addons.reduce((total, addon) => {
    return total + (PRICE_CONFIG.addon[addon] * area);
  }, 0);

  // Calculate appliances cost
  const appliancesCost = appliances.reduce((total, appliance) => {
    return total + (PRICE_CONFIG.appliance[appliance] || 0);
  }, 0);

  // Total manufacturing cost
  const manufacturingCost = baseCost + drawersCost;

  // Material cost (40% of manufacturing)
  const materialCost = Math.round(manufacturingCost * 0.4);

  // Total cost
  const totalCost = manufacturingCost + addonsCost + appliancesCost + PRICE_CONFIG.installation;

  // Update UI
  updateCalculatorUI(totalCost, manufacturingCost, materialCost, PRICE_CONFIG.installation, addonsCost);
}

function updateCalculatorByDimensions() {
  const length = appState.calculatorData.length;
  const width = appState.calculatorData.width;
  const material = appState.calculatorData.material;
  const wallCabinets = appState.calculatorData.wallCabinets;
  const baseCabinets = appState.calculatorData.baseCabinets;
  const addons = appState.calculatorData.addons;

  // Calculate area
  const area = length * width;

  // Calculate base cost
  const baseCost = PRICE_CONFIG.base[material] * area;

  // Calculate cabinets cost
  const wallCabinetsCost = PRICE_CONFIG.cabinet.wall * wallCabinets;
  const baseCabinetsCost = PRICE_CONFIG.cabinet.base * baseCabinets;
  const cabinetsCost = wallCabinetsCost + baseCabinetsCost;

  // Calculate addons cost (تضاف لكل متر)
  const addonsCost = addons.reduce((total, addon) => {
    return total + (PRICE_CONFIG.addon[addon] * area);
  }, 0);

  // Total manufacturing cost
  const manufacturingCost = baseCost + cabinetsCost;

  // Material cost (40% of manufacturing)
  const materialCost = Math.round(manufacturingCost * 0.4);

  // Total cost
  const totalCost = manufacturingCost + addonsCost + PRICE_CONFIG.installation;

  // Update UI
  updateCalculatorUI(totalCost, manufacturingCost, materialCost, PRICE_CONFIG.installation, addonsCost);
}

function updateCalculatorUI(total, manufacturing, material, installation, addons = 0) {
  const estimatedCost = $('#estimated-cost');
  const manufacturingCost = $('#manufacturing-cost');
  const materialCost = $('#material-cost');
  const installationCost = $('#installation-cost');
  const addonsCost = $('#addons-cost');

  if (estimatedCost) estimatedCost.textContent = `${formatNumber(total)} جنيه`;
  if (manufacturingCost) manufacturingCost.textContent = `${formatNumber(manufacturing)} ج`;
  if (materialCost) materialCost.textContent = `${formatNumber(material)} ج`;
  if (installationCost) installationCost.textContent = `${formatNumber(installation)} ج`;
  if (addonsCost) addonsCost.textContent = `${formatNumber(addons)} ج`;
}

function updateRecommendation() {
  const area = parseInt(document.getElementById('kitchen-area').value);
  const material = document.getElementById('material-type').value;

  let recommendedMaterial = 'شيت ألومنيوم';
  let reason = 'مثالي للمساحات المتوسطة، يجمع بين المتانة والسعر المعقول';

  if (area > 20) {
    recommendedMaterial = 'HPL';
    reason = 'مثالي للمساحات الكبيرة، متانة عالية وتنظيف سهل - الأكثر مبيعاً';
  } else if (area < 10) {
    recommendedMaterial = 'كلادينج';
    reason = 'مثالي للمساحات الصغيرة، مقاوم للرطوبة وسهل الصيانة';
  }

  if (material === 'premium') {
    recommendedMaterial = 'بولي باك جوود وود';
    reason = 'أعلى مستوى جودة مع مظهر خشب طبيعي فاخر';
  }

  document.getElementById('recommended-material').textContent = recommendedMaterial;
  document.getElementById('recommendation-reason').textContent = reason;
}

function initCalculator() {
  const areaSlider = $('#kitchen-area');
  const areaValue = $('#area-value');
  const materialSelect = $('#material-type');
  const drawersSlider = $('#drawers-count');
  const drawersValue = $('#drawers-value');
  const addonCheckboxes = $$('input[name="addons"]');
  const applianceCheckboxes = $$('input[name="appliances"]');

  // Dimension inputs
  const lengthInput = $('#kitchen-length');
  const widthInput = $('#kitchen-width');
  const wallCabinetsSlider = $('#wall-cabinets');
  const wallCabinetsValue = $('#wall-cabinets-value');
  const baseCabinetsSlider = $('#base-cabinets');
  const baseCabinetsValue = $('#base-cabinets-value');
  const addonDimensionsCheckboxes = $$('input[name="addons-dimensions"]');

  // Calculator tabs functionality
  const calculatorTabs = $$('.calculator-tab');

  // Event delegation for calculator tabs
  document.addEventListener('click', function (e) {
    if (e.target.matches('.calculator-tab')) {
      const targetTab = e.target.getAttribute('data-tab');

      // إزالة النشاط من جميع الألسنة
      calculatorTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.calculator-tab-content').forEach(c => c.classList.remove('active'));

      // إضافة النشاط للسان المحدد
      e.target.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');

      trackEvent('calculator', 'tab_switch', targetTab);
    }
  });

  // Area slider
  if (areaSlider && areaValue) {
    areaSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      appState.calculatorData.area = parseInt(value);
      areaValue.textContent = `${value} م²`;
      updateCalculator();
      updateRecommendation();
    });
  }

  // Material select
  if (materialSelect) {
    materialSelect.addEventListener('change', (e) => {
      appState.calculatorData.material = e.target.value;
      updateCalculator();
      updateRecommendation();
    });
  }

  // Material select for dimensions tab
  const materialSelectDimensions = $('#material-type-dimensions');
  if (materialSelectDimensions) {
    materialSelectDimensions.addEventListener('change', (e) => {
      appState.calculatorData.material = e.target.value;
      updateCalculatorByDimensions();
    });
  }

  // Drawers slider
  if (drawersSlider && drawersValue) {
    drawersSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      appState.calculatorData.drawers = parseInt(value);
      drawersValue.textContent = `${value} قطعة`;
      updateCalculator();
    });
  }

  // Addon checkboxes (تضاف لكل متر)
  addonCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        appState.calculatorData.addons.push(value);
      } else {
        appState.calculatorData.addons = appState.calculatorData.addons.filter(addon => addon !== value);
      }
      updateCalculator();
    });
  });

  // Appliance checkboxes
  applianceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        appState.calculatorData.appliances.push(value);
      } else {
        appState.calculatorData.appliances = appState.calculatorData.appliances.filter(app => app !== value);
      }
      updateCalculator();
    });
  });

  // Dimension inputs
  if (lengthInput) {
    lengthInput.addEventListener('input', (e) => {
      appState.calculatorData.length = parseFloat(e.target.value);
      updateCalculatorByDimensions();
    });
  }

  if (widthInput) {
    widthInput.addEventListener('input', (e) => {
      appState.calculatorData.width = parseFloat(e.target.value);
      updateCalculatorByDimensions();
    });
  }

  if (wallCabinetsSlider && wallCabinetsValue) {
    wallCabinetsSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      appState.calculatorData.wallCabinets = parseInt(value);
      wallCabinetsValue.textContent = `${value} وحدة`;
      updateCalculatorByDimensions();
    });
  }

  if (baseCabinetsSlider && baseCabinetsValue) {
    baseCabinetsSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      appState.calculatorData.baseCabinets = parseInt(value);
      baseCabinetsValue.textContent = `${value} وحدة`;
      updateCalculatorByDimensions();
    });
  }

  // Addon checkboxes for dimensions
  addonDimensionsCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        appState.calculatorData.addons.push(value);
      } else {
        appState.calculatorData.addons = appState.calculatorData.addons.filter(addon => addon !== value);
      }
      updateCalculatorByDimensions();
    });
  });

  // Sync calculator with user selection from pricing tabs
  window.syncCalculatorWithSelection = function (material, options) {
    const materialTypeSelect = document.getElementById('material-type');
    const materialTypeSelectDim = document.getElementById('material-type-dimensions');
    const addonCheckboxes = document.querySelectorAll('input[name="addons"]');

    // Map material name to type key
    let typeKey = 'economy';
    const name = material.name.toLowerCase();
    if (name.includes('ألومنيوم') || name.includes('الومنيوم')) typeKey = 'standard';
    if (name.includes('hpl') || name.includes('بولي') || name.includes('بورديوم')) typeKey = 'premium';

    // Update state and select elements
    appState.calculatorData.material = typeKey;
    if (materialTypeSelect) materialTypeSelect.value = typeKey;
    if (materialTypeSelectDim) materialTypeSelectDim.value = typeKey;

    // Update addons
    appState.calculatorData.addons = [];
    addonCheckboxes.forEach(cb => {
      const optionMatch = options.find(opt => {
        const optName = opt.name.toLowerCase();
        const cbValue = cb.value.toLowerCase();
        return optName.includes(cbValue) || cbValue.includes(optName);
      });

      cb.checked = !!optionMatch;
      if (cb.checked) {
        appState.calculatorData.addons.push(cb.value);
      }
    });

    // Trigger recalculation
    updateCalculator();
    updateCalculatorByDimensions();
    updateRecommendation();
  };

  // Initial calculation
  updateCalculator();
  updateRecommendation();
}

// Request detailed quote
function requestDetailedQuote() {
  const data = appState.calculatorData;
  const activeTab = $('.calculator-tab.active')?.getAttribute('data-tab') || 'area';
  const totalCost = $('#estimated-cost')?.textContent || $('#estimated-cost-dimensions')?.textContent || 'غير محدد';

  // Map material to Arabic
  const materialLabels = {
    economy: 'اقتصادي (MDF)',
    standard: 'قياسي (ألومنيوم)',
    premium: 'فاخر (HPL/طبيعي)'
  };

  // Build the message
  let message = `مرحباً الماسية للمطابخ، أرغب في عرض سعر لمطبخي:\n\n`;
  message += `🔹 نوع الحساب: ${activeTab === 'area' ? 'بالمساحة' : 'بالأبعاد'}\n`;

  if (activeTab === 'area') {
    message += `📏 المساحة: ${data.area} م²\n`;
    message += `🗄️ عدد الأدراج/القطع: ${data.drawers}\n`;
  } else {
    message += `📏 الأبعاد: ${data.length} م (طول) × ${data.width} م (عرض)\n`;
    message += `🗄️ الوحدات: ${data.wallCabinets} علوية، ${data.baseCabinets} سفلية\n`;
  }

  message += `💎 الخامات: ${materialLabels[data.material] || data.material}\n`;

  if (data.addons.length > 0) {
    message += `➕ الإضافات: ${data.addons.join('، ')}\n`;
  }

  message += `💰 التكلفة التقديرية: ${totalCost}\n`;

  // Add city if we can find it in the lead form (optional helper)
  const cityInput = document.getElementById('city');
  if (cityInput && cityInput.value) {
    message += `📍 المدينة: ${cityInput.value}\n`;
  }

  const whatsappUrl = `https://wa.me/201092497811?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  trackEvent('calculator', 'quote_request', data.material);
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initCalculator();
});