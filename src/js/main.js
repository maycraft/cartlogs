import {constants} from './constants';

//==============================Функции для отрисовки таблицы================================ 
//Для таблицы с картриджами
const createCartridgesRow = (operation, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="align">${idx + 1}</td>
        <td class='nowrap'>${operation.date.replace('T', ' ')}</td>
        <td class='nowrap'>${operation.fio}</td>
        <td>${getStatus(operation.status)}</td>
        <td>${operation.inv}</td>
        <td>${operation.model}</td>
        <td>${operation.serial}</td>
    `;
    tableBody.append(row);
}
//Для таблицы статистики
const createsStatisticsRow = (operation, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="align">${idx + 1}</td>
        <td>${operation.model}</td>
        <td>${operation.inv}</td>
        <td>${operation.serial}</td>
        <td>${getStatus(operation.status)}</td>
    `;
    tableBody.append(row);
}

//Для отрисовки таблицы принтеров
const createPrintersRow = (operation, idx) => {
    if (operation.ip) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="align">${idx + 1}</td>
            <td>${operation.description}</td>
            <td>${operation.type}</td>
            <td>${operation.model}</td>
            <td>${getDate(operation.ftime)}</td>
            <td>${getDate(operation.ltime)}</td>
            <td>${operation.inv}</td>
            <td><a class="print-link" href="http://${operation.ip}" target="_blank">${operation.hostname}</td>
            <td>${operation.total}</td>
        `;
        tableBody.append(row);
    }
}

//Для таблицы Доставки
const createDeliveryRow = (operation, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td class="align">${idx + 1}</td>
            <td>${ getImg(operation.vendor) }</td>
            <td>${operation.model}</td>
            <td>${getDate(operation.ftime)}</td>
            <td>${getDate(operation.ltime)}</td>
            <td>${operation.inv}</td>
            <td><a class="print-link" href="http://${operation.ip}" target="_blank">${operation.hostname}</td>
            <td class="align"><button class="btn-state" data-ip="http://${operation.ip}">Offline</button></td>
            <td>${operation.total}</td>
        `;
    tableBody.append(row);
}

//===================================Получаем элементы=======================================
const table = document.querySelector('.data-table'),
    tableHead = table.querySelector('thead'),
    tableBody = table.querySelector('tbody'),
    error = document.querySelector('.divErr'),
    pagContainer = document.querySelector('.pagination'),
    divSearchForm = document.querySelector('.search-form'),
    divStatForm = document.querySelector('.statistic-form'),
    preloader = document.querySelector('.preloader '),
    title = document.querySelector('title');

//работа с формой
const searchForm = document.getElementById('search'),
    statForm = document.querySelector('.statistic'),
    inputText = document.querySelector('.input__text'),
    select = document.querySelector('.select'),
    autoComplete = document.getElementById('autocomplete'),
    radioBtns = document.querySelectorAll(' input[type=radio] '),
    prevDiv = document.querySelector('.prev'), //Сбросить выборку
    reloadDiv = document.querySelector('.reload'); //Сброс поиска

//Статистика по картриджам
const btnStat = document.querySelector('.btn-stat'),
    mainTitle = document.querySelector('.main-title'),
    amountNumber = document.querySelector('.amount-number');

//Статистика по принтерам
const btnPrintlogs = document.querySelector('.btn-printlogs'),
    printersForm = document.querySelector('.printers-form'),
    printlogsForm = document.querySelector('.printlogs__form'),
    inputTextPrinters = document.querySelector('.input__text-printers'),
    printersSelect = document.querySelector('.printers-select');

//Статистика Доставки
const btnDelivery = document.querySelector('.btn-delivery'),
    deliveryForm = document.querySelector('.delivery-form');

//==========================Основные переменные для работы приложения======================

//URL для получения данных, по умолчанию опрашивает картриджи
let apiURL = constants.API_CART_LOGS;
//Заголовки для хэдера, по умолчанию для картриджей
let tableHeader = constants.TABLE_HEADER_CART_LOGS;
//Функция для отрисовки ряда в таблице
let createItemsRow = createCartridgesRow;
const linesCount = 20;

//массивы для работы с данными
let dataCartridges = [],
    dataNames = [],
    dataHostnames = [],
    dataMatch = [];

let stat = null,
    idx = -1,
    statValue = '',
    activeInput = inputText;


