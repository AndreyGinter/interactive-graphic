const getData = () => {
    const url = 'https://api.exchangeratesapi.io/history?base=GBP&symbols=USD&start_at=2014-11-05&end_at=2019-11-05';
    const database = [];
    const fetchData = fetch(url);

    fetchData.then(response => response.json())
        .then(quotations => {
            for (let key in quotations.rates) {
                database.push({
                    date: key.split('-').join(''),
                    value: quotations.rates[key].USD
                })
            }

            database.sort((a, b) => a.date - b.date);

            console.log(database);
        })
};

getData();