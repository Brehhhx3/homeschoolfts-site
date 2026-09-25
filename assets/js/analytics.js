(() => {
  const measurementId = 'G-YSH75MQR8G';
  const consentKey = 'homeschoolfts_analytics';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // Load the Google tag on every page so Tag Assistant can detect it.
  // Analytics storage remains denied until the visitor accepts.
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(tag);

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: true
  });

  function updateConsent(value) {
    window.gtag('consent', 'update', {
      analytics_storage: value === 'granted' ? 'granted' : 'denied'
    });
  }

  const savedConsent = localStorage.getItem(consentKey);
  if (savedConsent === 'granted') {
    updateConsent('granted');
  }

  function bindBanner() {
    let banner = document.getElementById('cookie-consent');

    if (!banner && savedConsent !== 'granted' && savedConsent !== 'denied') {
      banner = document.createElement('div');
      banner.id = 'cookie-consent';
      banner.className = 'cookie-consent';
      banner.setAttribute('aria-live', 'polite');
      banner.innerHTML = `
        <div class="cookie-inner container">
          <p>We use minimal analytics to understand how the site is used. Analytics storage stays off unless you accept.</p>
          <div class="cookie-actions">
            <button id="cookie-reject" class="button button-secondary" type="button">Reject</button>
            <button id="cookie-accept" class="button" type="button">Accept</button>
          </div>
        </div>`;
      document.body.appendChild(banner);
    }

    if (!banner) return;

    if (savedConsent === 'granted' || savedConsent === 'denied') {
      banner.hidden = true;
      return;
    }

    banner.hidden = false;
    const accept = document.getElementById('cookie-accept');
    const reject = document.getElementById('cookie-reject');

    if (accept) {
      accept.addEventListener('click', () => {
        localStorage.setItem(consentKey, 'granted');
        updateConsent('granted');
        banner.hidden = true;
      });
    }

    if (reject) {
      reject.addEventListener('click', () => {
        localStorage.setItem(consentKey, 'denied');
        updateConsent('denied');
        banner.hidden = true;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindBanner, { once: true });
  } else {
    bindBanner();
  }
})();