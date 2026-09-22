const WHATSAPP_NUMBER = '51962029292';

document.getElementById('year').textContent = new Date().getFullYear();

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function setupWhatsappButtons() {
  const generic = waLink('Hola SmartSelect, quisiera más información sobre sus equipos.');
  document.getElementById('headerWhatsapp').href = generic;
  document.getElementById('footerWhatsapp').href = generic;
  document.getElementById('floatWhatsapp').href = generic;

  document.querySelectorAll('.gallery-wa').forEach((btn) => {
    btn.href = waLink(btn.dataset.msg || 'Hola SmartSelect, quisiera más información.');
  });
}

function setupLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  const overlayImg = document.getElementById('lightboxImage');
  const closeBtn = document.getElementById('lightboxClose');

  function openLightbox(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    overlayImg.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-card img').forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  closeBtn.addEventListener('click', closeLightbox);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeLightbox();
  });
}

setupWhatsappButtons();
setupLightbox();
