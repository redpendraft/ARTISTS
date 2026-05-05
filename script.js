const canvas = document.getElementById('portraitCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Исходные цвета из ваших файлов (эталоны)
const TARGET_SKIN = { r: 193, g: 158, b: 131 }; // #c19e83
const TARGET_HAIR = { r: 54, g: 64, b: 80 };   // #364050

// Кэш для изображений, чтобы не загружать их при каждом движении ползунка
const imageCache = {};

async function getImage(src) {
    if (imageCache[src]) return imageCache[src];
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            imageCache[src] = img;
            resolve(img);
        };
    });
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

// Функция сравнения цветов (строгое соответствие)
function isSameColor(r, g, b, target) {
    return r === target.r && g === target.g && b === target.b;
}

async function update() {
    const headImg = await getImage(document.getElementById('headSelect').value);
    const hairImg = await getImage(document.getElementById('hairSelect').value);

    const skinRGB = hexToRgb(document.getElementById('skinColor').value);
    const hairRGB = hexToRgb(document.getElementById('hairColor').value);

    canvas.width = headImg.width;
    canvas.height = headImg.height;

    // Рисуем слои
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(headImg, 0, 0);
    ctx.drawImage(hairImg, 0, 0);

    // Получаем пиксели
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue; // Прозрачность не трогаем

        // Меняем кожу
        if (isSameColor(r, g, b, TARGET_SKIN)) {
            data[i] = skinRGB.r;
            data[i + 1] = skinRGB.g;
            data[i + 2] = skinRGB.b;
        }
        // Меняем волосы
        else if (isSameColor(r, g, b, TARGET_HAIR)) {
            data[i] = hairRGB.r;
            data[i + 1] = hairRGB.g;
            data[i + 2] = hairRGB.b;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// Вешаем событие 'input' на все элементы управления
document.querySelectorAll('.trigger').forEach(el => {
    el.addEventListener('input', update);
});

// Запуск при загрузке страницы
window.onload = update;
