console.log("komootGPXport activated");

const interval = setInterval(function () {
    const downloadBtn = document.querySelector("[data-test-id=p_tour_save]");
    if (!downloadBtn) return;

    clearInterval(interval);
    downloadBtn.innerHTML = "Download GPX";
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const scripts = document.querySelectorAll('script');
        let rawJsonString = null;

        for (let script of scripts) {
            const content = script.textContent || script.innerHTML;
            if (content.includes('kmtBoot.setProps(')) {
                // Extract the JSON string between the quotes
                const match = content.match(/kmtBoot\.setProps\("(.+)"\)/);
                if (match) {
                    rawJsonString = match[1];
                    break;
                }
            }
        }

        if (rawJsonString) {
          console.log('rawJsonString: ', rawJsonString)
            // Unescape the JSON string (it's likely escaped for JavaScript)
            const unescapedJson = rawJsonString.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            
            // Parse the raw JSON
            const rawData = JSON.parse(unescapedJson);
            console.log('💽 Raw data:', rawData);
            
            // Now access coordinates the way they appear in the raw JSON
            const coordinates = rawData.page._embedded.tour._embedded.coordinates.items;
            console.log('🗺️ Coordinates:', coordinates);

            const gpx = jsonToGpx(coordinates);
            downloadGpx(`route.gpx`, gpx);
        } else {
            alert('There was an error reading the points of your route. If this keeps happening feel free to open an issue.');
            return;
        }
    })
}, 1000);

const jsonToGpx = (coords) => {
    let gpx =
        `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gpx version="1.1" creator="komootGPXport">
  <metadata></metadata>
  <rte>
  ${coords.map((coord) => {
            return `<rtept lat="${coord.lat}" lon="${coord.lng}"><ele>${coord.alt}</ele></rtept>`
        }).join('\n')
        }
  </rte>
</gpx>`;

    return gpx;
}

const downloadGpx = (filename, text) => {
    let elem = document.createElement('a');
    elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    elem.setAttribute('download', filename);

    elem.style.display = 'none';
    document.body.appendChild(elem);

    elem.click();

    document.body.removeChild(elem);
}