function markerSvg(isoCode) {
    // Cambia el isoCode a minúsculas para que coincida con el nombre de archivo de la bandera.
    const isoCodeLowerCase = isoCode.toLowerCase();

    // Construye la URL de la imagen de la bandera.
    const flagImageUrl = `assets/flags/1x1/${isoCodeLowerCase}.svg`;

    return `<svg viewBox="-4 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <!-- Redondea las esquinas del marcador -->
        <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z" rx="14"></path>
        <!-- Reemplaza el contenido de <text> con la imagen de la bandera y ajusta su tamaño -->
        <image x="4" y="4" width="20" height="20" xlink:href="${flagImageUrl}"></image>
    </svg>`;
}


let data; // Variable para almacenar los datos de los países
let countries = { features: [] }; // Variable para almacenar los datos GeoJSON de los países

async function cargarDatos() {
    const response = await fetch('assets/data/public_countries.json');
    data = await response.json(); // Almacena los datos de los países en la variable data

    // Cargar datos GeoJSON para los polígonos de países
    const countriesResponse = await fetch('assets/data/ne_110m_admin_0_countries.geojson');
    countries = await countriesResponse.json();
}

cargarDatos().then(() => {
    // Crear el modal
    const modal = `
        <div class="modal" tabindex="-1" id="countryModal">
            <div class="modal-dialog modal-dialog-scrollable modal-lg">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="countryName">Modal title</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" id="countryModalCloseButton"></button>
                    </div>
                    <div class="modal-body">
                        <p id="countryData">Modal body text goes here.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar el modal al cuerpo del documento
    document.body.insertAdjacentHTML('beforeend', modal);

    // Agregar evento para cerrar el modal al hacer clic en el botón de cierre
    document.getElementById('countryModalCloseButton').addEventListener('click', () => {
        $('#countryModal').modal('hide');
    });

    // Agregar evento para cerrar el modal al hacer clic fuera del modal
    $('#countryModal').on('hidden.bs.modal', () => {
        $('#countryName').text('País clickeado');
        $('#countryData').text('');
    });

    ReactDOM.render(
        <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"

            htmlElementsData={data.map(country => ({
                lat: country.latitude,
                lng: country.longitude,
                size: 30,
                color: 'white',
                name: country.name,
                ISO_A2: country.ISO_A2 // Asegúrate de que esta propiedad está disponible en tus datos
            }))}

            hexPolygonsData={countries.features}
            hexPolygonResolution={4}
            hexPolygonMargin={0.3}
            hexPolygonUseDots={true}
            hexPolygonColor={() => `rgba(9, 118, 172, 0.5)`}
            hexPolygonLabel={({ properties: d }) => `
                    <b>${d.ADMIN} (${d.ISO_A2})</b> <br />
                  `}


            backgroundColor='rgba(0,0,0,0)'
            htmlElement={d => {
                const el = document.createElement('div');
                el.innerHTML = markerSvg(d.ISO_A2); // Usar la función markerSvg para poner la bandera
                el.style.color = d.color;
                el.style.width = `${d.size}px`;
                el.style['pointer-events'] = 'auto';
                el.style.cursor = 'pointer';
                
                return el;
            }}
        />,
        document.getElementById('globeViz')
    );
});
