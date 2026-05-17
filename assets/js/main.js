(function(){
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav
  const navToggle = $('.nav-toggle');
  const nav = $('#primary-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Scroll animations
  const animated = $$('.animate-in');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting) {
        e.target.classList.add('appear');
        io.unobserve(e.target);
      }
    })
  },{ rootMargin: '0px 0px -10% 0px' });
  animated.forEach(el=>io.observe(el));

  // Counters
  function animateCounter(el){
    const target = Number(el.getAttribute('data-target')) || 0;
    const duration = 1400;
    const start = performance.now();
    function tick(now){
      const p = Math.min(1, (now - start)/duration);
      const val = Math.floor(p * target);
      el.textContent = val.toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  $$('.impact-value, .stat-value').forEach(el=>{
    const obs = new IntersectionObserver((entries)=>{
      if(entries.some(e=>e.isIntersecting)){
        animateCounter(el);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el);
  });

  // Gallery using all images from Images folder (static list)
  const allImages = [
    {src:'./Images/Gallery/plantation-2.jpg', alt:'Meal distribution'},
    {src:'./Images/Gallery/plantation-3.jpg', alt:'Tree plantation'},
    {src:'./Images/Gallery/plantation-4.jpg', alt:'Plantation team'},
    {src:'./Images/Gallery/plantation-5.jpg', alt:'Watering saplings'},
    {src:'./Images/Gallery/plantation-6.jpg', alt:'Volunteers group'},
    {src:'./Images/Gallery/plantation-7.jpg', alt:'Serving meals'},
    {src:'./Images/Gallery/plantation-8.jpg', alt:'Raskbind Foundation'},
    {src:'./Images/Gallery/plantation-9.jpg', alt:'Raskbind Foundation logo'},
    {src:'./Images/Gallery/plantation-10.jpg', alt:'Community'},
    {src:'./Images/Gallery/plantation-11.jpg', alt:'Community'},
    {src:'./Images/Gallery/plantation-12.jpg', alt:'Community'},
    {src:'./Images/Gallery/plantation-13.jpg', alt:'Community'},
    {src:'./Images/Gallery/plantation-14.jpg', alt:'Community'},
    {src:'./Images/Gallery/plantation-15.jpg', alt:'Background'},
    {src:'./Images/Gallery/plantation-16.jpg', alt:'Raskbind Foundation'},
    {src:'./Images/Gallery/plantation-17.jpg', alt:'Raskbind Foundation'}
  ];

  function populateGallery(gridId){
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const frag = document.createDocumentFragment();
    allImages.forEach((img,i)=>{
      const item = document.createElement('figure');
      item.className = 'gallery-item';
      const image = document.createElement('img');
      image.loading = 'lazy';
      image.src = img.src;
      image.alt = img.alt + ' ' + (i+1);
      item.appendChild(image);
      frag.appendChild(item);
    });
    grid.appendChild(frag);
  }

  populateGallery('galleryGrid');
  populateGallery('plantationGallery');
  populateGallery('mealsGallery');

  // Donation form logic
  const donationForm = $('#donationForm');
  if (donationForm) {
    const amountButtons = $$('.amount', donationForm);
    const customAmount = $('#customAmount', donationForm);
    let selectedAmount = 500;

    amountButtons.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        amountButtons.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        selectedAmount = Number(btn.dataset.amount);
        if (customAmount) customAmount.value = '';
      });
    });
    // Default select ₹500
    const defaultBtn = amountButtons.find(b=>b.dataset.amount === '500');
    if (defaultBtn) defaultBtn.classList.add('active');

    customAmount?.addEventListener('input', ()=>{
      const v = Number(customAmount.value || '0');
      if (v > 0) {
        selectedAmount = v;
        amountButtons.forEach(b=>b.classList.remove('active'));
      }
    });

    donationForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const cause = $('#cause', donationForm).value;
      const name = $('#name', donationForm)?.value?.trim() || '';
      const email = $('#email', donationForm)?.value?.trim() || '';
      const data = { cause, amount: selectedAmount, name, email };
      localStorage.setItem('rf_donation', JSON.stringify(data));
      window.location.href = 'checkout.html';
    });
  }

  // Checkout summary
  if (location.pathname.endsWith('checkout.html')){
    try{
      const data = JSON.parse(localStorage.getItem('rf_donation')||'{}');
      if (data && data.amount){
        $('#summaryCause').textContent = data.cause || '—';
        $('#summaryAmount').textContent = '₹' + Number(data.amount).toLocaleString('en-IN');
        $('#summaryName').textContent = data.name || '—';
        $('#summaryEmail').textContent = data.email || '—';
      }
    }catch(e){/* noop */}
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const confirmDonationBtn = document.getElementById('confirmDonationBtn');
  const transactionIdInput = document.getElementById('transactionId');
  const validationMessage = document.getElementById('validationMessage');

  if (confirmDonationBtn && transactionIdInput && validationMessage) {
    confirmDonationBtn.addEventListener('click', () => {
      const transactionId = transactionIdInput.value.trim();

      const isNumeric = /^[0-9]{12}$/.test(transactionId);
      const isAlphanumeric = /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{12}$/.test(transactionId);

      if (isNumeric || isAlphanumeric) {
        // Valid transaction ID
        validationMessage.textContent = 'Donation Successful';
        validationMessage.className = 'message success';

        // Display green tick (for now, just text, could be an icon/animation)
        // In a real application, you'd send this to a backend for verification

        setTimeout(async () => {
          const webAppUrl = 'https://script.google.com/macros/s/AKfycbzPdg7SIGFP4HM8uRoq9jBikIUerheJvghLK5grzWUwA3NFLakWJJ1xATRRlAdGsqIm/exec'; // *** REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL ***

          const donationData = {
            cause: document.getElementById('summaryCause').textContent,
            amount: document.getElementById('summaryAmount').textContent,
            name: document.getElementById('summaryName').textContent,
            email: document.getElementById('summaryEmail').textContent,
            transactionId: transactionId,
          };

          try {
            const response = await fetch(webAppUrl, {
              method: 'POST',
              mode: 'no-cors', // Required for Google Apps Script as a simple CORS bypass
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams(donationData).toString(),
            });

            // Even with no-cors, the fetch will technically succeed for network reasons.
            // Google Apps Script will still process the data.
            console.log('Donation data sent to Google Sheet.');

          } catch (error) {
            console.error('Error sending donation data:', error);
            // Optionally display an error message to the user
          }

          window.location.href = 'index.html'; // Redirect to homepage
        }, 2000); // 2 seconds
      } else {
        // Invalid transaction ID
        validationMessage.textContent = 'Invalid Transaction ID';
        validationMessage.className = 'message error';
      }
    });
  }
}); 