(function () {
    const Graph = {};
    window.Graph = Graph;

    const months = document.querySelector('.graph').querySelector('.grid-months')
    const years = document.querySelector('.graph').querySelector('.grid-years')

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
    };
    //! Создать переменные для элементов массива
    //Создать засечки 
    function makeText(i, month) {
        const dash = document.createElementNS('http://www.w3.org/2000/svg', 'line')

        dash.classList.add('grid__month')
        dash.setAttribute('x1', i)
        dash.setAttribute('x2', i)
        dash.setAttribute('interval', `${month[0]}-${parseInt(month[1])}`)

        //Задать год, если это начало месяца
        if(parseInt(month[1]) === 1) {
            years.insertAdjacentElement('beforeend', setYear(i, month[0]))
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

    //Ф-ция создания элемента текст с началом года
    function setYear(i, year) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')

        text.classList.add('grid__text')
        text.setAttribute('x', i)
        text.setAttribute('y', 435)
        text.textContent = year

        return text
    }
}());