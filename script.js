/* =========================================================
   FinSecure Checkout — script.js
   ========================================================= */

let currentStep = 0;

/* ---------------------------------------------------------
   VALIDATION
   --------------------------------------------------------- */
function validateStep(stepIndex) {
  let isValid = true;

  if (stepIndex === 0) {
    const firstName = document.getElementById('firstName');
    const lastName  = document.getElementById('lastName');
    const email     = document.getElementById('email');
    const phone     = document.getElementById('phone');

    const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneCleaned = phone.value.replace(/\s+/g, '');
    const phoneRegex  = /^\+\d{10,15}$/;

    setValidity(firstName, firstName.value.trim().length >= 1);
    setValidity(lastName,  lastName.value.trim().length >= 1);
    setValidity(email,     emailRegex.test(email.value));
    setValidity(phone,     phoneRegex.test(phoneCleaned));

    if (firstName.classList.contains('invalid') ||
        lastName.classList.contains('invalid')  ||
        email.classList.contains('invalid')     ||
        phone.classList.contains('invalid')) {
      isValid = false;
    }

  } else if (stepIndex === 1) {
    const fields = ['address', 'city', 'state', 'zip', 'country'];
    fields.forEach(id => {
      const el = document.getElementById(id);
      const valid = el.value.trim().length > 0;
      setValidity(el, valid);
      if (!valid) isValid = false;
    });

  } else if (stepIndex === 2) {
    const selectedMethod = document.querySelector('input[name="payment_method"]:checked').value;

    if (selectedMethod === 'Credit Card') {
      const cardholder = document.getElementById('cardholder');
      const cardNumber = document.getElementById('cardNumber');
      const expiry     = document.getElementById('expiry');
      const cvv        = document.getElementById('cvv');

      const cardNumCleaned = cardNumber.value.replace(/\s/g, '');
      const expiryRegex    = /^(0[1-9]|1[0-2])\/\d{2}$/;

      setValidity(cardholder, cardholder.value.trim().length >= 2);
      setValidity(cardNumber, cardNumCleaned.length >= 13 && cardNumCleaned.length <= 19);

      // Expiry: format + future date
      let expiryValid = true;
      if (!expiryRegex.test(expiry.value)) {
        expiryValid = false;
      } else {
        const [month, year]     = expiry.value.split('/').map(Number);
        const now               = new Date();
        const currentYearShort  = now.getFullYear() % 100;
        const currentMonth      = now.getMonth() + 1;
        if (year < currentYearShort || (year === currentYearShort && month < currentMonth)) {
          expiryValid = false;
        }
      }
      setValidity(expiry, expiryValid);
      setValidity(cvv, cvv.value.length >= 3 && cvv.value.length <= 4);

      if (cardholder.classList.contains('invalid') ||
          cardNumber.classList.contains('invalid')  ||
          expiry.classList.contains('invalid')      ||
          cvv.classList.contains('invalid')) {
        isValid = false;
      }
    }
  }

  return isValid;
}

function setValidity(el, valid) {
  if (valid) {
    el.classList.remove('invalid');
  } else {
    el.classList.add('invalid');
  }
}

/* ---------------------------------------------------------
   STEP NAVIGATION
   --------------------------------------------------------- */
