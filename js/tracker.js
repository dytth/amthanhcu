/** Minimal first-party traffic telemetry. */
(function () {
  'use strict';
  var endpoint = 'https://gateway.dytth.xyz/v1/ping';
  var storageKey = '_dytth_cid';

  try {
    var clientId = localStorage.getItem(storageKey);
    if (!clientId || !/^u_[a-zA-Z0-9_-]{6,64}$/.test(clientId)) {
      clientId = 'u_' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem(storageKey, clientId);
    }

    var payload = {
      site: location.hostname || 'amthanhcu.dytth.xyz',
      path: location.pathname || '/',
      ref: document.referrer ? new URL(document.referrer).hostname : 'Direct',
      device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      cid: clientId
    };

    fetch(endpoint, {
      method: 'POST', mode: 'cors', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function () {});
  } catch (error) {}
})();
