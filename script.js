document.addEventListener('DOMContentLoaded', () => {
  const cartItems = document.querySelector('.cart__items');
  const totalPriceElement = document.querySelector('.total-price');
  const emptyCartButton = document.querySelector('.empty-cart');
  const checkoutButton = document.querySelector('.checkout-button');
  const deliveryMethodSelect = document.getElementById('delivery-method');
  const cepInput = document.querySelector('.cep-input');
  const addButtons = document.querySelectorAll('.add-to-cart');

  let totalPrice = 0;
  let totalItems = 0;

  // Function to update total price displayed
  function updateTotalPrice() {
    totalPriceElement.textContent = totalPrice.toFixed(2);
  }

  // Function to update checkout button state based on total items
  function updateCheckoutButtonState() {
    if (totalItems > 10) {
      checkoutButton.removeAttribute('disabled');
    } else {
      checkoutButton.setAttribute('disabled', 'disabled');
    }
  }

  // Function to add item to cart
  function addToCart(productName, productPrice, productSize, quantity) {
    const totalProductPrice = productPrice * quantity;

    // Create object for cart item
    const cartItem = {
      productName: productName,
      productPrice: productPrice,
      productSize: productSize,
      quantity: quantity,
      totalProductPrice: totalProductPrice
    };

    // Get cart items from localStorage or initialize empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Add new item to the array
    cart.push(cartItem);

    // Save updated array back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update UI
    const cartItemElement = createCartItemElement(cartItem);
    cartItems.appendChild(cartItemElement);

    totalPrice += totalProductPrice;
    totalItems += quantity;
    updateTotalPrice();
    updateCheckoutButtonState();
  }

  // Function to create cart item element for UI
  function createCartItemElement(item) {
    const cartItem = document.createElement('li');
    cartItem.innerHTML = `
      <p>${item.productName} - R$ ${item.productPrice.toFixed(2)} each</p>
      <p>Tamanho: ${item.productSize}</p>
      <p>Quantidade: ${item.quantity}</p>
      <p>Total: R$ ${item.totalProductPrice.toFixed(2)}</p>
    `;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      // Remove from DOM
      cartItems.removeChild(cartItem);

      // Remove from localStorage
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const index = cart.findIndex(cartItem => cartItem.productName === item.productName && cartItem.productSize === item.productSize);
      if (index !== -1) {
        const removedItem = cart.splice(index, 1)[0];
        totalPrice -= removedItem.totalProductPrice;
        totalItems -= removedItem.quantity;
        updateTotalPrice();
        updateCheckoutButtonState();
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    });

    cartItem.appendChild(removeButton);
    return cartItem;
  }

  // Function to load cart items from localStorage on page load
  function loadCartFromLocalStorage() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    totalPrice = 0;
    totalItems = 0;

    // Clear current cart content
    cartItems.innerHTML = '';

    // Add items from localStorage back to the cart
    cart.forEach(item => {
      const cartItemElement = createCartItemElement(item);
      cartItems.appendChild(cartItemElement);

      totalPrice += item.totalProductPrice;
      totalItems += item.quantity;
    });

    updateTotalPrice();
    updateCheckoutButtonState();
  }

  // Event listeners

  // Add to cart button click event
  addButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      alert("produto adicionado ao carrinho!")
      const card = button.parentElement;
      const productName = card.querySelector('h2').textContent;
      const productPrice = parseFloat(card.querySelector('p').textContent.replace('Price: R$ ', ''));
      const productSize = card.querySelector('select[name="size"]').value;
      const quantity = parseInt(card.querySelector('input[type="number"]').value);
      addToCart(productName, productPrice, productSize, quantity);
    });
  });

  // Empty cart button click event
  emptyCartButton.addEventListener('click', () => {
    cartItems.innerHTML = '';
    totalPrice = 0;
    totalItems = 0;
    localStorage.removeItem('cart'); // Clear cart from localStorage
    updateTotalPrice();
    updateCheckoutButtonState();
  });

  // Delivery method select change event
  deliveryMethodSelect.addEventListener('change', () => {
    if (deliveryMethodSelect.value === 'correios') {
      cepInput.style.display = 'inline';
    } else {
      cepInput.style.display = 'none';
    }
  });

  // Checkout button click event
  checkoutButton.addEventListener('click', () => {
    const deliveryMethod = deliveryMethodSelect.value;
    const cep = cepInput.value.trim();

    // Order data to send to PagSeguro
    const orderData = {
      total: totalPrice.toFixed(2), // Order total
      deliveryMethod: deliveryMethod, // Delivery method
      cep: cep // Shipping zip code (if applicable)
      // You can add more order data here as needed
    };

    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer <c7ad5611-c41a-43bc-bf26-81cf99da63092b0654884e14a2748dc5f49e9a65d5150ae3-90bc-4c71-8fad-a692cade47a2>', // Replace with your real PagSeguro token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    };

    fetch('https://sandbox.api.pagseguro.com/orders', options)
      .then(response => response.json())
      .then(response => {
        console.log('PagSeguro API response:', response);

        // Process PagSeguro order creation response here
        // For example, redirect user to PagSeguro payment page

        // Simulate redirect to payment page
        window.location.href = response.paymentLink; // Example of accessing returned payment link
      })
      .catch(err => {
        console.error('Error creating order on PagSeguro:', err);
        alert('Error processing payment. Please try again later.');
      });
  });

  // Load cart items from localStorage on page load
  loadCartFromLocalStorage();

});
