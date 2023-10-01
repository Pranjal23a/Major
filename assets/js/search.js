{
    $(document).ready(function () {
        const searchForm = $('#search-form');
        const searchResults = $('#search-results');

        searchForm.submit(function (e) {
            e.preventDefault();

            const searchQuery = $('#search-query').val();

            // Send an AJAX request to the server
            $.ajax({
                url: `/staff/search/${searchQuery}`,
                dataType: 'json',
                success: function (data) {
                    // Handle the received data and update the search results on the page
                    console.log('Data received:', data);

                    updateSearchResults(data);
                },
                error: function (error) {
                    console.error('Error:', error);
                }
            });
        });

        function updateSearchResults(results) {
            // Clear previous search results
            searchResults.html('');

            if (results.length > 0) {
                // Create a table to display the search results
                const table = $('<table>').attr('border', '1').css('text-align', 'center');

                // Create table headers
                const thead = $('<thead>').html(`
                    <tr>
                        <th>Medicine ID</th>
                        <th>Name</th>
                        <th>Stock</th>
                        <th>Price(per Unit)</th>
                        <th>Expiry Date</th>
                    </tr>
                `);

                // Create table body
                const tbody = $('<tbody>');
                results.forEach(info => {
                    const row = $('<tr>').html(`
                        <td>${info.medicine_id}</td>
                        <td>${info.name}</td>
                        <td>${info.stock} U</td>
                        <td>Rs. ${info.price}</td>
                        <td style="${checkExpiration(info.exp_date)}">
                            ${new Date(info.exp_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                    `);
                    tbody.append(row);
                });

                // Append the table to the search results div
                table.append(thead);
                table.append(tbody);
                searchResults.append(table);
            } else {
                searchResults.text('No results found.');
            }
        }

        function checkExpiration(expDate) {
            var currentDate = new Date();
            var expirationDate = new Date(expDate);
            var timeDifference = expirationDate - currentDate;
            var daysUntilExpiration = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

            if (daysUntilExpiration < 0) {
                return " background-color: red;";
            } else if (daysUntilExpiration <= 30) {
                return "background-color: orange;";
            } else {
                return "";
            }
        }
    });
}