// Kun sivu on kokonaan ladattu, tämä koodi käynnistyy
document.addEventListener("DOMContentLoaded", function () {
    // Otetaan valikko, tulosalue ja hakukenttä talteen
    const dropdown = document.getElementById("stationDropdown"); // Asemavalikko
    const timetable = document.getElementById("timetable"); // Aikataulutulosalue
    const searchField = document.getElementById("searchField"); // Hakukenttä

    // Kuunnellaan, kun käyttäjä valitsee aseman
    dropdown.addEventListener("change", function () {
        const stationCode = dropdown.value; // Haetaan valitun aseman koodi

        // Tyhjennetään vanhat tulokset
        timetable.innerHTML = ""; // Poistetaan aikaisemmat aikataulut

        // Jos ei valittu mitään asemaa, lopetetaan
        if (stationCode === "") {
            return; // Ei tehdä mitään, jos asema ei ole valittuna
        }

        // Tehdään osoite, mistä haetaan junien tiedot
        const apiURL = `https://rata.digitraffic.fi/api/v1/live-trains/station/${stationCode}?arrived_trains=0&departed_trains=0&arriving_trains=6&departing_trains=6`; // API-pyyntö junatiedoille

        // Haetaan junatiedot
        fetch(apiURL)
            .then(function (response) {
                return response.json(); // Muutetaan saatu data JSON-muotoon
            })
            .then(function (trains) {
                // Jos junia ei ole saatavilla, näytetään viesti
                if (trains.length === 0) {
                    timetable.textContent = "Ei saatavilla olevia junia."; // Ei löytynyt junia
                    return; // Lopetetaan, koska ei löytynyt mitään junia
                }

                // Käydään jokainen juna läpi
                trains.forEach(function (train) {
                    const div = document.createElement("div"); // Luodaan uusi div-elementti
                    div.className = "train-box"; // Lisätään luokka tyylin soveltamiseksi

                    // Yhdistetään junan tyyppi ja numero
                    const trainId = train.trainType + " " + train.trainNumber; // Junan tunnus

                    // Etsitään lähtöaika tälle asemalle
                    const departureData = train.timeTableRows.find(function (row) {
                        return row.stationShortCode === stationCode && row.type === "DEPARTURE"; // Lähtöaika tälle asemalle
                    });

                    // Jos lähtöaika löytyy, näytetään se
                    const time = departureData
                        ? new Date(departureData.scheduledTime).toLocaleTimeString("fi-FI", { hour: '2-digit', minute: '2-digit' }) // Muutetaan aika oikeaan muotoon
                        : "Aika ei saatavilla"; // Jos aikaa ei löydy

                    // Otetaan määränpää eli viimeinen asema
                    const destinationCode = train.timeTableRows[train.timeTableRows.length - 1].stationShortCode; // Junan määränpää

                    // Tehdään näkyvä laatikko junasta
                    div.innerHTML = `
                        <strong>Juna:</strong> ${trainId}<br>
                        <strong>Lähtöaika:</strong> ${time}<br>
                        <strong>Määränpää:</strong> ${destinationCode}
                    `; // Luodaan HTML sisältö junan tiedoille

                    // Näytetään tämä junalaatikko sivulla
                    timetable.appendChild(div); // Lisätään laatikko aikataululistaan
                });
            });
    });

    // Kuunnellaan, kun käyttäjä kirjoittaa hakukenttään
    searchField.addEventListener("input", function () {
        const query = searchField.value.trim().toLowerCase(); // Haetaan hakusana ja muutetaan pieniksi kirjaimiksi

        // Jos hakusana on tyhjä, lopetetaan
        if (query === "") {
            return; // Ei tehdä mitään, jos hakusana on tyhjä
        }

        // Etsitään aseman koodi hakukentän syötteen perusteella
        const stationCode = Object.keys(stationNames).find(function (key) {
            return stationNames[key].toLowerCase().includes(query); // Vertaa hakusanaa aseman nimeen
        });

        // Jos asema löytyy, haetaan sen aikataulut
        if (stationCode) {
            // Asetetaan valikosta valittu asema
            dropdown.value = stationCode;
            // Tyhjennetään aikataulut ennen uuden hakemista
            timetable.innerHTML = "";
            // Haetaan aikataulut valitulle asemalle
            fetchTimetable(stationCode);
        }
    });

    // Funktio, joka hakee junien aikataulut asemakohtaisesti
    function fetchTimetable(stationCode) {
        const apiURL = `https://rata.digitraffic.fi/api/v1/live-trains/station/${stationCode}?arrived_trains=0&departed_trains=0&arriving_trains=6&departing_trains=6`;

        // Haetaan data API:sta
        fetch(apiURL)
            .then(function (response) {
                return response.json(); // Muutetaan vastaus JSON-muotoon
            })
            .then(function (trains) {
                if (trains.length === 0) {
                    timetable.textContent = "Ei aikatauluja saatavilla."; // Ei junia löydy
                    return;
                }

                // Käydään läpi kaikki junat ja näytetään niiden tiedot
                trains.forEach(function (train) {
                    const div = document.createElement("div");
                    div.className = "train-box"; // Lisätään luokka tyylille

                    const trainId = train.trainType + " " + train.trainNumber; // Junan tunnus

                    const departureData = train.timeTableRows.find(function (row) {
                        return row.stationShortCode === stationCode && row.type === "DEPARTURE";
                    });

                    const time = departureData
                        ? new Date(departureData.scheduledTime).toLocaleTimeString("fi-FI", { hour: '2-digit', minute: '2-digit' })
                        : "Ei aikaa";

                    const destinationCode = train.timeTableRows[train.timeTableRows.length - 1].stationShortCode;

                    div.innerHTML = `
                        <strong>Juna:</strong> ${trainId}<br>
                        <strong>Lähtöaika:</strong> ${time}<br>
                        <strong>Määränpää:</strong> ${destinationCode}
                    `;

                    timetable.appendChild(div);
                });
            });
    }

    // Asemien nimet ja koodit
    const stationNames = {
        "HKI": "Helsingin rautatieasema",
        "PSL": "Pasila",
        "TKU": "Turku",
        "HEC": "Lentoasema",
        "TKL": "Tikkurila"
    };
});
