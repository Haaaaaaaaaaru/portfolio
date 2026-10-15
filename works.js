// works.csv を読み込む
fetch("works.csv")
    .then(function(response) {
        // 読み込んだデータをテキストとして取得する
        return response.text();
    })
    .then(function(data) {
        // CSVのテキストデータを行ごとに分ける
        var rows = data.trim().split("\n");

        // 1行目をカンマごとに分けて見出しとして扱う
        var headers = rows[0].split(",");

        // 2行目以降を作品データ（オブジェクト）として扱う
        var works = rows.slice(1).map(function(row) {
            var values = row.trim().split(",");
            var work = {};
            headers.forEach(function(header, index) {
                work[header] = values[index];
            });
            return work;
        });

        // JavaScriptの適用先を指定する
        var grid = document.getElementById("works-grid");
        var categorySelect = document.getElementById("category");
        var sortSelect = document.getElementById("sort");

        // works配列のcategoryを元にカテゴリ一覧を作る
        var categories = [];
        works.forEach(function(work) {
            if (!categories.includes(work.category)) {
                categories.push(work.category);
            }
        });

        // カテゴリ一覧をプルダウンメニューに追加する
        categories.forEach(function(category) {
            var option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // 作品情報を表示する関数
        function displayWorks() {
            var selectedCategory = categorySelect.value;
            var selectedSort = sortSelect.value;

            // 元のworksを変更しないようにコピーを作る
            var filteredWorks = works.slice();

            // 選択されたカテゴリの作品だけを残す
            if (selectedCategory !== "all") {
                filteredWorks = filteredWorks.filter(function(work) {
                    return work.category === selectedCategory;
                });
            }

            // 選択されたソート方法で並べ替える
            if (selectedSort === "new") {
                filteredWorks.sort(function(a, b) {
                    return Number(b.year) - Number(a.year);
                });
            } else if (selectedSort === "old") {
                filteredWorks.sort(function(a, b) {
                    return Number(a.year) - Number(b.year);
                });
            } else if (selectedSort === "title") {
                filteredWorks.sort(function(a, b) {
                    return a.title.localeCompare(b.title, "ja");
                });
            }

            // Worksを一度空にする
            grid.innerHTML = "";

            // 作品ごとにカードを作って表示する
            filteredWorks.forEach(function(work) {
                var card = document.createElement("article");
                card.className = "work-card";
                card.innerHTML = `
                    <a href="${work.link}">
                        <img src="${work.image}" alt="${work.title}">
                        <div class="work-info">
                            <p class="work-category">${work.category}</p>
                            <h4>${work.title}</h4>
                            <p>${work.description}</p>
                            <p class="work-year">${work.year}</p>
                        </div>
                    </a>
                `;
                grid.appendChild(card);
            });
        }

        // 初期表示
        displayWorks();

        // カテゴリ・ソートが変更されたときに表示を更新する
        categorySelect.addEventListener("change", displayWorks);
        sortSelect.addEventListener("change", displayWorks);
    });

// ===== 天気に合わせて背景色を変える =====

// 都市大 横浜キャンパスのおおよその緯度・経度
var latitude = 35.55;
var longitude = 139.58;

// 緯度・経度をもとにOpen-Meteoで現在の天気を取得するURL
var weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current=weather_code&timezone=Asia%2FTokyo";

fetch(weatherUrl)
    .then(function(response) {
        // 取得した天気情報をJSON形式のデータに変換する
        return response.json();
    })
    .then(function(data) {
        // weather_code（天気ごとの番号）を取得する
        var code = data.current.weather_code;
        showWeather(code);
    });

// 天気に応じて天気マークと<body>のクラス名を変える
function showWeather(code) {
    var icon = document.getElementById("weather-icon");

    if (code === 0 || code === 1) {
        // 晴れ
        icon.textContent = "☀️";
        document.body.className = "weather-sunny";
    } else if (code === 2 || code === 3 || code === 45 || code === 48) {
        // くもり
        icon.textContent = "☁️";
        document.body.className = "weather-cloudy";
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) {
        // 雨
        icon.textContent = "☔️";
        document.body.className = "weather-rainy";
    } else {
        // その他（雪など）
        icon.textContent = "⛄️";
        document.body.className = "weather-other";
    }
}
