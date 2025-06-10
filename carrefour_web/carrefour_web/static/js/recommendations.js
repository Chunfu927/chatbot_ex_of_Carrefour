// 根據關鍵字顯示推薦商品
function showRecommendationsByKeyword(role, message) {
    const recommendationArea = document.querySelector(".recommended-products");
    recommendationArea.innerHTML = ""; // 清空現有商品

    const lowerCaseMessage = message.toLowerCase();

    // 檢查是否包含推薦或新品關鍵字
    if (!message.includes("推薦") && !message.includes("新品")) {
        const genericResponses = [
            "你好啊，有什麼需要我協助的嗎？",
            "今天有什麼特別想聊的嗎？",
            "我在這裡等著為你服務哦～"
        ];
        const randomIndex = Math.floor(Math.random() * genericResponses.length);
        appendMessage("robot", "聊天", genericResponses[randomIndex]);
        return;
    }

    const messageWords = lowerCaseMessage.split(" ");
    console.log("User Role:", role);
    console.log("User Message:", message);
    console.log("Message Words:", messageWords);

    const productList = productData[role] || [];
    let filteredProducts = [];

    // 遍歷每個單詞進行部分匹配（包含多關鍵字）
    messageWords.forEach(word => {
        const wordFiltered = productList.filter(product =>
            product.name.toLowerCase().includes(word)
        );
        filteredProducts = [...filteredProducts, ...wordFiltered];
    });

    // 去重處理
    filteredProducts = filteredProducts.filter((product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
    );

    console.log("Filtered Products:", filteredProducts);

    // 渲染推薦商品
    if (!filteredProducts.length) {
        console.log("無匹配商品，顯示全部商品");
        recommendationArea.innerHTML = "<p class='no-products'>目前沒有相關推薦商品，為您顯示所有商品：</p>";
        renderProducts(productList);
    } else {
        recommendationArea.innerHTML = "<p class='recommendation-message'>以下是我推薦的商品：</p>";
        renderProducts(filteredProducts);

        // 針對每個推薦商品生成對話，隨機選擇回應樣式
        filteredProducts.forEach(product => {
            const responses = [
                `推薦商品：這個 ${product.name} 是個好選擇哦！它的價格是 ${product.price}，趕快看看吧～`,
                `這款 ${product.name} 最近很受歡迎哦，特價 ${product.price}！`
            ];
            const randomIndex = Math.floor(Math.random() * responses.length);
            appendMessage("robot", "推薦商品", responses[randomIndex] + " 還有其他想了解的商品嗎？我很樂意幫忙推薦！");
        });
    }
}

// 渲染推薦商品
function renderProducts(products) {
    const recommendationArea = document.querySelector(".recommended-products");
    recommendationArea.innerHTML = "";
    products.forEach(product => {
        const productCard = createProductCard(product);
        recommendationArea.appendChild(productCard);
    });
}