function showStep(stepIndex) {
  if (stepIndex === 3) {
    // Populate success view
    const fname = document.getElementById('firstName').value;
    const lname = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    document.getElementById('successUserName').textContent    = `${fname} ${lname}`;
    document.getElementById('successContactName').textContent = `${fname} ${lname}`;
    document.getElementById('successContactEmail').textContent = email;
    document.getElementById('successContactPhone').textContent = phone;

    const addr    = document.getElementById('address').value;
    const apt     = document.getElementById('apt').value;
    const city    = document.getElementById('city').value;
    const state   = document.getElementById('state').value;
    const zip     = document.getElementById('zip').value;
    const country = document.getElementById('country').value;

    const paymentMethodVal = document.querySelector('input[name="payment_method"]:checked').value;
    document.getElementById('displayPaymentMethod').textContent = `Payment Method: ${paymentMethodVal}`;

    document.getElementById('successAddress').innerHTML =
      `${addr}${apt ? ', ' + apt : ''}<br>${city}, ${state} ${zip}<br>${country}`;

    // Hide checkout grid, show success
    document.getElementById('checkoutGrid').classList.add('hidden');
    document.getElementById('successView').classList.remove('hidden');
  }

  // Deactivate all steps
  document.querySelectorAll('.step-content').forEach(s => s.classList.remove('active'));

  // Activate target step (only if not success)
  if (stepIndex < 3) {
    const target = document.getElementById(`step-${stepIndex}`);
    if (target) target.classList.add('active');
  }

  // Update stepper tabs
  updateStepperTabs(stepIndex);

  currentStep = stepIndex;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(currentIndex) {
  if (validateStep(currentIndex)) {
    showStep(currentIndex + 1);
  }
}

function updateStepperTabs(activeIndex) {
  const tabIds = ['step-tab-0', 'step-tab-1', 'step-tab-2', 'step-tab-3'];

  tabIds.forEach((id, idx) => {
    const tab   = document.getElementById(id);
    if (!tab) return;

    const icon  = tab.querySelector('.material-symbols-outlined');
    const label = tab.querySelector('.step-tab-label');

    // Reset everything
    tab.classList.remove('step-tab-active');
    tab.style.borderBottomColor = 'transparent';
    icon.classList.remove('step-tab-icon-muted');
    label.classList.remove('step-tab-label-active', 'step-tab-label-muted', 'step-tab-label-done');

    if (idx === activeIndex) {
      tab.classList.add('step-tab-active');
      label.classList.add('step-tab-label-active');
      // icon inherits primary color from .step-tab-active parent or explicit
      icon.style.color = 'var(--color-primary-container)';
    } else if (idx < activeIndex) {
      icon.style.color  = 'var(--color-primary)';
      label.classList.add('step-tab-label-done');
      tab.style.borderBottomColor = 'var(--color-primary)';
    } else {
      icon.classList.add('step-tab-icon-muted');
      icon.style.color = '';
      label.classList.add('step-tab-label-muted');
    }
  });
}

/* ---------------------------------------------------------
   PAYMENT METHOD TOGGLE
   --------------------------------------------------------- */
const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
const cardSection    = document.getElementById('cardSection');
const paymentBtnText = document.getElementById('paymentBtnText');

paymentMethods.forEach(method => {
  method.addEventListener('change', (e) => {
    // Update label styles
    document.querySelectorAll('.payment-option-label').forEach(label => {
      label.classList.remove('payment-option-active');
    });
    e.target.parentElement.classList.add('payment-option-active');

    if (e.target.value === 'Cash on Delivery') {
      cardSection.style.display    = 'none';
      paymentBtnText.textContent   = 'Place Order';
    } else {
      cardSection.style.display    = 'flex';
      paymentBtnText.textContent   = 'Pay $517.31';
    }
  });
});

/* ---------------------------------------------------------
   CARD NUMBER FORMATTING
   --------------------------------------------------------- */
const cardInput = document.getElementById('cardNumber');
cardInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  value = value.match(/.{1,4}/g)?.join(' ') || value;
  e.target.value = value;
});

/* ---------------------------------------------------------
   EXPIRY FORMATTING
   --------------------------------------------------------- */
const expiryInput = document.getElementById('expiry');
expiryInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4);
  }
  e.target.value = value;
});

/* ---------------------------------------------------------
   PAY BUTTON — SUBMIT WITH ANIMATION
   --------------------------------------------------------- */
document.getElementById('submitPayment').addEventListener('click', (e) => {
  if (!validateStep(2)) return;

  const btn        = e.currentTarget;
  const btnTextEl  = document.getElementById('paymentBtnText');
  const origText   = btnTextEl.textContent;

  // Processing state
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Processing...';
  btn.disabled  = true;

  setTimeout(() => {
    btn.innerHTML = '<span class="material-symbols-outlined">check</span> Success';
    btn.style.backgroundColor = '#16a34a'; // green-600

    setTimeout(() => {
      showStep(3);
      btn.innerHTML = `<span id="paymentBtnText">${origText}</span>`;
      btn.disabled  = false;
      btn.style.backgroundColor = '';
    }, 1000);
  }, 1500);
});

/* ---------------------------------------------------------
   REAL-TIME BLUR / INPUT FEEDBACK
   --------------------------------------------------------- */
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('blur', () => {
    if (input.hasAttribute('required') && input.value.trim().length === 0) {
      input.classList.add('invalid');
    }
  });
  input.addEventListener('input', () => {
    if (input.value.trim().length > 0) {
      input.classList.remove('invalid');
    }
  });
});