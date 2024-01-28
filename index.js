const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
</svg>`;

let data; // Declara una variable para almacenar los datos


async function cargarDatos() {
    const response = await fetch('assets/data/public_countries.json');
    data = await response.json(); // Almacena los datos en la variable data
}

cargarDatos().then(() => {
    // Crear el modal
    const modal = `
        <div class="modal fade" id="countryModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="countryName">País clickeado</h5>
                        <button type="button" class="btn-close" aria-label="Close" id="countryModalCloseButton"></button>
                    </div>
                    <div class="modal-body">
                        <p id="countryData"></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar el modal al cuerpo del documento
    document.body.insertAdjacentHTML('beforeend', modal);

    // Agregar evento para cerrar el modal al hacer clic en el botón de cierre (X)
    document.getElementById('countryModalCloseButton').addEventListener('click', () => {
        $('#countryModal').modal('hide');
    });

    // Agregar evento para cerrar el modal al hacer clic en cualquier área fuera del modal
    $('#countryModal').on('hidden.bs.modal', () => {
        // Limpiar el contenido del modal cuando se cierra
        $('#countryName').text('País clickeado');
        $('#countryData').text('');
    });

    ReactDOM.render(
        <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            htmlElementsData={data.map(country => ({
                lat: country.latitude,
                lng: country.longitude,
                size: 20, // Tamaño de los marcadores
                color: 'red', // Color de los marcadores
                name: country.name
            }))}
            backgroundColor='rgba(0,0,0,0)'
            htmlElement={d => {
                const el = document.createElement('div');
                el.innerHTML = markerSvg;
                el.style.color = d.color;
                el.style.width = `${d.size}px`;


                el.style['pointer-events'] = 'auto';
                el.style.cursor = 'pointer';
                el.onclick = async () => {
                    try {
                        // Obtener el nombre del país del marcador
                        const countryName = d.name;

                        // Realizar una solicitud fetch para cargar los datos del archivo
                        const response = await fetch('assets/data/public_grouped.json');

                        // Verificar si la respuesta es exitosa
                        if (!response.ok) {
                            throw new Error(`Error al cargar los datos: ${response.status}`);
                        }

                        // Parsear los datos JSON utilizando la función json()
                        const grouped = await response.json();

                        // Filtrar los datos por país
                        const filteredData = grouped.filter(country => country.country === countryName);

                        // Crear la tabla HTML dinámicamente
                        let tableHtml = '<table class="table table-striped-columns my-table-class">';
                        tableHtml += '<thead><tr><th>Name</th><th>Country</th><th>City</th><th>Position</th><th>Mail</th></tr></thead>';
                        tableHtml += '<tbody>';

                        // Recorrer los datos filtrados y agregar filas a la tabla
                        filteredData.forEach(country => {
                            country.rows.forEach(row => {
                                tableHtml += '<tr>';
                                tableHtml += `<td>${row.name}</td>`;
                                tableHtml += `<td>${row.country}</td>`;
                                tableHtml += `<td>${row.city}</td>`;
                                tableHtml += `<td>${row.position}</td>`;
                                tableHtml += `<td>${row.mail}</td>`;
                                tableHtml += '</tr>';
                            });
                        });

                        tableHtml += '</tbody></table>';

                        // Agregar la tabla al modal
                        $('#countryData').html(tableHtml);

                        // Obtener el modal
                        const countryModal = $('#countryModal');

                        // Establecer altura máxima y scroll si es necesario
                        countryModal.find('.modal-body').css('max-height', '400px');
                        countryModal.find('.modal-body').css('overflow-y', 'auto');

                        // Actualizar el título del modal con el valor de countryName
                        countryModal.find('.modal-title').text(countryName);

                        countryModal.addClass('custom-modal');
                        // Mostrar el modal con la tabla de datos
                        countryModal.modal('show');


                    } catch (error) {
                        console.error('Error al cargar los datos:', error);
                    }
                };




                return el;
            }}
        />,
        document.getElementById('globeViz')
    );
});
