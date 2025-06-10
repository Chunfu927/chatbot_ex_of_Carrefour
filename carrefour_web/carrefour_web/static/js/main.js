// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {

    const chatDisplay = document.getElementById("chat-display");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");

    // Role Icons
    const roleIcons = document.querySelectorAll(".role-icon");

    // Current Role
    let currentRole = "CaraBunny";

    // Click Event for Role Selection
    roleIcons.forEach(icon => {
        icon.addEventListener("click", function() {
            currentRole = this.getAttribute("data-role");

            // Remove previous active role
            roleIcons.forEach(icon => icon.classList.remove("active"));

            // Add active class to the selected role
            this.classList.add("active");

            console.log(`Current role set to: ${currentRole}`);

            // Clear chat display and load history for the selected role
            loadChatHistory(currentRole);

            // 更新右側推薦商品欄
            updateRecommendations(currentRole);
        });
    });

    // Send Chat Message
    sendBtn.addEventListener("click", function() {
        sendMessage();
    });

    messageInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {
        const message = messageInput.value.trim();

        if (message !== "") {
            appendMessage("user", "我", message);

            console.log(`Sending message: ${message}, Role: ${currentRole}`);

            // 先進行一般聊天回應
            fetch("/call_llm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `role=${encodeURIComponent(currentRole)}&message=${encodeURIComponent(message)}`
            })
            .then(response => response.json())
            .then(data => {
                console.log("Response data:", data);

                if (data.response) {
                    appendMessage(currentRole, currentRole, data.response);
                }

                // 僅當訊息包含"推薦"或"新品"時才進行商品推薦
                if ((/推薦|新品/).test(message)) {
                    console.log("觸發商品推薦：", data.recommendations);
                    if (data.recommendations && data.recommendations.length > 0) {
                        renderRecommendations(data.recommendations);
                    } else {
                        console.log("無匹配商品，顯示全部商品");
                        renderAllRecommendations(currentRole);
                    }
                }
            })
            .catch(err => {
                console.error("Error during fetch:", err);
            });

            messageInput.value = "";
        }
    }

    // 顯示推薦商品，並加入對話訊息
    function renderRecommendations(products) {
        const recommendationArea = document.getElementById("recommended-products");
        recommendationArea.innerHTML = "<p class='recommendation-message'>這是我推薦給你的商品：</p>";

        products.forEach(product => {
            const productCard = createProductCard(product);
            recommendationArea.appendChild(productCard);

            // 在推薦商品後新增對話訊息
            const chatMessage = `這個 ${product.name} 很受歡迎哦～ 它的價格是 ${product.price}，想試試看嗎？`;
            appendMessage("robot", "推薦商品", chatMessage);
        });

        // 加入額外聊天對話
        const followUpMessage = "還有其他想了解的商品嗎？我很樂意幫忙推薦！";
        appendMessage("robot", "推薦商品", followUpMessage);
    }

    // 顯示全部商品
    function renderAllRecommendations(role) {
        const recommendedProducts = productData[role] || [];
        const recommendationArea = document.getElementById("recommended-products");
        recommendationArea.innerHTML = "<p class='no-products'>目前沒有相關推薦商品，為您顯示所有商品：</p>";

        recommendedProducts.forEach(product => {
            const productCard = createProductCard(product);
            recommendationArea.appendChild(productCard);
        });
    }

    function showRecommendations(role) {
        const recommendedProducts = productData[role] || [];
        const recommendationArea = document.getElementById("recommended-products");
        recommendationArea.innerHTML = "";

        if (recommendedProducts.length === 0) {
            recommendationArea.innerHTML = "<p class='no-products'>尚無推薦商品</p>";
            return;
        }

        recommendedProducts.forEach(product => {
            recommendationArea.appendChild(createProductCard(product));
        });
    }

    function showRecommendationsByKeyword(role, keyword) {
        const recommendedProducts = productData[role] || [];
        const filteredProducts = recommendedProducts.filter(product => 
            product.name.includes(keyword) || 
            product.name.toLowerCase().includes(keyword.toLowerCase())
        );

        const recommendationArea = document.getElementById("recommended-products");
        recommendationArea.innerHTML = "";

        if (filteredProducts.length === 0) {
            recommendationArea.innerHTML = "<p class='no-products'>無符合條件的商品</p>";
            appendMessage("robot", "推薦商品", "抱歉，目前沒有符合條件的商品哦～");
            return;
        }

        recommendationArea.innerHTML = "<p class='recommendation-message'>這是我推薦給你的商品：</p>";

        filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            recommendationArea.appendChild(productCard);

            // 在推薦商品後新增對話訊息
            const chatMessage = `推薦的 ${product.name} 是個好選擇哦！它的價格是 ${product.price}，很值得考慮呢～`;
            appendMessage("robot", "推薦商品", chatMessage);
        });
    }

    function createProductCard(product) {
        const productCard = document.createElement("div");
        productCard.className = "product-card";

        const img = document.createElement("img");
        img.src = `/static/images/${product.image}`;
        img.alt = product.name;
        img.className = "product-image";

        const infoDiv = document.createElement("div");
        infoDiv.className = "product-info";

        const name = document.createElement("h4");
        name.className = "product-name";
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = product.price;

        infoDiv.appendChild(name);
        infoDiv.appendChild(price);

        productCard.appendChild(img);
        productCard.appendChild(infoDiv);

        return productCard;
    }

    function appendMessage(role, sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `chat-message ${role}`;
        messageDiv.style.justifyContent = role === "user" ? "flex-end" : "flex-start";

        const textDiv = document.createElement("div");
        textDiv.className = "chat-text";
        textDiv.innerHTML = `<strong>${sender}：</strong> ${text}`;
        messageDiv.appendChild(textDiv);

        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
});
