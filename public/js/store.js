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

setupWhatsappButtons();
