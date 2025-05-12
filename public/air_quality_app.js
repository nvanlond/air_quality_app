async function loadAirQualityData() {
    await fetch('/air_quality_data')
        .then((result) => result.json())
        .then((resultJson) => {
            const table = document.createElement('table');
            table.setAttribute('id', 'air_quality_info');

            const tableRow = document.createElement('tr');

            const tableHeadingCity = document.createElement('th');
            tableHeadingCity.innerHTML = 'city'
            tableRow.appendChild(tableHeadingCity);

            const tableHeadingDate = document.createElement('th');
            tableHeadingDate.innerHTML = 'date'
            tableRow.appendChild(tableHeadingDate);

            const tableHeadingParameter = document.createElement('th');
            tableHeadingParameter.innerHTML = 'parameter'
            tableRow.appendChild(tableHeadingParameter);

            const tableHeadingValue = document.createElement('th');
            tableHeadingValue.innerHTML = 'value'
            tableRow.appendChild(tableHeadingValue);

            const tableHeadingUnit = document.createElement('th');
            tableHeadingUnit.innerHTML = 'unit'
            tableRow.appendChild(tableHeadingUnit);

            table.appendChild(tableRow);

            resultJson.forEach((location) => {
                const dataTableRow = document.createElement('tr');
                const dataTableCity = document.createElement('td');
                const dataTableDate = document.createElement('td');
                const dataTableParameter = document.createElement('td');
                const dataTableValue = document.createElement('td');
                const dataTableUnit = document.createElement('td');
                
                dataTableCity.innerHTML = location.city;
                dataTableDate.innerHTML = location.date;
                dataTableParameter.innerHTML = location.parameter;
                dataTableValue.innerHTML = location.value;
                dataTableUnit.innerHTML = location.unit;

                dataTableRow.appendChild(dataTableCity);
                dataTableRow.appendChild(dataTableDate);
                dataTableRow.appendChild(dataTableParameter);
                dataTableRow.appendChild(dataTableValue);
                dataTableRow.appendChild(dataTableUnit);

                table.appendChild(dataTableRow);
            });

            document.body.appendChild(table);
        });
}

window.onload = loadAirQualityData;