const cartContainer = document.getElementById('cartItems');
const cartTitle = document.querySelector('.cart-title');

// تحديث العنوان بعدد المنتجات
function updateCartTitle() {
    const totalItems = Array.from(cartContainer.children).reduce((total, product) => {
        const qty = parseInt(product.querySelector('.quantity').textContent);
        return total + qty;
    }, 0);

    cartTitle.textContent = `Your Cart (${totalItems})`;
}

// دالة لحساب وتحديث السعر الاجمالي
function updateTotalPrice() {
    const total = Array.from(cartContainer.children).reduce((sum, product) => {
        const price = parseFloat(product.querySelector('.price').textContent.replace('$', ''));
        return sum + price;
    }, 0);
    
    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
}

// دالة للتحقق من حالة السلة واظهار/اخفاء رسالة السلة الفارغة وزر التأكيد
function checkCartEmpty() {
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartTotal = document.querySelector('.cart-total');
    
    const cartProducts = Array.from(cartContainer.children).map(
        product => product.querySelector('.name').textContent
    );
    
    // التحقق من حالة السلة
    if (cartContainer.children.length === 0) {
        emptyCartMessage.style.display = 'flex';
        cartTotal.style.display = 'none';
    } else {
        emptyCartMessage.style.display = 'none';
        cartTotal.style.display = 'block';
    }
    
    // تحديث حالة جميع المنتجات
    const allProducts = document.querySelectorAll('.product');
    allProducts.forEach(product => {
        const productName = product.querySelector('.name').textContent;
        const cartControls = product.querySelector('.cart-controls');
        const addToCartBtn = cartControls.querySelector('.add-to-cart-btn');
        const qtyController = cartControls.querySelector('.quantity-controller');
        const productImage = product.querySelector('img');
        
        // التحقق ما اذا كان المنتج موجودا في السلة
        if (cartProducts.includes(productName)) {
            // المنتج موجود في السلة
            addToCartBtn.style.display = 'none';
            qtyController.style.display = 'inline-flex';
            qtyController.classList.add('active');
            productImage.classList.add('active');
        } else {
            // المنتج غير موجود في السلة
            addToCartBtn.style.display = 'inline-block';
            qtyController.style.display = 'none';
            qtyController.classList.remove('active');
            productImage.classList.remove('active');
            
            // اعادة تعيين الكمية إلى 1
            const qtyDisplay = qtyController.querySelector('.selected-qty');
            if (qtyDisplay) {
                qtyDisplay.textContent = '1';
            }
        }
    });
}

// دالة لاضافة المنتج إلى السلة
function addToCart(name, price, qty, imagePath) {
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartTotal = document.querySelector('.cart-total');
    
    // اخفاء رسالة السلة الفارغة و اظهار قسم السعر الاجمالي عند اضافة اول منتج
    if (cartContainer.children.length === 0) {
        emptyCartMessage.style.display = 'none';
        cartTotal.style.display = 'block';
    }
    
    const existingProduct = Array.from(cartContainer.children).find(
        product => product.querySelector('.name').textContent === name
    );

    if (existingProduct) {
        // اذا كان المنتج موجود، قم بتحديث الكمية والسعر
        const qtyElement = existingProduct.querySelector('.quantity');
        const priceElement = existingProduct.querySelector('.price');
        const currentQty = parseInt(qtyElement.textContent);
        const newQty = currentQty + qty;
        qtyElement.textContent = `${newQty} x`;
        priceElement.textContent = `$${(price * newQty).toFixed(2)}`;
    } else {
        // اذا لم يكن موجودا،أضف المنتج كجديد
        const product = document.createElement('div');
        product.className = 'product-in-cart';
        product.dataset.image = imagePath;

        product.innerHTML = `
            <div class="product-info">
                <div class="product-image">
                    <img src="${imagePath}" alt="${name}">
                </div>
                <h5 class="name">${name}</h5>
                <div class="product-details">
                    <span class="quantity">${qty} X</span>
                    <span class="unit-price">$${price.toFixed(2)}</span>
                    <span class="price">$${(price * qty).toFixed(2)}</span>
                </div>
            </div>
            <button class="remove-btn btn btn-sm btn-danger">&times;</button>
        `;

        // عناصر التحكم
        const removeBtn = product.querySelector('.remove-btn');
        const quantitySpan = product.querySelector('.quantity');
        const priceElement = product.querySelector('.price');

        // ازالة المنتج
        removeBtn.onclick = () => {
            product.remove();
            updateCartTitle();
            updateTotalPrice();
            checkCartEmpty(); // التحقق من حالة السلة بعد ازالة المنتج
        };

        cartContainer.appendChild(product);
    }

    updateCartTitle();
    updateTotalPrice();
}