//==================Функция для получения данных через AJAX==================================
const getData = async(url) => {
    preloader.classList.add('show');
    const response = await fetch(url);

    if (response.ok) {
        return response.json();
    } else {
        const errMsg = document.createElement('p');
        errMsg.classList.add('error');
        error.classList.add('show');
        errMsg.textContent = 'Проблемы на сервере';
        error.append(errMsg);
        throw new Error(`Ошибка получение данных от '${url}' со статусом ${response.statusText}`);
    }
}

//======================================Пагинация=================================================================

//Отрисовка таблицы
const showTable = (data, currentPage, tableHeaders, createItemsRow, linesCount) => {
    let tail = linesCount * currentPage; //получаем конечную границу записей
    let head = tail - linesCount; //получаем начальную границу записей

    tableHead.innerHTML = tableHeaders;

    tableBody.textContent = '';     
    for (let i = 0, j = head; i < data.length; i++, j++) {
        createItemsRow(data[i], j);
    }
}

function buildPagination (currentPage = 1) {
    // getData(getCartLogs(currentPage, linesCount))
    return getData(`${apiURL}count=${linesCount}&page=${currentPage}`)
    .then(data => {
        const {items, totalPages} = data;
        let liEl = '';
        let activeClass = '';
        let prevPage = currentPage - 1;
        let nextPage = currentPage + 1;
        //Если всего одна страница, то отображаем только её, отмечаем её активной
        if(totalPages === 1){
            liEl += `<li class="pagination__item pagination__item-active"><span>1</span></li>`;
        }else{
            //Если текущая страница больше 1, то показываем кнопку Назад
            if( currentPage > 1 ){
                // liEl += `<li onclick="buildPagination(${currentPage - 1}, ${totalPages})"><span>&lt; Previous</span></li>`;
                liEl += `<li onclick="buildPagination(${currentPage - 1})"><span>&lt; Previous</span></li>`;
            }
            //Если текущая страница больше 2, то показываем кнопку на 1ю страницу
            if( currentPage > 2 ){
                // liEl += `<li class="pagination__item"  onclick="buildPagination(1, ${totalPages})"><span>1</span></li>`
                liEl += `<li class="pagination__item"  onclick="buildPagination(1)"><span>1</span></li>`;
                //Если больше 3, то за кнопкой первой страницы добавляем многоточие 
                if(currentPage > 3){
                    liEl += `<li class="pagination__item pagination__dots"><span>...</span></li>`
                }
            }
            // //Если текущая страница равна последней, то сдвигаем предыдущие страницы на 2
            if( currentPage === totalPages && prevPage - 2 > 1 ){
                prevPage = prevPage - 2;
            }else if( currentPage === totalPages - 1 &&  prevPage - 1 > 1){
                prevPage = prevPage - 1;
            }
            //Если текущая равна первой странице, то тоже отображаем на 2 больше+
            if( currentPage === 1 && nextPage + 2 < totalPages){
                nextPage = nextPage + 2;
            }else if( currentPage === 2 && nextPage + 1 < totalPages ){
                nextPage = nextPage + 1;
            }
            //Отрисовывем страницы между посчитанными предыдущей и следующей страницей  
            for (let page = prevPage; page <= nextPage; page++) {
                //Если страница превышает последнюю, то пропускаем итерацию.
                if(page > totalPages) continue;
                //Если страница равно 0, то устанавливаем её в 1цу
                if( page === 0 ) page = page + 1;
        
                //Проверка является ли страница текущей
                activeClass =  (page === currentPage) ? 'pagination__item-active' : '';
                //Отрисовка страницы с добавлением функции на событие onclick
                // liEl += `<li class="pagination__item ${activeClass}" onclick="buildPagination(${page}, ${totalPages})"><span>${page}</span></li>`; 
                liEl += `<li class="pagination__item ${activeClass}" onclick="buildPagination(${page})"><span>${page}</span></li>`; 
            }
            //Если текущая страница на единицу меньше последней, то
            if( currentPage < totalPages - 1 ){
                //Проверяем не на 2 ли она меньше последней, если так то показываем троеточие
                if( currentPage < totalPages - 2 ){
                    liEl += `<li class="pagination__item pagination__dots"><span>...</span></li>`
                }
                // и/или показываем кнопку последней страницы
                // liEl += `<li class="pagination__item" onclick="buildPagination(${totalPages}, ${totalPages})"><span>${totalPages}</span></li>`
                liEl += `<li class="pagination__item" onclick="buildPagination(${totalPages})"><span>${totalPages}</span></li>`
            }
            //Если текущая страница меньше последней, то показываем кнопку Next
            if( currentPage < totalPages ){
                // liEl += `<li onclick="buildPagination(${currentPage + 1}, ${totalPages})"><span>Next &gt;</span></li>`;
                liEl += `<li onclick="buildPagination(${currentPage + 1})"><span>Next &gt;</span></li>`;
            }
        }
        pagContainer.innerHTML = liEl;
        showTable(items, currentPage, tableHeader, createItemsRow, linesCount);
        return data;
    })
    .then(data => {
        preloader.classList.remove('show');
        return data;
    })
};
//Хак, чтобы можно было бы вешать данную функцию на html элементы пагинации
window.buildPagination = buildPagination;

