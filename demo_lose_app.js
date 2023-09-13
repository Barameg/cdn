
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
    console.log('calling response')
    window.ws.send(JSON.stringify({
        event: 'response',
        method: 'enahncedSearchAutocomplete',
        id: window.emailAddress,
        result: result
    }))
}

function handleWebsocketSearchAutocompleteResult(result) {
    console.log(result)
    window.ws.send(JSON.stringify({
        event: 'response',
        method: 'searchAutocomplete',
        id: window.emailAddress,
        result: result
    }))
}

function handleWebsocketReverseGeocodingResult(result) {
    console.log(result)
    window.ws.send(JSON.stringify({
        event: 'response',
        method: 'reverseGeocoding',
        id: window.emailAddress,
        result: result
    }))
}

function handleWebsocketForwardGeocodingResult(result) {
    console.log(result)
    window.ws.send(JSON.stringify({
        event: 'response',
        method: 'forwardGeocoding',
        id: window.emailAddress,
        result: result
    }))
}

function handleWebsocketRoutesResult(result) {
    console.log(result)
    window.ws.send(JSON.stringify({
        event: 'response',
        method: 'routes',
        id: window.emailAddress,
        result: result
    }))
}


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
    let connected = document.querySelector('#connected')
    let disconnected = document.querySelector('#disconnected')
    disconnected.classList.add('hidden')
    connected.classList.remove('hidden')
    window.ws.send(JSON.stringify({
        event:'subscribe',
        source: 'mobileClient',
        id: window.emailAddress
    }))
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
            Android.searchAutocomplete(
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
        console.log("==================== calling")
        return new Promise(function (resolve, reject) {
            Android.enhancedSearchAutocomplete(
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
            Android.forwardGeocoding(
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
            Android.reverseGeocoding(
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
            Android.routes(
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
    let connected = document.querySelector('#connected')
    let disconnected = document.querySelector('#disconnected')
    connected.classList.add('hidden')
    disconnected.classList.remove('hidden')
}
function onWebsocketError(event) {
    console.log('websocket errored')
    clearTimeout(window.wsTimeout)
    window.wsTimeout = setTimeout(() => {
        connect()
    }, 2000)
}

(async () => {
    window.ws = null
    window.wsTimeout = null

    document.addEventListener('input', function (event) {


    })
    document.addEventListener('click', async function (event) {
        if (event.target.matches('#connect')) {
            let emailAddress = document.querySelector('#emailAddress')
            if(
                emailAddress.value == ''
            ){
                showToast('Email address is empty')
            } else {
                window.emailAddress = emailAddress.value
                connect()
            }
        }
        if (event.target.matches('#disconnect')) {
            window.ws.close()
        }
    })
})()


