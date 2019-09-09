var el = document.body

function fadeIn (el) {
  el.style.opacity = 0

  var tick = function () {
    el.style.opacity = +el.style.opacity + 0.01

    if (+el.style.opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) ||
        setTimeout(tick, 8)
    }
  }

  tick()
}

fadeIn(el)
