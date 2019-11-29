(function () {
    const Slider = {}
    window.Slider = Slider

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

    Slider.changeEvent = function changeEvent(event, domElement) {
        addAnimate()
        setTimeout(addEventContent, 300, event)
        setTimeout(addNextEvent, 300, domElement)
        setTimeout(addPrevEvent, 300, domElement)
        setTimeout(removeAnimate, 300)  
    }

    next.addEventListener('click', () => {
        const active = document.querySelector('.graph__event--active')
        const nextDomElement = active.nextElementSibling
        const nextEventId = nextDomElement.getAttribute('event-id')
        const nextEventInfo = eventsDatabase.find(elem => elem.id === nextEventId)

        active.classList.remove(activeClass)
        nextDomElement.classList.add(activeClass)

        Slider.changeEvent(nextEventInfo, nextDomElement)

    })

    prev.addEventListener('click', () => {
        const active = document.querySelector('.graph__event--active')
        const prevDomElement = active.previousElementSibling
        const prevEventId = prevDomElement.getAttribute('event-id')
        const prevEventInfo = eventsDatabase.find(elem => elem.id === prevEventId)

        active.classList.remove(activeClass)
        prevDomElement.classList.add(activeClass)

        Slider.changeEvent(prevEventInfo, prevDomElement)

    })

    function addEventContent(event) {
        const day = event.day
        const month = event.month
        const year = event.year
        const title = event.title
        const descr = event.descr

        currentDate.textContent = `${day} ${month} ${year}`
        currentTitle.textContent = title
        currentDescr.textContent = descr
    }

    function addNextEvent(currentDomElement) {
        const nextEvent = currentDomElement.nextElementSibling

        if (nextEvent) {
            const nextEventId = nextEvent.getAttribute('event-id')
            const nextEventInfo = eventsDatabase.find(elem => elem.id === nextEventId)
            const day = nextEventInfo.day
            const month = nextEventInfo.month
            const year = nextEventInfo.year
            const title = nextEventInfo.title

            if(next.classList.contains(unavailable)) {
                next.classList.remove(unavailable)
            }

            nextDate.innerHTML = `${month} ${day}, <div class="slider__year">${year}</div>`
            nextTitle.textContent = title

            return
        }

        next.classList.add(unavailable)
    }

    function addPrevEvent(currentDomElement) {
        const prevEvent = currentDomElement.previousElementSibling

        if (prevEvent) {
            const prevEventId = prevEvent.getAttribute('event-id')
            const prevEventInfo = eventsDatabase.find(elem => elem.id === prevEventId)
            const day = prevEventInfo.day
            const month = prevEventInfo.month
            const year = prevEventInfo.year
            const title = prevEventInfo.title

            if(prev.classList.contains(unavailable)) {
                prev.classList.remove(unavailable)
            }

            prevDate.innerHTML = `${month} ${day}, <div class="slider__year">${year}</div>`
            prevTitle.textContent = title

            return
        }

        prev.classList.add(unavailable)
    }

    function addAnimate () {        
        for (const item of animationElement) {
            item.classList.add(animateClass)
        }
    }

    function removeAnimate () {
        for (const item of animationElement) {
            item.classList.remove(animateClass)
        }
    }
}());