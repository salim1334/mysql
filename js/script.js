const container = document.getElementById('productsContainer');

fetch('http://127.0.0.1:8000/getAllProducts')
  .then((res) => res.json())
  .then((data) => {
    if (data.length === 0) {
      container.innerHTML = '<p>No products found.</p>';
      return;
    }

    container.innerHTML = ''; // Clear loading text

    data.forEach((product) => {
      const div = document.createElement('div');
      div.classList.add('product');

      div.innerHTML = `
        <h2>${product.product_name}</h2>
        <img src="${product.product_img}" alt="${product.product_name}" />
        <div>
          <p><strong>Brief:</strong> ${product.product_brief_description}</p>
          <p><strong>Description:</strong> ${product.product_description}</p>
          <p class="price"><strong>Start Price:</strong> ${product.starting_price}</p>
          <p class="price"><strong>Range:</strong> ${product.price_range}</p>
          <a href="${product.product_url}" target="_blank">🔗 View Product</a>
        </div>
      `;

      container.appendChild(div);
    });
  })
  .catch((err) => {
    console.error('Error fetching products:', err);
    container.innerHTML = '<p style="color:red;">Failed to load products.</p>';
  });
