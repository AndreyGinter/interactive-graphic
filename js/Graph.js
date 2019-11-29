(function () {
    const Graph = {}
    window.Graph = Graph

    const graph = document.querySelector('.js-graph')
    const container = graph.querySelector('.js-graph-wrapper')
    const graphEvents = graph.querySelector('.js-graph-events')
    const line = graph.querySelector('.js-graph-line')
    const months = graph.querySelector('.js-graph-months')
    const years = graph.querySelector('.js-graph-years')
    const axisX = graph.querySelector('.js-graph-x')
    const active = 'graph__event--active'
    const eventsLink = 'json/events.json'
    const width = container.offsetWidth
    const height = container.offsetHeight

    Graph.makeGraph = function makeGraph(database) {
        let str = ""
        let i = 0

        database.reduce((last, curr) => {
            const coef = container.offsetWidth / database.length;
            //Если не начало массива
            if (last) {
                if (curr.date.split('-')[1] !== last.date.split('-')[1]) {
                    months.insertAdjacentElement('beforeend', makeDash(i * coef, curr.date.split('-')))
                } else {
                    months.insertAdjacentElement('beforeend', makeInvisiblePoint(i * coef, curr.date.split('-')))
                }
            }

            //Если первый элемент, то добавить атрибуты к path
            //     Второе - координата у. Первое число увеличивает коэффициент юсд к фунту. 
            //     Т.к. значение коэффициента и разница между несколько коэффициентами мала, то надо увеличить ее умножив все числа. 
            //Второе число - это положение графика внутри свг. Зависит от размера холста.
            //перебор массива 
            if (i === 0) {
                str = `${str} M ${coef} ${-curr.value * 950 + 1530} S`;
            } else {
                str = `${str} ${i * (coef)} ${-curr.value  * 950 + 1530},`;
            }

            //!Решить проблему первого месяца. Не отслеживается

            i++

            return curr

        }, undefined)


        line.setAttribute("d", str);

        makeAxis()
        getEvents()
    };

    function makeAxis() {
        axisX.setAttribute('x1', '0')
        axisX.setAttribute('x2', width)
        axisX.setAttribute('y1', height - 26)
        axisX.setAttribute('y2', height - 26)
    }

    //! Создать переменные для элементов массива
    //Создать засечки 
    function makeDash(i, month) {
        const dash = document.createElementNS('http://www.w3.org/2000/svg', 'line')

        dash.classList.add('graph__dash')
        dash.classList.add('graph__dash--color')
        dash.setAttribute('x1', i)
        dash.setAttribute('x2', i)
        dash.setAttribute('eventsCount', 0)
        dash.setAttribute('interval', `${month[0]}-${parseInt(month[1])}-${parseInt(month[2])}`)

        //Задать год, если это начало месяца
        if (parseInt(month[1]) === 1) {
            years.insertAdjacentElement('beforeend', setYear(i, +month[0]))
        }

        if (parseInt(month[1]) === 5) {
            years.insertAdjacentElement('beforeend', setYear(i, 'May'))
        }

        if (parseInt(month[1]) === 9) {
            years.insertAdjacentElement('beforeend', setYear(i, 'Sep'))
        }


        //Если месяц январь, май или сентябрь, то сделать большую засечку
        if (parseInt(month[1]) === 5 || parseInt(month[1]) === 9 || parseInt(month[1]) === 1) {
            dash.setAttribute('y1', height - 26)
            dash.setAttribute('y2', height - 18)

            return dash
        }

        //Обычная черточка
        dash.setAttribute('y1', height - 26)
        dash.setAttribute('y2', height - 23)

        return dash
    }

    function makeInvisiblePoint(i, month) {
        const dash = document.createElementNS('http://www.w3.org/2000/svg', 'line')

        dash.classList.add('graph__dash')
        dash.setAttribute('x1', i)
        dash.setAttribute('x2', i)
        dash.setAttribute('y1', height - 26)
        dash.setAttribute('y2', height - 26)

        dash.setAttribute('eventsCount', 0)

        dash.setAttribute('interval', `${month[0]}-${parseInt(month[1])}-${parseInt(month[2])}`)

        return dash
    }

    //Ф-ция создания элемента текст с началом года. Возможно, что стоит разбить на две функции. Сет ер и сет монф
    function setYear(i, year) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')

        //Сделать более грамотное изменение
        if (typeof year === 'number') {
            text.classList.add('graph__text--year')
            text.setAttribute('y', height)
        } else {
            text.classList.add('graph__text--month')
            text.setAttribute('y', height - 4)
        }
        text.setAttribute('x', i)

        text.textContent = year

        return text
    }

    //Взять базу событий
    function getEvents() {
        const eventsList = fetch(eventsLink)
        eventsList.then(response => response.json())
            .then(events => {
                const eventsDatabase = JSON.parse(JSON.stringify(events))
                eventsDatabase.sort((a, b) => sortEventDatabase(a, b))
                window.eventsDatabase = eventsDatabase

                for (const item of eventsDatabase) {
                    graphEvents.insertAdjacentElement('beforeend', setEvent(item))
                }

                makeLastEventActive()
            })
    }

    //! рефактор
    function setEvent(event) {
        const interval = event.interval
        const id = event.id
        const point = graph.querySelector(`.graph__dash[interval='${interval}']`)
        const eventsCount = parseInt(point.getAttribute('eventsCount')) + 1
        point.setAttribute('eventsCount', eventsCount)

        const pointX = parseInt(point.getAttribute('x1'))
        const pointY = parseInt(point.getAttribute('y1'))

        const rect = document.createElement('div')

        if (eventsCount === 1) {
            rect.classList.add('graph__event--first')
            rect.setAttribute('style', `transform: translate(${pointX - 4}px, ${pointY - 10}px)`)
        } else {
            rect.setAttribute('style', `transform: translate(${pointX - 4}px, ${(pointY - 10) - (16 * (eventsCount - 1))}px)`)
        }

        rect.classList.add('graph__event')
        rect.setAttribute('event-id', `${id}`)
        rect.setAttribute('interval', `${event.interval}`)
        rect.addEventListener('click', openEvent)

        return rect
    }

    function makeLastEventActive() {
        const eventsArr = graph.querySelectorAll('.graph__event')
        const event = eventsArr[eventsArr.length - 1]
        const id = event.getAttribute('event-id')
        const eventInfo = eventsDatabase.find(elem => elem.id === id)

        event.classList.add(active)
        Slider.changeEvent(eventInfo, event)
    }

    function openEvent() {
        const id = this.getAttribute('event-id')
        const event = eventsDatabase.find(elem => elem.id === id)

        changeActiveEvent(this)
        Slider.changeEvent(event, this)
    }

    function changeActiveEvent(current) {
        graph.querySelector('.graph__event--active').classList.remove(active)
        current.classList.add(active)
    }

    function sortEventDatabase(a, b) {
        return a.interval.split('-').join('') - b.interval.split('-').join('')
    }
}());