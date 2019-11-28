(function () {
    const Graph = {};
    window.Graph = Graph;

    const graph = document.querySelector('.js-graph')
    const container = graph.querySelector('.js-graph-wrapper')
    const svg = graph.querySelector('.js-graph-svg')
    const graphEvents = graph.querySelector('.js-graph-events')
    const line = graph.querySelector('.js-graph-line')
    const months = graph.querySelector('.js-graph-months')
    const years = graph.querySelector('.js-graph-years')
    const axisY = graph.querySelector('.js-graph-y')
    const axisX = graph.querySelector('.js-graph-x')
    const active = 'graph__event--active'
    
    Graph.makeGraph = function makeGraph(database) {
        let str = "";
        let i = 0;

        database.reduce((last, curr) => {
            const coef = container.offsetWidth/database.length;
            //Если не начало массива
            if (last) {
                if (curr.date.split('-')[1] !== last.date.split('-')[1]) {
                    months.insertAdjacentElement('beforeend', makeText(i * coef, curr.date.split('-')))
                }
            }

            //Если первый элемент, то добавить атрибуты к path
            //     Второе - координата у. Первое число увеличивает коэффициент юсд к фунту. 
            //     Т.к. значение коэффициента и разница между несколько коэффициентами мала, то надо увеличить ее умножив все числа. 
            //Второе число - это положение графика внутри свг. Зависит от размера холста.
        //перебор массива 
            if (i === 0) {
                str = `${str} M ${coef} ${-curr.value * 950 + 1510} S`;
            } else {
                str = `${str} ${i * (coef)} ${-curr.value  * 950 + 1510},`;
            }

            //!Решить проблему первого месяца. Не отслеживается

            i++

            return curr

        }, undefined)


        line.setAttribute("d", str);

        makeAxis()
        setEvents()
    };

    function makeAxis() {
        const width = container.offsetWidth
        const height = container.offsetHeight

        axisX.setAttribute('x1', '0')
        axisX.setAttribute('x2', width)
        axisX.setAttribute('y1', height - 24)
        axisX.setAttribute('y2', height - 24)
        axisY.setAttribute('x1', '0')
        axisY.setAttribute('x2', '0')
        axisY.setAttribute('y1', '0')
        axisY.setAttribute('y2', height - 24)
    }

    //! Создать переменные для элементов массива
    //Создать засечки 
    function makeText(i, month) {
        const dash = document.createElementNS('http://www.w3.org/2000/svg', 'line')

        dash.classList.add('graph__dash')
        dash.setAttribute('x1', i)
        dash.setAttribute('x2', i)
        dash.setAttribute('eventsCount', 0)
        dash.setAttribute('interval', `${month[0]}-${parseInt(month[1])}`)

        //Задать год, если это начало месяца
        if(parseInt(month[1]) === 1) {
            years.insertAdjacentElement('beforeend', setYear(i, +month[0]))
        }

        if(parseInt(month[1]) === 5) {
            years.insertAdjacentElement('beforeend', setYear(i, 'May'))
        }

        if(parseInt(month[1]) === 9) {
            years.insertAdjacentElement('beforeend', setYear(i, 'Sep'))
        }


        //Если месяц январь, май или сентябрь, то сделать большую засечку
        if (parseInt(month[1]) === 5 || parseInt(month[1]) === 9 || parseInt(month[1]) === 1) {
            dash.setAttribute('y1', 410)
            dash.setAttribute('y2', 420)

            return dash
        }

        //Обычная черточка
        dash.setAttribute('y1', 410)
        dash.setAttribute('y2', 415)

        return dash
    }

    //Ф-ция создания элемента текст с началом года. Возможно, что стоит разбить на две функции. Сет ер и сет монф
    function setYear(i, year) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')

        //Сделать более грамотное изменение
        if(typeof year === 'number') {
            text.classList.add('graph__text--year')
            text.setAttribute('y', 435)
        }
        else {
            text.classList.add('graph__text--month')
            text.setAttribute('y', 432)
        } 
        text.setAttribute('x', i)
        
        text.textContent = year

        return text
    }

    //Добавить событие на график
    function setEvents() {
        const eventsList = fetch('json/events.json')
        eventsList.then(response => response.json())
            .then(events => {
                const eventsDatabase = JSON.parse(JSON.stringify(events))
                window.eventsDatabase = eventsDatabase

                for(const item of events) {          
                    graphEvents.insertAdjacentElement('beforeend', makeEvent(item))
                }

                makeLastEventActive()
            })
    }

    //Возможно, стоит использовать дивы,а не рект, т.к. их можно редактировать. Какие последствия?
    //! рефактор
    function makeEvent(event) {
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
            rect.setAttribute('style', `transform: translate(${pointX - 5}px, ${pointY - 12}px)`)  
        } else {
            rect.setAttribute('style', `transform: translate(${pointX - 5}px, ${(pointY - 12) - (16 * (eventsCount - 1))}px)`)
        }

        rect.classList.add('graph__event')      
        rect.setAttribute('event-id', `${id}`)
        rect.addEventListener('click', openEvent)

        return rect
    }

    function makeLastEventActive() {
        const eventsArr = graph.querySelectorAll('.graph__event')
        eventsArr[eventsArr.length - 1].classList.add(active)
    }

    function openEvent(){
        const id = this.getAttribute('event-id')

        changeActiveEvent(this)

        const event = eventsDatabase.find(elem => elem.id === id)
        
    }

    function changeActiveEvent(current) {
        graph.querySelector('.graph__event--active').classList.remove(active)
        current.classList.add(active)
    }
}());