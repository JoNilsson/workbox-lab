'use strict'

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js')

if (workbox) {
  console.log('Whoop-whoop! SW loaded!')

  workbox.precaching.precacheAndRoute([])

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