function toggleCartControls(button, name, price, imagePath) {
    const cartControls = button.parentElement;
    const qtyController = cartControls.querySelector('.quantity-controller');
    const qtyDisplay = qtyController.querySelector('.selected-qty');
    const productImage = cartControls.parentElement.querySelector('img');

    button.style.display = 'none';
    qtyController.style.display = 'inline-flex';
    // إضافة كلاس active
    qtyController.classList.add('active');
    productImage.classList.add('active');

    let currentQty = 1;
    qtyDisplay.textContent = currentQty;

    addToCart(name, price, currentQty, imagePath);

    qtyController.querySelector('.increase-qty').onclick = () => {
        currentQty++;
        qtyDisplay.textContent = currentQty;
        addToCart(name, price, 1, imagePath);
    };

    qtyController.querySelector('.decrease-qty').onclick = () => {
        if (currentQty > 1) {
            currentQty--;
            qtyDisplay.textContent = currentQty;
            addToCart(name, price, -1, imagePath);
        } else {
            // ارجاع الزر واخفاء التحكم اذا اصبحت الكمية 0
            qtyController.style.display = 'none';
            button.style.display = 'inline-block';
            // ازالة كلاس active
            qtyController.classList.remove('active');
            productImage.classList.remove('active');
            removeFromCart(name);
        }
    };
}

function removeFromCart(name) {
    const product = Array.from(cartContainer.children).find(
        product => product.querySelector('.name').textContent === name
    );

    if (product) {
        product.remove();
        updateCartTitle();
        updateTotalPrice();
        checkCartEmpty();
    }
}

// دالة معالجة الطلب
function processOrder() {
    const orderContent = document.querySelector('.order-content');
    const orderSuccess = document.getElementById('orderSuccess');
    
    // اخفاء محتوى الطلب
    orderContent.style.display = 'none';
    orderSuccess.style.display = 'block';
}

// دالة تاكيد الطلب
function confirmOrder() {
    const overlay = document.getElementById('orderOverlay');
    const orderItems = document.getElementById('orderItems');
    const modalTotalPrice = document.getElementById('modalTotalPrice');
    
    // تحديث السعر الاجمالي في الـ overlay
    modalTotalPrice.textContent = document.getElementById('totalPrice').textContent;
    
    // اضافة المنتجات الى الـ overlay
    orderItems.innerHTML = '';
    Array.from(cartContainer.children).forEach(product => {
        const name = product.querySelector('.name').textContent;
        const quantity = product.querySelector('.quantity').textContent;
        const unitPrice = product.querySelector('.unit-price').textContent.replace('$', '').trim();
        const totalPrice = product.querySelector('.price').textContent.replace('$', '').trim();
        const imagePath = product.dataset.image;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-image">
                <img src="${imagePath}" alt="${name}">
            </div>
            <div class="order-item-info">
                <div class="order-item-name">${name}</div>
                <div class="order-item-details">
                    <div class="left-details">
                        <span>${quantity}</span>
                        <span>$${unitPrice}</span>
                    </div>
                    <div class="right-details">
                        <span>$${totalPrice}</span>
                    </div>
                </div>
            </div>
        `;
        orderItems.appendChild(orderItem);
    });
    
    // اظهار الـ overlay
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
}

// دالة بدء طلب جديد
function startNewOrder() {
    // مسح السلة
    cartContainer.innerHTML = '';
    updateCartTitle();
    updateTotalPrice();
    checkCartEmpty();
    
    // اغلاق الـ overlay
    closeOrderOverlay();
}

// دالة اغلاق overlay
function closeOrderOverlay() {
    const overlay = document.getElementById('orderOverlay');
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

// اغلاق الـ overlay عند النقر خارجه
document.getElementById('orderOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeOrderOverlay();
    }
});

// منع اغلاق الـ overlay عند النقر على المحتوى
document.querySelector('.order-modal').addEventListener('click', function(e) {
    e.stopPropagation();
});

// إضافة استدعاء للدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    checkCartEmpty(); // التأكد من أن زر التأكيد مخفي عند تحميل الصفحة
});

