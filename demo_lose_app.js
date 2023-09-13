
function showToast(message) {
    Android.showToast(message); // Call the Android function
}

function getDeviceCoordinates() {
    return new Promise(function (resolve, reject) {
        Android.getDeviceCoordinates('deviceCoordinatesHandler');
    });
}
function deviceCoordinatesHandler(result) {
    console.log(result)
}

function originSearchAutocomplete(language, country, query) {
    return new Promise(function (resolve, reject) {
        Android.searchAutocomplete(language, country, query, 'originSearchAutocompleteResult');
    });
}

function originSearchAutocompleteResult(result) {
    let originSuggestionsWrapper = document.querySelector('#originSuggestionsWrapper')
    originSuggestionsWrapper.textContent = ''
    for (const suggestion of result) {
        const suggestionElement = document.createElement('div')
        suggestionElement.classList.add('originSuggestion')
        suggestionElement.textContent = suggestion
        originSuggestionsWrapper.insertAdjacentElement('beforeend', suggestionElement)
    }
}

function destinationSearchAutocomplete(language, country, query) {
    return new Promise(function (resolve, reject) {
        Android.searchAutocomplete(language, country, query, 'destinationSearchAutocompleteResult');
    });
}

function destinationSearchAutocompleteResult(result) {
    let destinationSuggestionsWrapper = document.querySelector('#destinationSuggestionsWrapper')
    destinationSuggestionsWrapper.textContent = ''
    for (const suggestion of result) {
        const suggestionElement = document.createElement('div')
        suggestionElement.classList.add('destinationSuggestion')
        suggestionElement.textContent = suggestion
        destinationSuggestionsWrapper.insertAdjacentElement('beforeend', suggestionElement)
    }
}


function getOriginCoordinates(language, country, query) {
    return new Promise(function (resolve, reject) {
        Android.forwardGeocoding(language, country, query, 'originCoordinatesResult');
    });
}

function originCoordinatesResult(result) {
    window.originCoordinates = result
    window.map.setCenter([result.longitude, result.latitude])
    window.map.setZoom(14)
}

function getDestinationCoordinates(language, country, query) {
    return new Promise(function (resolve, reject) {
        Android.forwardGeocoding(language, country, query, 'destinationCoordinatesResult');
    });
}

function destinationCoordinatesResult(result) {
    window.destinationCoordinates = result
    window.map.setCenter([result.longitude, result.latitude])
    window.map.setZoom(14)
}

function getRouteData(
    origin_lat, origin_long,
    destination_lat, destination_long
) {
    return new Promise(function (resolve, reject) {
        Android.routes(origin_lat, origin_long, destination_lat, destination_long, 'getRouteDataResult');
    });
}

function getRouteDataResult(result) {
    console.log(result)
}

function handleWebsocketEnhancedSearchAutocompleteResult(result) {
    console.log(result)
    socket.send(JSON.stringify({
        event: 'response',
        method: 'enahncedSearchAutocomplete',
        id: localStorage.userIdentifier,
        result: result
    }))
}

function handleWebsocketSearchAutocompleteResult(result) {
    console.log(result)
    socket.send(JSON.stringify({
        event: 'response',
        method: 'searchAutocomplete',
        id: localStorage.userIdentifier,
        result: result
    }))
}

function handleWebsocketReverseGeocodingResult(result) {
    console.log(result)
    socket.send(JSON.stringify({
        event: 'response',
        method: 'reverseGeocoding',
        id: localStorage.userIdentifier,
        result: result
    }))
}

function handleWebsocketForwardGeocodingResult(result) {
    console.log(result)
    socket.send(JSON.stringify({
        event: 'response',
        method: 'forwardGeocoding',
        id: localStorage.userIdentifier,
        result: result
    }))
}

function handleWebsocketRoutesResult(result) {
    console.log(result)
    socket.send(JSON.stringify({
        event: 'response',
        method: 'routes',
        id: localStorage.userIdentifier,
        result: result
    }))
}