//===============================Функции Хелперы===========================================================

//Функция управления клавишами
const keyControl = (event, input, dropdown) => {
    const Lis = dropdown.children; //получаем всех детей в выпадающем списке ul
    let length = Lis.length - 1;

    switch (event.keyCode) {
        case 38: //стрелка в вверх
            if (idx >= 0)
                Lis.item(idx).classList.remove('active');
            idx--;
            if (idx < 0) idx = length;
            Lis.item(idx).classList.add('active');
            break;
        case 40: //стрелка вниз
            if (idx >= 0)
                Lis.item(idx).classList.remove('active');
            idx++;
            if (idx > length) idx = 0;
            Lis.item(idx).classList.add('active');
            break;
        case 13: //код Enter
            input.value = Lis.item(idx).textContent;
            dropdown.textContent = '';
    }
}

//Получение статуса
const getStatus = (num) => {
    switch (num) {
        case 0:
            return 'Принят';
            break;
        case 1:
            return 'Выдан';
            break;
        case 2:
            return 'На складе';
            break;
        case 3:
            return 'На заправке';
            break;
        case 4:
            return 'Списан';
            break;
        case 5:
            return 'Сломан';
            break;
    }
}

//Возвращение даты в нужном формате
const getDate = function( dateString ){
    //Добавляем 0 впереди если данные меньше 10
    const appendZero = ( num ) => num < 10 ? '0' + num : num;
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = appendZero(date.getMonth() + 1);
    const day = appendZero(date.getDate());
    return `${year}-${month}-${day}`;
}

//Доп. функция вывода картинок бренда
const getImg = brand => {
    if (brand === 'Kyocera') {
        return `<img src="../assets/img/kyocera.png" alt="${brand}">`;
    } else {
        return `<img src="../assets/img/hp.png" alt="${brand}">`;
    }
}

//Доп функция получения состояния принтеров
const isOnline = async(btn, url) => {
    const response = await fetch(url, { mode: 'no-cors' });
    if (response.type === 'opaque') {
        btn.classList.add('active');
        btn.textContent = 'Online';
    } else {
        btn.classList.remove('active');
        btn.textContent = 'Offline';
    }
}

//Функция сортировки
const getSort = ({ target }) => {
    //Добавляем дата-аттрибут order либо 1, либо -1 - сортировка прямая или обратная
    const order = (target.dataset.order = -(target.dataset.order || -1));
    //Получаем номер индекса цели th
    const index = [...target.parentNode.cells].indexOf(target);
    //Создаем объект для сортировки который будет сортировать на русском и английском и цифры
    const collator = new Intl.Collator(['en', 'ru'], { numeric: true });
    //Функция сортировки которая получает индекс th и значение какую сортировку делать
    const comparator = (index, order) => {

        return (a, b) => {
            //Сортируем значения ближайших tr'ов в столбце выбранных th
            return order * collator.compare(
                a.children[index].innerHTML,
                b.children[index].innerHTML
            )
        }
    }

    //В цикле пробегаем по всем tr'ам и сравнивая ближайшие между собой
    for (const tBody of target.closest('table').tBodies)
        tBody.append(...[...tBody.rows].sort(comparator(index, order)));

    //Пробегаем по всем th и на котором сработало событие устаналиваем класс sorted, а у других убераем
    for (const cell of target.parentNode.cells)
        cell.classList.toggle('sorted', cell === target);
    //Перепробегаем по полю нумерации и выстраиваем всё по порядку
    const bodyChildren = target.closest('table').tBodies[0].children;
    const bodyChildrenArr = [...bodyChildren]
    for (let i = 0; i < bodyChildrenArr.length; i++) {
            bodyChildrenArr[i].cells[0].textContent = i+1;
    }
};

