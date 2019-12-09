 /*Модуль отвечает за все действия, связанные со слайдером. */

 const html = document.documentElement
 const slider = document.querySelector('.js-graph-slider')
 const prev = slider.querySelector('.js-control-prev')
 const prevDate = slider.querySelector('.js-slider-prev-date')
 const prevTitle = slider.querySelector('.js-slider-prev-theme')
 const next = slider.querySelector('.js-control-next')
 const nextDate = slider.querySelector('.js-slider-next-date')
 const nextTitle = slider.querySelector('.js-slider-next-theme')
 const currentDate = slider.querySelector('.js-slider-date')
 const currentTitle = slider.querySelector('.js-slider-title')
 const currentDescr = slider.querySelector('.js-slider-descr')
 const animationElement = slider.querySelectorAll('.js-slider-animate')
 const unavailable = 'slider__control--unavailable'
 const activeClass = 'graph__event--active'
 const animateClass = 'js-slider-animate-on'
 const animationSpeed = 300

 export function changeEvent(event, domElement) {
     addAnimation()
     setTimeout(addEventContent, animationSpeed, event)
     setTimeout(addNextEvent, animationSpeed, domElement)
     setTimeout(addPrevEvent, animationSpeed, domElement)
     setTimeout(removeAnimation, animationSpeed)
 }

 next.addEventListener('click', () => {
     const active = document.querySelector('.graph__event--active')
     const nextDomElement = active.nextElementSibling
     const nextEventId = nextDomElement.getAttribute('event-id')
     const nextEventInfo = eventsDatabase.cards.find(elem => elem.id === nextEventId)

     active.classList.remove(activeClass)
     nextDomElement.classList.add(activeClass)

     changeEvent(nextEventInfo, nextDomElement)

 })

 prev.addEventListener('click', () => {
     const active = document.querySelector('.graph__event--active')
     const prevDomElement = active.previousElementSibling
     const prevEventId = prevDomElement.getAttribute('event-id')
     const prevEventInfo = eventsDatabase.cards.find(elem => elem.id === prevEventId)

     active.classList.remove(activeClass)
     prevDomElement.classList.add(activeClass)

     changeEvent(prevEventInfo, prevDomElement)

 })

 function addEventContent(event) {
     const date = event.interval.split('-')
     const [year, monthNumber, day] = date
     const month = eventsDatabase.languageSettings[monthNumber - 1]
     const title = event.title
     const descr = event.descr

     currentDate.innerHTML = `${day} ${month} ${year}`
     currentTitle.innerHTML = title
     currentDescr.innerHTML = descr
 }

 function addNextEvent(currentDomElement) {
     const nextEvent = currentDomElement.nextElementSibling

     //Если существует следующее событие
     if (nextEvent) {
         const nextEventId = nextEvent.getAttribute('event-id')
         const nextEventInfo = eventsDatabase.cards.find(elem => elem.id === nextEventId)
         const date = nextEventInfo.interval.split('-')
         const [year, monthNumber, day] = date
         const month = eventsDatabase.languageSettings[monthNumber - 1]
         const title = nextEventInfo.title

         if (next.classList.contains(unavailable)) {
             next.classList.remove(unavailable)
         }

         //Для ру версии сначала идет дата, потом число
         if (html.getAttribute('lang') === 'ru') {
             nextDate.innerHTML = `${day} ${month}, <div class="slider__year">${year}</div>`
         } else {
             nextDate.innerHTML = `${month} ${day}, <div class="slider__year">${year}</div>`
         }
         nextTitle.innerHTML = title

         return
     }

     next.classList.add(unavailable)
 }

 function addPrevEvent(currentDomElement) {
     const prevEvent = currentDomElement.previousElementSibling

     //Если существует прошлое событие
     if (prevEvent) {
         const prevEventId = prevEvent.getAttribute('event-id')
         const prevEventInfo = eventsDatabase.cards.find(elem => elem.id === prevEventId)
         const date = prevEventInfo.interval.split('-')
         const [year, monthNumber, day] = date
         const month = eventsDatabase.languageSettings[monthNumber - 1]
         const title = prevEventInfo.title

         if (prev.classList.contains(unavailable)) {
             prev.classList.remove(unavailable)
         }

         //Для ру версии сначала идет дата, потом число
         if (html.getAttribute('lang') === 'ru') {
             prevDate.innerHTML = `${day} ${month}, <div class="slider__year">${year}</div>`
         } else {
             prevDate.innerHTML = `${month} ${day}, <div class="slider__year">${year}</div>`
         }
         prevTitle.innerHTML = title

         return
     }

     prev.classList.add(unavailable)
 }

 function addAnimation() {
     for (const item of animationElement) {
         item.classList.add(animateClass)
     }
 }

 function removeAnimation() {
     for (const item of animationElement) {
         item.classList.remove(animateClass)
     }
 }