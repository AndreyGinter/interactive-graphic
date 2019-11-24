(function () {
    const Graph = {};
    window.Graph = Graph;

    const months = document.querySelector('.graph').querySelector('.grid-months')
    const years = document.querySelector('.graph').querySelector('.grid-years')
    const graphEvents = document.querySelector('.graph').querySelector('.events')

    Graph.makeGraph = function makeGraph(database) {
        let str = "";
        let i = 1;


        // for (const key in database) {
        //     console.log(database[key].date.split('-'));
        //     /*! Первое - масштаб. Расстояние между двумя соседними точками. Координата х. 
        //     Второе - координата у. Первое число увеличивает коэффициент юсд к фунту. 
        //     Т.к. значение коэффициента и разница между несколько коэффициентами мала, то надо увеличить ее умножив все числа. 
        //     Второе число - это положение графика внутри свг. Зависит от размера холста.
        //     */
        //     if (i == 1) {
        //         str = `${str} M ${i * 3.81}${-database[key].value * 950 + 1510} S`;
        //     } else {
        //         str = `${str} ${i * 3.81} ${-database[key].value  * 950 + 1510},`;
        //     }

        //     console.log(database[key].date.split('-')[1])

        //     i++;
        // }
        //перебор массива 
        database.reduce((last, curr) => {
            //Если не начало массива
            if (last) {
                if (curr.date.split('-')[1] !== last.date.split('-')[1]) {
                    months.insertAdjacentElement('beforeend', makeText(i * 3.81, curr.date.split('-')))
                }
            }

            //Если первый элемент, то добавить атрибуты к path
            if (i === 1) {
                str = `${str} M ${i * 3.81}${-curr.value * 950 + 1510} S`;
            } else {
                str = `${str} ${i * 3.81} ${-curr.value  * 950 + 1510},`;
            }

            //!Решить проблему первого месяца. Не отслеживается

            i++

            return curr

        }, undefined)

        document.querySelector(".graph__line").setAttribute("d", str);

        setEvents()
    };
    //! Создать переменные для элементов массива
    //Создать засечки 
    function makeText(i, month) {
        const dash = document.createElementNS('http://www.w3.org/2000/svg', 'line')

        dash.classList.add('grid__month')
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
            text.classList.add('grid__text--year')
            text.setAttribute('y', 435)
        }
        else {
            text.classList.add('grid__text--month')
            text.setAttribute('y', 432)
        } 
        text.setAttribute('x', i)
        
        text.textContent = year

        return text
    }

    function setEvents() {
        const eventsList = fetch('./events.json')
        eventsList.then(response => response.json())
            .then(events => {
                //Объявлять за пределами этой функции. вверху
                const eventsDatabase = JSON.parse(JSON.stringify(events))
                window.eventsDatabase = eventsDatabase

                for(const event of events) {          
                    graphEvents.insertAdjacentElement('beforeend', makeEvent(event))
                }
            })
    }

    //Возможно, стоит использовать дивы,а не рект, т.к. их можно редактировать. Какие последствия?
    //! рефактор
    function makeEvent(event) {
        const interval = event.interval
        const id = event.id
        const point = document.querySelector('.graph').querySelector(`.grid__month[interval='${interval}']`)
        const eventsCount = parseInt(point.getAttribute('eventsCount')) + 1
        point.setAttribute('eventsCount', eventsCount)

        const pointX = parseInt(point.getAttribute('x1'))
        const pointY = parseInt(point.getAttribute('y1'))

        const rect = document.createElement('div')

        if(eventsCount === 1) {
            rect.classList.add('graph__rect--first')
            rect.setAttribute('style', `transform: translate(${pointX}px, ${pointY - 11}px)`)  
        }
        else {
            console.log(eventsCount)
            rect.setAttribute('style', `transform: translate(${pointX}px, ${(pointY - 11) - (16 * (eventsCount - 1))}px)`)
            console.log(pointY)
        }
        rect.classList.add('graph__rect')
        
        rect.setAttribute('id', `${id}`)

        rect.addEventListener('click', openEvent)

        return rect
    }

    function openEvent(){
        const id = this.getAttribute('id')

        const event = eventsDatabase.find(elem => elem.id === id)
        
    }
}());