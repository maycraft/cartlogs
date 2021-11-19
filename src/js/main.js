import {constants} from './constants';
//Функции для отрисовки таблицы 
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
            <td>${operation.ltime.replace('T', ' ')}</td>
            <td>${operation.description}</td>
            <td>${operation.model}</td>
            <td>${operation.type}</td>
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
            <td>${operation.ftime.replace('T', ' ')}</td>
            <td>${operation.ltime.replace('T', ' ')}</td>
            <td>${operation.inv}</td>
            <td><a class="print-link" href="http://${operation.ip}" target="_blank">${operation.hostname}</td>
            <td class="align"><button class="btn-state" data-ip="http://${operation.ip}">Offline</button></td>
            <td>${operation.total}</td>
        `;
    tableBody.append(row);
}

//Получаем элементы
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
let stat = null,
    idx = -1,
    statValue = '';

//Статистика по картриджам
const btnStat = document.querySelector('.btn-stat'),
    mainTitle = document.querySelector('.main-title');
let dataStat = [],
    selectStatData = [],
    amountNumber = document.querySelector('.amount-number');

//Статистика по принтерам
const btnPrintlogs = document.querySelector('.btn-printlogs'),
    printersForm = document.querySelector('.printers-form'),
    printlogsForm = document.querySelector('.printlogs__form'),
    inputTextPrinters = document.querySelector('.input__text-printers'),
    printersSelect = document.querySelector('.printers-select');
let dataPrinters = [],
    selectPrinters = [];

//Статистика Доставки
const btnDelivery = document.querySelector('.btn-delivery'),
    deliveryForm = document.querySelector('.delivery-form');

//Основные переменные для работы приложения

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
    dataMatch = [];

    //Функция для получения данных через AJAX
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

//Автоподстановка, получаем все ФИО пользоватлей
getData(constants.API_USERS)
    .then(({items}) => items.forEach( item => dataNames.push(item.fullname) ))
    .catch(err => console.log(err.stack));
//Получение все модели картриджей    
getData(constants.API_CARTRIDGES)
    .then(({items}) => {
        const tempArr = [];
        items.forEach( item => tempArr.push(item.model));
        dataCartridges = Array.from( new Set(tempArr));
    })
    .catch(err => console.log(err.stack));
//Каждые 5 минут переполучаем данные из БД
setInterval(() => {
    resetAll();
    buildPagination();
}, 600000);

//======================================Пагинация=================================================================

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

window.buildPagination = buildPagination;

//===============================================Функции===========================================================

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

//Доп. функция вывода картики бренда
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

//Сброс всех полей
const resetAll = () => {
    error.classList.remove('show');
    table.style.display = '';
    pagContainer.style.display = '';
    error.textContent = '';
    searchForm.reset();
    mainTitle.textContent = 'Учёт картриджей';
    divSearchForm.classList.remove('hide');
    divStatForm.classList.remove('show');
    prevDiv.classList.remove('show');
    printersForm.classList.remove('show');
    createItemsRow = createCartridgesRow;
    apiURL = constants.API_CART_LOGS;
    tableHeader = constants.TABLE_HEADER_CART_LOGS;
    const radioStat = document.querySelector('.radio_stat');
    radioStat.checked = true;
    inputText.style.borderColor = '';
    title.text = '';
    buildPagination();
}

//Обработка данных и либо их вывода, либо вывода ошибок
const dataProcess = () => {
    if (data.length) {
        error.innerHTML = '';
        buildPagination();
        // setArray(data);
        // pageChange();
    } else {
        tableBody.textContent = '';
        pagContainer.textContent = '';
        error.innerHTML = `<p class='error'>По запросу нет данных</p>`;
    }
}

//Замена форм
const changeForm = (form, header) => {
    prevDiv.classList.add('show'); //отбражаем стрелку назад
    mainTitle.textContent = header; //меняем заголовок
    divSearchForm.classList.add('hide'); //скрываем главную форму
    form.classList.add('show');
}

//==============================События========================================================//

//Событие обработки формы
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const status = statValue;

    if (inputText.value) {
        inputText.style.borderColor = ''; //убираем красную границу
        console.log('status', status);
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
        inputText.style.borderColor = 'red';
    }

    inputText.value = '';
});

//Событие для получения значения value у отмеченной радиокнопки
searchForm.addEventListener('click', event => {
    let target = event.target;
    if (target.tagName === 'INPUT' && target.type === 'radio')
        statValue = target.value;
})

//Событие для обработки нажатия по кнопке "назад"
prevDiv.addEventListener('click', () => {
    resetAll();
    buildPagination();
});

//События при вводе символов в инпут и выводе li-шек с подсказками
inputText.addEventListener("input", event => {

    if (inputText.value == '') {
        autoComplete.textContent = '';
    } else {
        let dataItems = []; 
        if( select.value === 'fio' ){
            dataItems = dataNames;
        }
        if( select.value === 'model' ){
            dataItems = dataCartridges;
        }

        dataMatch = dataItems.filter(item => item.toLowerCase().startsWith(inputText.value.toLowerCase()));
        let nameString = '';
        for (let i = 0; i < dataMatch.length; i++) {
            if (i == 15) break;
            nameString += `<li class='list'>${dataMatch[i]}</li>`;
        }
        autoComplete.innerHTML = nameString;
        idx = -1;
    }
});

//Обработка нажатия клавиш
document.addEventListener('keydown', event => {
    if (event.keyCode === 40 || event.keyCode === 38 || event.keyCode === 13) {
        if (dataMatch.length) {
            keyControl(event, inputText, autoComplete);
        }
    }
});

//Сортировка таблицы
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
    //Вещаем событие thead передавая
    document.querySelectorAll('.data-table thead').forEach(tableTH => tableTH.addEventListener('click', () => getSort(event)));

//=======================================Статистика=========================================================//

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

//===================================Printlogs==================================================

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
        prevDiv.classList.remove('show');
        reloadDiv.classList.add('show');
        switch (printersSelect.value) {
            case 'department':
                selectPrinters = dataPrinters.filter(data => data.descr === inputTextPrinters.value);
                break;
            case 'hostname':
                selectPrinters = dataPrinters.filter(data => data.host_name === inputTextPrinters.value);
                break;
            case 'ip':
                selectPrinters = dataPrinters.filter(data => data.ipv4 === inputTextPrinters.value);
                break;
            case 'type':
                selectPrinters = dataPrinters.filter(data => data.name === inputTextPrinters.value);
                break;
        }
        renderPrintTable(selectPrinters);
        inputTextPrinters.value = '';
    } else {
        inputTextPrinters.style.borderColor = 'red';
    }
})



//Сбросить данные по результатам сортировки после формы
reloadDiv.addEventListener('click', event => {
    prevDiv.classList.add('show');
    reloadDiv.classList.remove('show');
    renderPrintTable(dataPrinters);
})

//=====================================Delivery============================================================
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

buildPagination();