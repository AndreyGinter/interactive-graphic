/*Модуль отвечает за построение графика, через приходящие точки*/

import {changeEvent} from './Slider.js'

const graph = document.querySelector('.js-graph')
const container = graph.querySelector('.js-graph-container')
const scroll = graph.querySelector('.js-graph-scroll')
const graphEvents = graph.querySelector('.js-graph-events')
const line = graph.querySelector('.js-graph-line')
const background = graph.querySelector('.js-graph-background')
const months = graph.querySelector('.js-graph-months')
const years = graph.querySelector('.js-graph-years')
const axisX = graph.querySelector('.js-graph-x')
const active = 'graph__event--active'
const eventsLink = '../json/events.json'
const windowWidth = document.documentElement.clientWidth
const width = container.offsetWidth
const height = container.offsetHeight

export default function (database) {
    let lineStr = ""
    let backgroundLineStr = ""
    let i = 0
    let lastValue, firstValue


    database.reduce((last, curr) => {
        const coef = width / database.length;
        //Если не начало массива. Создание точек с датами в легенде графика
        if (last) {
            if (curr.date.split('-')[1] !== last.date.split('-')[1]) {
                months.insertAdjacentElement('beforeend', makeDash(i * coef, curr.date.split('-')))
            } else {
                months.insertAdjacentElement('beforeend', makeInvisiblePoint(i * coef, curr.date.split('-')))
            }
        }

        //coef - это число по оси х. Ставится через равные промежутки, зависит от ширины графика и количества точек.
        //Второе коэффициент - координата у. 
        //Т.к. значение коэффициента и разница между несколько коэффициентами мала, то надо увеличить ее умножив все числа на 950. 
        //1530 - это положение графика внутри свг. Зависит от размера холста.
        if (i === 0) {
            lineStr += `M ${coef} ${-curr.value * 950 + 1530} S`;
            backgroundLineStr += `M ${coef} ${-curr.value * 950 + 1530} S`;

        } else {
            lineStr += `${i * (coef)} ${-curr.value  * 950 + 1530},`;
            backgroundLineStr += `${i * (coef)} ${-curr.value  * 950 + 1530},`;
        }

        //Записать последние точки, чтобы можно было сделать заливку цветом графику.
        if (i === database.length - 1) {
            firstValue = coef
            lastValue = i * (coef)
        }

        i++

        return curr

    }, undefined)

    //Присовение аттрибута с графиком svg элементу.
    backgroundLineStr = `${backgroundLineStr} ${lastValue} 405, ${lastValue} 405 L ${firstValue} 405 Z`
    line.setAttribute("d", lineStr);
    background.setAttribute("d", backgroundLineStr)

    makeAxis()
    getEvents()

    if (document.documentElement.clientWidth < 1024) {
        changeGraphViewPosition()
    }
};

function makeAxis() {
    axisX.setAttribute('x1', '0')
    axisX.setAttribute('x2', width)
    axisX.setAttribute('y1', height - 26)
    axisX.setAttribute('y2', height - 26)
}

//Создать засечки на легенде графика
function makeDash(i, date) {
    const dash = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    date = date.map(el => parseInt(el))
    const [year, month, day] = date

    dash.classList.add('graph__dash')
    dash.classList.add('graph__dash--color')
    dash.setAttribute('x1', i)
    dash.setAttribute('x2', i)
    dash.setAttribute('eventsCount', 0)
    dash.setAttribute('interval', `${year}-${month}-${day}`)

    //Задать год, если это начало месяца
    if (month === 1) {
        years.insertAdjacentElement('beforeend', setYear(i, year))
    }

    if (month === 5) {
        years.insertAdjacentElement('beforeend', setYear(i, 'May'))
    }

    if (month === 9) {
        years.insertAdjacentElement('beforeend', setYear(i, 'Sep'))
    }


    //Если месяц январь, май или сентябрь, то сделать большую засечку
    if (month === 5 || month === 9 || month === 1) {
        dash.setAttribute('y1', height - 26)
        dash.setAttribute('y2', height - 18)

        return dash
    }

    //Обычная черточка
    dash.setAttribute('y1', height - 26)
    dash.setAttribute('y2', height - 23)

    return dash
}


