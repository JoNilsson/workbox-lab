'use strict'

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js')

if (workbox) {
  console.log('Whoop-whoop! SW loaded!')

  workbox.precaching.precacheAndRoute([
  {
    "url": "style/main.css",
    "revision": "628320e3f89c25f36472cda3e970e57d"
  },
  {
    "url": "index.html",
    "revision": "3fa85de7568743582370032fd44af350"
  },
  {
    "url": "js/animation.js",
    "revision": "8a471b9cd5015ad78b81b1c99989f6a2"
  },
  {
    "url": "images/home/business.jpg",
    "revision": "9c3ec8d2a8a188bab9ddc212a64a0c1e"
  },
  {
    "url": "pages/offline.html",
    "revision": "9674bf9c4836209850ac5a82c18f3312"
  },
  {
    "url": "pages/404.html",
    "revision": "1a6cf0261a93d2c998c813d5588856bb"
  }
])

  workbox.routing.registerRoute(
    /(.*)articles(.*)\.(?:png|gif|jpg)/,
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days in seconds
        })
      ]
    })
  ),

  workbox.routing.registerRoute(
    /(.*)icon(.*)\.(?:svg|)/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'icon-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 5,
          maxAgeSeconds: 30 * 24 * 60 * 60
        })
      ]
    })
  )
  // cach current articles upon visit
  const articleHandler = workbox.strategies.networkFirst({
    cacheName: 'articles-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })

  workbox.routing.registerRoute(/(.*)pages\/article(.*)\.html/, args => {
    return articleHandler.handle(args).then(response => {
      if (!response) {
        return caches.match('pages/offline.html')
      } else if (response.status === 404) {
        return caches.match('pages/404.html')
      }
      return response
    })
  })

  // prefetch and cache first 50 archived posts
  const postHandler = workbox.strategies.cacheFirst({
    cacheName: 'posts-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50
      })
    ]
  })

  workbox.routing.registerRoute(/(.*)pages\/post(.*)\.html/, args => {
    return postHandler.handle(args).then(response => {
      if (response.status === 404) {
        return caches.match('pages/404.html')
      }
      return response
    })
      .catch(function () {
        return caches.match('pages/offline.html')
      })
  })
} else {
  console.log('Oh Poo... SW wasn\'t loaded!')
}