window.ws = null
window.wsTimeout = null
localStorage.userIdentifier = 'admin@yourcompany.example.com'
function connect() {
    const url = 'wss://locationservices.barameg.co/echo'
    window.ws = new WebSocket(url)
    window.ws.addEventListener('open', function (event) {
        onWebsocketOpen(event)
    })
    window.ws.addEventListener('message', function (event) {
        onWebsocketMessage(event)
    })
    window.ws.addEventListener('close', function (event) {
        onWebsocketClose(event)
    })
    window.ws.addEventListener('error', function (event) {
        onWebsocketError(event)
    })
}
function onWebsocketOpen(event) {
    console.log('websocket opened')
    console.log(event)
}
function onWebsocketMessage(event) {
    const data = JSON.parse(event.data);
    console.log(data)
    if (
        data.event &&
        data.event == 'ping'
    ) {
        window.wsTimeout = setTimeout(() => {
            window.ws.send(JSON.stringify({
                event: 'pong'
            }))
        }, 5000);
    }

    if (data.event && data.event == 'query' && data.method && data.method == 'searchAutocomplete') {
        return new Promise(function (resolve, reject) {
            Android.socketSearchAutocomplete(
                data.client_id,
                data.client_key,
                data.language,
                data.country,
                data.query,
                'handleWebsocketSearchAutocompleteResult'
            );
        });
    }
    if (data.event && data.event == 'query' && data.method && data.method == 'enhancedSearchAutocomplete') {
        return new Promise(function (resolve, reject) {
            Android.socketSearchAutocomplete(
                data.client_id,
                data.client_key,
                data.language,
                data.country,
                data.query,
                'handleWebsocketEnhancedSearchAutocompleteResult'
            );
        });
    }
    if (data.event && data.event == 'query' && data.method && data.method == 'forwardGeocoding') {
        return new Promise(function (resolve, reject) {
            Android.socketReverseGeocoding(
                data.client_id,
                data.client_key,
                data.language,
                data.country,
                data.latitude,
                data.longitude,
                'handleWebsocketForwardGeocodingResult'
            );
        });
    }
    if (data.event && data.event == 'query' && data.method && data.method == 'reverseGeocoding') {
        return new Promise(function (resolve, reject) {
            Android.socketReverseGeocoding(
                data.client_id,
                data.client_key,
                data.language,
                data.country,
                data.latitude,
                data.longitude,
                'handleWebsocketReverseGeocodingResult'
            );
        });
    }
    if (data.event && data.event == 'query' && data.method && data.method == 'routes') {
        return new Promise(function (resolve, reject) {
            Android.socketReverseGeocoding(
                data.client_id,
                data.client_key,
                data.origin_latitude,
                data.origin_longitude,
                data.destination_latitude,
                data.destination_longitude,
                'handleWebsocketRoutesResult'
            );
        });

    }
}
function onWebsocketClose(event) {
    console.log('websocket closed')
    clearTimeout(window.wsTimeout)
    window.wsTimeout = setTimeout(() => {
        connect()
    }, 2000)
}
function onWebsocketError(event) {
    console.log('websocket errored')
    clearTimeout(window.wsTimeout)
    window.wsTimeout = setTimeout(() => {
        connect()
    }, 2000)
}

(async () => {

    document.addEventListener('input', function (event) {
        if (event.target.matches('#originInput')) {
            var language = "en";
            var country = "us";
            var query = event.target.value;
            originSearchAutocomplete(language, country, query)
        }
        if (event.target.matches('#destinationInput')) {
            var language = "en";
            var country = "us";
            var query = event.target.value;
            destinationSearchAutocomplete(language, country, query)
        }

    })
    document.addEventListener('click', async function (event) {
        if (event.target.matches('.originSuggestion')) {
            window.originAddress = event.target.textContent
            getOriginCoordinates('en', 'us', event.target.textContent)
            let originSuggestionsWrapper = document.querySelector('#originSuggestionsWrapper')
            originSuggestionsWrapper.textContent = ''
        }
        if (event.target.matches('.destinationSuggestion')) {
            window.destinationAddress = event.target.textContent
            getDestinationCoordinates('en', 'us', event.target.textContent)
            let destinationSuggestionsWrapper = document.querySelector('#destinationSuggestionsWrapper')
            destinationSuggestionsWrapper.textContent = ''
        }
        if (event.target.matches('#getRoute')) {
            getRouteData(
                window.originCoordinates.latitude,
                window.originCoordinates.longitude,
                window.destinationCoordinates.latitude,
                window.destinationCoordinates.longitude
            )
        }

    })
})()


