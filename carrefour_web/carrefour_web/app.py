from flask import Flask, render_template, request, url_for, jsonify
from configparser import ConfigParser
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
'''
# Load API Key
config = ConfigParser()
config.read("config.ini")
genai.configure(api_key=config["Gemini"]["API_KEY"])
'''

# Load API Key
config = ConfigParser()
try:
    if not config.read("config1.ini"):
        raise FileNotFoundError("config1.ini file not found")
    if "Gemini" not in config:
        raise KeyError("Gemini section not found in config1.ini")
    if "API_KEY" not in config["Gemini"]:
        raise KeyError("API_KEY not found in Gemini section")
    genai.configure(api_key=config["Gemini"]["API_KEY"])
except Exception as e:
    print(f"Configuration Error: {e}")
    exit(1)

# Initialize Flask
app = Flask(__name__)

# Initialize LLM
llm = genai.GenerativeModel(
    "gemini-1.5-flash-latest",
    safety_settings={
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    },
    generation_config={
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
    }
)

# Role Descriptions
role_descriptions = {
    "CaraBunny": "你是一隻療癒料理兔叫做CaraBunny，專注於分享各種療癒系料理，語氣溫柔且具有親和力。",
    "CaraMom": "你是一隻實用家庭兔叫做CaraMom，擅長推薦經濟實惠且實用的家庭商品，語氣溫暖且充滿耐心。",
    "CaraDad": "你是一隻理性生活兔叫做CaraDad，對家電與科技產品充滿知識，語氣穩重且專業。",
    "Peter": "你是一隻健身活力兔叫做Peter，專注於健身和運動器材的推薦，語氣活力十足，充滿動感。"
}

# Initialize Chat
chat_sessions = {}

def get_chat_session(user_role):
    """Initialize or retrieve chat session for a specific role."""
    if user_role not in chat_sessions:
        try:
            # 初始化對話並附加角色描述
            initial_message = role_descriptions[user_role]
            chat_sessions[user_role] = llm.start_chat()
            chat_sessions[user_role].send_message(initial_message)
        except Exception as e:
            print(f"對話初始化失敗 ({user_role}): {e}")
            return None
    return chat_sessions[user_role]

# Routes
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/call_llm", methods=["POST"])
def call_llm():
    data = request.form
    user_role = data.get("role")
    user_message = data.get("message")

    chat = get_chat_session(user_role)

    # 推薦商品資料
    product_data = {
        "CaraBunny": [
            {"id": 1, "name": "貴夫人FP-100多功能手持攪拌棒", "price": "$1388", "image": "carabunny_01.jpg"},
            {"id": 2, "name": "NESCO 食物乾燥機 FD-79", "price": "$4980", "image": "carabunny_02.jpg"},
            {"id": 3, "name": "【非籠飼】茂林伊利蛋非籠飼(冷藏) 10入", "price": "$140", "image": "carabunny_03.jpg"}
        ],
        "CaraMom": [
            {"id": 1, "name": "得意的一天100％葵花油2.4L", "price": "$259", "image": "caramom_01.jpg"},
            {"id": 2, "name": "春風柔膚感抽取式衛生紙-110PC", "price": "$315", "image": "caramom_02.jpg"},
            {"id": 3, "name": "【可易家電】日本IRIS 大拍3.5雙氣旋偵測除蟎清淨機", "price": "$2390", "image": "caramom_03.jpg"}
        ],
        "CaraDad": [
            {"id": 1, "name": "CUKTECH 酷態科 GaN 65W 氮化鎵 快速充電器", "price": "$790", "image": "caradad_01.jpg"},
            {"id": 2, "name": "明基EX2710R 27吋VA曲面瞳孔HDRi螢幕", "price": "$7488", "image": "caradad_02.jpg"}
        ],
        "Peter": [
            {"id": 1, "name": "【限量】NS 健身環大冒險 中文版", "price": "$1690", "image": "peter_01.jpg"},
            {"id": 2, "name": "成功防震鋁合金羽拍", "price": "$329", "image": "peter_02.jpg"}
        ]
    }

    try:
        # 獲取對話回應
        response_message = chat.send_message(user_message).text.strip()

        matching_products = []

        # 將 user_message 分割為單詞，用於部分匹配
        message_words = user_message.lower().split()

        # 用於擴展關鍵字列表，增加部分匹配靈活度
        keywords = ["推薦", "新品", "蛋", "攪拌棒", "乾燥機", "葵花油", "運動", "充電器", "除蟎", "螢幕", "羽拍", "非籠飼"]

        # 商品推薦匹配邏輯
        for product in product_data.get(user_role, []):
            product_name_lower = product["name"].lower()
            # 檢查是否任一單詞或關鍵字出現在商品名稱中
            for word in message_words + keywords:
                if word in product_name_lower:
                    matching_products.append(product)
                    break  # 防止同一商品多次匹配

        # 若匹配商品，生成推薦對話
        if matching_products:
            # 角色化對話結合推薦商品
            response_message += f" 另外，我也推薦你看看這些商品："
            for product in matching_products:
                response_message += f" {product['name']} 價格 {product['price']}。"
        else:
            # 若無匹配商品，生成普通對話
            response_message = chat.send_message(user_message).text.strip()

        print(f"User Role: {user_role}")
        print(f"User Message: {user_message}")
        print(f"Matching Products: {matching_products}")

        # 返回結果
        return jsonify({
            "response": response_message,
            "recommendations": matching_products
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "系統錯誤，請稍後再試。"}), 500

if __name__ == "__main__":
    app.run(debug=True)
