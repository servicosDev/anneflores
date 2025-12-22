document.addEventListener("DOMContentLoaded", () => {
    // --- HELPERS E DADOS ---
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);
    const format = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
    
    // Estado inicial com recuperação do LocalStorage
    let cart = JSON.parse(localStorage.getItem('anne_cart') || '[]');
    let currentCustom = null, qty = 6;
    
    // Recupera dados do cliente
    if(localStorage.getItem('anne_name')) $('#client-name').value = localStorage.getItem('anne_name');
    if(localStorage.getItem('anne_phone')) $('#client-phone').value = localStorage.getItem('anne_phone');

    // Salva inputs ao digitar
    $$('#client-name, #client-phone').forEach(input => {
        input.addEventListener('input', e => localStorage.setItem(e.target.id === 'client-name' ? 'anne_name' : 'anne_phone', e.target.value));
    });

    const products = [
        { id: 99, name: "Monte Seu Buquê", category: "monte", custom: true, unitPrice: 15.0, minQty: 6, img: "https://tessfleur.com.br/wp-content/uploads/2025/07/ad973dc2a5bb6c487ab88d59eb887409.jpeg", colors: ["Vermelha", "Branca", "Rosa", "Amarela", "Azul", "Salmão"] },
        { id: 1, name: "12 Rosas Buquê(o queridinho)", category: "buques", price: 160.0, img: "src/img/flor12.jpg" },
        { id: 2, name: "6 Rosas Buquê", category: "buques", price: 110.0, img: "src/img/flor6.jpg" },
        { id: 3, name: "Cesta De Cafe da Manhã", category: "cestas", price: 255.0, img: "src/img/cafeflor.jpg" },
        { id: 4, name: "Cesta de Maternidade", category: "cestas", price: 250.0, img: "src/img/cestaflor.jpg" },
        { id: 5, name: "Kit Bebê", category: "kits", price: 250.0, img: "src/img/kitbebe.png" },
        { id: 6, name: "Box de Rosas", category: "kits", price: 195.0, img: "src/img/boxflor.jpg" },
    ];

    // --- FUNÇÕES GLOBAIS (window) PARA HTML ---
    
    // 1. Navegação SPA
    window.switchView = (view) => {
        $$('.view-section').forEach(el => { el.style.display = 'none'; el.classList.remove('active'); });
        $$('.menu-link, .nav-item').forEach(el => el.classList.remove('active'));
        
        const target = $(`#view-${view}`);
        if (target) { target.style.display = 'block'; setTimeout(() => target.classList.add('active'), 10); }
        
        $$(`[onclick="switchView('${view}')"]`).forEach(el => el.classList.add('active'));
        window.scrollTo(0, 0);
    };

    // 2. Carrinho (Adicionar e Remover)
    window.addStandard = (id) => {
        cart.push({ ...products.find(p => p.id === id), desc: "" });
        updateCart();
        alert("Adicionado à sacola!");
    };

    window.removeItem = (i) => { cart.splice(i, 1); updateCart(); };

    function updateCart() {
        localStorage.setItem('anne_cart', JSON.stringify(cart)); // Save
        
        const total = cart.reduce((acc, item) => acc + item.price, 0);
        $('#cart-total').innerText = format(total);
        
        $$('.cart-badge').forEach(b => { b.innerText = cart.length; b.style.display = cart.length ? 'flex' : 'none'; });
        
        $('#cart-items').innerHTML = cart.length ? cart.map((item, i) => `
            <div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee;align-items:center;">
                <div><strong>${item.name}</strong><br><small style="color:#777">${item.desc || ""}</small></div>
                <div style="text-align:right;color:#d86b7c;font-weight:bold">${format(item.price)}
                <div onclick="removeItem(${i})" style="color:red;cursor:pointer;font-size:0.75rem">Remover</div></div>
            </div>`).join('') : "<p style='text-align:center;color:#aaa;padding:20px'>Sacola vazia.</p>";
    }

    // 3. Renderização de Produtos
    function render(cat = "todos") {
        const list = cat === "todos" ? products : products.filter(p => p.category === cat);
        $('#product-grid').innerHTML = list.length ? list.map(p => `
            <article class="card">
                <img src="${p.img}" class="card-img" loading="lazy" onerror="this.src='https://via.placeholder.com/300'">
                <div class="card-body">
                    <h4 class="card-title">${p.name}</h4>
                    <span class="card-price">${p.custom ? `A partir de ${format(p.unitPrice * p.minQty)}` : format(p.price)}</span>
                    <button class="add-btn" onclick="${p.custom ? `openDetails(${p.id})` : `addStandard(${p.id})`}">${p.custom ? '🛠️ Montar' : 'Adicionar'}</button>
                </div>
            </article>`).join('') : "<p style='padding:20px;text-align:center;width:100%'>Nenhum produto aqui.</p>";
    }

    // 4. Customização (Monte seu Buquê)
    window.openDetails = (id) => {
        currentCustom = products.find(p => p.id === id);
        qty = currentCustom.minQty;
        
        $('#detail-title').innerText = currentCustom.name;
        $('#detail-img').src = currentCustom.img;
        $('#unit-price').innerText = format(currentCustom.unitPrice);
        
        const colorsMap = { Vermelha: "#d32f2f", Branca: "#f5f5f5", Rosa: "#ff4081", Amarela: "#ffeb3b", Azul: "#2196f3", Salmão: "#ff8a65" };
        $('#colors-grid').innerHTML = currentCustom.colors.map(c => `
            <label><input type="checkbox" class="color-checkbox" value="${c}">
            <span class="color-tag"><span class="dot" style="background:${colorsMap[c]||'#ccc'}"></span>${c}</span></label>
        `).join('');
        
        updateTotal();
        $('#product-details-modal').classList.add("open");
    };

    const updateTotal = () => {
        $('#qty-value').innerText = qty;
        $('#detail-total').innerText = format(qty * currentCustom.unitPrice);
    };

    $('#qty-minus').onclick = () => { if (qty > currentCustom.minQty) { qty--; updateTotal(); }};
    $('#qty-plus').onclick = () => { qty++; updateTotal(); };

    $('#add-custom-btn').onclick = () => {
        const selected = Array.from($$('.color-checkbox:checked')).map(c => c.value);
        if (!selected.length) return alert("Selecione uma cor!");
        
        cart.push({ name: `${currentCustom.name} (${qty} flores)`, price: qty * currentCustom.unitPrice, desc: `Cores: ${selected.join(", ")}` });
        updateCart();
        $('#product-details-modal').classList.remove("open");
    };

    // 5. Checkout WhatsApp
    $('#checkout-btn').onclick = () => {
        if (!cart.length) return alert("Carrinho vazio!");
        const [nome, tel] = [$('#client-name').value, $('#client-phone').value];
        if (!nome || !tel) return alert("Preencha seus dados!");

        const base = window.location.origin + window.location.pathname.replace("index.html", "");
        let msg = `Olá! Sou *${nome}*.
*Meu Pedido:*
`;
        
        cart.forEach(i => {
            let link = i.img && !i.img.startsWith('http') ? base + i.img.replace('./','') : i.img;
            msg += `
- ${i.name} | ${format(i.price)}${i.desc ? `
  (${i.desc})` : ''}${link ? `
  📸 ${link}` : ''}
`;
        });
        
        msg += `
*Total: ${$('#cart-total').innerText}*`;
        window.open(`https://wa.me/5568999987876?text=${encodeURIComponent(msg)}`);
    };

    // --- EVENTOS E INICIALIZAÇÃO ---
    $$('.tab-btn').forEach(btn => btn.onclick = () => {
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(btn.dataset.category);
    });

    // Modais
    const toggleCart = () => $('#cart-modal').classList.toggle("open");
    $('#cart-btn-desktop').onclick = toggleCart;
    $('#cart-btn-mobile').onclick = toggleCart;
    $$('.close-btn').forEach(b => b.onclick = () => $$('.modal-overlay').forEach(m => m.classList.remove('open')));

    // Visualizador de Imagem
    document.addEventListener("click", e => {
        if (e.target.classList.contains("card-img")) {
            $('#full-image').src = e.target.src;
            $('#image-viewer-modal').style.display = 'flex';
            setTimeout(() => $('#image-viewer-modal').classList.add("open"), 10);
        }
        if (e.target.id === 'image-viewer-modal' || e.target.classList.contains('close-viewer')) {
            $('#image-viewer-modal').classList.remove("open");
            setTimeout(() => $('#image-viewer-modal').style.display = 'none', 300);
        }
    });

    render();
    updateCart();
});