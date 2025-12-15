document.addEventListener("DOMContentLoaded", () => {
  // --- 1. DADOS DOS PRODUTOS ---
  const products = [
    // PRODUTO ESPECIAL: MONTE SEU BUQUÊ
    {
      id: 99,
      name: "Monte Seu Buquê",
      category: "monte",
      custom: true, // Ativa botão "Montar"
      unitPrice: 15.0, // Preço por flor
      minQty: 6,
      img: "assets/img/buque-custom.jpg", // Substitua por foto real
      colors: ["Vermelha", "Branca", "Rosa", "Amarela", "Azul", "Salmão"],
    },

    // PRODUTOS NORMAIS
    {
      id: 1,
      name: "Buquê Amor (12 Rosas)",
      category: "buques",
      price: 180.0,
      img: "assets/img/buque-12.jpg",
    },
    {
      id: 2,
      name: "Buquê Tropical",
      category: "buques",
      price: 120.0,
      img: "assets/img/buque-misto.jpg",
    },
    {
      id: 3,
      name: "Cesta Bom Dia",
      category: "cestas",
      price: 250.0,
      img: "assets/img/cesta-cafe.jpg",
    },
    {
      id: 4,
      name: "Cesta Chocolates",
      category: "cestas",
      price: 160.0,
      img: "assets/img/cesta-choc.jpg",
    },
    {
      id: 5,
      name: "Kit Bebê",
      category: "kits",
      price: 145.9,
      img: "assets/img/kit-bebe.jpg",
    },
    {
      id: 6,
      name: "Box Luxo",
      category: "kits",
      price: 210.0,
      img: "assets/img/box-luxo.jpg",
    },
  ];

  let cart = [];
  let currentCustom = null;
  let qty = 6;

  // Elementos DOM
  const grid = document.getElementById("product-grid");
  const cartModal = document.getElementById("cart-modal");
  const detailsModal = document.getElementById("product-details-modal");
  const cartItems = document.getElementById("cart-items");
  const format = (v) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  // --- 2. SISTEMA DE SPA (TROCA DE TELAS) ---
  window.switchView = (viewName) => {
    // Esconde todas as telas
    document.querySelectorAll(".view-section").forEach((el) => {
      el.style.display = "none";
      el.classList.remove("active");
    });

    // Remove active dos botões de navegação
    document
      .querySelectorAll(".menu-link, .nav-item")
      .forEach((el) => el.classList.remove("active"));

    // Mostra a tela certa
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.style.display = "block";
      setTimeout(() => target.classList.add("active"), 10);
    }

    // Ativa botões (Desktop e Mobile)
    const desktopLink = document.querySelector(
      `.menu-link[onclick="switchView('${viewName}')"]`
    );
    if (desktopLink) desktopLink.classList.add("active");

    const mobileLink = document.querySelector(
      `.nav-item[onclick="switchView('${viewName}')"]`
    );
    if (mobileLink) mobileLink.classList.add("active");

    window.scrollTo(0, 0);
  };

  // --- 3. RENDERIZAÇÃO DO CATÁLOGO ---
  function render(cat = "todos") {
    grid.innerHTML = "";
    const list =
      cat === "todos" ? products : products.filter((p) => p.category === cat);

    if (list.length === 0) {
      grid.innerHTML =
        "<p style='grid-column:1/-1;text-align:center;padding:20px;color:#888'>Nenhum produto encontrado nesta categoria.</p>";
      return;
    }

    list.forEach((p) => {
      const card = document.createElement("article");
      card.className = "card";

      // Define se o botão é "Montar" ou "Adicionar"
      const btn = p.custom
        ? `<button class="add-btn" onclick="openDetails(${p.id})">🛠️ Montar</button>`
        : `<button class="add-btn" onclick="addStandard(${p.id})">Adicionar</button>`;

      const price = p.custom
        ? `A partir de ${format(p.unitPrice * p.minQty)}`
        : format(p.price);

      card.innerHTML = `
                <img src="${p.img}" class="card-img" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=Anne+Flores'">
                <div class="card-body">
                    <h4 class="card-title">${p.name}</h4>
                    <span class="card-price">${price}</span>
                    ${btn}
                </div>
            `;
      grid.appendChild(card);
    });
  }

  // Filtro por Abas
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      render(btn.dataset.category);
    };
  });

  // --- 4. LÓGICA DE CARRINHO E COMPRA ---

  // Adicionar Produto Normal
  window.addStandard = (id) => {
    const p = products.find((x) => x.id === id);
    cart.push({ ...p, desc: "" });
    updateCart();
    alert("Produto adicionado à sacola!");
  };

  // Atualizar UI do Carrinho
  function updateCart() {
    const count = cart.length;
    document.querySelectorAll(".cart-badge").forEach((b) => {
      b.innerText = count;
      b.style.display = count ? "flex" : "none";
    });

    cartItems.innerHTML = "";
    let total = 0;

    if (!count) {
      cartItems.innerHTML =
        "<p style='text-align:center;color:#aaa;margin-top:20px'>Sua sacola está vazia.</p>";
    } else {
      cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement("div");
        div.style.cssText =
          "display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee;align-items:center;";
        div.innerHTML = `
                    <div>
                        <strong style="font-size:0.9rem">${
                          item.name
                        }</strong><br>
                        <small style="color:#777;font-size:0.8rem">${
                          item.desc || ""
                        }</small>
                    </div>
                    <div style="text-align:right">
                        <div style="color:#d86b7c;font-weight:bold">${format(
                          item.price
                        )}</div>
                        <small onclick="removeItem(${index})" style="color:red;cursor:pointer;font-size:0.75rem">Remover</small>
                    </div>
                `;
        cartItems.appendChild(div);
      });
    }
    document.getElementById("cart-total").innerText = format(total);
  }

  window.removeItem = (i) => {
    cart.splice(i, 1);
    updateCart();
  };

  // --- 5. LÓGICA DE PERSONALIZAÇÃO (MODAL) ---
  window.openDetails = (id) => {
    currentCustom = products.find((p) => p.id === id);
    qty = currentCustom.minQty;

    // Preenche modal
    document.getElementById("detail-title").innerText = currentCustom.name;
    document.getElementById("detail-img").src = currentCustom.img;
    document.getElementById("unit-price").innerText = format(
      currentCustom.unitPrice
    );

    // Gera Cores
    const cGrid = document.getElementById("colors-grid");
    cGrid.innerHTML = "";
    currentCustom.colors.forEach((c) => {
      const colorCode = getColor(c);
      cGrid.innerHTML += `
                <label>
                    <input type="checkbox" class="color-checkbox" value="${c}">
                    <span class="color-tag">
                        <span class="dot" style="background:${colorCode}"></span>${c}
                    </span>
                </label>`;
    });
    updateTotal();
    detailsModal.classList.add("open");
  };

  function updateTotal() {
    document.getElementById("qty-value").innerText = qty;
    document.getElementById("detail-total").innerText = format(
      qty * currentCustom.unitPrice
    );
  }

  document.getElementById("qty-minus").onclick = () => {
    if (qty > currentCustom.minQty) {
      qty--;
      updateTotal();
    }
  };
  document.getElementById("qty-plus").onclick = () => {
    qty++;
    updateTotal();
  };

  // Adicionar Customizado ao Carrinho
  document.getElementById("add-custom-btn").onclick = () => {
    const selected = Array.from(
      document.querySelectorAll(".color-checkbox:checked")
    ).map((c) => c.value);
    if (!selected.length) return alert("Selecione pelo menos uma cor!");

    cart.push({
      name: `${currentCustom.name} (${qty} rosas)`,
      price: qty * currentCustom.unitPrice,
      desc: `Cores: ${selected.join(", ")}`,
    });
    updateCart();
    detailsModal.classList.remove("open");
    alert("Buquê personalizado criado!");
  };

  // --- 6. CHECKOUT WHATSAPP ---
  document.getElementById("checkout-btn").onclick = () => {
    if (!cart.length) return alert("Carrinho vazio!");
    const nome = document.getElementById("client-name").value;
    const tel = document.getElementById("client-phone").value;
    if (!nome || !tel) return alert("Preencha nome e telefone!");

    let msg = `Olá! Sou *${nome}*.\nMeu Pedido:\n`;
    let total = 0;
    cart.forEach((i) => {
      msg += `\n- ${i.name} | ${format(i.price)}`;
      if (i.desc) msg += `\n  (${i.desc})`;
      total += i.price;
    });
    msg += `\n\n*Total: ${format(total)}*`;

    // Abre WhatsApp
    window.open(`https://wa.me/5568999999999?text=${encodeURIComponent(msg)}`);
  };

  // --- 7. UTILITÁRIOS E INICIALIZAÇÃO ---
  const toggleCart = () => cartModal.classList.toggle("open");
  document.getElementById("cart-btn-desktop").onclick = toggleCart;
  document.getElementById("cart-btn-mobile").onclick = toggleCart;

  document.querySelectorAll(".close-btn").forEach(
    (b) =>
      (b.onclick = () => {
        cartModal.classList.remove("open");
        detailsModal.classList.remove("open");
      })
  );

  function getColor(name) {
    const map = {
      Vermelha: "#d32f2f",
      Branca: "#f5f5f5",
      Rosa: "#ff4081",
      Amarela: "#ffeb3b",
      Azul: "#2196f3",
      Salmão: "#ff8a65",
    };
    return map[name] || "#ccc";
  }

  // Inicia App
  render();
});
