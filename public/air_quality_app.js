let chart;

async function loadComments(city) {
    const commentSection = document.getElementById('commentSection');
    commentSection.style.display = 'block';

    document.getElementById('commentsHeader').textContent = `Comments on ${city}'s Air Quality`;

    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = ''; // clear previous comments

    await fetch(`/comments?city=${encodeURIComponent(city)}`)
        .then((result) => result.json())
        .then((resultJson) => {
            const table = document.createElement('table');
            table.setAttribute('id', 'comments_table');

            const tableRow = document.createElement('tr');

            const tableHeadingUser = document.createElement('th');
            tableHeadingUser.innerHTML = 'Username'
            tableRow.appendChild(tableHeadingUser);

            const tableHeadingComment = document.createElement('th');
            tableHeadingComment.innerHTML = 'Comment'
            tableRow.appendChild(tableHeadingComment);

            const tableHeadingDate = document.createElement('th');
            tableHeadingDate.innerHTML = 'Date'
            tableRow.appendChild(tableHeadingDate);

            table.appendChild(tableRow);

            resultJson.forEach((comment) => {
                const dataTableRow = document.createElement('tr');
                const dataTableUser = document.createElement('td');
                const dataTableComment = document.createElement('td');
                const dataTableDate = document.createElement('td');

                dataTableUser.innerHTML = comment.username;
                dataTableComment.innerHTML = comment.comment;
                dataTableDate.innerHTML = `<i>${new Date(comment.created_at).toLocaleString()}</i>`;

                dataTableRow.appendChild(dataTableUser);
                dataTableRow.appendChild(dataTableComment);
                dataTableRow.appendChild(dataTableDate);

                table.appendChild(dataTableRow);

            });

            commentsList.appendChild(table);
        });
}

async function submitComment(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const comment = document.getElementById('comment').value;
    const city = document.getElementById('city').value;

    if (!username || !comment) return;

    await fetch(`/comments`, {
        method: 'POST',
        body: JSON.stringify({
            username: `${username}`,
            comment: `${comment}`,
            city: `${city}`,
        }),
        headers: {
            'content-type': 'application/json',
        },
    }).then((result) => result.json());

    document.getElementById('username').value = '';
    document.getElementById('comment').value = '';

    await loadComments(city);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
}

async function createAQChart(url) {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Fetched chart data:", data);


    const labels = data.map(item =>
        new Date(item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    );
    const values = data.map(item => item.value);

    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');
    canvas.style.display = 'block';

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'PM2.5 µg/m³ (Monthly Average per Sensor)',
                data: values,
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        }
    });
}

async function submitCityForm(event) {
    event.preventDefault();

    const city = document.getElementById("city").value.trim();
    const sliderValues = document.getElementById('slider-date').noUiSlider.get();
    let startDate = new Date(+sliderValues[0]).toISOString().split('T')[0];
    let endDate = new Date(+sliderValues[1]).toISOString().split('T')[0];

    if (!city) return;

    if (!startDate) startDate = "2015-01-01";
    if (!endDate) endDate = "2025-05-17";

    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    const geoJson = await geoRes.json();

    if (!geoJson || geoJson.length === 0) {
        alert("City not found");
        return;
    }

    const lat = parseFloat(geoJson[0].lat);
    const lon = parseFloat(geoJson[0].lon);
    const delta = 0.1;
    const minLat = lat - delta;
    const maxLat = lat + delta;
    const minLon = lon - delta;
    const maxLon = lon + delta;
    const bbox = [minLon, minLat, maxLon, maxLat].join(',');

    const url = `/openaq/pm25?bbox=${bbox}&start=${startDate}&end=${endDate}`;

    await createAQChart(url);

    document.getElementById('graphTitle').textContent = `Air Quality in ${city} from ${formatDate(startDate)} to ${formatDate(endDate)}`;
    await loadComments(city);
}

var dateSlider = document.getElementById('slider-date');

function timestamp(str) {
    return new Date(str).getTime();
}

noUiSlider.create(dateSlider, {
    // Create two timestamps to define a range.
    range: {
        min: timestamp('2016'),
        max: timestamp('2025')
    },

    // Steps of one month
    step: 30 * 24 * 60 * 60 * 1000,

    // Two more timestamps indicate the handle starting positions.
    start: [timestamp('2016'), timestamp('2025')],

    // No decimals
    format: wNumb({
        decimals: 0
    })
});

var dateValues = [
    document.getElementById('event-start'),
    document.getElementById('event-end')
];

var formatter = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short'
});

dateSlider.noUiSlider.on('update', function (values, handle) {
    dateValues[handle].innerHTML = formatter.format(new Date(+values[handle]));
});