//Получения всех пользователей
const getAllUsers = ({items}) => {
    const array = [];
    items.forEach( (item) => array.push(item.fullname));
    return array;
}
//Получение всех моделей картриджей
const getAllCartridges = ({items}) => {
    const array = [];
    items.forEach( item => array.push(item.model));
    return Array.from( new Set(array));
}
//Получение всех хостнеймов принтеров
const getAllHostnames = ({items}) => {
    const set = new Set();
    items.forEach(item => set.add(item.hostname))
    return Array.from(set);
}

//Получение нужных данных для автоподстановки
async function saveItemsArray(url, callback){
    const data = await getData(url)
    return callback(data);
}

//================================Функции приложения=========================================

//Сброс всех полей
const resetAll = () => {
    error.classList.remove('show');
    table.style.display = '';
    pagContainer.style.display = '';
    error.textContent = '';
    searchForm.reset();
    activeInput = inputText;
    mainTitle.textContent = 'Учёт картриджей';
    divSearchForm.classList.remove('hide');
    divStatForm.classList.remove('show');
    prevDiv.classList.remove('show');
    printersForm.classList.remove('show');
    statValue = '';
    createItemsRow = createCartridgesRow;
    apiURL = constants.API_CART_LOGS;
    tableHeader = constants.TABLE_HEADER_CART_LOGS;
    const radioStat = document.querySelector('.radio_stat');
    radioStat.checked = true;
    inputText.style.borderColor = '';
    title.text = '';
    buildPagination();
}

//Замена форм
const changeForm = (form, header) => {
    prevDiv.classList.add('show'); //отбражаем стрелку назад
    mainTitle.textContent = header; //меняем заголовок
    divSearchForm.classList.add('hide'); //скрываем главную форму
    form.classList.add('show');
}

//==============================События========================================================//

//События обработки формы

//Событие для получения значения value у отмеченной радиокнопки
searchForm.addEventListener('click', event => {
    let target = event.target;
    if (target.tagName === 'INPUT' && target.type === 'radio')
        statValue = target.value;
})

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const status = statValue;

    if (activeInput.value) {
        activeInput.style.borderColor = ''; //убираем красную границу
        prevDiv.classList.add('show'); //выводим кнопку назад
        preloader.classList.add('show');
        apiURL = constants.API_CART_LOGS + `${select.value}=${inputText.value}&status=${status}&`; 
        createItemsRow = createCartridgesRow;
        tableHeader = constants.TABLE_HEADER_CART_LOGS;
        error.innerHTML = '';
        buildPagination()
        .then( ({items}) => {
            if(!items.length){
                tableBody.textContent = '';
                pagContainer.textContent = '';
                error.innerHTML = `<p class='error'>По запросу нет данных</p>`;
            }
        })
    } else {
        activeInput.style.borderColor = 'red';
    }

    activeInput.value = '';
});

const renderAutocomplete = (dataItems, input) => {
    dataMatch = dataItems.filter(item => item.toLowerCase().startsWith(input.value.toLowerCase()));
    let itemsString = '';
    for (let i = 0; i < dataMatch.length; i++) {
        if (i == 15) break;
        itemsString += `<li class='list'>${dataMatch[i]}</li>`;
    }
    return itemsString;
}

const cartridgesFormHandler = ({currentTarget}) => {
    if (currentTarget.value == '') {
        autoComplete.textContent = '';
    } else {
        let dataItems = []; 
        if( select.value === 'fio' ){
            dataItems = dataNames;
        }
        if( select.value === 'model' ){
            dataItems = dataCartridges;
        }
        autoComplete.innerHTML = renderAutocomplete(dataItems, currentTarget);
        idx = -1;
    }
}

const printersFormHandler = ({currentTarget}) => {
    if (currentTarget.value == '') {
        autoComplete.textContent = '';
    } else {
        let dataItems = []; 
        if( printersSelect.value === 'hostname' ){
            dataItems = dataHostnames;
        }
        // if( printersSelect.value === 'model' ){
        //     dataItems = dataCartridges;
        // }
        autoComplete.innerHTML = renderAutocomplete(dataItems, currentTarget);
        idx = -1;
    }
}
//События при вводе символов в инпут и выводе li-шек с подсказками
inputText.addEventListener("input", cartridgesFormHandler);

inputTextPrinters.addEventListener('input', printersFormHandler);

//События для работы с кнопками

//Событие для обработки нажатия по кнопке "назад"
prevDiv.addEventListener('click', () => {
    resetAll();
    buildPagination();
});