//Сделать точку, к которой можно привязать событие, вне диапазона 
function makeInvisiblePoint(i, date) {
    const dash = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    const [year, month, day] = date

    dash.classList.add('graph__dash')
    dash.setAttribute('x1', i)
    dash.setAttribute('x2', i)
    dash.setAttribute('y1', height - 26)
    dash.setAttribute('y2', height - 26)

    dash.setAttribute('eventsCount', 0)
    dash.setAttribute('interval', `${year}-${parseInt(month)}-${parseInt(day)}`)

    return dash
}

//Ф-ция создания тестовых значений годов на легенде графика
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

//Загрузить базу events
function getEvents() {
    const eventsList = fetch(eventsLink)
    eventsList.then(response => response.json())
        .then(events => {
            const eventsDatabase = JSON.parse(JSON.stringify(events))
            eventsDatabase.cards.sort((a, b) => sortEventDatabase(a.interval.split('-'), b.interval.split('-')))
            window.eventsDatabase = eventsDatabase

            for (const item of eventsDatabase.cards) {
                graphEvents.insertAdjacentElement('beforeend', setEvent(item))
            }

            makeLastEventActive()
        })
}

//Установить точку event га график
function setEvent(event) {
    const interval = event.interval
    const id = event.id
    let point = graph.querySelector(`.graph__dash[interval='${interval}']`)

    //Если event является событием вне отметки на графике
    if (!point) {
        point = setEventInIntervalDate(interval)
    }

    const eventsCount = parseInt(point.getAttribute('eventsCount')) + 1
    point.setAttribute('eventsCount', eventsCount)

    const pointX = parseInt(point.getAttribute('x1'))
    const pointY = parseInt(point.getAttribute('y1'))

    const rect = document.createElement('div')

    //Если это первый event на этой отметке.
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
    const lastEvent = eventsArr[eventsArr.length - 1]
    const id =  lastEvent.getAttribute('event-id')
    const eventInfo = eventsDatabase.cards.find(el => el.id === id)

    lastEvent.classList.add(active)
    changeEvent(eventInfo,  lastEvent)
}

//Открыть эвент при нажатии на точку
function openEvent() {
    const id = this.getAttribute('event-id')
    const event = eventsDatabase.cards.find(el => el.id === id)

    changeActiveEvent(this)
    changeEvent(event, this)
}

//Функция по определения отметки для точки, лежащей вне даты конца биржевой недели
function setEventInIntervalDate(interval) {
    const splitted = interval.split('-')
    const date = parseInt(splitted.join(''))
    const arrayOfMatchedDashes = []
    const arrayOfDashes = document.querySelectorAll('.graph__dash')
    let i = 0

    while (true) {
        const searchingInterval = [splitted[0], parseInt(splitted[1]) + i].join('-')

        if (searchingInterval[1] === 13) {
            searchingInterval[1] = 1
        }

        for (const elem of arrayOfDashes) {
            const elemInterval = elem.getAttribute('interval').split('-')
            const matchedInterval = [elemInterval[0], elemInterval[1]].join('-')

            if (searchingInterval === matchedInterval) {
                arrayOfMatchedDashes.push(elem)
            }
        }

        for (const elem of arrayOfMatchedDashes) {
            const elemInterval = parseInt(elem.getAttribute('interval').split('-').join(''))

            if (elemInterval > date) {
                return elem
            }
        }

        i++
    }
}

//Сдвинуть графика вправо на мобильной разрешении
function changeGraphViewPosition() {
    scroll.scrollLeft = width - windowWidth
}

function changeActiveEvent(current) {
    graph.querySelector('.graph__event--active').classList.remove(active)
    current.classList.add(active)
}

function sortEventDatabase(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] - b[i] !== 0) {
            return a[i] - b[i]
        }
    }
}