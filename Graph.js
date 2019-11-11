(function() {
    const Graph = {};
    window.Graph = Graph;

    Graph.makeGraph = function makeGraph(database) {
        let str = "";
        let i = 1;
        let y;

        for (let key in database) {
            console.log(database[key].date.split('-'));
            if (i == 1) {
                str = `${str} M ${i * 3.81},${-database[key].value * 950 + 1510} S`;
            } else {
                str = `${str} ${i * 3.81}, ${-database[key].value * 950 + 1510}`;
            }
            i++;
        }

        document.querySelector(".graph").setAttribute("d", str);
    };
}());