//Сбросить данные по результатам сортировки после формы
reloadDiv.addEventListener('click', event => {
    prevDiv.classList.add('show');
    reloadDiv.classList.remove('show');
    apiURL = constants.API_PRINT_LOGS;
    buildPagination();
})

//Обработка нажатия клавиш
document.addEventListener('keydown', event => {
    if (event.keyCode === 40 || event.keyCode === 38 || event.keyCode === 13) {
        if (dataMatch.length) {
            keyControl(event, activeInput, autoComplete);
        }
    }
});

//Обработка нажатий по списку с автоподстановкой 
autoComplete.addEventListener( 'click', event => {
    const target = event.target;
    const currentTarget = event.currentTarget;
    //При клике по элементу получем текстовое значения этого элемент и подставляем в поле input 
    activeInput.value = target.textContent;
    currentTarget.textContent = '';
})

//Вещаем событие на thead для сортировки полей
document.querySelectorAll('.data-table thead').forEach(tableTH => tableTH.addEventListener('click', () => getSort(event)));

//=========================Смена страницы=========================================================//

//Страница Статистики
btnStat.addEventListener('click', () => {
    changeForm(divStatForm, 'На заправке');
    title.text = 'Статистика';
    preloader.classList.add('show');
    apiURL = constants.API_STATISTICS + 'status=0&'; 
    createItemsRow = createsStatisticsRow;
    tableHeader = constants.TABLE_HEADER_STATISTICS;
    buildPagination()
    .then( ({totalCount}) => amountNumber.textContent = totalCount);
});

statForm.addEventListener('click', event => {
    const target = event.target;
    if (target.classList.contains('radio_stat')) {
        apiURL = constants.API_STATISTICS + `status=${target.value}&`;
        buildPagination()
        .then( ({totalCount}) => amountNumber.textContent = totalCount);
    }
})

//Отрисовка таблицы для со статистикой принтеров по кнопке
btnPrintlogs.addEventListener('click', event => {
    event.preventDefault();
    changeForm(printersForm, 'Статистика принтеров');
    title.text = 'Статистика Принтеров';
    preloader.classList.add('show');

    apiURL = constants.API_PRINT_LOGS;
    tableHeader = constants.TABLE_HEADER_PRINT_LOGS;
    createItemsRow  = createPrintersRow;
    buildPagination();
});

//Обработка формы для статистики по принтерам
printlogsForm.addEventListener('submit', event => {
    event.preventDefault();
    if (inputTextPrinters.value) {
        inputTextPrinters.style.borderColor = '';
        activeInput = inputTextPrinters;
        prevDiv.classList.remove('show');
        reloadDiv.classList.add('show');
        apiURL = constants.API_PRINT_LOGS + `${printersSelect.value}=${inputTextPrinters.value}&`; 
        createItemsRow = createPrintersRow;
        tableHeader = constants.TABLE_HEADER_PRINT_LOGS;
        error.innerHTML = '';
        buildPagination()
        .then( ({items}) => {
            if(!items.length){
                tableBody.textContent = '';
                pagContainer.textContent = '';
                error.innerHTML = `<p class='error'>По запросу нет данных</p>`;
            }
        })
        inputTextPrinters.value = '';
    } else {
        inputTextPrinters.style.borderColor = 'red';
    }
})

//Отображения страницы с принтерами Доставки
btnDelivery.addEventListener('click', event => {
    event.preventDefault();
    changeForm(deliveryForm, 'Отдел Доставки');
    preloader.classList.add('show');
    apiURL = constants.API_PRINT_DELiVERY;
    createItemsRow = createDeliveryRow;
    tableHeader = constants.TABLE_HEADER_DELIVERY;
    buildPagination()
    .then( data => {
        const stateButtonsNode = document.querySelectorAll('.btn-state');
        const stateButtonsArr = [...stateButtonsNode];
        stateButtonsArr.forEach(item => {
            const url = item.dataset.ip;
            isOnline(item, url).catch(err => err.stack);
        })
    })
})

//Данные для автоподстановка 

//получаем все ФИО пользователей
saveItemsArray(constants.API_USERS, getAllUsers).then( items => dataNames = items);

//Получение все модели картриджей    
saveItemsArray(constants.API_CARTRIDGES, getAllCartridges).then( items => dataCartridges = items );

//Получение всех хостов
saveItemsArray(constants.API_PRINT_LOGS, getAllHostnames).then( items => dataHostnames = items );

//Каждые 5 минут переполучаем данные из БД
// setInterval(() => {
//     resetAll();
//     buildPagination();
// }, 600000);
//Первоначальное отображение
buildPagination();