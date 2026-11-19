// Tout l'appli est servie depuis le cache : aucune requête réseau une fois installée.
const VERSION = "carnet-v6";
const FILES = ["./", "./index.html", "./visites.json", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  // cache: "reload" contourne le cache HTTP du navigateur, sinon une mise à jour peut réinstaller l'ancienne page.
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true })
    .then(hit => hit || (e.request.mode === "navigate" ? caches.match("./index.html") : fetch(e.request)))
    .then(r => r || fetch(e.request)));
});
